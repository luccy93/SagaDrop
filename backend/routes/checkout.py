"""Checkout routes — Stripe (global card payments) and Razorpay (India UPI/cards).

Security model:
- Prices are ALWAYS resolved server-side from the catalog — never trusted from the client.
- Razorpay payments are verified via HMAC-SHA256 before any order is saved.
- Stripe payments are confirmed via the signed webhook; the success-page endpoint
  checks payment_status == 'paid' and uses a DB flag to prevent duplicate emails.
- Webhook handler guards against both SignatureVerificationError and ValueError
  (malformed payload) and is idempotent on payment_id / session_id.
"""
import hashlib
import hmac
import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from catalog import CATALOG
from config import (
    RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,
    RESEND_API_KEY,
    STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
)
from database import db

router = APIRouter(prefix="/checkout")
logger = logging.getLogger("sagadrop.checkout")

# Build a quick lookup dict from the catalog: book_id → Book
_CATALOG_MAP = {book.id: book for book in CATALOG}


# ─── Models ───────────────────────────────────────────────────────────────────

class CartItem(BaseModel):
    """Only id and qty are trusted — price is resolved server-side."""
    id: str
    qty: int


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

def _resolve_items(cart: List[CartItem]):
    """Return (line_items, total_inr). Raises 400 if any book id is unknown."""
    resolved = []
    total = 0.0
    for ci in cart:
        book = _CATALOG_MAP.get(ci.id)
        if book is None:
            raise HTTPException(400, f"Unknown product id: {ci.id!r}")
        if ci.qty < 1:
            raise HTTPException(400, f"Invalid quantity for {ci.id!r}")
        line = {
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "price": float(book.price),
            "qty": ci.qty,
            "cover": book.cover,
        }
        total += book.price * ci.qty
        resolved.append(line)
    return resolved, round(total, 2)


async def _save_order(provider: str, status: str, items: list,
                      total: float, payment_id: str,
                      customer_email: Optional[str] = None) -> Optional[dict]:
    """Persist order to DB. Returns None if DB is unavailable."""
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
        "email_sent": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.orders.insert_one(order)
    return order


async def _is_duplicate_payment(payment_id: str) -> bool:
    """Return True if this payment_id / session_id is already recorded."""
    if db is None:
        return False
    existing = await db.orders.find_one({"payment_id": payment_id})
    return existing is not None


