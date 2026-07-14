"""Review business logic."""
import logging
from datetime import datetime, timezone

from fastapi import HTTPException

from database import db

logger = logging.getLogger("sagadrop.reviews")


async def create_review(book_id: str, user_id: str, user_name: str,
                         rating: int, comment: str) -> dict:
    if db is None:
        raise HTTPException(503, "Database not configured")
    existing = await db.reviews.find_one({"book_id": book_id, "user_id": user_id})
    if existing:
        raise HTTPException(409, "You have already reviewed this book")
    doc = {
        "book_id": book_id,
        "user_id": user_id,
        "user_name": user_name,
        "rating": rating,
        "comment": comment,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    r = await db.reviews.insert_one(doc)
    doc["_id"] = str(r.inserted_id)
    return doc


async def get_reviews(book_id: str) -> list:
    if db is None:
        return []
    return await db.reviews.find({"book_id": book_id}).sort("created_at", -1).to_list(length=100)


async def get_review_stats(book_id: str) -> dict:
    if db is None:
        return {"average": 0, "count": 0}
    pipeline = [
        {"$match": {"book_id": book_id}},
        {"$group": {"_id": None, "average": {"$avg": "$rating"}, "count": {"$sum": 1}}},
    ]
    cursor = db.reviews.aggregate(pipeline)
    result = await cursor.to_list(length=1)
    if not result:
        return {"average": 0, "count": 0}
    return {"average": round(result[0]["average"], 1), "count": result[0]["count"]}
