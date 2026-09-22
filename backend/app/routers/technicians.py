from fastapi import APIRouter, HTTPException, Query, status
from pymongo import ReturnDocument

from ..database import TECHNICIANS, get_db, next_id, serialize
from ..models.technician import Technician, TechnicianCreate, TechnicianUpdate

router = APIRouter(prefix="/api/technicians", tags=["technicians"])


@router.get("", response_model=list[Technician])
async def list_technicians(
    search: str | None = None,
    availability: str | None = Query(default=None),
):
    query: dict = {}
    if availability and availability != "All":
        query["availability"] = availability
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"skills": {"$regex": search, "$options": "i"}},
        ]
    docs = await get_db()[TECHNICIANS].find(query).sort("_id", 1).to_list(length=None)
    return [serialize(d) for d in docs]


@router.get("/{technician_id}", response_model=Technician)
async def get_technician(technician_id: str):
    doc = await get_db()[TECHNICIANS].find_one({"_id": technician_id})
    if doc is None:
        raise HTTPException(status_code=404, detail=f"Technician {technician_id} not found")
    return serialize(doc)


@router.post("", response_model=Technician, status_code=status.HTTP_201_CREATED)
async def create_technician(payload: TechnicianCreate):
    db = get_db()
    if await db[TECHNICIANS].find_one({"email": payload.email}):
        raise HTTPException(status_code=409, detail="A technician with this email already exists")

    doc = payload.model_dump()
    if not doc["avatar"]:
        doc["avatar"] = "".join(part[0] for part in payload.name.split()[:2]).upper()
    doc["_id"] = await next_id(db, TECHNICIANS, "T", 3)
    await db[TECHNICIANS].insert_one(doc)
    return serialize(doc)


@router.put("/{technician_id}", response_model=Technician)
async def update_technician(technician_id: str, payload: TechnicianUpdate):
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")
    doc = await get_db()[TECHNICIANS].find_one_and_update(
        {"_id": technician_id}, {"$set": changes}, return_document=ReturnDocument.AFTER
    )
    if doc is None:
        raise HTTPException(status_code=404, detail=f"Technician {technician_id} not found")
    return serialize(doc)


@router.delete("/{technician_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_technician(technician_id: str):
    result = await get_db()[TECHNICIANS].delete_one({"_id": technician_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Technician {technician_id} not found")
