"""SagaDrop backend — premium story book marketplace."""
import logging
import os

from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from pathlib import Path

from config import CORS_ORIGINS
from database import client, db
from routes.books import router as books_router
from routes.newsletter import router as newsletter_router
from routes.recommendations import router as rec_router
from routes.share import router as share_router
from routes.auth import router as auth_router
from routes.checkout import router as checkout_router
from routes.coupons import router as coupons_router
from routes.reviews import router as reviews_router
from routes.storage import router as storage_router
from middleware.security import SecurityHeadersMiddleware, RateLimitMiddleware
from services.monitoring_service import init_sentry, MetricsMiddleware, metrics_endpoint
from services.analytics_service import analytics_service

logging.basicConfig(level=logging.INFO)

# ── Sentry (init early) ──────────────────────────────────────────────────────────
sentry_dsn = os.environ.get("SENTRY_DSN", "")
sentry_env = os.environ.get("SENTRY_ENVIRONMENT", "development")
SentryMiddleware = init_sentry(sentry_dsn, sentry_env)

app = FastAPI(title="SagaDrop API")

# Serve uploaded files
uploads_dir = Path(__file__).resolve().parent / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"service": "SagaDrop", "status": "ok"}


@api_router.get("/health")
async def health():
    db_ok = db is not None
    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "unavailable",
        "version": "1.0.0",
    }


@api_router.get("/public-config")
async def public_config():
    """Public endpoint — exposes non-secret runtime config to the frontend."""
    import os
    return {
        "google_client_id": os.environ.get("GOOGLE_CLIENT_ID", ""),
        "cors_origins": CORS_ORIGINS,
        "raw_cors": os.environ.get("CORS_ORIGINS", "(not set)"),
    }


api_router.include_router(books_router)
api_router.include_router(newsletter_router)
api_router.include_router(rec_router)
api_router.include_router(share_router)
api_router.include_router(auth_router)
api_router.include_router(checkout_router)
api_router.include_router(coupons_router)
api_router.include_router(reviews_router)
api_router.include_router(storage_router)

# Prometheus metrics endpoint
@api_router.get("/metrics")
async def prometheus_metrics():
    return metrics_endpoint()

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, max_requests=200, window=60)
app.add_middleware(MetricsMiddleware)
if SentryMiddleware is not None:
    app.add_middleware(SentryMiddleware)  # type: ignore


@app.on_event("startup")
async def _startup():
    if db is None:
        logging.warning("Skipping DB setup — no database connection.")
        return

    import os
    from datetime import datetime, timezone
    from auth_utils import hash_password, verify_password

    # ── Indexes ──────────────────────────────────────────────────────────────────
    async def _safe_index(collection, *args, **kwargs):
        try:
            await collection.create_index(*args, **kwargs)
        except Exception as exc:
            logging.warning("Index create failed on %s: %s", collection.name, exc)

    await _safe_index(db.users, "email", unique=True)
    await _safe_index(db.books, "category")
    await _safe_index(db.books, "collection")
    await _safe_index(db.books, [("title", 1), ("author", 1), ("description", 1)])
    await _safe_index(db.orders, "payment_id", unique=True, sparse=True)
    await _safe_index(db.orders, "customer_email")
    await _safe_index(db.orders, "created_at")
    await _safe_index(db.otps, "email")
    await _safe_index(db.otps, "expires_at", expireAfterSeconds=0)
    await _safe_index(db.login_attempts, "identifier", unique=True)
    await _safe_index(db.coupons, "code", unique=True)
    await _safe_index(db.reviews, [("book_id", 1), ("user_id", 1)], unique=True)
    await _safe_index(db.shared_books, "id", unique=True)
    await _safe_index(db.audit_logs, "timestamp")
    await _safe_index(db.audit_logs, [("action", 1), ("actor", 1)])

    # ── Seed catalog books into DB ───────────────────────────────────────────────
    from catalog import CATALOG
    existing_books = await db.books.count_documents({})
    if existing_books == 0 and CATALOG:
        books = [b.model_dump() for b in CATALOG]
        await db.books.insert_many(books)
        logging.info("Seeded %d books into DB", len(books))

    # ── Admin user ───────────────────────────────────────────────────────────────
    admin_email = os.environ.get("ADMIN_EMAIL", "").lower().strip()
    admin_password = os.environ.get("ADMIN_PASSWORD", "").strip()
    if admin_email and admin_password:
        existing = await db.users.find_one({"email": admin_email})
        if existing is None:
            await db.users.insert_one({
                "name": "Admin", "email": admin_email,
                "password_hash": hash_password(admin_password),
                "role": "admin", "cart": [], "wishlist": [],
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        elif not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"password_hash": hash_password(admin_password)}},
            )

    # ── Analytics ──────────────────────────────────────────────────────────────────
    analytics_service.init()

    # ── Start queue worker ────────────────────────────────────────────────────────
    from services.queue_service import queue_service
    queue_service.start_worker()

    # ── Re-index Meilisearch ──────────────────────────────────────────────────────
    from services.search_service import search_service
    from services.book_service import list_books
    if search_service.available:
        try:
            all_books = await list_books(limit=200)
            search_service.index_books([b.model_dump() for b in all_books])
        except Exception as exc:
            logging.warning("Meilisearch reindex at startup failed: %s", exc)

    logging.info("Startup complete")


@app.on_event("shutdown")
async def _shutdown():
    if client is not None:
        client.close()
