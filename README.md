# SagaDrop — Premium Story Book Marketplace

Full-stack book store: **React (Vite) frontend** on Vercel, **FastAPI backend** on Render, **MongoDB (Atlas)**, and **Redis** on the free tier.

---

## Live URLs

- Frontend: https://saga-drop-gules.vercel.app
- Backend: https://sagadrop-backend.onrender.com
- Health check: https://sagadrop-backend.onrender.com/api/health

---

## Repository

- GitHub: https://github.com/luccy93/SagaDrop (author identity: `luccy93 <devadraprasadkumar@gmail.com>`)

---

## Production Setup (all done)

### Email delivery — Brevo (primary)
Render blocks outbound SMTP (587/465) on its free tier, so Gmail SMTP fails from Render. Emails are sent over HTTPS via the Brevo API instead (300 free emails/day). Order of senders: **Brevo → Gmail SMTP (fallback) → Resend (fallback)**.

| Env var | Value |
|---|---|
| `BREVO_API_KEY` | `xkeysib-...` (set in Render; DO NOT commit) |
| `BREVO_FROM` | `devadraprasadkumar@gmail.com` |
| `BREVO_FROM_NAME` | `SagaDrop` |

- Verify sender address in Brevo dashboard (no domain needed).
- SMTP vars (`SMTP_HOST`, `SMTP_PORT=465`, `SMTP_USER=pookrish81@gmail.com`, `SMTP_PASS=<app password>`) still exist as fallback for local/dev. Gmail App Passwords rotate; regenerate at myaccount.google.com → App passwords.
- `RESEND_API_KEY` / `RESEND_FROM` remain as last-resort fallback. Resend free tier only delivers to the account owner's verified address without a domain.

### Payments — Razorpay (UPI / Indian cards) + Stripe (cards)
| Env var | Value |
|---|---|
| `RAZORPAY_KEY_ID` | `rzp_live_...` (set in Render; DO NOT commit) |
| `RAZORPAY_KEY_SECRET` | set in Render; DO NOT commit |
| `STRIPE_SECRET_KEY` | `sk_...` (set in Render; DO NOT commit) |
| `STRIPE_WEBHOOK_SECRET` | (set if added — Developer → Webhooks → `https://sagadrop-backend.onrender.com/api/checkout/stripe/webhook`, event `checkout.session.completed`) |

- Test cards: `4242 4242 4242 4242` (Stripe) — any future expiry, any CVV. Razorpay UPI test: `success@razorpay`.
- Razorpay verification happens client-side (`/api/checkout/razorpay/verify`); a webhook is NOT required and would not parse correctly at that endpoint.

### Authentication
- **Email OTP** (signup, login, password reset): 6-digit code sent via Brevo; 10-min expiry, 5 attempts, 60s resend cooldown, lockout after 5 failed logins.
- **Google OAuth**: `GOOGLE_CLIENT_ID` set in Render (Client ID from Google Cloud Console, published to production). Authorized origins: `https://saga-drop-gules.vercel.app`, `http://localhost:3000`.
- Admin: `ADMIN_EMAIL=admin@sagadrop.com`, `ADMIN_PASSWORD=<set in Render>`. Admin user auto-created on backend startup.

### Core env vars (Render → Environment)
`MONGO_URL`, `REDIS_URL`, `DB_NAME=sagadrop`, `JWT_SECRET` (long random string), `CORS_ORIGINS` (Vercel + localhost), `GOOGLE_CLIENT_ID`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `BREVO_API_KEY`, `BREVO_FROM`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `STRIPE_SECRET_KEY`. SMTP vars kept only as fallback.

⚠️ **Never commit secrets.** API keys live only in Render Environment (masked). If a key leaks, regenerate it.

### Cold-start keep-alive
Free Render instances sleep after ~15 min idle. A UptimeRobot monitor pings `https://sagadrop-backend.onrender.com/api/health` every 5 minutes to keep the backend warm. Alternative: cron-job.org.

---

## Local Development

### Backend
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
copy .env.example .env                          # fill MONGO_URL, JWT_SECRET, etc.
uvicorn server:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev     # http://localhost:3000
```

Frontend proxies `/api` to the backend via `vercel.json` (production) and Vite config (dev).

---

## Testing

- Backend: `cd backend && pytest`
- Frontend: `cd frontend && npm test`

## Tech Stack
React 18 · Vite · Tailwind CSS · framer-motion · FastAPI · Motor (MongoDB) · Redis · Brevo · Razorpay · Stripe · Google OAuth · Sentry (optional) · PostHog (optional) · Meilisearch (optional)
