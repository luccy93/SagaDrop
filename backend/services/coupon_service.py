"""Coupon/promo code business logic."""
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException

from database import db

logger = logging.getLogger("sagadrop.coupons")


async def create_coupon(code: str, discount_percent: float, max_uses: int = 0,
                         expires_at: Optional[str] = None) -> dict:
    if db is None:
        raise HTTPException(503, "Database not configured")
    code = code.upper().strip()
    existing = await db.coupons.find_one({"code": code})
    if existing:
        raise HTTPException(409, "Coupon code already exists")
    doc = {
        "code": code,
        "discount_percent": discount_percent,
        "max_uses": max_uses,
        "uses": 0,
        "expires_at": expires_at,
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.coupons.insert_one(doc)
    return doc


async def list_coupons() -> list:
    if db is None:
        return []
    return await db.coupons.find().sort("created_at", -1).to_list(length=100)


async def delete_coupon(code: str):
    if db is None:
        raise HTTPException(503, "Database not configured")
    r = await db.coupons.delete_one({"code": code.upper().strip()})
    if r.deleted_count == 0:
        raise HTTPException(404, "Coupon not found")
    return {"ok": True}


async def validate_coupon(code: str, cart_total: float) -> dict:
    if db is None:
        return {"valid": False, "discount_percent": 0, "discounted_total": 0, "message": "Database not available"}
    code = code.upper().strip()
    coupon = await db.coupons.find_one({"code": code})
    if not coupon:
        return {"valid": False, "discount_percent": 0, "discounted_total": 0, "message": "Invalid coupon code"}
    if not coupon.get("active", True):
        return {"valid": False, "discount_percent": 0, "discounted_total": 0, "message": "This coupon is no longer active"}
    max_uses = coupon.get("max_uses", 0)
    uses = coupon.get("uses", 0)
    if max_uses > 0 and uses >= max_uses:
        return {"valid": False, "discount_percent": 0, "discounted_total": 0, "message": "This coupon has reached its usage limit"}
    expires_at = coupon.get("expires_at")
    if expires_at:
        try:
            if datetime.fromisoformat(expires_at) < datetime.now(timezone.utc):
                return {"valid": False, "discount_percent": 0, "discounted_total": 0, "message": "This coupon has expired"}
        except ValueError:
            pass
    discount = round(cart_total * coupon["discount_percent"] / 100, 2)
    discounted_total = round(cart_total - discount, 2)
    return {
        "valid": True,
        "discount_percent": coupon["discount_percent"],
        "discounted_total": discounted_total,
        "message": f"{coupon['discount_percent']:.0f}% off — ₹{discount:,.0f} saved",
    }


async def claim_coupon(code: str):
    if db is None:
        raise HTTPException(503, "Database not configured")
    code = code.upper().strip()
    r = await db.coupons.update_one(
        {"code": code, "active": True},
        {"$inc": {"uses": 1}},
    )
    if r.matched_count == 0:
        raise HTTPException(400, "Invalid or inactive coupon")
    return {"ok": True}
