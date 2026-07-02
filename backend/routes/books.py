from fastapi import APIRouter, HTTPException
from typing import List, Optional

from models import Book
from catalog import CATALOG, BOOKS_BY_ID

router = APIRouter()


@router.get("/books", response_model=List[Book])
async def list_books(category: Optional[str] = None,
                     collection: Optional[str] = None,
                     limit: int = 40):
    items = CATALOG
    if category:
        items = [b for b in items if b.category.lower() == category.lower()]
    if collection:
        items = [b for b in items if (b.collection or "").lower() == collection.lower()]
    return items[:limit]


@router.get("/books/trending", response_model=List[Book])
async def trending():
    return sorted(CATALOG, key=lambda b: b.reviews, reverse=True)[:6]


@router.get("/books/{book_id}", response_model=Book)
async def get_book(book_id: str):
    b = BOOKS_BY_ID.get(book_id)
    if not b:
        raise HTTPException(status_code=404, detail="Book not found")
    return b


@router.get("/categories")
async def categories():
    return {
        "categories": ["Fantasy", "Mystery", "Romance", "Sci-Fi",
                       "Adventure", "Horror", "Classics", "Children"]
    }
