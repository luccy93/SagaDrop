import hashlib
import os
import random
from datetime import datetime, timezone, timedelta
from typing import Optional

import requests as http_requests
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from pydantic import BaseModel, EmailStr, Field

from database import db
from auth_utils import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    set_auth_cookies, public_user, get_current_user, get_jwt_secret, JWT_ALGORITHM,
)
import jwt as pyjwt

router = APIRouter(prefix="/auth")

MAX_ATTEMPTS = 5
LOCKOUT_MINUTES = 15
OTP_EXPIRY_MINUTES = 10
OTP_MAX_ATTEMPTS = 5


# ─── Models ───────────────────────────────────────────────────────────────────

class RegisterInput(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class SendOtpInput(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    password: Optional[str] = None
    purpose: str = "signup"          # "signup" | "login"


class VerifyOtpInput(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)
    purpose: str = "signup"


class GoogleAuthInput(BaseModel):
    access_token: str


class AccountState(BaseModel):
    cart: list = []
    wishlist: list = []


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "unknown")


async def _check_lockout(identifier: str):
    if db is None:
        return
    doc = await db.login_attempts.find_one({"identifier": identifier})
    if doc and doc.get("count", 0) >= MAX_ATTEMPTS:
        locked_until = doc.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(429, "Too many failed attempts. Try again in 15 minutes.")
        await db.login_attempts.delete_one({"identifier": identifier})


async def _record_failure(identifier: str):
    if db is None:
        return
    doc = await db.login_attempts.find_one_and_update(
        {"identifier": identifier},
        {"$inc": {"count": 1}},
        upsert=True, return_document=True,
    )
    count = (doc or {}).get("count", 0) + 1
    if count >= MAX_ATTEMPTS:
        locked = (datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)).isoformat()
        await db.login_attempts.update_one(
            {"identifier": identifier}, {"$set": {"locked_until": locked}}
        )


def _generate_otp() -> str:
    return f"{random.randint(0, 999999):06d}"


def _hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()


async def _send_otp_email(email: str, otp: str, name: str = "") -> bool:
    """Send OTP via Resend. Returns True if sent, False otherwise (dev mode)."""
    api_key = os.environ.get("RESEND_API_KEY", "")
    if not api_key:
        return False
    try:
        import resend
        resend.api_key = api_key
        greeting = f"Hi {name}," if name else "Hi,"
        resend.Emails.send({
            "from": "SagaDrop <noreply@sagadrop.com>",
            "to": [email],
            "subject": f"Your SagaDrop verification code: {otp}",
            "html": f"""
<div style="font-family:Georgia,serif;background:#0a0a0a;padding:48px 40px;max-width:520px;margin:0 auto;color:#fff;">
  <div style="font-size:22px;font-weight:900;letter-spacing:0.15em;margin-bottom:32px;">
    SAGA<span style="color:#D90429;">DROP</span>
  </div>
  <p style="color:#aaa;font-size:14px;margin-bottom:8px;">{greeting}</p>
  <p style="font-size:15px;line-height:1.6;margin-bottom:32px;">
    Use the code below to verify your email address. It expires in {OTP_EXPIRY_MINUTES} minutes.
  </p>
  <div style="background:#1a1a1a;border:1px solid #333;padding:24px;text-align:center;margin-bottom:32px;">
    <span style="font-size:42px;font-weight:900;letter-spacing:0.4em;color:#D90429;">{otp}</span>
  </div>
  <p style="font-size:12px;color:#666;">
    If you did not request this, you can safely ignore this email.
  </p>
</div>
""",
        })
        return True
    except Exception:
        return False


# ─── Standard auth ────────────────────────────────────────────────────────────

