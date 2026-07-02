from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone
import uuid


class Book(BaseModel):
    id: str
    title: str
    author: str
    price: float
    original_price: Optional[float] = None
    rating: float
    reviews: int
    cover: str
    category: str
    badge: Optional[str] = None
    description: str
    collection: Optional[str] = None
    year: int


class NewsletterInput(BaseModel):
    email: EmailStr


class NewsletterEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class RecommendRequest(BaseModel):
    mood: str
    tone: Optional[str] = None


class RecommendedBook(BaseModel):
    title: str
    author: str
    reason: str
    match_book_id: Optional[str] = None


class RecommendResponse(BaseModel):
    mood: str
    summary: str
    picks: List[RecommendedBook]


class CoverRequest(BaseModel):
    title: str
    author: Optional[str] = None
    material: Optional[str] = "Hardcover"
    style: Optional[str] = "epic fantasy illustration"
    foil: Optional[str] = "gold"


class CoverResponse(BaseModel):
    mime_type: str
    data: str  # base64


class ShareRequest(BaseModel):
    title: str
    author: Optional[str] = None
    material: Optional[str] = "Hardcover"
    foil: Optional[str] = "gold"
    mime_type: str
    cover_data: str  # base64


class ShareInfo(BaseModel):
    id: str
    title: str
    author: Optional[str] = None
    material: Optional[str] = None
    foil: Optional[str] = None
    created_at: str
    views: int
    cover_url: str
