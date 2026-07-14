"""Book catalog business logic."""
import hashlib
import json
import logging
from typing import List, Optional
from catalog import CATALOG, BOOKS_BY_ID
from models import Book, BookInput
from services.cache_service import cache_service
from services.search_service import search_service

logger = logging.getLogger("book_service")
CACHE_TTL = 300  # 5 minutes


def _cache_key(prefix: str, *args) -> str:
    raw = f"{prefix}:{':'.join(str(a) for a in args if a is not None)}"
    return f"books:{hashlib.md5(raw.encode()).hexdigest()}"


def _model_list_to_dicts(items: list[Book]) -> list[dict]:
    return [b.model_dump() for b in items]


def _dicts_to_model_list(data: list[dict]) -> list[Book]:
    return [Book(**d) for d in data]


async def _invalidate_books_cache():
    try:
        await cache_service.clear_pattern("books:*")
    except Exception as exc:
        logger.debug("Cache invalidation error: %s", exc)


def _next_id() -> str:
    existing = [int(b.id[1:]) for b in CATALOG if b.id.startswith("b")]
    return f"b{max(existing) + 1}" if existing else "b1"


def _reindex():
    """Sync in-memory catalog to Meilisearch."""
    if not search_service.available:
        return
    try:
        search_service.index_books([b.model_dump() for b in CATALOG])
    except Exception as exc:
        logger.warning("Meilisearch reindex failed: %s", exc)


async def list_books(category: Optional[str] = None,
                     collection: Optional[str] = None,
                     q: Optional[str] = None,
                     min_price: Optional[float] = None,
                     max_price: Optional[float] = None,
                     sort_by: Optional[str] = None,
                     limit: int = 40) -> List[Book]:
    # Try cache for non-search queries only (search is already fast via Meilisearch)
    if not q:
        ck = _cache_key("list", category or "", collection or "", str(min_price or ""), str(max_price or ""), sort_by or "", str(limit))
        cached = await cache_service.get(ck)
        if cached is not None:
            return _dicts_to_model_list(cached)

    items = CATALOG

    if q:
        ql = q.lower()
        if search_service.available:
            try:
                hits = search_service.search(q, limit)
                if hits:
                    ids = {h["id"] for h in hits}
                    items = [b for b in CATALOG if b.id in ids]
                    ordered = []
                    seen = set()
                    for h in hits:
                        for b in items:
                            if b.id == h["id"] and b.id not in seen:
                                ordered.append(b)
                                seen.add(b.id)
                                break
                    items = ordered
            except Exception as exc:
                logger.warning("Meilisearch query failed, falling back: %s", exc)
                items = [b for b in items if
                         ql in b.title.lower() or
                         ql in b.author.lower() or
                         ql in (b.category or "").lower() or
                         ql in (b.description or "").lower()]
        else:
            items = [b for b in items if
                     ql in b.title.lower() or
                     ql in b.author.lower() or
                     ql in (b.category or "").lower() or
                     ql in (b.description or "").lower()]

    if category:
        items = [b for b in items if b.category.lower() == category.lower()]
    if collection:
        items = [b for b in items if (b.collection or "").lower() == collection.lower()]


    if min_price is not None:
        items = [b for b in items if b.price >= min_price]
    if max_price is not None:
        items = [b for b in items if b.price <= max_price]

    if sort_by == 'price_asc':
        items.sort(key=lambda b: b.price)
    elif sort_by == 'price_desc':
        items.sort(key=lambda b: b.price, reverse=True)
    elif sort_by == 'rating':
        items.sort(key=lambda b: b.rating, reverse=True)
    elif sort_by == 'title':
        items.sort(key=lambda b: b.title.lower())

    result = items[:limit]

    if not q:
        await cache_service.set(ck, _model_list_to_dicts(result), ttl=CACHE_TTL)

    return result


async def get_trending() -> List[Book]:
    ck = "books:trending"
    cached = await cache_service.get(ck)
    if cached is not None:
        return _dicts_to_model_list(cached)
    result = sorted(CATALOG, key=lambda b: b.reviews, reverse=True)[:6]
    await cache_service.set(ck, _model_list_to_dicts(result), ttl=CACHE_TTL)
    return result


async def get_book(book_id: str) -> Optional[Book]:
    ck = f"books:detail:{book_id}"
    cached = await cache_service.get(ck)
    if cached is not None:
        return Book(**cached)
    book = BOOKS_BY_ID.get(book_id)
    if book:
        await cache_service.set(ck, book.model_dump(), ttl=CACHE_TTL)
    return book


async def create_book(data: BookInput) -> Book:
    book = Book(id=_next_id(), **data.model_dump())
    CATALOG.append(book)
    BOOKS_BY_ID[book.id] = book
    await _invalidate_books_cache()
    _reindex()
    return book


async def update_book(book_id: str, data: BookInput) -> Optional[Book]:
    existing = BOOKS_BY_ID.get(book_id)
    if not existing:
        return None
    updated = Book(id=book_id, **data.model_dump())
    for i, b in enumerate(CATALOG):
        if b.id == book_id:
            CATALOG[i] = updated
            break
    BOOKS_BY_ID[book_id] = updated
    await _invalidate_books_cache()
    _reindex()
    return updated


async def delete_book(book_id: str) -> bool:
    if book_id not in BOOKS_BY_ID:
        return False
    CATALOG[:] = [b for b in CATALOG if b.id != book_id]
    del BOOKS_BY_ID[book_id]
    await _invalidate_books_cache()
    _reindex()
    return True


async def get_categories() -> list:
    ck = "books:categories"
    cached = await cache_service.get(ck)
    if cached is not None:
        return cached
    cats = ["Fantasy", "Mystery", "Romance", "Sci-Fi",
            "Adventure", "Horror", "Classics", "Children"]
    await cache_service.set(ck, cats, ttl=CACHE_TTL)
    return cats
