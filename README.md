<p align="center">
  <img src="https://img.shields.io/badge/SagaDrop-Premium%20Story%20Book%20Marketplace-%23D90429?style=for-the-badge" alt="SagaDrop">
</p>

<p align="center">
  <strong>Every Story Begins Here.</strong>
</p>

<p align="center">
  <a href="https://saga-drop-gules.vercel.app">Live Demo</a> ·
  <a href="https://sagadrop-backend.onrender.com/api/health">API Health</a> ·
  <a href="https://github.com/luccy93/SagaDrop">GitHub</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square">
  <img src="https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white&style=flat-square">
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white&style=flat-square">
  <img src="https://img.shields.io/badge/Redis-7-FF4438?logo=redis&logoColor=white&style=flat-square">
  <img src="https://img.shields.io/badge/Razorpay-Live-0C2451?logo=razorpay&logoColor=white&style=flat-square">
  <img src="https://img.shields.io/badge/Stripe-Test-635BFF?logo=stripe&logoColor=white&style=flat-square">
  <img src="https://img.shields.io/badge/Google-OAuth-4285F4?logo=google&logoColor=white&style=flat-square">
  <img src="https://img.shields.io/badge/Deploy-Vercel%20%2B%20Render-000000?style=flat-square">
</p>

---

## Overview

SagaDrop is a full-stack premium story book marketplace. A cinematic React storefront with a 3D hero experience sits on top of a FastAPI backend with JWT-authenticated checkout, OTP email verification, mood-based recommendations, a bespoke book customizer with shareable Open Graph pages, admin analytics, and production-grade observability.

It is fully deployed: the **React frontend runs on Vercel**, the **FastAPI backend runs on Render (free tier)**, backed by **MongoDB Atlas**, **Redis**, and optional **Meilisearch** — with graceful degradation so the store stays up even if an optional service is unavailable.

---

## Live URLs

| Service   | URL                                              |
|-----------|--------------------------------------------------|
| Frontend  | https://saga-drop-gules.vercel.app               |
| Backend   | https://sagadrop-backend.onrender.com            |
| Health    | https://sagadrop-backend.onrender.com/api/health |
| API Docs  | `https://sagadrop-backend.onrender.com/docs`     |

---

## Features

