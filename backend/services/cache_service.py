"""Redis-based cache with in-memory fallback when Redis is unavailable."""
import json
import logging
import os
import time
from typing import Any, Callable, Optional

logger = logging.getLogger("cache")

try:
    import redis.asyncio as aioredis
    _REDIS_AVAILABLE = True
except ImportError:
    _REDIS_AVAILABLE = False


class CacheService:
    def __init__(self, url: str = "redis://localhost:6379"):
        self.url = url
        self._redis: Optional[aioredis.Redis] = None
        self._memory: dict[str, tuple[float, Any]] = {}  # key -> (expires_at, value)

    @property
    def client(self) -> Optional[aioredis.Redis]:
        if self._redis is not None:
            return self._redis
        if not _REDIS_AVAILABLE:
            return None
        try:
            self._redis = aioredis.from_url(self.url, decode_responses=True)
            logger.info("Connected to Redis at %s", self.url)
        except Exception as exc:
            logger.warning("Redis unavailable (%s) — using in-memory cache", exc)
            self._redis = None
        return self._redis

    @property
    def available(self) -> bool:
        return self.client is not None

    async def get(self, key: str) -> Optional[Any]:
        c = self.client
        if c:
            try:
                raw = await c.get(key)
                return json.loads(raw) if raw else None
            except Exception as exc:
                logger.debug("Redis get error: %s", exc)
        # In-memory fallback
        entry = self._memory.get(key)
        if entry:
            expires_at, val = entry
            if expires_at == 0 or time.time() < expires_at:
                return val
            del self._memory[key]
        return None

    async def set(self, key: str, value: Any, ttl: int = 300):
        c = self.client
        if c:
            try:
                await c.setex(key, ttl, json.dumps(value, default=str))
                return
            except Exception as exc:
                logger.debug("Redis set error: %s", exc)
        self._memory[key] = (time.time() + ttl if ttl > 0 else 0, value)

    async def delete(self, key: str):
        c = self.client
        if c:
            try:
                await c.delete(key)
            except Exception:
                pass
        self._memory.pop(key, None)

    async def clear_pattern(self, pattern: str):
        """Delete all keys matching a glob pattern (e.g. 'books:*')."""
        c = self.client
        if c:
            try:
                cursor = 0
                while True:
                    cursor, keys = await c.scan(cursor, match=pattern)
                    if keys:
                        await c.delete(*keys)
                    if cursor == 0:
                        break
            except Exception as exc:
                logger.debug("Redis clear_pattern error: %s", exc)
        # In-memory: remove matching
        import fnmatch
        self._memory = {k: v for k, v in self._memory.items() if not fnmatch.fnmatch(k, pattern)}


cache_service = CacheService(url=os.environ.get("REDIS_URL", "redis://localhost:6379"))
