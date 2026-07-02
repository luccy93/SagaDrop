from datetime import datetime, timezone, timedelta
from typing import List, Optional

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


class RegisterInput(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class AccountState(BaseModel):
    cart: List[dict] = []
    wishlist: List[dict] = []


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "unknown")


async def _check_lockout(identifier: str):
    doc = await db.login_attempts.find_one({"identifier": identifier})
    if doc and doc.get("count", 0) >= MAX_ATTEMPTS:
        locked_until = doc.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(429, "Too many failed attempts. Try again in 15 minutes.")
        await db.login_attempts.delete_one({"identifier": identifier})


async def _record_failure(identifier: str):
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


@router.post("/register")
async def register(inp: RegisterInput, response: Response):
    email = inp.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(409, "An account with this email already exists.")
    doc = {
        "name": inp.name.strip(),
        "email": email,
        "password_hash": hash_password(inp.password),
        "role": "user",
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
    email = inp.email.lower().strip()
    identifier = f"{_client_ip(request)}:{email}"
    await _check_lockout(identifier)

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(inp.password, user["password_hash"]):
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

    from bson import ObjectId
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(401, "User not found")
    access = create_access_token(str(user["_id"]), user["email"])
    response.set_cookie(key="access_token", value=access, httponly=True,
                        secure=False, samesite="lax", max_age=900, path="/")
    return {"ok": True}


# ─── Persisted cart & wishlist ────────────────────────────────────────
@router.get("/state", response_model=AccountState)
async def get_state(user: dict = Depends(get_current_user)):
    return AccountState(cart=user.get("cart", []), wishlist=user.get("wishlist", []))


@router.put("/state")
async def put_state(state: AccountState, user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"cart": state.cart[:100], "wishlist": state.wishlist[:100]}},
    )
    return {"ok": True}
