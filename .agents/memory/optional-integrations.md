---
name: Optional integrations pattern
description: How payment/email SDKs are imported and guarded when keys are absent
---

**Rule:** Stripe, Razorpay, and Resend are imported inside route handlers (not at module level) and gated by key presence checks. Missing keys → clean 503 with a helpful message, not a startup crash.

**Why:** On Replit, users may not have connected integrations yet. A module-level `import stripe` would crash uvicorn startup if the package is absent or keys are missing.

**How to apply:** Keep all three imports (`import stripe`, `import razorpay`, `import resend`) inside the functions that use them. Always check `if not STRIPE_SECRET_KEY` (etc.) before importing. Add new payment SDKs to `backend/requirements.txt`.

**Keys read from:** `backend/config.py` via `os.environ.get(...)`. Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Razorpay: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`. Email: `RESEND_API_KEY`.
