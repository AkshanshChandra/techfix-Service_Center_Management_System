"""Load the seed dataset into MongoDB.

Run from the backend directory:  python -m app.seed
"""

import asyncio
import json
from pathlib import Path

from .config import settings
from .database import (
    CUSTOMERS,
    DEVICES,
    INVENTORY,
    INVOICES,
    REPAIR_JOBS,
    TECHNICIANS,
    connect,
    disconnect,
    get_db,
)

SEED_DIR = Path(__file__).resolve().parent.parent / "seed_data"

COLLECTIONS = {
    CUSTOMERS: "customers.json",
    DEVICES: "devices.json",
    REPAIR_JOBS: "repair_jobs.json",
    TECHNICIANS: "technicians.json",
    INVENTORY: "inventory.json",
    INVOICES: "invoices.json",
}


def _to_documents(records: list[dict]) -> list[dict]:
    """The dataset carries human-readable ids (C001, J2415); use them as _id."""
    documents = []
    for record in records:
        doc = dict(record)
        doc["_id"] = doc.pop("id")
        documents.append(doc)
    return documents


async def seed() -> None:
    await connect()
    db = get_db()
    try:
        for collection, filename in COLLECTIONS.items():
            records = json.loads((SEED_DIR / filename).read_text())
            await db[collection].delete_many({})
            await db[collection].insert_many(_to_documents(records))
            print(f"  {collection:<14} {len(records):>3} documents")
        print(f"\nSeeded database '{settings.database_name}'.")
    finally:
        await disconnect()


if __name__ == "__main__":
    print(f"Seeding '{settings.database_name}'...\n")
    asyncio.run(seed())
