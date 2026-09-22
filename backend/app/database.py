import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from .config import settings

CUSTOMERS = "customers"
DEVICES = "devices"
REPAIR_JOBS = "repair_jobs"
TECHNICIANS = "technicians"
INVENTORY = "inventory"
INVOICES = "invoices"

_client: AsyncIOMotorClient | None = None


async def connect() -> None:
    global _client
    _client = AsyncIOMotorClient(
        settings.mongodb_url, serverSelectionTimeoutMS=10000, tlsCAFile=certifi.where()
    )
    await _client.admin.command("ping")
    await _create_indexes(_client[settings.database_name])


async def disconnect() -> None:
    if _client is not None:
        _client.close()


def get_db() -> AsyncIOMotorDatabase:
    if _client is None:
        raise RuntimeError("Database connection not initialised")
    return _client[settings.database_name]


async def _create_indexes(db: AsyncIOMotorDatabase) -> None:
    await db[CUSTOMERS].create_index("email", unique=True)
    await db[DEVICES].create_index("serial", unique=True)
    await db[DEVICES].create_index("customerId")
    await db[REPAIR_JOBS].create_index("status")
    await db[REPAIR_JOBS].create_index("customerId")
    await db[REPAIR_JOBS].create_index("technicianId")
    await db[TECHNICIANS].create_index("email", unique=True)
    await db[INVENTORY].create_index("sku", unique=True)
    await db[INVOICES].create_index("customerId")
    await db[INVOICES].create_index("status")


def serialize(doc: dict | None) -> dict | None:
    """Mongo stores the human-readable key as _id; expose it as id."""
    if doc is None:
        return None
    doc = dict(doc)
    doc["id"] = doc.pop("_id")
    return doc


async def next_id(db: AsyncIOMotorDatabase, collection: str, prefix: str, width: int) -> str:
    """Generate the next sequential id such as C009, J2416 or INV-2416."""
    latest = await db[collection].find_one(sort=[("_id", -1)], projection={"_id": 1})
    if latest is None:
        return f"{prefix}{'1'.zfill(width)}"
    digits = "".join(ch for ch in str(latest["_id"]) if ch.isdigit())
    return f"{prefix}{str(int(digits) + 1).zfill(width)}"
