"""Checkout & order business logic."""
import hashlib
import hmac
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import HTTPException
from pydantic import BaseModel

from catalog import CATALOG
from config import (
    RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,
    RESEND_API_KEY,
    STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
)
from database import db

logger = logging.getLogger("sagadrop.checkout")

_CATALOG_MAP = {book.id: book for book in CATALOG}


class CartItem(BaseModel):
    id: str
    qty: int


class Address(BaseModel):
    line1: str
    line2: Optional[str] = ""
    city: str
    state: str
    pincode: str
    phone: Optional[str] = ""


def resolve_items(cart: List[CartItem]):
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


async def save_order(provider: str, status: str, items: list,
                     total: float, payment_id: str,
                     customer_email: Optional[str] = None,
                     shipping_address: Optional[dict] = None,
                     user_id: Optional[str] = None) -> Optional[dict]:
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
        "user_id": user_id,
        "shipping_address": shipping_address,
        "email_sent": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.orders.insert_one(order)
    return order


async def is_duplicate_payment(payment_id: str) -> bool:
    if db is None:
        return False
    existing = await db.orders.find_one({"payment_id": payment_id})
    return existing is not None


async def mark_email_sent(payment_id: str):
    if db is None:
        return
    await db.orders.update_one(
        {"payment_id": payment_id},
        {"$set": {"email_sent": True}},
    )


def build_line_items(resolved: list) -> list:
    line_items = []
    for item in resolved:
        pd: dict = {"name": item["title"], "description": f"by {item['author']}"}
        if item.get("cover") and item["cover"].startswith("http"):
            pd["images"] = [item["cover"]]
        line_items.append({
            "price_data": {
                "currency": "inr",
                "unit_amount": int(item["price"] * 100),
                "product_data": pd,
            },
            "quantity": item["qty"],
        })
    return line_items


async def send_confirmation(to_email: str, items: list, total: float, provider: str):
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


async def create_stripe_session(items: list, customer_email: Optional[str],
                                 success_url: str, cancel_url: str,
                                 shipping_address: Optional[dict] = None) -> dict:
    if not STRIPE_SECRET_KEY:
        raise HTTPException(503, "Stripe is not configured — add STRIPE_SECRET_KEY to secrets.")

    try:
        import stripe as stripe_sdk
    except ImportError:
        raise HTTPException(503, "Stripe SDK not installed.")

    stripe_sdk.api_key = STRIPE_SECRET_KEY
    resolved, _total = resolve_items(items)
    line_items = build_line_items(resolved)

    metadata = {}
    if shipping_address:
        metadata["shipping_address"] = json.dumps(shipping_address)

    session = stripe_sdk.checkout.Session.create(
        payment_method_types=["card"],
        line_items=line_items,
        mode="payment",
        customer_email=customer_email or None,
        success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url=cancel_url,
        metadata=metadata,
    )
    return {"url": session.url, "session_id": session.id}


async def handle_stripe_webhook(payload: bytes, sig: str) -> dict:
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(503, "Stripe webhook secret not configured")

    try:
        import stripe as stripe_sdk
    except ImportError:
        raise HTTPException(503, "Stripe SDK not installed.")

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
            return {"received": True}

        session_id = sess["id"]
        if await is_duplicate_payment(session_id):
            logger.info("Duplicate webhook for session %s — skipped", session_id)
            return {"received": True}

        customer_email = (
            sess.get("customer_email")
            or (sess.get("customer_details") or {}).get("email")
        )
        total_inr = (sess.get("amount_total") or 0) / 100

        meta = sess.get("metadata") or {}
        shipping_address = None
        if meta.get("shipping_address"):
            try:
                shipping_address = json.loads(meta["shipping_address"])
            except Exception:
                pass

        await save_order(
            provider="stripe", status="paid",
            items=[],
            total=total_inr,
            payment_id=session_id,
            customer_email=customer_email,
            shipping_address=shipping_address,
        )
        logger.info("Stripe session completed: %s", session_id)

    return {"received": True}


async def get_stripe_session_details(session_id: str) -> dict:
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

    if customer_email and db is not None:
        record = await db.orders.find_one({"payment_id": session_id})
        if record and not record.get("email_sent"):
            await send_confirmation(customer_email, items, total_inr, "stripe")
            await mark_email_sent(session_id)
    elif customer_email and db is None:
        await send_confirmation(customer_email, items, total_inr, "stripe")

    return {
        "session_id": session_id,
        "status": sess.get("payment_status"),
        "customer_email": customer_email,
        "total": total_inr,
        "items": items,
    }


async def create_razorpay_order(items: list, customer_email: Optional[str]) -> dict:
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(503, "Razorpay is not configured")

    try:
        import razorpay
    except ImportError:
        raise HTTPException(503, "Razorpay SDK not installed.")

    resolved, total_inr = resolve_items(items)
    total_paise = int(total_inr * 100)
    receipt = str(uuid.uuid4()).replace("-", "")[:16]

    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    order = client.order.create({
        "amount": total_paise,
        "currency": "INR",
        "receipt": receipt,
        "notes": {"customer_email": customer_email or ""},
    })

    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "key_id": RAZORPAY_KEY_ID,
        "items": resolved,
        "total": total_inr,
    }


async def verify_razorpay_payment(order_id: str, payment_id: str, signature: str,
                                    customer_email: Optional[str], items: list,
                                    shipping_address: Optional[dict] = None) -> dict:
    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(503, "Razorpay not configured")

    if await is_duplicate_payment(payment_id):
        logger.info("Duplicate Razorpay payment %s — skipped", payment_id)
        return {"success": True, "payment_id": payment_id}

    body = f"{order_id}|{payment_id}"
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        body.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise HTTPException(400, "Invalid payment signature — possible tampering detected.")

    resolved, total = resolve_items(items)

    await save_order(
        provider="razorpay", status="paid",
        items=resolved, total=total,
        payment_id=payment_id,
        customer_email=customer_email,
        shipping_address=shipping_address,
    )

    if customer_email:
        await send_confirmation(customer_email, resolved, total, "razorpay")
        await mark_email_sent(payment_id)

    return {"success": True, "payment_id": payment_id}


async def get_my_orders(email: str) -> list:
    if db is None:
        return []
    orders = await db.orders.find({"customer_email": email}).sort("created_at", -1).to_list(length=50)
    for o in orders:
        o["_id"] = str(o["_id"])
    return orders


async def get_all_orders() -> list:
    if db is None:
        return []
    orders = await db.orders.find().sort("created_at", -1).to_list(length=200)
    for o in orders:
        o["_id"] = str(o["_id"])
    return orders


async def update_order_status(order_id: str, status: str):
    if db is None:
        raise HTTPException(503, "Database not configured")
    if status not in ("paid", "processing", "shipped", "delivered", "cancelled"):
        raise HTTPException(422, "Invalid status")
    result = await db.orders.update_one(
        {"id": order_id}, {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Order not found")
    return {"ok": True}
