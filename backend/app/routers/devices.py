from fastapi import APIRouter, HTTPException, Query, status
from pymongo import ReturnDocument

from ..database import DEVICES, get_db, next_id, serialize
from ..models.device import Device, DeviceCreate, DeviceUpdate

router = APIRouter(prefix="/api/devices", tags=["devices"])


@router.get("", response_model=list[Device])
async def list_devices(
    search: str | None = None,
    category: str | None = None,
    brand: str | None = None,
    device_status: str | None = Query(default=None, alias="status"),
    customerId: str | None = None,
):
    query: dict = {}
    for field, value in (
        ("category", category),
        ("brand", brand),
        ("status", device_status),
        ("customerId", customerId),
    ):
        if value and value != "All":
            query[field] = value
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"serial": {"$regex": search, "$options": "i"}},
            {"customer": {"$regex": search, "$options": "i"}},
        ]
    docs = await get_db()[DEVICES].find(query).sort("_id", 1).to_list(length=None)
    return [serialize(d) for d in docs]


@router.get("/{device_id}", response_model=Device)
async def get_device(device_id: str):
    doc = await get_db()[DEVICES].find_one({"_id": device_id})
    if doc is None:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    return serialize(doc)


@router.post("", response_model=Device, status_code=status.HTTP_201_CREATED)
async def create_device(payload: DeviceCreate):
    db = get_db()
    if await db[DEVICES].find_one({"serial": payload.serial}):
        raise HTTPException(status_code=409, detail="A device with this serial number already exists")

    doc = payload.model_dump()
    doc["_id"] = await next_id(db, DEVICES, "D", 3)
    await db[DEVICES].insert_one(doc)
    return serialize(doc)


@router.put("/{device_id}", response_model=Device)
async def update_device(device_id: str, payload: DeviceUpdate):
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")
    doc = await get_db()[DEVICES].find_one_and_update(
        {"_id": device_id}, {"$set": changes}, return_document=ReturnDocument.AFTER
    )
    if doc is None:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    return serialize(doc)


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(device_id: str):
    result = await get_db()[DEVICES].delete_one({"_id": device_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
