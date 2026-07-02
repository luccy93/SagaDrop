"""SagaDrop iteration 3 tests: JWT Auth, share validation, catalog regressions."""
import os
import time
import uuid
import requests
import pytest

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://editorial-books.preview.emergentagent.com",
).rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@sagadrop.com"
ADMIN_PASS = "SagaAdmin@2026"

TINY_PNG_B64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4"
    "nGP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
)


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ────────────────── AUTH: register / login / me / logout / refresh ──────────────────
class TestAuthCore:
    def test_register_success_sets_cookies(self):
        s = requests.Session()
        email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        r = s.post(f"{API}/auth/register",
                   json={"name": "TEST User", "email": email, "password": "Passw0rd!"},
                   timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == email.lower()
        assert data["name"] == "TEST User"
        assert data["role"] == "user"
        assert "id" in data and isinstance(data["id"], str)
        # Cookies set
        cookie_names = {c.name for c in s.cookies}
        assert "access_token" in cookie_names
        assert "refresh_token" in cookie_names
        # Verify /me works with the same session cookies
        me = s.get(f"{API}/auth/me", timeout=10)
        assert me.status_code == 200
        assert me.json()["email"] == email.lower()

    def test_register_duplicate_returns_409(self, client):
        email = f"TEST_dup_{uuid.uuid4().hex[:8]}@example.com"
        payload = {"name": "Dup", "email": email, "password": "Passw0rd!"}
        r1 = client.post(f"{API}/auth/register", json=payload, timeout=15)
        assert r1.status_code == 200
        r2 = client.post(f"{API}/auth/register", json=payload, timeout=15)
        assert r2.status_code == 409, r2.text

    def test_admin_login_success(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login",
                   json={"email": ADMIN_EMAIL, "password": ADMIN_PASS},
                   timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        cookie_names = {c.name for c in s.cookies}
        assert "access_token" in cookie_names
        assert "refresh_token" in cookie_names

        # /me works
        me = s.get(f"{API}/auth/me", timeout=10)
        assert me.status_code == 200
        assert me.json()["email"] == ADMIN_EMAIL

        # logout clears cookies
        lo = s.post(f"{API}/auth/logout", timeout=10)
        assert lo.status_code == 200
        assert lo.json().get("ok") is True

        # After logout, /me on a fresh session returns 401
        s2 = requests.Session()
        me2 = s2.get(f"{API}/auth/me", timeout=10)
        assert me2.status_code == 401

    def test_admin_login_wrong_password_401(self, client):
        # Use uuid-tagged email to avoid brute-force interference
        r = client.post(f"{API}/auth/login",
                        json={"email": ADMIN_EMAIL, "password": "definitely-wrong"},
                        timeout=15)
        assert r.status_code == 401, r.text

    def test_me_without_cookie_401(self, client):
        s = requests.Session()
        r = s.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401

    def test_refresh_issues_new_access_token(self):
        s = requests.Session()
        # Login admin
        r = s.post(f"{API}/auth/login",
                   json={"email": ADMIN_EMAIL, "password": ADMIN_PASS},
                   timeout=15)
        assert r.status_code == 200
        # Save old access token
        old_access = next((c.value for c in s.cookies if c.name == "access_token"), None)
        refresh = next((c.value for c in s.cookies if c.name == "refresh_token"), None)
        assert refresh is not None

        # Force a small pause to ensure new token exp value differs
        time.sleep(1.1)

        r2 = s.post(f"{API}/auth/refresh", timeout=10)
        assert r2.status_code == 200, r2.text
        new_access = next((c.value for c in s.cookies if c.name == "access_token"), None)
        assert new_access is not None
        assert new_access != old_access, "Refresh did not rotate access token"

        # /me works with new access token
        me = s.get(f"{API}/auth/me", timeout=10)
        assert me.status_code == 200


# ────────────────── AUTH: brute-force lockout ──────────────────
class TestBruteForce:
    def test_5_failed_logins_return_429(self):
        # Use throwaway email — must NOT be admin
        email = f"TEST_bf_{uuid.uuid4().hex[:8]}@example.com"
        s = requests.Session()
        # First register the user so brute-force is against a real account
        reg = s.post(f"{API}/auth/register",
                     json={"name": "BF", "email": email, "password": "Correct123!"},
                     timeout=15)
        assert reg.status_code == 200

        # Now hit 5 failed logins from same client (identifier = ip:email)
        got_429 = False
        for i in range(6):
            r = requests.post(f"{API}/auth/login",
                              json={"email": email, "password": "wrongpass"},
                              timeout=15)
            if r.status_code == 429:
                got_429 = True
                break
            assert r.status_code == 401, f"attempt {i+1}: {r.status_code} {r.text}"
        assert got_429, "Expected 429 after 5 failed attempts"


# ────────────────── AUTH: cart/wishlist state persistence ──────────────────
class TestAccountState:
    def test_state_get_and_put_roundtrip(self):
        s = requests.Session()
        email = f"TEST_state_{uuid.uuid4().hex[:8]}@example.com"
        reg = s.post(f"{API}/auth/register",
                     json={"name": "State", "email": email, "password": "Passw0rd!"},
                     timeout=15)
        assert reg.status_code == 200

        # Initially empty
        r = s.get(f"{API}/auth/state", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d.get("cart") == []
        assert d.get("wishlist") == []

        # Put state
        payload = {
            "cart": [{"id": "b1", "title": "Test", "author": "A", "price": 25, "cover": "x", "qty": 2}],
            "wishlist": [{"id": "b2", "title": "T2", "author": "B", "price": 30, "cover": "y"}],
        }
        p = s.put(f"{API}/auth/state", json=payload, timeout=10)
        assert p.status_code == 200
        assert p.json().get("ok") is True

        # Get back
        r2 = s.get(f"{API}/auth/state", timeout=10)
        assert r2.status_code == 200
        d2 = r2.json()
        assert len(d2["cart"]) == 1
        assert d2["cart"][0]["id"] == "b1"
        assert d2["cart"][0]["qty"] == 2
        assert len(d2["wishlist"]) == 1
        assert d2["wishlist"][0]["id"] == "b2"

    def test_state_requires_auth(self, client):
        r = requests.get(f"{API}/auth/state", timeout=10)
        assert r.status_code == 401


# ────────────────── SHARE: validation ──────────────────
class TestShareValidation:
    def test_share_rejects_gif_mime(self, client):
        payload = {
            "title": "TEST_gif", "author": "TA", "material": "Hardcover", "foil": "gold",
            "mime_type": "image/gif", "cover_data": TINY_PNG_B64,
        }
        r = client.post(f"{API}/share", json=payload, timeout=15)
        assert r.status_code == 400, r.text

    def test_share_rejects_invalid_base64(self, client):
        payload = {
            "title": "TEST_b64", "author": "TA", "material": "Hardcover", "foil": "gold",
            "mime_type": "image/png", "cover_data": "!!!not-base64!!!",
        }
        r = client.post(f"{API}/share", json=payload, timeout=15)
        assert r.status_code == 400, r.text

    def test_share_accepts_valid_png(self, client):
        payload = {
            "title": "TEST_okpng", "author": "TA", "material": "Hardcover", "foil": "gold",
            "mime_type": "image/png", "cover_data": TINY_PNG_B64,
        }
        r = client.post(f"{API}/share", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert len(data["id"]) == 10


# ────────────────── CATALOG regressions ──────────────────
class TestCatalogRegressions:
    def test_books_limit_40(self, client):
        r = client.get(f"{API}/books", params={"limit": 40}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 40
        # 5 per each of 8 categories
        cats = {}
        for b in data:
            cats[b["category"]] = cats.get(b["category"], 0) + 1
        assert len(cats) == 8, f"expected 8 categories, got {list(cats.keys())}"
        for c, n in cats.items():
            assert n == 5, f"category {c} has {n} books, expected 5"

    def test_trending_returns_6(self, client):
        r = client.get(f"{API}/books/trending", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 6

    def test_categories_returns_8(self, client):
        r = client.get(f"{API}/categories", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert len(data["categories"]) == 8

    def test_all_covers_reachable(self, client):
        r = client.get(f"{API}/books", params={"limit": 40}, timeout=10)
        assert r.status_code == 200
        books = r.json()
        broken = []
        for b in books:
            url = b["cover"]
            # Force covers.openlibrary to not return a default 1x1 image
            check_url = url + ("&" if "?" in url else "?") + "default=false"
            try:
                hr = requests.get(check_url, timeout=15, allow_redirects=True)
                if hr.status_code != 200 or len(hr.content) < 500:
                    broken.append((b["id"], url, hr.status_code, len(hr.content)))
            except Exception as e:
                broken.append((b["id"], url, "exception", str(e)))
        assert not broken, f"Broken covers: {broken}"
