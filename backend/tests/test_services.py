"""Unit tests for the service layer — no database dependency."""
import pytest
from services.book_service import (
    list_books, get_trending, get_book,
    create_book, update_book, delete_book,
    get_categories,
)
from models import BookInput


# ─── Book Service ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
class TestBookService:
    async def test_list_books_default(self):
        books = await list_books(limit=40)
        assert len(books) == 40

    async def test_list_books_filter_category(self):
        books = await list_books(category="Fantasy", limit=40)
        assert len(books) > 0
        for b in books:
            assert b.category.lower() == "fantasy"

    async def test_list_books_search_title(self):
        books = await list_books(q="hobbit", limit=40)
        assert len(books) > 0
        assert any("hobbit" in b.title.lower() for b in books)

    async def test_list_books_search_author(self):
        books = await list_books(q="tolkien", limit=40)
        assert len(books) > 0
        assert any("tolkien" in b.author.lower() for b in books)

    async def test_list_books_search_no_match(self):
        books = await list_books(q="xyznonexistent12345", limit=40)
        assert len(books) == 0

    async def test_trending_returns_6(self):
        books = await get_trending()
        assert len(books) == 6
        for i in range(len(books) - 1):
            assert books[i].reviews >= books[i + 1].reviews

    async def test_get_book_exists(self):
        b = await get_book("b1")
        assert b is not None
        assert b.id == "b1"
        assert b.title == "Ready Player One"

    async def test_get_book_not_found(self):
        assert await get_book("nonexistent") is None

    async def test_crud_cycle(self):
        inp = BookInput(
            title="Test Book",
            author="Test Author",
            price=499,
            rating=4.5,
            reviews=100,
            cover="https://example.com/cover.jpg",
            category="Fantasy",
            description="A test book",
            year=2025,
        )
        created = await create_book(inp)
        assert created.id.startswith("b")
        assert created.title == "Test Book"
        assert await get_book(created.id) is not None

        inp2 = BookInput(
            title="Updated Title",
            author="Updated Author",
            price=599,
            rating=4.0,
            reviews=50,
            cover="https://example.com/cover2.jpg",
            category="Mystery",
            description="Updated",
            year=2024,
        )
        updated = await update_book(created.id, inp2)
        assert updated is not None
        assert updated.title == "Updated Title"
        assert updated.price == 599

        assert await delete_book(created.id) is True
        assert await get_book(created.id) is None
        assert await delete_book("nonexistent") is False

    async def test_get_categories(self):
        cats = await get_categories()
        assert len(cats) == 8
        assert "Fantasy" in cats
        assert "Mystery" in cats
