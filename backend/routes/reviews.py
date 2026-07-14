"""Review routes — thin wrappers over services/review_service.py"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from services.review_service import (
    create_review, get_reviews, get_review_stats,
)
from auth_utils import get_current_user

router = APIRouter(prefix="/reviews")


class ReviewInput(BaseModel):
    book_id: str
    rating: int = Field(ge=1, le=5)
    comment: str = Field(default="", max_length=2000)


@router.post("")
async def create_review_endpoint(inp: ReviewInput, user: dict = Depends(get_current_user)):
    return await create_review(
        inp.book_id, str(user["_id"]),
        user.get("name", "Anonymous"),
        inp.rating, inp.comment,
    )


@router.get("/{book_id}")
async def get_reviews_endpoint(book_id: str):
    return await get_reviews(book_id)


@router.get("/{book_id}/stats")
async def get_review_stats_endpoint(book_id: str):
    return await get_review_stats(book_id)
