"""SagaDrop backend — AI-powered story book marketplace."""
import logging

from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS
from database import client, db
from routes.books import router as books_router
from routes.newsletter import router as newsletter_router
from routes.ai import router as ai_router
from routes.share import router as share_router
from routes.auth import router as auth_router

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="SagaDrop API")
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"service": "SagaDrop", "status": "ok"}


api_router.include_router(books_router)
api_router.include_router(newsletter_router)
api_router.include_router(ai_router)
api_router.include_router(share_router)
api_router.include_router(auth_router)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup():
    import os
    from datetime import datetime, timezone
    from auth_utils import hash_password, verify_password

    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@sagadrop.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "SagaAdmin@2026")
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


@app.on_event("shutdown")
async def _shutdown():
    client.close()
