from fastapi import APIRouter, HTTPException

from models import NewsletterInput, NewsletterEntry
from database import db

router = APIRouter()


@router.post("/newsletter")
async def newsletter(inp: NewsletterInput):
    if db is None:
        raise HTTPException(503, "Database not configured")
    entry = NewsletterEntry(email=inp.email)
    await db.newsletter.update_one(
        {"email": entry.email},
        {"$setOnInsert": entry.model_dump()},
        upsert=True,
    )
    return {"ok": True, "message": "Welcome to SagaDrop."}
