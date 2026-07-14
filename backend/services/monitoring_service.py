"""Monitoring — Prometheus metrics, Sentry error tracking, Loki log shipping."""
import logging
import time
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("monitoring")

# ── Sentry ──────────────────────────────────────────────────────────────────────
_sentry_available = False
try:
    import sentry_sdk
    from sentry_sdk.integrations.asgi import SentryAsgiMiddleware
    _sentry_available = True
except ImportError:
    SentryAsgiMiddleware = None  # type: ignore


def init_sentry(dsn: str = "", environment: str = "development"):
    if not _sentry_available or not dsn:
        logger.info("Sentry not configured — error tracking disabled")
        return None
    sentry_sdk.init(
        dsn=dsn,
        environment=environment,
        traces_sample_rate=0.1,
    )
    logger.info("Sentry initialized")
    return SentryAsgiMiddleware


# ── Prometheus ──────────────────────────────────────────────────────────────────
_prometheus_available = False
try:
    from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
    _prometheus_available = True
except ImportError:
    Counter = None  # type: ignore
    Histogram = None  # type: ignore
    generate_latest = None  # type: ignore

REQUEST_COUNT = None
REQUEST_LATENCY = None

if _prometheus_available:
    REQUEST_COUNT = Counter("http_requests_total", "Total HTTP requests", ["method", "path", "status"])
    REQUEST_LATENCY = Histogram("http_request_duration_seconds", "HTTP request latency", ["method", "path"])


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not _prometheus_available:
            return await call_next(request)
        start = time.time()
        response = await call_next(request)
        duration = time.time() - start
        path = request.url.path
        REQUEST_COUNT.labels(method=request.method, path=path, status=response.status_code).inc()
        REQUEST_LATENCY.labels(method=request.method, path=path).observe(duration)
        return response


def metrics_endpoint():
    from fastapi.responses import Response as FastResponse
    if not _prometheus_available:
        return FastResponse("Prometheus not available", status_code=503)
    return FastResponse(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
