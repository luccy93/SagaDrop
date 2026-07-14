import logging
import os
from typing import Optional

logger = logging.getLogger("search")

MEILI_INDEX = "books"

try:
    import meilisearch
    from meilisearch import Client as MeiliClient
    _MEILI_AVAILABLE = True
except ImportError:
    _MEILI_AVAILABLE = False
    MeiliClient = None  # type: ignore


class SearchService:
    def __init__(self, url: str = "http://localhost:7700", api_key: str = ""):
        self.url = url.rstrip("/")
        self.api_key = api_key
        self._client: Optional[MeiliClient] = None

    @property
    def client(self) -> Optional[MeiliClient]:
        if self._client is not None:
            return self._client
        if not _MEILI_AVAILABLE:
            logger.info("meilisearch package not installed — falling back")
            return None
        try:
            self._client = MeiliClient(self.url, self.api_key)
            self._client.health()
            logger.info("Connected to Meilisearch at %s", self.url)
        except Exception as exc:
            logger.warning("Meilisearch unavailable (%s) — falling back", exc)
            self._client = None
        return self._client

    @property
    def available(self) -> bool:
        return self.client is not None

    def index_books(self, books: list[dict]):
        c = self.client
        if not c:
            return
        documents = []
        for b in books:
            documents.append({
                "id": b.get("id"),
                "title": b.get("title", ""),
                "author": b.get("author", ""),
                "description": b.get("description", ""),
                "category": b.get("category", ""),
                "price": b.get("price", 0),
                "rating": b.get("rating", 0),
                "cover": b.get("cover", ""),
                "badge": b.get("badge"),
                "collection": b.get("collection"),
                "year": b.get("year", 2025),
            })
        index = c.index(MEILI_INDEX)
        r = index.add_documents(documents)
        logger.info("Indexed %d books (task %s)", len(documents), r.task_uid)

    def search(self, query: str, limit: int = 20) -> list[dict]:
        c = self.client
        if not c:
            return []
        index = c.index(MEILI_INDEX)
        r = index.search(query, {"limit": limit})
        return r.get("hits", [])

    def delete_index(self):
        c = self.client
        if not c:
            return
        try:
            c.delete_index(MEILI_INDEX)
        except Exception:
            pass


search_service = SearchService(
    url=os.environ.get("MEILI_URL", "http://localhost:7700"),
    api_key=os.environ.get("MEILI_MASTER_KEY", ""),
)
