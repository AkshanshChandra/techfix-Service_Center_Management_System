from fastapi import APIRouter, HTTPException, Query, status
from pymongo import ReturnDocument

from ..database import INVENTORY, get_db, next_id, serialize
from ..models.inventory import Part, PartCreate, PartUpdate, StockAdjustment, stock_status

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


@router.get("", response_model=list[Part])
async def list_parts(
    search: str | None = None,
    category: str | None = None,
    part_status: str | None = Query(default=None, alias="status"),
):
    query: dict = {}
    if category and category != "All":
        query["category"] = category
    if part_status and part_status != "All":
        query["status"] = part_status
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"sku": {"$regex": search, "$options": "i"}},
            {"supplier": {"$regex": search, "$options": "i"}},
        ]
    docs = await get_db()[INVENTORY].find(query).sort("_id", 1).to_list(length=None)
    return [serialize(d) for d in docs]


@router.get("/low-stock", response_model=list[Part])
async def list_low_stock():
    docs = (
        await get_db()[INVENTORY]
        .find({"status": {"$in": ["Low Stock", "Out of Stock"]}})
        .sort("stock", 1)
        .to_list(length=None)
    )
    return [serialize(d) for d in docs]


@router.get("/{part_id}", response_model=Part)
async def get_part(part_id: str):
    doc = await get_db()[INVENTORY].find_one({"_id": part_id})
    if doc is None:
        raise HTTPException(status_code=404, detail=f"Part {part_id} not found")
    return serialize(doc)


@router.post("", response_model=Part, status_code=status.HTTP_201_CREATED)
async def create_part(payload: PartCreate):
    db = get_db()
    if await db[INVENTORY].find_one({"sku": payload.sku}):
        raise HTTPException(status_code=409, detail="A part with this SKU already exists")

    doc = payload.model_dump()
    doc["status"] = stock_status(payload.stock, payload.minStock)
    doc["_id"] = await next_id(db, INVENTORY, "P", 3)
    await db[INVENTORY].insert_one(doc)
    return serialize(doc)


@router.put("/{part_id}", response_model=Part)
async def update_part(part_id: str, payload: PartUpdate):
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")

    db = get_db()
    part = await db[INVENTORY].find_one({"_id": part_id})
    if part is None:
        raise HTTPException(status_code=404, detail=f"Part {part_id} not found")

    merged = {**part, **changes}
    changes["status"] = stock_status(merged["stock"], merged["minStock"])
    doc = await db[INVENTORY].find_one_and_update(
        {"_id": part_id}, {"$set": changes}, return_document=ReturnDocument.AFTER
    )
    return serialize(doc)


@router.patch("/{part_id}/stock", response_model=Part)
async def adjust_stock(part_id: str, payload: StockAdjustment):
    """Consume parts on a repair (negative delta) or restock them (positive)."""
    db = get_db()
    part = await db[INVENTORY].find_one({"_id": part_id})
    if part is None:
        raise HTTPException(status_code=404, detail=f"Part {part_id} not found")

    new_stock = part["stock"] + payload.delta
    if new_stock < 0:
        raise HTTPException(
            status_code=400,
            detail=f"Only {part['stock']} units of {part['name']} in stock",
        )

    doc = await db[INVENTORY].find_one_and_update(
        {"_id": part_id},
        {"$set": {"stock": new_stock, "status": stock_status(new_stock, part["minStock"])}},
        return_document=ReturnDocument.AFTER,
    )
    return serialize(doc)


@router.delete("/{part_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_part(part_id: str):
    result = await get_db()[INVENTORY].delete_one({"_id": part_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Part {part_id} not found")
