from fastapi import APIRouter, HTTPException, Request
from typing import List, Optional

from models import Book, BookInput
from services.book_service import (
    list_books, get_trending, get_book,
    create_book, update_book, delete_book,
    get_categories,
)
from services.audit_service import log_event
from auth_utils import get_current_user

router = APIRouter()


async def _require_admin(request: Request):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/books", response_model=List[Book])
async def list_books_endpoint(category: Optional[str] = None,
                               collection: Optional[str] = None,
                               q: Optional[str] = None,
                               min_price: Optional[float] = None,
                               max_price: Optional[float] = None,
                               sort_by: Optional[str] = None,
                               limit: int = 40):
    return await list_books(category, collection, q, min_price, max_price, sort_by, limit)


@router.get("/books/trending", response_model=List[Book])
async def trending():
    return await get_trending()


@router.get("/books/{book_id}", response_model=Book)
async def get_book_endpoint(book_id: str):
    b = await get_book(book_id)
    if not b:
        raise HTTPException(status_code=404, detail="Book not found")
    return b


@router.post("/books", response_model=Book)
async def create_book_endpoint(body: BookInput, request: Request):
    user = await _require_admin(request)
    book = await create_book(body)
    await log_event("book.create", user.get("email", "admin"), "book", book.id, body.model_dump())
    return book


@router.put("/books/{book_id}", response_model=Book)
async def update_book_endpoint(book_id: str, body: BookInput, request: Request):
    user = await _require_admin(request)
    result = await update_book(book_id, body)
    if not result:
        raise HTTPException(status_code=404, detail="Book not found")
    await log_event("book.update", user.get("email", "admin"), "book", book_id, {"changes": body.model_dump()})
    return result


@router.delete("/books/{book_id}")
async def delete_book_endpoint(book_id: str, request: Request):
    user = await _require_admin(request)
    if not await delete_book(book_id):
        raise HTTPException(status_code=404, detail="Book not found")
    await log_event("book.delete", user.get("email", "admin"), "book", book_id)
    return {"ok": True}


@router.get("/categories")
async def categories():
    return {"categories": await get_categories()}
