from motor.motor_asyncio import AsyncIOMotorClient

from config import MONGO_URL, DB_NAME

if MONGO_URL and (MONGO_URL.startswith("mongodb://") or MONGO_URL.startswith("mongodb+srv://")):
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
else:
    import logging
    logging.warning("MONGO_URL is not set or invalid — database features will be unavailable.")
    client = None
    db = None
