import time

from fastapi import APIRouter, HTTPException, Request, status
from pymongo import ReturnDocument

from .. import cashfree
from ..config import settings
from ..database import CUSTOMERS, INVOICES, get_db, serialize
from ..models.invoice import Invoice, PaymentLinkRequest

router = APIRouter(prefix="/api", tags=["payments"])


@router.post("/invoices/{invoice_id}/payment-link", response_model=Invoice)
async def create_invoice_payment_link(invoice_id: str, payload: PaymentLinkRequest):
    db = get_db()
    invoice = await db[INVOICES].find_one({"_id": invoice_id})
    if invoice is None:
        raise HTTPException(status_code=404, detail=f"Invoice {invoice_id} not found")
    if invoice["status"] == "Paid":
        raise HTTPException(status_code=400, detail="Invoice is already paid")

    # Reuse an existing link rather than spamming Cashfree with duplicates.
    if invoice.get("paymentLinkId") and invoice.get("paymentLinkStatus") == "ACTIVE":
        return serialize(invoice)

    link_id = f"{invoice_id}-{int(time.time())}"
    try:
        result = await cashfree.create_payment_link(
            link_id=link_id,
            amount=invoice["total"],
            purpose=f"TechFix invoice {invoice_id} — {invoice.get('service') or 'Repair service'}",
            customer_name=invoice.get("customer", "Customer"),
            customer_email=payload.email,
            customer_phone=payload.phone or "",
            return_url=f"{settings.frontend_url}/invoices",
        )
    except cashfree.CashfreeError as exc:
        raise HTTPException(status_code=502, detail=f"Cashfree error: {exc}") from exc

    changes = {
        "paymentLinkId": link_id,
        "paymentLinkUrl": result.get("link_url"),
        "paymentLinkStatus": result.get("link_status", "ACTIVE"),
        "customerEmail": payload.email,
        "customerPhone": payload.phone or invoice.get("customerPhone", ""),
    }
    doc = await db[INVOICES].find_one_and_update(
        {"_id": invoice_id}, {"$set": changes}, return_document=ReturnDocument.AFTER
    )
    return serialize(doc)


async def _sync_invoice_payment(db, invoice: dict) -> dict:
    """Refetch a payment link's status from Cashfree and apply it, rather than trusting a payload."""
    link_id = invoice.get("paymentLinkId")
    if not link_id or invoice["status"] == "Paid":
        return invoice

    try:
        result = await cashfree.get_payment_link(link_id)
    except cashfree.CashfreeError:
        return invoice

    new_status = result.get("link_status", invoice.get("paymentLinkStatus"))
    changes = {"paymentLinkStatus": new_status}
    if new_status == "PAID":
        changes["status"] = "Paid"
        changes["method"] = "Online (Cashfree)"

    doc = await db[INVOICES].find_one_and_update(
        {"_id": invoice["_id"]}, {"$set": changes}, return_document=ReturnDocument.AFTER
    )
    if new_status == "PAID":
        await db[CUSTOMERS].update_one(
            {"_id": doc["customerId"], "invoices.id": doc["_id"]},
            {"$set": {"invoices.$.status": "Paid"}},
        )
    return doc


@router.post("/invoices/{invoice_id}/payment-link/sync", response_model=Invoice)
async def sync_invoice_payment_link(invoice_id: str):
    db = get_db()
    invoice = await db[INVOICES].find_one({"_id": invoice_id})
    if invoice is None:
        raise HTTPException(status_code=404, detail=f"Invoice {invoice_id} not found")
    doc = await _sync_invoice_payment(db, invoice)
    return serialize(doc)


@router.post("/webhooks/cashfree", status_code=status.HTTP_200_OK)
async def cashfree_webhook(request: Request):
    """Cashfree calls this when a payment link is paid. Requires a public URL, so it's a no-op
    for pure localhost development — the frontend's polling covers that case instead."""
    raw_body = await request.body()
    signature = request.headers.get("x-webhook-signature", "")
    timestamp = request.headers.get("x-webhook-timestamp", "")

    if not cashfree.verify_webhook_signature(raw_body, timestamp, signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    # The payload's own status is not trusted — every currently-active link is re-checked
    # directly against Cashfree, so this endpoint works regardless of exact payload shape.
    db = get_db()
    active = await db[INVOICES].find({"paymentLinkStatus": "ACTIVE"}).to_list(length=None)
    for invoice in active:
        await _sync_invoice_payment(db, invoice)
    return {"received": True}
