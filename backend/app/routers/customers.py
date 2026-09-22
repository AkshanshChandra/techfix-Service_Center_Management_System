from fastapi import APIRouter, HTTPException, Query, status
from pymongo import ReturnDocument

from ..database import CUSTOMERS, get_db, next_id, serialize
from ..models.customer import Customer, CustomerCreate, CustomerUpdate

router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.get("", response_model=list[Customer])
async def list_customers(
    search: str | None = None,
    customer_status: str | None = Query(default=None, alias="status"),
):
    query: dict = {}
    if customer_status and customer_status != "All":
        query["status"] = customer_status
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
        ]
    docs = await get_db()[CUSTOMERS].find(query).sort("_id", 1).to_list(length=None)
    return [serialize(d) for d in docs]


@router.get("/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str):
    doc = await get_db()[CUSTOMERS].find_one({"_id": customer_id})
    if doc is None:
        raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")
    return serialize(doc)


@router.post("", response_model=Customer, status_code=status.HTTP_201_CREATED)
async def create_customer(payload: CustomerCreate):
    db = get_db()
    if await db[CUSTOMERS].find_one({"email": payload.email}):
        raise HTTPException(status_code=409, detail="A customer with this email already exists")

    doc = payload.model_dump()
    if not doc["avatar"]:
        doc["avatar"] = "".join(part[0] for part in payload.name.split()[:2]).upper()
    doc["_id"] = await next_id(db, CUSTOMERS, "C", 3)
    await db[CUSTOMERS].insert_one(doc)
    return serialize(doc)


@router.put("/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, payload: CustomerUpdate):
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")
    doc = await get_db()[CUSTOMERS].find_one_and_update(
        {"_id": customer_id}, {"$set": changes}, return_document=ReturnDocument.AFTER
    )
    if doc is None:
        raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")
    return serialize(doc)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(customer_id: str):
    result = await get_db()[CUSTOMERS].delete_one({"_id": customer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")
