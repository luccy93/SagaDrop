import logging
import random

from fastapi import APIRouter

from models import (
    RecommendRequest, RecommendResponse, RecommendedBook,
)
from catalog import CATALOG

router = APIRouter()
logger = logging.getLogger("sagadrop")

MOOD_MAP = {
    "Fantasy":        "Fantasy",
    "Adventure":      "Adventure",
    "Romance":        "Romance",
    "Mystery":        "Mystery",
    "Thriller":       "Thriller",
    "Science Fiction":"Science Fiction",
    "Horror":         "Horror",
    "Historical":     "Historical",
}

REASONS = [
    "A reader favourite with unforgettable characters and a gripping story.",
    "Critically acclaimed — beautifully written and impossible to put down.",
    "Perfect for fans of rich world-building and atmospheric prose.",
    "An enduring classic that belongs on every bookshelf.",
    "Our editors called this one 'unmissable' — and we agree.",
    "A hidden gem with stunning prose and a deeply moving narrative.",
]


@router.post("/recommend", response_model=RecommendResponse)
async def recommend(req: RecommendRequest):
    mood = req.mood.strip().lower()
    tone = (req.tone or "").strip().lower()

    matched = [
        b for b in CATALOG
        if mood in b.category.lower() or b.category.lower() in mood
    ]
    if not matched:
        matched = list(CATALOG)

    picks = random.sample(matched, min(4, len(matched)))
    if len(picks) < 4:
        remainder = [b for b in CATALOG if b not in picks]
        picks += random.sample(remainder, min(4 - len(picks), len(remainder)))

    summary = f"A hand-picked selection for readers in a {mood.title()} mood."

    return RecommendResponse(
        mood=mood.title(),
        summary=summary,
        picks=[
            RecommendedBook(
                title=b.title,
                author=b.author,
                reason=random.choice(REASONS),
                match_book_id=b.id,
            )
            for b in picks
        ],
    )
