"""Audit logging — tracks admin actions and key events in MongoDB."""
import logging
from datetime import datetime, timezone
from typing import Optional

from database import db

logger = logging.getLogger("audit")


async def log_event(
    action: str,
    actor: str,
    resource: str,
    resource_id: Optional[str] = None,
    detail: Optional[dict] = None,
):
    """Record an auditable event to the audit_logs collection."""
    if db is None:
        logger.warning("No DB — audit event dropped: %s %s", action, resource)
        return
    entry = {
        "action": action,
        "actor": actor,
        "resource": resource,
        "resource_id": resource_id,
        "detail": detail or {},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    try:
        await db.audit_logs.insert_one(entry)
    except Exception as exc:
        logger.error("Failed to write audit log: %s", exc)