- **Cinematic storefront** — 3D hero (`@react-three/fiber` + `drei`), smooth scroll (Lenis), animated marquees, dark editorial design system.
- **Full catalog** — 40+ curated titles seeded at startup with prices in INR, ratings, badges (Best Seller / Trending / Award Winner) and curated collections (Editor's Picks, Award Winners, Collector Editions, New Releases).
- **Search & browse** — instant search powered by **Meilisearch** when available (in-memory fallback), plus category, collection, price-range, and sorting filters.
- **Mood-based Book Advisor** — `/api/recommend` returns hand-picked, mood-matched titles with reasons.
- **Bespoke Book Customizer** — configure material, foil, size, paper, finish and edge stain; generate a shareable cover with server-rendered Open Graph/Twitter card page and view tracking.
- **Authentication** — email **OTP** signup/login/password-reset (SHA-256 hashed codes, 10-min expiry, 5 attempts, 60 s resend cooldown) and **Google OAuth** (audience-validated). JWT access (15 min) + refresh (7 day) tokens in `httpOnly` cookies.
- **Checkout** — **Razorpay** (live — UPI & Indian cards) verified via HMAC signature on the server, and **Stripe Checkout** (cards) with signature-verified webhooks. Duplicate-payment protection.
- **Order management** — per-customer order history and an admin order pipeline (paid → processing → shipped → delivered / cancelled).
- **Coupons** — admin-created percentage coupons with usage caps and expiry; validated server-side.
- **Reviews & ratings** — authenticated users rate books once per book; aggregate rating stats per title.
- **Newsletter** — idempotent email capture.
- **Account sync** — cart & wishlist persist to the user's account (debounced) and restore on login.
- **Admin panel** — dashboard, books CRUD, orders, coupons, customers, analytics; every admin action written to an **audit log**.
- **Observability** — Prometheus metrics (`/api/metrics`), Sentry error tracking, PostHog analytics, structured audit logs, health endpoint.

---

## System Architecture

```mermaid
flowchart LR
    subgraph Client
        FE["React SPA (Vercel)
            React 19 · Vite/CRA · Tailwind
            Framer Motion · React Three Fiber"]
    end

    subgraph Edge
        V["vercel.json rewrites
            /api/* → Render"]
    end

    subgraph API["FastAPI Backend (Render)"]
        GW["app (server.py)
            CORS · Security Headers
            Rate Limit · Metrics"]
        R1["routes/books"]
        R2["routes/auth"]
        R3["routes/checkout"]
        R4["routes/coupons"]
        R5["routes/reviews"]
        R6["routes/share"]
        R7["routes/newsletter"]
        R8["routes/recommendations"]
        R9["routes/storage"]
    end

    subgraph Services["Service Layer"]
        S1["auth_service"]
        S2["book_service"]
        S3["checkout_service"]
        S4["coupon_service"]
        S5["review_service"]
        S6["search_service"]
        S7["cache_service"]
        S8["queue_service"]
        S9["audit_service"]
        S10["analytics_service"]
        S11["monitoring_service"]
    end

    subgraph Data["Data Layer"]
        DB[("MongoDB Atlas
            users · books · orders · otps
            login_attempts · coupons · reviews
            shared_books · newsletter · audit_logs")]
        RD[("Redis
            cache + ARQ queue")]
        MS[("Meilisearch
            books index")]
    end

    subgraph External["External Providers"]
        E1["Brevo (primary email)
            Gmail SMTP (fallback)
            Resend (fallback)"]
        E2["Razorpay (live)"]
        E3["Stripe (checkout)"]
        E4["Google OAuth 2.0"]
        E5["Sentry · PostHog"]
    end

    FE --> V
    V --> GW
    GW --> R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9
    R1 --> S2
    R2 --> S1
    R3 --> S3
    R4 --> S4
    R5 --> S5
    R6 --> S6
    R6 -. 3D share page .-> DB
    S1 --> E1 & E4
    S3 --> E2 & E3
    S2 --> S6 & S7
    S7 --> RD
    S8 --> RD
    S6 --> MS
    S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10 & S11 --> DB
    S10 --> E5
    S11 --> E5
```

---

## Application Flows

### Email OTP signup / login

```mermaid
sequenceDiagram
    participant U as User
    participant FE as React SPA
    participant API as FastAPI
    participant DB as MongoDB
    participant MX as Brevo (fallback SMTP/Resend)

    U->>FE: Enter email (signup/login/reset)
    FE->>API: POST /api/auth/send-otp
    API->>DB: Hash + store OTP (SHA-256, 10-min TTL)
    API->>MX: Send 6-digit code
    MX-->>U: Email delivered
    U->>FE: Enter code
    FE->>API: POST /api/auth/verify-otp
    API->>DB: Validate hash, attempts, expiry
    API-->>FE: 200 + set httpOnly access/refresh cookies
    FE->>FE: Authenticated session
```

### Checkout — Razorpay

```mermaid
sequenceDiagram
    participant U as User
    participant FE as React SPA
    participant API as FastAPI
    participant RZ as Razorpay (live)
    participant DB as MongoDB

    U->>FE: Place order (cart, address)
    FE->>API: POST /api/checkout/razorpay/order
    API->>RZ: Create order (INR amount)
    RZ-->>API: order_id
    API-->>FE: order_id + key_id
    FE->>RZ: Razorpay checkout popup
    U->>RZ: Pay via UPI / card
    RZ-->>FE: payment_id + signature
    FE->>API: POST /api/checkout/razorpay/verify
    API->>API: HMAC-SHA256 signature check
    API->>DB: Save order (dedupe payment_id)
    API->>DB: mark order paid + audit
    API-->>FE: 200 success
```

### Checkout — Stripe

```mermaid
sequenceDiagram
    participant U as User
    participant FE as React SPA
    participant API as FastAPI
    participant ST as Stripe
    participant DB as MongoDB

    U->>FE: Place order
    FE->>API: POST /api/checkout/stripe/session
    API->>ST: Create Checkout Session (INR line items)
    ST-->>API: session url
    API-->>FE: Redirect URL
    U->>ST: Pay on Stripe hosted page
    ST->>API: POST /api/checkout/stripe/webhook (signed)
    API->>API: Verify signature (STRIPE_WEBHOOK_SECRET)
    API->>DB: Save order (dedupe session_id)
    ST-->>U: Redirect to /checkout/success
    FE->>API: GET /api/checkout/stripe/session/{id}
    API-->>FE: Session details + confirmation email
```

---

## Tech Stack

### Frontend

| Layer      | Technology                                              |
|------------|----------------------------------------------------------|
| Framework  | React 19 · React DOM 19                                  |
| Build      | CRA + Craco · Vite · react-scripts 5                     |
| Styling    | Tailwind CSS 3.4 · tailwindcss-animate · tailwind-merge · clsx |
| UI        | Radix UI primitives (46+ `ui/` components) · lucide-react · embla-carousel · vaul · cmdk · sonner |
| 3D        | @react-three/fiber · @react-three/drei · three.js        |
| Animation | framer-motion · lenis (smooth scroll)                    |
| Data      | @tanstack/react-query · axios · swr                      |
| Forms     | react-hook-form · zod · @hookform/resolvers              |
| Auth      | @react-oauth/google (Google Identity Services)           |
| Charts    | recharts                                                |
| Tests     | Jest · @testing-library/react · @playwright/test (e2e)   |

### Backend

| Layer      | Technology                                              |
|------------|----------------------------------------------------------|
| Framework  | FastAPI 0.110 · Uvicorn · Pydantic 2                     |
| Database   | Motor (async MongoDB) · pymongo                          |
| Cache      | redis (async) with in-memory fallback                    |
| Queue      | ARQ (async Redis jobs) with in-process fallback          |
| Search     | Meilisearch client with in-memory fallback               |
| Auth       | pyjwt · bcrypt · python-jose · requests-oauthlib         |
| Payments   | razorpay SDK · stripe SDK                                |
| Email      | Brevo API (REST) · smtplib (Gmail) · resend SDK          |
| Analytics  | posthog · prometheus-client · sentry-sdk                 |
| Testing    | pytest · pytest-xdist · pytest-asyncio · black · flake8 · mypy |

### Infrastructure

| Component     | Technology                                   |
|---------------|----------------------------------------------|
| Frontend host | Vercel (rewrites `/api/*` → backend)         |
| Backend host  | Render (free tier, `render.yaml`)            |
| Database      | MongoDB Atlas (`MONGO_URL`)                  |
| Cache/Queue   | Redis (`REDIS_URL`)                          |
| Search        | Meilisearch (optional, `MEILI_URL`)          |
| Containers    | Docker Compose — Mongo, Redis, Meilisearch, backend, frontend, nginx, Prometheus, Loki, Grafana |
| Monitoring    | Prometheus (`/api/metrics`) · Grafana · Loki · Sentry · PostHog |
| Uptime        | UptimeRobot keep-alive ping on `/api/health` |

---

## Architecture Decisions

1. **Brevo over SMTP on Render.** Render's free tier blocks outbound SMTP (ports 587/465). Email is sent over HTTPS via the **Brevo API** (300 free emails/day), falling back to Gmail SMTP, then Resend.
2. **Client-verified Razorpay.** Razorpay signatures are verified server-side via HMAC-SHA256 (`order_id|payment_id`), so a webhook is intentionally **not** required.
3. **Graceful degradation.** Redis, Meilisearch, ARQ, Sentry, PostHog, and even MongoDB all fall back or fail soft, so catalog browsing stays available even when an optional service is down.
4. **Resilient async.** The cache, queue, and search services each have an in-process fallback so the app runs in a single process when Redis/Meilisearch are not configured.
5. **Two-layer caching.** Book catalog results are cached in Redis (5-min TTL) with deterministic `books:*` keys invalidated on any admin write; Meilisearch handles free-text search.

---

## Project Structure

```text
SagaDrop/
├── backend/
│   ├── server.py                 # FastAPI app, middleware, startup (indexes/seed/admin)
│   ├── config.py                 # env-driven config + CORS origins
│   ├── database.py               # Motor (MongoDB) client
│   ├── models.py                 # Pydantic models
│   ├── auth_utils.py             # JWT, bcrypt, cookies, current-user guard
│   ├── catalog.py                # seeded book catalog (40+ titles)
│   ├── middleware/
│   │   └── security.py           # OWASP headers + rate limiting (200 req/60 s)
│   ├── routes/                   # auth, books, checkout, coupons, reviews, share, newsletter, recommendations, storage
│   ├── services/                 # auth, book, checkout, coupon, review, search, cache, queue, audit, analytics, monitoring, storage
│   ├── tests/                    # pytest suite
│   ├── scripts/seed_db.py
│   ├── requirements.txt
│   ├── Dockerfile · Procfile · pytest.ini
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.js                # all routes (auth, shop, discover, support, company, admin)
│   │   ├── lib/api.js            # typed axios client
│   │   ├── context/              # AuthContext · StoreContext (cart/wishlist)
│   │   ├── components/           # Navbar, Footer, Hero3D, CartDrawer, WishlistDrawer, BookCard, ShareModal, …
│   │   ├── components/ui/        # 46+ Radix/Tailwind primitives
│   │   ├── pages/                # home, product, search, auth, account, dashboard, orders, checkout, share
│   │   │   ├── shop/             # Trending · NewReleases · Bestsellers · CollectorEditions · GiftCards · Collections
│   │   │   ├── discover/         # Categories · BookAdvisor · BookCustomizer · Authors · Reviews
│   │   │   ├── support/          # TrackOrder · Shipping · Returns · FAQ · Contact
│   │   │   ├── company/          # About · Careers · Press · Sustainability · Terms
│   │   │   └── admin/            # Dashboard · Books · Orders · Coupons · Customers · Analytics
│   │   └── ...
│   ├── package.json
│   └── vercel.json               # CRA build + /api rewrite to Render
├── docker-compose.yml            # full local stack incl. observability
├── render.yaml                   # Render blueprint for the backend
├── nginx.conf · prometheus.yml · trivy.yaml
└── README.md
```

---

## Environment Variables

All secrets live only in deployment environments (Render / Vercel). **Never commit keys.** The backend reads them via `os.environ` (see `backend/config.py`).

| Variable              | Required | Description                                        |
|-----------------------|----------|----------------------------------------------------|
| `MONGO_URL`           | Yes      | MongoDB Atlas connection string                    |
| `DB_NAME`             | Yes      | Database name (e.g. `sagadrop`)                    |
| `JWT_SECRET`          | Yes      | Long random string used to sign access/refresh JWTs|
| `CORS_ORIGINS`        | Yes      | Comma-separated allowed origins                    |
| `ADMIN_EMAIL`         | No       | Admin account auto-created at startup              |
| `ADMIN_PASSWORD`      | No       | Admin password (hashed with bcrypt)                |
| `GOOGLE_CLIENT_ID`    | No       | Google OAuth client ID (published to production)   |
| `BREVO_API_KEY`       | No       | Brevo REST API key (primary email sender)          |
| `BREVO_FROM`          | No       | Verified sender email                              |
| `BREVO_FROM_NAME`     | No       | Sender display name                                |
| `SMTP_HOST`           | No       | Gmail SMTP fallback host                           |
| `SMTP_PORT`           | No       | 465 (implicit TLS)                                 |
| `SMTP_USER`           | No       | Gmail address                                      |
| `SMTP_PASS`           | No       | Gmail App Password                                 |
| `RESEND_API_KEY`      | No       | Resend fallback API key                            |
| `RESEND_FROM`         | No       | Resend sender address                              |
| `RAZORPAY_KEY_ID`     | No       | Razorpay key ID (live)                             |
| `RAZORPAY_KEY_SECRET` | No       | Razorpay key secret (live)                         |
| `STRIPE_SECRET_KEY`   | No       | Stripe secret key                                  |
| `STRIPE_WEBHOOK_SECRET`| No      | Stripe webhook signing secret                      |
| `REDIS_URL`           | No       | Redis URL for cache/queue (in-memory fallback)     |
| `MEILI_URL`           | No       | Meilisearch URL (fallback search)                  |
| `MEILI_MASTER_KEY`    | No       | Meilisearch master key                             |
| `SENTRY_DSN`          | No       | Sentry error tracking                              |
| `SENTRY_ENVIRONMENT`  | No       | e.g. `production`                                  |
| `POSTHOG_API_KEY`     | No       | PostHog product analytics                          |

> ⚠️ If a key is ever exposed, regenerate it immediately. GitHub push protection is enabled on this repository.

---

## Local Development

### Option A — Backend + frontend directly

**Backend** (needs MongoDB — use Docker below or Atlas):

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
copy .env.example .env                           # fill MONGO_URL, JWT_SECRET, …
uvicorn server:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev     # http://localhost:3000  (proxies /api to the backend)
```

### Option B — Full stack with Docker Compose

Starts MongoDB, Redis, Meilisearch, backend, frontend, nginx, Prometheus, Loki and Grafana:

```bash
docker compose up --build
```

- Frontend: http://localhost:5001
- Backend API: http://localhost:8001/api
- Prometheus: http://localhost:9090 · Grafana: http://localhost:3000 · Loki: http://localhost:3100

---

## Deployment

### Backend — Render (`render.yaml`)

```bash
render blueprint from render.yaml
# build:  pip install -r backend/requirements.txt
# start:  cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
```

Set `MONGO_URL`, `JWT_SECRET`, `CORS_ORIGINS`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `GOOGLE_CLIENT_ID`, `BREVO_API_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `STRIPE_SECRET_KEY` (and optional keys) in **Environment** (masked, `sync: false`).

### Frontend — Vercel (`vercel.json`)

```bash
vercel --prod
```

`vercel.json` builds with CRA and rewrites `/api/*` → `https://sagadrop-backend.onrender.com/api/*`, with a SPA fallback to `index.html`.

### Cold-start keep-alive

Render free instances sleep after ~15 min idle. An UptimeRobot monitor pings `https://sagadrop-backend.onrender.com/api/health` every 5 minutes to keep the instance warm.

---

## Testing

```bash
# Backend (pytest + xdist, async tests included)
cd backend && pytest

# Frontend (Jest + Testing Library)
cd frontend && npm test

# Frontend E2E (Playwright)
cd frontend && npm run test:e2e
```

The backend suite (`backend/tests/`) covers the book service (list, filter, search, trending, CRUD), auth & share flows, and service-layer behavior without requiring a database.

---

## Security

- **Passwords** hashed with **bcrypt**; never stored in plain text.
- **JWTs** — 15-minute access token + 7-day refresh token, stored in `httpOnly`, `SameSite=Lax` cookies (`Secure` in production). Token type is validated on every request.
- **OTP** codes stored **SHA-256 hashed** with 10-minute expiry, max 5 attempts, 60 s resend cooldown, and account lockout after 5 failed logins (15 min, keyed by IP + email).
- **Google OAuth** — server-side audience (`azp`/`aud`) validation against the configured client ID.
- **Razorpay** — HMAC-SHA256 signature verification + duplicate-payment rejection (`payment_id` unique).
- **Stripe** — webhook signature verified with the webhook secret; session retrieval confirms `paid` status before fulfillment.
- **Rate limiting** — 200 requests / 60 s per client on `/api/*` (429 otherwise).
- **Headers** — `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, HSTS, `Referrer-Policy`, restrictive `Permissions-Policy`.
- **CORS** — restricted to configured origins with credentials.
- **Admin** — admin-only CRUD enforced via role checks; every mutation written to the `audit_logs` collection.
- **File uploads** — 5 MB cap, allow-listed image extensions, random filenames.

---

## Production Notes

- Email delivery uses **Brevo** (HTTPS) because Render's free tier blocks outbound SMTP; Gmail SMTP and Resend remain as fallbacks.
- Razorpay verification is **client-side** (`POST /api/checkout/razorpay/verify`); a Razorpay webhook is not required and won't parse at that endpoint.
- Stripe test cards: `4242 4242 4242 4242` (any future expiry / any CVV). Razorpay UPI test: `success@razorpay`.
- Books, order statuses, coupons and users are manageable from `/admin` once logged in as the admin account.
- Prometheus metrics are exposed at `/api/metrics` for scraping by Prometheus/Grafana.

---

## Roadmap

- [ ] Stripe live mode (currently test keys)
- [ ] Razorpay server-side webhook for server-confirmed order fulfillment
- [ ] Email order-invoice receipts with line-item totals (templated confirmation email already implemented)
- [ ] Pagination and infinite scroll on catalog/search pages
- [ ] Wishlist sharing and public reading lists
- [ ] Multi-language / i18n support
- [ ] iOS/Android PWA install support
- [ ] Cloud object storage (S3) for uploaded covers
- [ ] CI/CD pipeline with GitHub Actions (lint, typecheck, test, scan)

---

## Acknowledgements

- Book covers served from the Open Library Covers API.
- Design system assembled from Radix UI primitives and Tailwind CSS.
- Deployed free-tier-first: Vercel, Render, MongoDB Atlas, UptimeRobot.

---

<p align="center">
  <strong>Author:</strong> Devendra Prasad Kumar ·
  <a href="https://github.com/luccy93">github.com/luccy93</a>
</p>
<p align="center">© 2026 SagaDrop · Every Story Begins Here.</p>