@router.post("/register")
async def register(inp: RegisterInput, response: Response):
    if db is None:
        raise HTTPException(503, "Database not configured")
    email = inp.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(409, "An account with this email already exists.")
    doc = {
        "name": inp.name.strip(),
        "email": email,
        "password_hash": hash_password(inp.password),
        "role": "user",
        "email_verified": False,
        "cart": [],
        "wishlist": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    user_id = str(result.inserted_id)
    set_auth_cookies(response, create_access_token(user_id, email), create_refresh_token(user_id))
    return public_user(doc)


@router.post("/login")
async def login(inp: LoginInput, request: Request, response: Response):
    if db is None:
        raise HTTPException(503, "Database not configured")
    email = inp.email.lower().strip()
    identifier = f"{_client_ip(request)}:{email}"
    await _check_lockout(identifier)

    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not verify_password(inp.password, user["password_hash"]):
        await _record_failure(identifier)
        raise HTTPException(401, "Invalid email or password.")

    await db.login_attempts.delete_one({"identifier": identifier})
    user_id = str(user["_id"])
    set_auth_cookies(response, create_access_token(user_id, email), create_refresh_token(user_id))
    return public_user(user)


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return public_user(user)


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(401, "No refresh token")
    try:
        payload = pyjwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Invalid token type")
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(401, "Refresh token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(401, "Invalid refresh token")

    if db is None:
        raise HTTPException(503, "Database not configured")
    from bson import ObjectId
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(401, "User not found")
    from auth_utils import _is_secure_context
    access = create_access_token(str(user["_id"]), user["email"])
    response.set_cookie(key="access_token", value=access, httponly=True,
                        secure=_is_secure_context(), samesite="lax", max_age=900, path="/")
    return {"ok": True}


# ─── OTP ──────────────────────────────────────────────────────────────────────

@router.post("/send-otp")
async def send_otp(inp: SendOtpInput):
    if db is None:
        raise HTTPException(503, "Database not configured")

    email = inp.email.lower().strip()
    purpose = inp.purpose

    if purpose == "signup":
        existing_user = await db.users.find_one({"email": email})
        if existing_user:
            raise HTTPException(409, "An account with this email already exists.")
        if not inp.name or not inp.password:
            raise HTTPException(422, "Name and password are required for signup.")
        if len(inp.password) < 6:
            raise HTTPException(422, "Password must be at least 6 characters.")
    elif purpose == "login":
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(404, "No account found with this email.")
    else:
        raise HTTPException(422, "Invalid purpose.")

    # Rate-limit: 1 OTP per 60 seconds
    existing_otp = await db.otps.find_one({"email": email, "purpose": purpose})
    if existing_otp and existing_otp.get("created_at"):
        try:
            created = datetime.fromisoformat(existing_otp["created_at"])
            elapsed = (datetime.now(timezone.utc) - created).total_seconds()
            if elapsed < 60:
                raise HTTPException(429, f"Please wait {60 - int(elapsed)} seconds before requesting a new code.")
        except ValueError:
            pass

    otp = _generate_otp()
    now = datetime.now(timezone.utc)
    doc = {
        "email": email,
        "purpose": purpose,
        "otp_hash": _hash_otp(otp),
        "expires_at": (now + timedelta(minutes=OTP_EXPIRY_MINUTES)).isoformat(),
        "created_at": now.isoformat(),
        "attempts": 0,
    }
    if purpose == "signup":
        doc["name"] = inp.name.strip()
        doc["password_hash"] = hash_password(inp.password)

    await db.otps.replace_one({"email": email, "purpose": purpose}, doc, upsert=True)

    dev_mode = not os.environ.get("RESEND_API_KEY", "")
    sent = await _send_otp_email(email, otp, inp.name or "")

    if not sent and not dev_mode:
        # Resend key is present but sending failed — surface a real error
        raise HTTPException(503, "Failed to send verification email. Please try again shortly.")

    result: dict = {"ok": True, "sent": sent}
    if dev_mode:
        # Only expose OTP in response when no email service is configured (local dev)
        result["dev_otp"] = otp
    return result


@router.post("/verify-otp")
async def verify_otp(inp: VerifyOtpInput, response: Response):
    if db is None:
        raise HTTPException(503, "Database not configured")

    email = inp.email.lower().strip()

    # Atomically increment attempts and retrieve the BEFORE state.
    # Filter also ensures we only operate on a non-exhausted, non-expired doc.
    now = datetime.now(timezone.utc)
    otp_doc = await db.otps.find_one_and_update(
        {
            "email": email,
            "purpose": inp.purpose,
            "attempts": {"$lt": OTP_MAX_ATTEMPTS},
            "expires_at": {"$gt": now.isoformat()},
        },
        {"$inc": {"attempts": 1}},
        return_document=False,  # return the BEFORE state
    )

    if otp_doc is None:
        # Either no doc exists, it's expired, or already exhausted — check which
        stale = await db.otps.find_one({"email": email, "purpose": inp.purpose})
        if not stale:
            raise HTTPException(400, "No verification code found. Please request a new one.")
        if datetime.fromisoformat(stale["expires_at"]) <= now:
            await db.otps.delete_one({"email": email, "purpose": inp.purpose})
            raise HTTPException(400, "Code expired. Please request a new one.")
        # attempts exhausted
        await db.otps.delete_one({"email": email, "purpose": inp.purpose})
        raise HTTPException(400, "Too many incorrect attempts. Please request a new code.")

    if _hash_otp(inp.otp) != otp_doc["otp_hash"]:
        attempts_after = otp_doc.get("attempts", 0) + 1  # already incremented in DB
        left = OTP_MAX_ATTEMPTS - attempts_after
        if left <= 0:
            await db.otps.delete_one({"email": email, "purpose": inp.purpose})
            raise HTTPException(400, "Too many incorrect attempts. Please request a new code.")
        raise HTTPException(400, f"Incorrect code. {left} attempt(s) remaining.")

    # Valid — atomically delete using otp_hash as a uniqueness guard (single-use)
    del_result = await db.otps.delete_one(
        {"email": email, "purpose": inp.purpose, "otp_hash": otp_doc["otp_hash"]}
    )
    if del_result.deleted_count == 0:
        # Another concurrent request already consumed this OTP
        raise HTTPException(400, "Verification code already used. Please request a new one.")

    if inp.purpose == "signup":
        user_doc = {
            "name": otp_doc["name"],
            "email": email,
            "password_hash": otp_doc["password_hash"],
            "role": "user",
            "email_verified": True,
            "cart": [],
            "wishlist": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        result = await db.users.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        user_id = str(result.inserted_id)
    else:
        user_doc = await db.users.find_one({"email": email})
        if not user_doc:
            raise HTTPException(404, "User not found.")
        user_id = str(user_doc["_id"])

    set_auth_cookies(response, create_access_token(user_id, email), create_refresh_token(user_id))
    return public_user(user_doc)


# ─── Google OAuth ─────────────────────────────────────────────────────────────

@router.post("/google")
async def google_auth(inp: GoogleAuthInput, response: Response):
    google_client_id = os.environ.get("GOOGLE_CLIENT_ID", "")
    if not google_client_id:
        raise HTTPException(503, "Google OAuth not configured — add GOOGLE_CLIENT_ID secret.")
    if db is None:
        raise HTTPException(503, "Database not configured")

    # Step 1: Validate the access token via tokeninfo — confirms audience matches our app
    try:
        tokeninfo = http_requests.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"access_token": inp.access_token},
            timeout=10,
        )
        if tokeninfo.status_code != 200:
            raise HTTPException(401, "Invalid Google access token.")
        ti = tokeninfo.json()
        # azp is the authorized party (client that created the token); aud may differ for access tokens
        token_audience = ti.get("azp") or ti.get("aud") or ""
        if token_audience != google_client_id:
            raise HTTPException(401, "Google token was not issued for this application.")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "Could not validate Google token.")

    # Step 2: Fetch user profile from userinfo
    try:
        resp = http_requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {inp.access_token}"},
            timeout=10,
        )
        if resp.status_code != 200:
            raise HTTPException(401, "Could not fetch Google user profile.")
        info = resp.json()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "Could not fetch Google user profile.")

    email = info.get("email", "").lower().strip()
    name = info.get("name") or info.get("given_name") or "Reader"
    google_sub = info.get("sub", "")

    if not email:
        raise HTTPException(400, "Google account has no email address.")
    if not info.get("email_verified"):
        raise HTTPException(400, "Google account email is not verified.")

    user = await db.users.find_one({"email": email})
    if user:
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"oauth_google_sub": google_sub, "email_verified": True}},
        )
    else:
        doc = {
            "name": name,
            "email": email,
            "password_hash": None,
            "oauth_provider": "google",
            "oauth_google_sub": google_sub,
            "role": "user",
            "email_verified": True,
            "cart": [],
            "wishlist": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        result = await db.users.insert_one(doc)
        doc["_id"] = result.inserted_id
        user = doc

    user_id = str(user["_id"])
    set_auth_cookies(response, create_access_token(user_id, email), create_refresh_token(user_id))
    return public_user(user)


# ─── Persisted cart & wishlist ────────────────────────────────────────────────

@router.get("/state", response_model=AccountState)
async def get_state(user: dict = Depends(get_current_user)):
    return AccountState(cart=user.get("cart", []), wishlist=user.get("wishlist", []))


@router.put("/state")
async def put_state(state: AccountState, user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(503, "Database not configured")
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"cart": state.cart[:100], "wishlist": state.wishlist[:100]}},
    )
    return {"ok": True}
