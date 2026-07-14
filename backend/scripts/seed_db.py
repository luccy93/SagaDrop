"""Seed MongoDB with the static catalog so DB queries work independently."""
import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from catalog import CATALOG

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")


async def seed(uri: str, db_name: str):
    client = AsyncIOMotorClient(uri)
    db = client[db_name]

    # Seed books
    existing = await db.books.count_documents({})
    if existing == 0:
        books = [b.model_dump() for b in CATALOG]
        await db.books.insert_many(books)
        logger.info("Seeded %d books", len(books))
    else:
        logger.info("Books collection already has %d documents — skipping", existing)

    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.books.create_index("category")
    await db.books.create_index("collection")
    await db.books.create_index([("title", "text"), ("author", "text"), ("description", "text")])
    await db.orders.create_index("payment_id", unique=True, sparse=True)
    await db.orders.create_index("customer_email")
    await db.orders.create_index("created_at")
    await db.otps.create_index("email")
    await db.otps.create_index("expires_at", expireAfterSeconds=0)
    await db.login_attempts.create_index("identifier", unique=True)
    await db.coupons.create_index("code", unique=True)
    await db.reviews.create_index(["book_id", "user_id"], unique=True)
    await db.shared_books.create_index("id", unique=True)

    logger.info("All indexes created")
    client.close()


if __name__ == "__main__":
    import os
    uri = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    name = os.environ.get("DB_NAME", "sagadrop")
    asyncio.run(seed(uri, name))
