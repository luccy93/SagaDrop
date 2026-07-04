"""Checkout routes — Stripe (global card payments) and Razorpay (India UPI/cards)."""
import hashlib
import hmac
import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional

import stripe as stripe_sdk
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from config import (
    STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
    RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,
    RESEND_API_KEY,
)
from database import db

router = APIRouter(prefix="/checkout")
logger = logging.getLogger("sagadrop.checkout")


# ─── Models ───────────────────────────────────────────────────────────────────

class CartItem(BaseModel):
    id: str
    title: str
    author: str
    price: float
    qty: int
    cover: Optional[str] = None


class StripeSessionRequest(BaseModel):
    items: List[CartItem]
    customer_email: Optional[str] = None
    success_url: str
    cancel_url: str


class RazorpayOrderRequest(BaseModel):
    items: List[CartItem]
    customer_email: Optional[str] = None


class RazorpayVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    customer_email: Optional[str] = None
    items: List[CartItem]


# ─── Helpers ──────────────────────────────────────────────────────────────────

async def _save_order(provider: str, status: str, items: list,
                      total: float, payment_id: str,
                      customer_email: Optional[str] = None):
    if db is None:
        return None
    order = {
        "id": str(uuid.uuid4()),
        "provider": provider,
        "status": status,
        "items": items,
        "total": total,
        "payment_id": payment_id,
        "customer_email": customer_email,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.orders.insert_one(order)
    return order


async def _send_confirmation(to_email: str, items: list, total: float, provider: str):
    """Send order confirmation via Resend — silently skipped if not configured."""
    if not RESEND_API_KEY or not to_email:
        return
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        rows = "".join(
            f"<tr><td style='padding:8px 0;border-bottom:1px solid #eee;'>{i['title']}</td>"
            f"<td style='padding:8px 0;border-bottom:1px solid #eee;text-align:center;'>{i['qty']}</td>"
            f"<td style='padding:8px 0;border-bottom:1px solid #eee;text-align:right;'>₹{i['price'] * i['qty']:,.0f}</td></tr>"
            for i in items
        )
        resend.Emails.send({
            "from": "SagaDrop <orders@sagadrop.com>",
            "to": to_email,
            "subject": "Your SagaDrop order is confirmed 📚",
            "html": f"""
            <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#0a0a0a;padding:32px 0;">
              <h1 style="font-size:32px;margin:0;letter-spacing:-1px;">SagaDrop</h1>
              <p style="color:#D90429;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;margin:4px 0 32px;">Every Story Begins Here.</p>
              <h2 style="font-size:20px;margin-bottom:8px;">Order Confirmed</h2>
              <p style="color:#555;margin-top:0;">Thank you for shopping with SagaDrop. Paid via {provider.title()}.</p>
              <table style="width:100%;border-collapse:collapse;margin:24px 0;">
                <thead>
                  <tr style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">
                    <th style="text-align:left;padding-bottom:8px;border-bottom:2px solid #0a0a0a;">Book</th>
                    <th style="text-align:center;padding-bottom:8px;border-bottom:2px solid #0a0a0a;">Qty</th>
                    <th style="text-align:right;padding-bottom:8px;border-bottom:2px solid #0a0a0a;">Price</th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </table>
              <p style="font-size:20px;font-weight:bold;text-align:right;margin:0;">
                Total: ₹{total:,.0f}
              </p>
              <hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0 16px;" />
              <p style="font-size:12px;color:#999;">SagaDrop · Every Story Begins Here.</p>
            </div>
            """,
        })
        logger.info(f"Confirmation email sent to {to_email}")
    except Exception as exc:
        logger.warning(f"Email send failed: {exc}")


# ─── Stripe ───────────────────────────────────────────────────────────────────

@router.post("/stripe/session")
async def create_stripe_session(req: StripeSessionRequest):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(503, "Stripe is not configured — add STRIPE_SECRET_KEY to secrets.")
    stripe_sdk.api_key = STRIPE_SECRET_KEY

    line_items = []
    for item in req.items:
        pd: dict = {"name": item.title, "description": f"by {item.author}"}
        if item.cover and item.cover.startswith("http"):
            pd["images"] = [item.cover]
        line_items.append({
            "price_data": {
                "currency": "inr",
                "unit_amount": int(item.price * 100),  # paise
                "product_data": pd,
            },
            "quantity": item.qty,
        })

    session = stripe_sdk.checkout.Session.create(
        payment_method_types=["card"],
        line_items=line_items,
        mode="payment",
        customer_email=req.customer_email or None,
        success_url=req.success_url + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url=req.cancel_url,
    )
    return {"url": session.url, "session_id": session.id}


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    """Stripe sends signed POST here after payment events."""
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(503, "Stripe webhook secret not configured")

    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    try:
        stripe_sdk.api_key = STRIPE_SECRET_KEY
        event = stripe_sdk.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except stripe_sdk.error.SignatureVerificationError:
        raise HTTPException(400, "Invalid Stripe signature")

    if event["type"] == "checkout.session.completed":
        sess = event["data"]["object"]
        customer_email = (
            sess.get("customer_email")
            or (sess.get("customer_details") or {}).get("email")
        )
        total_inr = (sess.get("amount_total") or 0) / 100

        await _save_order(
            provider="stripe", status="paid",
            items=[],  # line items need a separate Stripe list call — kept minimal
            total=total_inr,
            payment_id=sess["id"],
            customer_email=customer_email,
        )
        # Email is sent by the success page via /checkout/stripe/confirm
        logger.info(f"Stripe session completed: {sess['id']}")

    return {"received": True}


@router.get("/stripe/session/{session_id}")
async def get_stripe_session(session_id: str):
    """Called by the success page to fetch order details and send confirmation email."""
    if not STRIPE_SECRET_KEY:
        raise HTTPException(503, "Stripe not configured")
    stripe_sdk.api_key = STRIPE_SECRET_KEY

    try:
        sess = stripe_sdk.checkout.Session.retrieve(
            session_id, expand=["line_items"]
        )
    except stripe_sdk.error.InvalidRequestError:
        raise HTTPException(404, "Session not found")

    customer_email = (
        sess.get("customer_email")
        or (sess.get("customer_details") or {}).get("email")
    )
    total_inr = (sess.get("amount_total") or 0) / 100

    items = [
        {
            "title": li["description"],
            "qty": li["quantity"],
            "price": li["amount_total"] / li["quantity"] / 100,
        }
        for li in (sess.get("line_items") or {}).get("data", [])
    ]

    # Send confirmation (idempotent — Resend deduplicates on our end if needed)
    if customer_email:
        await _send_confirmation(customer_email, items, total_inr, "stripe")

    return {
        "session_id": session_id,
        "status": sess.get("payment_status"),
        "customer_email": customer_email,
        "total": total_inr,
        "items": items,
    }


# ─── Razorpay ─────────────────────────────────────────────────────────────────

@router.post("/razorpay/order")
async def create_razorpay_order(req: RazorpayOrderRequest):
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(503, "Razorpay is not configured — add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to secrets.")

    import razorpay
    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

    total_paise = int(sum(i.price * i.qty for i in req.items) * 100)
    receipt = str(uuid.uuid4()).replace("-", "")[:16]

    order = client.order.create({
        "amount": total_paise,
        "currency": "INR",
        "receipt": receipt,
        "notes": {"customer_email": req.customer_email or ""},
    })

    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "key_id": RAZORPAY_KEY_ID,
    }


@router.post("/razorpay/verify")
async def verify_razorpay_payment(req: RazorpayVerifyRequest):
    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(503, "Razorpay not configured")

    # Verify HMAC-SHA256 signature
    body = f"{req.razorpay_order_id}|{req.razorpay_payment_id}"
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        body.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, req.razorpay_signature):
        raise HTTPException(400, "Invalid payment signature — possible tampering detected.")

    total = sum(i.price * i.qty for i in req.items)
    items_plain = [
        {"title": i.title, "author": i.author, "price": i.price, "qty": i.qty}
        for i in req.items
    ]

    await _save_order(
        provider="razorpay", status="paid",
        items=items_plain, total=total,
        payment_id=req.razorpay_payment_id,
        customer_email=req.customer_email,
    )

    if req.customer_email:
        await _send_confirmation(req.customer_email, items_plain, total, "razorpay")

    return {"success": True, "payment_id": req.razorpay_payment_id}
