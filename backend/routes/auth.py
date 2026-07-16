from fastapi import APIRouter, HTTPException, Request, Response, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from database import db
from auth_utils import get_current_user
from services.auth_service import (
    register_user, login_user, send_otp, verify_otp,
    google_auth, refresh_token, update_profile,
    change_password, reset_password, list_users,
)

router = APIRouter(prefix="/auth")


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
    purpose: str = "signup"


class VerifyOtpInput(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)
    purpose: str = "signup"


class GoogleAuthInput(BaseModel):
    access_token: str


class AccountState(BaseModel):
    cart: list = []
    wishlist: list = []


class UpdateProfileInput(BaseModel):
    name: Optional[str] = None


class ChangePasswordInput(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=128)


class ResetPasswordInput(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=6, max_length=128)


@router.get("/users")
async def list_users_endpoint(request: Request):
    admin = await get_current_user(request)
    if admin.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return await list_users(admin)


@router.put("/profile")
async def update_profile_endpoint(inp: UpdateProfileInput, user: dict = Depends(get_current_user)):
    return await update_profile(user, inp.name)


@router.post("/change-password")
async def change_password_endpoint(inp: ChangePasswordInput, user: dict = Depends(get_current_user)):
    return await change_password(user, inp.current_password, inp.new_password)


@router.post("/reset-password")
async def reset_password_endpoint(inp: ResetPasswordInput, response: Response):
    return await reset_password(inp.email, inp.otp, inp.new_password)


@router.post("/register")
async def register(inp: RegisterInput, response: Response):
    return await register_user(inp.name, inp.email, inp.password, response)


@router.post("/login")
async def login(inp: LoginInput, request: Request, response: Response):
    return await login_user(inp.email, inp.password, request, response)


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    from auth_utils import public_user
    return public_user(user)


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    return await refresh_token(request, response)


@router.post("/send-otp")
async def send_otp_endpoint(inp: SendOtpInput):
    import os, random
    if inp.purpose == "signup":
        if os.environ.get("RESEND_API_KEY", ""):
            return await send_otp(inp.email, inp.purpose, inp.name, inp.password)
        return {"ok": True, "dev_otp": f"{random.randint(0, 999999):06d}"}
    return await send_otp(inp.email, inp.purpose, inp.name, inp.password)


@router.post("/verify-otp")
async def verify_otp_endpoint(inp: VerifyOtpInput, response: Response):
    return await verify_otp(inp.email, inp.otp, inp.purpose, response)


@router.post("/google")
async def google_auth_endpoint(inp: GoogleAuthInput, response: Response):
    return await google_auth(inp.access_token, response)


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
