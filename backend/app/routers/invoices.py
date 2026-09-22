from datetime import date, timedelta

from fastapi import APIRouter, HTTPException, Query, status
from pymongo import ReturnDocument

from ..database import CUSTOMERS, INVOICES, REPAIR_JOBS, get_db, serialize
from ..models.invoice import TAX_RATE, Invoice, InvoiceCreate, InvoiceUpdate

router = APIRouter(prefix="/api/invoices", tags=["invoices"])


@router.get("", response_model=list[Invoice])
async def list_invoices(
    search: str | None = None,
    invoice_status: str | None = Query(default=None, alias="status"),
    customerId: str | None = None,
):
    query: dict = {}
    if invoice_status and invoice_status != "All":
        query["status"] = invoice_status
    if customerId:
        query["customerId"] = customerId
    if search:
        query["$or"] = [
            {"_id": {"$regex": search, "$options": "i"}},
            {"customer": {"$regex": search, "$options": "i"}},
            {"device": {"$regex": search, "$options": "i"}},
        ]
    docs = await get_db()[INVOICES].find(query).sort("date", -1).to_list(length=None)
    return [serialize(d) for d in docs]


@router.get("/{invoice_id}", response_model=Invoice)
async def get_invoice(invoice_id: str):
    doc = await get_db()[INVOICES].find_one({"_id": invoice_id})
    if doc is None:
        raise HTTPException(status_code=404, detail=f"Invoice {invoice_id} not found")
    return serialize(doc)


@router.post("", response_model=Invoice, status_code=status.HTTP_201_CREATED)
async def create_invoice(payload: InvoiceCreate):
    db = get_db()
    job = await db[REPAIR_JOBS].find_one({"_id": payload.jobId})
    if job is None:
        raise HTTPException(status_code=404, detail=f"Repair job {payload.jobId} not found")
    if await db[INVOICES].find_one({"jobId": payload.jobId}):
        raise HTTPException(status_code=409, detail=f"Job {payload.jobId} is already invoiced")

    doc = payload.model_dump()
    doc["customer"] = doc["customer"] or job["customerName"]
    doc["device"] = doc["device"] or job["device"]
    doc["service"] = doc["service"] or job["issue"]
    doc["date"] = doc["date"] or date.today().isoformat()
    doc["dueDate"] = doc["dueDate"] or (date.today() + timedelta(days=7)).isoformat()
    doc["tax"] = round(payload.amount * TAX_RATE, 2)
    doc["total"] = round(payload.amount + doc["tax"], 2)
    # Invoice numbers mirror the job number they bill, e.g. J2415 -> INV-2415.
    doc["_id"] = f"INV-{''.join(ch for ch in payload.jobId if ch.isdigit())}"

    await db[INVOICES].insert_one(doc)
    await db[CUSTOMERS].update_one(
        {"_id": payload.customerId},
        {"$push": {"invoices": {"id": doc["_id"], "amount": doc["amount"], "date": doc["date"], "status": doc["status"]}}},
    )
    return serialize(doc)


@router.put("/{invoice_id}", response_model=Invoice)
async def update_invoice(invoice_id: str, payload: InvoiceUpdate):
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")

    if "amount" in changes:
        changes["tax"] = round(changes["amount"] * TAX_RATE, 2)
        changes["total"] = round(changes["amount"] + changes["tax"], 2)

    db = get_db()
    doc = await db[INVOICES].find_one_and_update(
        {"_id": invoice_id}, {"$set": changes}, return_document=ReturnDocument.AFTER
    )
    if doc is None:
        raise HTTPException(status_code=404, detail=f"Invoice {invoice_id} not found")

    if "status" in changes:
        await db[CUSTOMERS].update_one(
            {"_id": doc["customerId"], "invoices.id": invoice_id},
            {"$set": {"invoices.$.status": changes["status"]}},
        )
    return serialize(doc)


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(invoice_id: str):
    db = get_db()
    doc = await db[INVOICES].find_one_and_delete({"_id": invoice_id})
    if doc is None:
        raise HTTPException(status_code=404, detail=f"Invoice {invoice_id} not found")
    await db[CUSTOMERS].update_one(
        {"_id": doc["customerId"]}, {"$pull": {"invoices": {"id": invoice_id}}}
    )
