---
name: Checkout integration security model
description: How SagaDrop's checkout routes prevent price tampering and duplicate payments
---

**Rule:** The frontend only sends `{id, qty}` per cart item. The backend resolves every price via `_resolve_items()` from `CATALOG` (catalog.py) — never from the request body.

**Why:** Without server-side pricing, a tampered client payload could set any price. HMAC verification alone (Razorpay) only proves the order was unmodified after creation, not that the amount was correct to begin with.

**How to apply:** Any new checkout provider must call `_resolve_items(req.items)` before computing totals. Never add a `price` field back to `CartItem`.

**Idempotency:** `_is_duplicate_payment(payment_id)` blocks duplicate DB writes for both Stripe (session_id) and Razorpay (payment_id). Webhook handler also guards this.

**Email deduplication:** DB `email_sent` flag prevents resending on repeated success-page loads. Falls back to best-effort (single send) when DB is unavailable.
