"""Async task queue for background jobs — in-process fallback, Redis/ARQ when available."""
import asyncio
import logging
from typing import Any, Callable, Optional

logger = logging.getLogger("queue")

try:
    import arq
    _ARQ_AVAILABLE = True
except ImportError:
    _ARQ_AVAILABLE = False


class QueueService:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_url = redis_url
        self._pool: Optional[arq.ArqRedis] = None
        self._inprocess: asyncio.Queue[tuple[str, dict]] = asyncio.Queue()
        self._worker_task: Optional[asyncio.Task] = None
        self._handlers: dict[str, Callable] = {}

    def register(self, name: str, handler: Callable):
        self._handlers[name] = handler

    @property
    def pool(self) -> Optional[arq.ArqRedis]:
        if self._pool is not None:
            return self._pool
        if not _ARQ_AVAILABLE:
            return None
        try:
            self._pool = asyncio.run(arq.create_pool(arq.connections.RedisSettings.from_dsn(self.redis_url)))
            logger.info("Connected to ARQ/Redis at %s", self.redis_url)
        except Exception as exc:
            logger.warning("ARQ/Redis unavailable (%s) — using in-process queue", exc)
            self._pool = None
        return self._pool

    @property
    def available(self) -> bool:
        return self.pool is not None

    async def enqueue(self, name: str, **kwargs):
        """Enqueue a job — ARQ when available, otherwise in-process."""
        if self.available and self._pool:
            try:
                await self._pool.enqueue_job(name, **kwargs)
                logger.debug("Enqueued %s via ARQ", name)
                return
            except Exception as exc:
                logger.warning("ARQ enqueue failed, falling back: %s", exc)
        await self._inprocess.put((name, kwargs))
        logger.debug("Enqueued %s in-process", name)

    async def _process_inprocess(self):
        while True:
            name, kwargs = await self._inprocess.get()
            handler = self._handlers.get(name)
            if handler:
                try:
                    if asyncio.iscoroutinefunction(handler):
                        await handler(**kwargs)
                    else:
                        handler(**kwargs)
                except Exception as exc:
                    logger.error("Job %s failed: %s", name, exc)
            self._inprocess.task_done()

    def start_worker(self):
        if self._worker_task is None:
            self._worker_task = asyncio.create_task(self._process_inprocess())
            logger.info("In-process queue worker started")

    async def shutdown(self):
        if self._worker_task:
            self._worker_task.cancel()
            try:
                await self._worker_task
            except asyncio.CancelledError:
                pass
        if self._pool:
            self._pool.close()


queue_service = QueueService()
