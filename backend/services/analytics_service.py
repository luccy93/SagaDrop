"""Analytics — PostHog integration for backend events."""
import logging
import os
from typing import Optional

logger = logging.getLogger("analytics")

try:
    import posthog
    _POSTHOG_AVAILABLE = True
except ImportError:
    _POSTHOG_AVAILABLE = False


class AnalyticsService:
    def __init__(self):
        self._api_key: Optional[str] = None

    def init(self, api_key: str = "", host: str = "https://app.posthog.com"):
        if not _POSTHOG_AVAILABLE:
            logger.info("posthog package not installed — analytics disabled")
            return
        self._api_key = api_key or os.environ.get("POSTHOG_API_KEY", "")
        if not self._api_key:
            logger.info("POSTHOG_API_KEY not set — analytics disabled")
            return
        posthog.api_key = self._api_key
        posthog.host = host
        logger.info("PostHog initialized")

    def capture(self, distinct_id: str, event: str, properties: Optional[dict] = None):
        if not self._api_key or not _POSTHOG_AVAILABLE:
            return
        try:
            posthog.capture(distinct_id, event, properties or {})
        except Exception as exc:
            logger.debug("PostHog capture error: %s", exc)

    def identify(self, distinct_id: str, properties: Optional[dict] = None):
        if not self._api_key or not _POSTHOG_AVAILABLE:
            return
        try:
            posthog.identify(distinct_id, properties or {})
        except Exception as exc:
            logger.debug("PostHog identify error: %s", exc)


analytics_service = AnalyticsService()
