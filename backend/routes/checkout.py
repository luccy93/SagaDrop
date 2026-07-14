"""Checkout routes — thin wrappers over services/checkout_service.py"""
import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel

from services.checkout_service import (
    CartItem, Address,
    create_stripe_session, handle_stripe_webhook,
    get_stripe_session_details,
    create_razorpay_order, verify_razorpay_payment,
    get_my_orders, get_all_orders, update_order_status,
)
from auth_utils import get_current_user

router = APIRouter(prefix="/checkout")
logger = logging.getLogger("sagadrop.checkout")


class StripeSessionRequest(BaseModel):
    items: List[CartItem]
    customer_email: Optional[str] = None
    success_url: str
    cancel_url: str
    shipping_address: Optional[Address] = None


class RazorpayOrderRequest(BaseModel):
    items: List[CartItem]
    customer_email: Optional[str] = None
    shipping_address: Optional[Address] = None


class RazorpayVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    customer_email: Optional[str] = None
    items: List[CartItem]
    shipping_address: Optional[Address] = None


class StatusUpdate(BaseModel):
    status: str


# ─── Stripe ───────────────────────────────────────────────────────────────────

@router.post("/stripe/session")
async def create_stripe_session_endpoint(req: StripeSessionRequest):
    addr_dict = req.shipping_address.model_dump() if req.shipping_address else None
    return await create_stripe_session(
        req.items, req.customer_email,
        req.success_url, req.cancel_url,
        addr_dict,
    )


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    return await handle_stripe_webhook(payload, sig)


@router.get("/stripe/session/{session_id}")
async def get_stripe_session(session_id: str):
    return await get_stripe_session_details(session_id)


# ─── Razorpay ─────────────────────────────────────────────────────────────────

@router.post("/razorpay/order")
async def create_razorpay_order_endpoint(req: RazorpayOrderRequest):
    return await create_razorpay_order(req.items, req.customer_email)


@router.post("/razorpay/verify")
async def verify_razorpay_payment_endpoint(req: RazorpayVerifyRequest):
    addr_dict = req.shipping_address.model_dump() if req.shipping_address else None
    return await verify_razorpay_payment(
        req.razorpay_order_id, req.razorpay_payment_id,
        req.razorpay_signature, req.customer_email,
        req.items, addr_dict,
    )


# ─── Order management ─────────────────────────────────────────────────────────

@router.get("/orders")
async def list_orders_admin(request: Request):
    admin = await get_current_user(request)
    if admin.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return await get_all_orders()


@router.get("/my-orders")
async def my_orders(user: dict = Depends(get_current_user)):
    return await get_my_orders(user.get("email", ""))


@router.patch("/orders/{order_id}/status")
async def update_order_status_endpoint(order_id: str, body: StatusUpdate, request: Request):
    admin = await get_current_user(request)
    if admin.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return await update_order_status(order_id, body.status)