async def _mark_email_sent(payment_id: str):
    """Flip email_sent flag so we don't resend on repeated success-page loads."""
    if db is None:
        return
    await db.orders.update_one(
        {"payment_id": payment_id},
        {"$set": {"email_sent": True}},
    )


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
            f"<td style='padding:8px 0;border-bottom:1px solid #eee;text-align:right;'>"
            f"₹{i['price'] * i['qty']:,.0f}</td></tr>"
            for i in items
        )
        resend.Emails.send({
            "from": "SagaDrop <orders@sagadrop.com>",
            "to": to_email,
            "subject": "Your SagaDrop order is confirmed 📚",
            "html": f"""
            <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;
                        color:#0a0a0a;padding:32px 0;">
              <h1 style="font-size:32px;margin:0;letter-spacing:-1px;">SagaDrop</h1>
              <p style="color:#D90429;font-size:11px;letter-spacing:0.18em;
                        text-transform:uppercase;margin:4px 0 32px;">
                Every Story Begins Here.
              </p>
              <h2 style="font-size:20px;margin-bottom:8px;">Order Confirmed</h2>
              <p style="color:#555;margin-top:0;">
                Thank you for shopping with SagaDrop. Paid via {provider.title()}.
              </p>
              <table style="width:100%;border-collapse:collapse;margin:24px 0;">
                <thead>
                  <tr style="font-size:11px;text-transform:uppercase;
                             letter-spacing:0.1em;color:#999;">
                    <th style="text-align:left;padding-bottom:8px;
                               border-bottom:2px solid #0a0a0a;">Book</th>
                    <th style="text-align:center;padding-bottom:8px;
                               border-bottom:2px solid #0a0a0a;">Qty</th>
                    <th style="text-align:right;padding-bottom:8px;
                               border-bottom:2px solid #0a0a0a;">Price</th>
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
        logger.info("Confirmation email sent to %s", to_email)
    except Exception as exc:
        logger.warning("Email send failed: %s", exc)


# ─── Stripe ───────────────────────────────────────────────────────────────────

@router.post("/stripe/session")
async def create_stripe_session(req: StripeSessionRequest):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(503, "Stripe is not configured — add STRIPE_SECRET_KEY to secrets.")

    try:
        import stripe as stripe_sdk
    except ImportError:
        raise HTTPException(503, "Stripe SDK not installed.")

    stripe_sdk.api_key = STRIPE_SECRET_KEY
    resolved, _total = _resolve_items(req.items)

    line_items = []
    for item in resolved:
        pd: dict = {"name": item["title"], "description": f"by {item['author']}"}
        if item.get("cover") and item["cover"].startswith("http"):
            pd["images"] = [item["cover"]]
        line_items.append({
            "price_data": {
                "currency": "inr",
                "unit_amount": int(item["price"] * 100),  # paise
                "product_data": pd,
            },
            "quantity": item["qty"],
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

    try:
        import stripe as stripe_sdk
    except ImportError:
        raise HTTPException(503, "Stripe SDK not installed.")

    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    try:
        stripe_sdk.api_key = STRIPE_SECRET_KEY
        event = stripe_sdk.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except stripe_sdk.error.SignatureVerificationError:
        raise HTTPException(400, "Invalid Stripe signature")
    except ValueError:
        raise HTTPException(400, "Malformed webhook payload")

    if event["type"] == "checkout.session.completed":
        sess = event["data"]["object"]
        if sess.get("payment_status") != "paid":
            return {"received": True}  # not yet paid — ignore

        session_id = sess["id"]
        if await _is_duplicate_payment(session_id):
            logger.info("Duplicate webhook for session %s — skipped", session_id)
            return {"received": True}

        customer_email = (
            sess.get("customer_email")
            or (sess.get("customer_details") or {}).get("email")
        )
        total_inr = (sess.get("amount_total") or 0) / 100

        await _save_order(
            provider="stripe", status="paid",
            items=[],  # authoritative line items fetched by success page
            total=total_inr,
            payment_id=session_id,
            customer_email=customer_email,
        )
        logger.info("Stripe session completed: %s", session_id)

    return {"received": True}


@router.get("/stripe/session/{session_id}")
async def get_stripe_session(session_id: str):
    """Called by the success page to display order details and send confirmation email once."""
    if not STRIPE_SECRET_KEY:
        raise HTTPException(503, "Stripe not configured")

    try:
        import stripe as stripe_sdk
    except ImportError:
        raise HTTPException(503, "Stripe SDK not installed.")

    stripe_sdk.api_key = STRIPE_SECRET_KEY

    try:
        sess = stripe_sdk.checkout.Session.retrieve(
            session_id, expand=["line_items"]
        )
    except stripe_sdk.error.InvalidRequestError:
        raise HTTPException(404, "Session not found")

    # Only proceed for actually paid sessions
    if sess.get("payment_status") != "paid":
        raise HTTPException(402, "Payment not completed")

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

    # Send confirmation email at most once per session
    if customer_email and db is not None:
        record = await db.orders.find_one({"payment_id": session_id})
        if record and not record.get("email_sent"):
            await _send_confirmation(customer_email, items, total_inr, "stripe")
            await _mark_email_sent(session_id)
    elif customer_email and db is None:
        # No DB — just send once (can't track; best-effort)
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
        raise HTTPException(
            503,
            "Razorpay is not configured — add RAZORPAY_KEY_ID and "
            "RAZORPAY_KEY_SECRET to secrets.",
        )

    try:
        import razorpay
    except ImportError:
        raise HTTPException(503, "Razorpay SDK not installed.")

    resolved, total_inr = _resolve_items(req.items)
    total_paise = int(total_inr * 100)
    receipt = str(uuid.uuid4()).replace("-", "")[:16]

    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
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
        # Return resolved items so the frontend can show accurate prices
        "items": resolved,
        "total": total_inr,
    }


@router.post("/razorpay/verify")
async def verify_razorpay_payment(req: RazorpayVerifyRequest):
    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(503, "Razorpay not configured")

    # Idempotency — refuse to record the same payment twice
    if await _is_duplicate_payment(req.razorpay_payment_id):
        logger.info("Duplicate Razorpay payment %s — skipped", req.razorpay_payment_id)
        return {"success": True, "payment_id": req.razorpay_payment_id}

    # Verify HMAC-SHA256 signature
    body = f"{req.razorpay_order_id}|{req.razorpay_payment_id}"
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        body.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, req.razorpay_signature):
        raise HTTPException(400, "Invalid payment signature — possible tampering detected.")

    # Resolve prices server-side from the catalog
    resolved, total = _resolve_items(req.items)

    await _save_order(
        provider="razorpay", status="paid",
        items=resolved, total=total,
        payment_id=req.razorpay_payment_id,
        customer_email=req.customer_email,
    )

    if req.customer_email:
        await _send_confirmation(req.customer_email, resolved, total, "razorpay")
        await _mark_email_sent(req.razorpay_payment_id)

    return {"success": True, "payment_id": req.razorpay_payment_id}
