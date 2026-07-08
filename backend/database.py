import logging

from motor.motor_asyncio import AsyncIOMotorClient

from config import MONGO_URL, DB_NAME

client: AsyncIOMotorClient | None = None
db = None

if MONGO_URL:
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
    except Exception as exc:
        logging.warning("Could not connect to MongoDB: %s", exc)
        client = None
        db = None
else:
    logging.warning("MONGO_URL is not set — database features will be unavailable.")
