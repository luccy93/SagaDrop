"""Authentication & user business logic."""
import hashlib
import os
import random
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

import requests as http_requests
from fastapi import HTTPException, Request, Response
from bson import ObjectId

from database import db
from auth_utils import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    set_auth_cookies, public_user,
)

logger = logging.getLogger("sagadrop.auth")

MAX_ATTEMPTS = 5
LOCKOUT_MINUTES = 15
OTP_EXPIRY_MINUTES = 10
OTP_MAX_ATTEMPTS = 5


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return fwd.split(",")[0].strip() if fwd else (
        request.client.host if request.client else "unknown")


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


def _otp_html(otp: str, name: str = "") -> str:
    greeting = f"Hi {name}," if name else "Hi,"
    return f"""
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
</div>"""


import asyncio
import functools

def _send_email_sync(email: str, otp: str, name: str = "") -> bool:
    """Synchronous email sender — runs in a thread to avoid blocking the event loop."""
    html = _otp_html(otp, name)
    subject = f"Your SagaDrop verification code: {otp}"

    # 1) Resend
    api_key = os.environ.get("RESEND_API_KEY", "")
    if api_key:
        try:
            import resend
            resend.api_key = api_key
            resend.Emails.send({
                "from": "SagaDrop <noreply@hakidrop.com>",
                "to": [email],
                "subject": subject,
                "html": html,
            })
            return True
        except Exception:
            logger.warning("Resend failed")

    # 2) SMTP fallback — only if SMTP_USER is set
    smtp_host = os.environ.get("SMTP_HOST", "")
    smtp_user = os.environ.get("SMTP_USER", "")
    if smtp_host and smtp_user:
        try:
            import smtplib
            from email.mime.text import MIMEText
            smtp_port = int(os.environ.get("SMTP_PORT", "587"))
            smtp_pass = os.environ.get("SMTP_PASS", "")
            smtp_from = os.environ.get("SMTP_FROM", "noreply@sagadrop.com")

            msg = MIMEText(html, "html")
            msg["Subject"] = subject
            msg["From"] = smtp_from
            msg["To"] = email

            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as s:
                s.starttls()
                s.login(smtp_user, smtp_pass)
                s.send_message(msg)
            return True
        except Exception as exc:
            logger.warning("SMTP send failed: %s", exc)

    return False


