"""Coupon routes — thin wrappers over services/coupon_service.py"""
from typing import Optional

from fastapi import APIRouter, HTTPException, Request

from services.coupon_service import (
    create_coupon, list_coupons, delete_coupon,
    validate_coupon, claim_coupon,
)
from auth_utils import get_current_user
from pydantic import BaseModel, Field

router = APIRouter(prefix="/coupons")


class CouponInput(BaseModel):
    code: str = Field(min_length=3, max_length=30)
    discount_percent: float = Field(ge=0, le=100)
    max_uses: int = Field(default=0, ge=0)
    expires_at: Optional[str] = None


class ValidateInput(BaseModel):
    code: str
    cart_total: float


class ValidateOut(BaseModel):
    valid: bool
    discount_percent: float = 0
    discounted_total: float = 0
    message: str = ""


async def _require_admin(request: Request):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return user


@router.post("/admin")
async def create_coupon_endpoint(inp: CouponInput, request: Request):
    await _require_admin(request)
    return await create_coupon(inp.code, inp.discount_percent, inp.max_uses, inp.expires_at)


@router.get("/admin")
async def list_coupons_endpoint(request: Request):
    await _require_admin(request)
    return await list_coupons()


@router.delete("/admin/{code}")
async def delete_coupon_endpoint(code: str, request: Request):
    await _require_admin(request)
    return await delete_coupon(code)


@router.post("/validate", response_model=ValidateOut)
async def validate_coupon_endpoint(inp: ValidateInput):
    return await validate_coupon(inp.code, inp.cart_total)


@router.post("/claim")
async def claim_coupon_endpoint(inp: ValidateInput):
    return await claim_coupon(inp.code)
