"""SagaDrop backend regression tests (iteration 2: share + 40-book catalog)."""
import os
import re
import base64
import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://editorial-books.preview.emergentagent.com",
).rstrip("/")

API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# 1×1 red PNG (base64, no data-url prefix) for share fixture
TINY_PNG_B64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4"
    "nGP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
)


# ────────────────────────── Health / root ──────────────────────────
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data.get("service") == "SagaDrop"
        assert data.get("status") == "ok"


# ────────────────────────── Books (40-book catalog) ────────────────
class TestBooks:
    def test_trending_returns_8(self, client):
        r = client.get(f"{API}/books/trending", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 6
        for b in data:
            for k in ["id", "title", "author", "price", "cover", "rating"]:
                assert k in b, f"missing field {k}"
            assert b["cover"].startswith("https://covers.openlibrary.org/")

    def test_list_books_limit_40(self, client):
        r = client.get(f"{API}/books", params={"limit": 40}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 40, f"Expected 40 books, got {len(data)}"

        seen_ids = set()
        for b in data:
            for k in ["id", "title", "author", "price", "cover",
                      "rating", "reviews", "category", "description", "year"]:
                assert k in b, f"missing field {k} on {b.get('id')}"
            assert b["cover"].startswith("https://covers.openlibrary.org/"), b["cover"]
            assert b["id"] not in seen_ids, f"duplicate id {b['id']}"
            seen_ids.add(b["id"])

    def test_list_books_default(self, client):
        r = client.get(f"{API}/books", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 40  # default limit=40

    def test_list_books_filter_category_fantasy(self, client):
        r = client.get(f"{API}/books", params={"category": "Fantasy"}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        for b in data:
            assert b["category"].lower() == "fantasy"

    def test_list_books_filter_collection_editors_picks(self, client):
        r = client.get(
            f"{API}/books", params={"collection": "Editor's Picks"}, timeout=10
        )
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        for b in data:
            assert (b.get("collection") or "").lower() == "editor's picks"

    def test_get_book_by_id(self, client):
        r = client.get(f"{API}/books/b1", timeout=10)
        assert r.status_code == 200
        assert r.json()["id"] == "b1"

    def test_get_book_b40(self, client):
        r = client.get(f"{API}/books/b40", timeout=10)
        assert r.status_code == 200
        assert r.json()["id"] == "b40"

    def test_get_book_not_found(self, client):
        r = client.get(f"{API}/books/does-not-exist", timeout=10)
        assert r.status_code == 404


# ────────────────────────── Categories ─────────────────────────────
class TestCategories:
    def test_categories_returns_9(self, client):
        r = client.get(f"{API}/categories", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "categories" in data
        assert len(data["categories"]) == 8


# ────────────────────────── Newsletter ─────────────────────────────
class TestNewsletter:
    def test_newsletter_valid_email(self, client):
        r = client.post(
            f"{API}/newsletter",
            json={"email": "TEST_reader@example.com"},
            timeout=10,
        )
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_newsletter_invalid_email(self, client):
        r = client.post(
            f"{API}/newsletter", json={"email": "not-an-email"}, timeout=10
        )
        assert r.status_code in (400, 422)


# ────────────────────────── Share feature ─────────────────────────
class TestShare:
    @pytest.fixture(scope="class")
    def created_share(self, client):
        payload = {
            "title": "TEST_Cartographer",
            "author": "TEST Author",
            "material": "Hardcover",
            "foil": "gold",
            "mime_type": "image/png",
            "cover_data": TINY_PNG_B64,
        }
        r = client.post(f"{API}/share", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) == 10
        assert "share_url" in data and data["share_url"].endswith(f"/api/share/{data['id']}/page")
        assert "app_url" in data and data["app_url"].endswith(f"/share/{data['id']}")
        return data

    def test_create_share_returns_ids_and_urls(self, created_share):
        # implicit — the fixture asserts. Just re-check the shape.
        assert set(["id", "share_url", "app_url"]).issubset(created_share.keys())

    def test_get_share_metadata_and_increments_views(self, client, created_share):
        sid = created_share["id"]
        # First get
        r1 = client.get(f"{API}/share/{sid}", timeout=10)
        assert r1.status_code == 200
        d1 = r1.json()
        assert d1["id"] == sid
        assert d1["title"] == "TEST_Cartographer"
        assert d1["author"] == "TEST Author"
        assert d1["material"] == "Hardcover"
        assert d1["foil"] == "gold"
        assert d1["cover_url"].endswith(f"/api/share/{sid}/cover")
        assert isinstance(d1["views"], int)
        views1 = d1["views"]

        # Second get should increment views
        r2 = client.get(f"{API}/share/{sid}", timeout=10)
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["views"] == views1 + 1, f"views did not increment ({views1} → {d2['views']})"

    def test_get_share_cover_returns_image(self, client, created_share):
        sid = created_share["id"]
        r = client.get(f"{API}/share/{sid}/cover", timeout=10)
        assert r.status_code == 200
        ctype = r.headers.get("content-type", "")
        assert ctype.startswith("image/"), f"unexpected content-type {ctype}"
        # Should be non-empty bytes (our tiny PNG decodes to ~70 bytes)
        assert len(r.content) > 20
        # Verify decoded content matches original bytes
        assert r.content == base64.b64decode(TINY_PNG_B64)

    def test_get_share_page_has_og_tags(self, client, created_share):
        sid = created_share["id"]
        r = client.get(f"{API}/share/{sid}/page", timeout=10)
        assert r.status_code == 200
        assert "text/html" in r.headers.get("content-type", "").lower()
        body = r.text
        assert 'property="og:title"' in body
        assert 'property="og:image"' in body
        assert 'property="og:description"' in body
        # Should redirect to /share/{sid}
        assert f"/share/{sid}" in body
        assert 'http-equiv="refresh"' in body or "window.location.replace" in body

    def test_get_share_nonexistent(self, client):
        r = client.get(f"{API}/share/nonexistent-xyz-000", timeout=10)
        assert r.status_code == 404

    def test_get_share_cover_nonexistent(self, client):
        r = client.get(f"{API}/share/nonexistent-xyz-000/cover", timeout=10)
        assert r.status_code == 404

    def test_get_share_page_nonexistent(self, client):
        r = client.get(f"{API}/share/nonexistent-xyz-000/page", timeout=10)
        assert r.status_code == 404


# ────────────────────────── Recommendations ───────────────────────
class TestRecommend:
    def test_recommend_fantasy(self, client):
        r = client.post(
            f"{API}/recommend",
            json={"mood": "Fantasy", "tone": "epic dragons"},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "summary" in data and isinstance(data["summary"], str)
        assert "picks" in data
        assert isinstance(data["picks"], list)
        assert len(data["picks"]) == 4
        for p in data["picks"]:
            assert p.get("title")
            assert p.get("author")
            assert p.get("reason")