async def _send_otp_email(email: str, otp: str, name: str = "") -> bool:
    """Send OTP email in a thread so it never blocks the event loop."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, functools.partial(_send_email_sync, email, otp, name))


# ─── Public API ───────────────────────────────────────────────────────────────

async def register_user(name: str, email: str, password: str, response: Response) -> dict:
    if db is None:
        raise HTTPException(503, "Database not configured")
    email = email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(409, "An account with this email already exists.")
    doc = {
        "name": name.strip(),
        "email": email,
        "password_hash": hash_password(password),
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


async def login_user(email: str, password: str, request: Request, response: Response) -> dict:
    if db is None:
        raise HTTPException(503, "Database not configured")
    email = email.lower().strip()
    identifier = f"{_client_ip(request)}:{email}"
    await _check_lockout(identifier)
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not verify_password(password, user["password_hash"]):
        await _record_failure(identifier)
        raise HTTPException(401, "Invalid email or password.")
    await db.login_attempts.delete_one({"identifier": identifier})
    user_id = str(user["_id"])
    set_auth_cookies(response, create_access_token(user_id, email), create_refresh_token(user_id))
    return public_user(user)


async def send_otp(email: str, purpose: str, name: Optional[str] = None,
                   password: Optional[str] = None) -> dict:
    if db is None:
        raise HTTPException(503, "Database not configured")
    email = email.lower().strip()

    if purpose == "signup":
        existing_user = await db.users.find_one({"email": email})
        if existing_user:
            raise HTTPException(409, "An account with this email already exists.")
        if not name or not password:
            raise HTTPException(422, "Name and password are required for signup.")
        if len(password) < 6:
            raise HTTPException(422, "Password must be at least 6 characters.")
    elif purpose in ("login", "reset"):
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(404, "No account found with this email.")
        if purpose == "reset" and not user.get("password_hash"):
            raise HTTPException(400, "Cannot reset password for OAuth accounts. Use Google login.")
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
        doc["name"] = name.strip()
        doc["password_hash"] = hash_password(password)

    await db.otps.replace_one({"email": email, "purpose": purpose}, doc, upsert=True)

    dev_mode = not os.environ.get("RESEND_API_KEY", "")
    sent = await _send_otp_email(email, otp, name or "")

    if not sent and not dev_mode:
        raise HTTPException(503, "Failed to send verification email. Please try again shortly.")

    result: dict = {"ok": True, "sent": sent}
    if dev_mode:
        result["dev_otp"] = otp
    return result


async def verify_otp(email: str, otp: str, purpose: str, response: Response) -> dict:
    if db is None:
        raise HTTPException(503, "Database not configured")
    email = email.lower().strip()
    now = datetime.now(timezone.utc)

    otp_doc = await db.otps.find_one_and_update(
        {
            "email": email,
            "purpose": purpose,
            "attempts": {"$lt": OTP_MAX_ATTEMPTS},
            "expires_at": {"$gt": now.isoformat()},
        },
        {"$inc": {"attempts": 1}},
        return_document=False,
    )

    if otp_doc is None:
        stale = await db.otps.find_one({"email": email, "purpose": purpose})
        if not stale:
            raise HTTPException(400, "No verification code found. Please request a new one.")
        if datetime.fromisoformat(stale["expires_at"]) <= now:
            await db.otps.delete_one({"email": email, "purpose": purpose})
            raise HTTPException(400, "Code expired. Please request a new one.")
        await db.otps.delete_one({"email": email, "purpose": purpose})
        raise HTTPException(400, "Too many incorrect attempts. Please request a new code.")

    if _hash_otp(otp) != otp_doc["otp_hash"]:
        attempts_after = otp_doc.get("attempts", 0) + 1
        left = OTP_MAX_ATTEMPTS - attempts_after
        if left <= 0:
            await db.otps.delete_one({"email": email, "purpose": purpose})
            raise HTTPException(400, "Too many incorrect attempts. Please request a new code.")
        raise HTTPException(400, f"Incorrect code. {left} attempt(s) remaining.")

    del_result = await db.otps.delete_one(
        {"email": email, "purpose": purpose, "otp_hash": otp_doc["otp_hash"]}
    )
    if del_result.deleted_count == 0:
        raise HTTPException(400, "Verification code already used. Please request a new one.")

    if purpose == "signup":
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
    elif purpose == "reset":
        raise HTTPException(400, "Use /auth/reset-password for password reset.")
    else:
        user_doc = await db.users.find_one({"email": email})
        if not user_doc:
            raise HTTPException(404, "User not found.")
        user_id = str(user_doc["_id"])

    set_auth_cookies(response, create_access_token(user_id, email), create_refresh_token(user_id))
    return public_user(user_doc)


async def google_auth(access_token: str, response: Response) -> dict:
    google_client_id = os.environ.get("GOOGLE_CLIENT_ID", "")
    if not google_client_id:
        raise HTTPException(503, "Google OAuth not configured — add GOOGLE_CLIENT_ID secret.")
    if db is None:
        raise HTTPException(503, "Database not configured")

    try:
        tokeninfo = http_requests.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"access_token": access_token},
            timeout=10,
        )
        if tokeninfo.status_code != 200:
            raise HTTPException(401, "Invalid Google access token.")
        ti = tokeninfo.json()
        token_audience = ti.get("azp") or ti.get("aud") or ""
        if token_audience != google_client_id:
            raise HTTPException(401, "Google token was not issued for this application.")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "Could not validate Google token.")

    try:
        resp = http_requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
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


async def refresh_token(request: Request, response: Response):
    import jwt as pyjwt
    from auth_utils import get_jwt_secret, JWT_ALGORITHM, _is_secure_context

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
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(401, "User not found")

    access = create_access_token(str(user["_id"]), user["email"])
    response.set_cookie(key="access_token", value=access, httponly=True,
                        secure=_is_secure_context(), samesite="lax", max_age=900, path="/")
    return {"ok": True}


async def update_profile(user: dict, name: Optional[str]) -> dict:
    if db is None:
        raise HTTPException(503, "Database not configured")
    update = {}
    if name:
        update["name"] = name.strip()
    if update:
        await db.users.update_one({"_id": user["_id"]}, {"$set": update})
        updated = await db.users.find_one({"_id": user["_id"]})
        return public_user(updated)
    return public_user(user)


async def change_password(user: dict, current_password: str, new_password: str):
    if db is None:
        raise HTTPException(503, "Database not configured")
    if not user.get("password_hash"):
        raise HTTPException(400, "Cannot change password for OAuth accounts. Set a password first.")
    if not verify_password(current_password, user["password_hash"]):
        raise HTTPException(401, "Current password is incorrect.")
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": hash_password(new_password)}},
    )
    return {"ok": True}


async def reset_password(email: str, otp: str, new_password: str) -> dict:
    if db is None:
        raise HTTPException(503, "Database not configured")
    email = email.lower().strip()

    otp_doc = await db.otps.find_one_and_update(
        {
            "email": email,
            "purpose": "reset",
            "attempts": {"$lt": OTP_MAX_ATTEMPTS},
            "expires_at": {"$gt": datetime.now(timezone.utc).isoformat()},
        },
        {"$inc": {"attempts": 1}},
        return_document=False,
    )
    if not otp_doc:
        raise HTTPException(400, "Invalid or expired OTP. Please request a new one.")
    if _hash_otp(otp) != otp_doc["otp_hash"]:
        raise HTTPException(400, "Incorrect OTP.")
    await db.otps.delete_one({"email": email, "purpose": "reset", "otp_hash": otp_doc["otp_hash"]})

    await db.users.update_one(
        {"email": email},
        {"$set": {"password_hash": hash_password(new_password)}},
    )
    return {"ok": True}


async def list_users(admin_user: dict) -> list:
    if db is None:
        return []
    users = await db.users.find().sort("created_at", -1).to_list(length=200)
    return [
        {
            "id": str(u["_id"]),
            "name": u.get("name", ""),
            "email": u["email"],
            "role": u.get("role", "user"),
            "email_verified": u.get("email_verified", False),
            "created_at": u.get("created_at", ""),
        }
        for u in users
    ]
