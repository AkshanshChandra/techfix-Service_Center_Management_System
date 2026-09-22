from datetime import date

from fastapi import APIRouter, HTTPException, Query, status
from pymongo import ReturnDocument

from ..database import CUSTOMERS, REPAIR_JOBS, TECHNICIANS, get_db, next_id, serialize
from ..models.repair_job import JobStatus, RepairJob, RepairJobCreate, RepairJobUpdate, StatusUpdate

router = APIRouter(prefix="/api/repair-jobs", tags=["repair-jobs"])

PROGRESS_BY_STATUS = {
    JobStatus.received: 10,
    JobStatus.diagnosing: 25,
    JobStatus.waiting_parts: 35,
    JobStatus.repairing: 65,
    JobStatus.quality_check: 90,
    JobStatus.ready: 100,
    JobStatus.delivered: 100,
}


@router.get("", response_model=list[RepairJob])
async def list_jobs(
    search: str | None = None,
    job_status: str | None = Query(default=None, alias="status"),
    priority: str | None = None,
    customerId: str | None = None,
    technicianId: str | None = None,
):
    query: dict = {}
    for field, value in (
        ("status", job_status),
        ("priority", priority),
        ("customerId", customerId),
        ("technicianId", technicianId),
    ):
        if value and value != "All":
            query[field] = value
    if search:
        query["$or"] = [
            {"_id": {"$regex": search, "$options": "i"}},
            {"customerName": {"$regex": search, "$options": "i"}},
            {"device": {"$regex": search, "$options": "i"}},
            {"issue": {"$regex": search, "$options": "i"}},
        ]
    docs = await get_db()[REPAIR_JOBS].find(query).sort("_id", -1).to_list(length=None)
    return [serialize(d) for d in docs]


@router.get("/{job_id}", response_model=RepairJob)
async def get_job(job_id: str):
    doc = await get_db()[REPAIR_JOBS].find_one({"_id": job_id})
    if doc is None:
        raise HTTPException(status_code=404, detail=f"Repair job {job_id} not found")
    return serialize(doc)


@router.post("", response_model=RepairJob, status_code=status.HTTP_201_CREATED)
async def create_job(payload: RepairJobCreate):
    db = get_db()
    customer = await db[CUSTOMERS].find_one({"_id": payload.customerId})
    if customer is None:
        raise HTTPException(status_code=404, detail=f"Customer {payload.customerId} not found")

    doc = payload.model_dump(mode="json")
    doc["customerName"] = doc["customerName"] or customer["name"]
    doc["customerPhone"] = doc["customerPhone"] or customer["phone"]
    doc["receivedDate"] = doc["receivedDate"] or date.today().isoformat()
    doc["progress"] = doc["progress"] or PROGRESS_BY_STATUS[payload.status]

    if payload.technicianId:
        technician = await db[TECHNICIANS].find_one({"_id": payload.technicianId})
        if technician is None:
            raise HTTPException(status_code=404, detail=f"Technician {payload.technicianId} not found")
        doc["technicianName"] = technician["name"]
        await db[TECHNICIANS].update_one({"_id": payload.technicianId}, {"$inc": {"currentJobs": 1}})

    doc["_id"] = await next_id(db, REPAIR_JOBS, "J", 4)
    await db[REPAIR_JOBS].insert_one(doc)
    await db[CUSTOMERS].update_one(
        {"_id": payload.customerId},
        {"$inc": {"totalRepairs": 1}, "$set": {"currentDevice": doc["device"]}},
    )
    return serialize(doc)


@router.put("/{job_id}", response_model=RepairJob)
async def update_job(job_id: str, payload: RepairJobUpdate):
    changes = payload.model_dump(exclude_unset=True, mode="json")
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")

    db = get_db()
    if changes.get("technicianId"):
        technician = await db[TECHNICIANS].find_one({"_id": changes["technicianId"]})
        if technician is None:
            raise HTTPException(status_code=404, detail=f"Technician {changes['technicianId']} not found")
        changes["technicianName"] = technician["name"]

    doc = await db[REPAIR_JOBS].find_one_and_update(
        {"_id": job_id}, {"$set": changes}, return_document=ReturnDocument.AFTER
    )
    if doc is None:
        raise HTTPException(status_code=404, detail=f"Repair job {job_id} not found")
    return serialize(doc)


@router.patch("/{job_id}/status", response_model=RepairJob)
async def update_job_status(job_id: str, payload: StatusUpdate):
    """Backs the kanban board: dragging a card moves the job between columns."""
    db = get_db()
    job = await db[REPAIR_JOBS].find_one({"_id": job_id})
    if job is None:
        raise HTTPException(status_code=404, detail=f"Repair job {job_id} not found")

    changes = {"status": payload.status.value, "progress": PROGRESS_BY_STATUS[payload.status]}
    doc = await db[REPAIR_JOBS].find_one_and_update(
        {"_id": job_id}, {"$set": changes}, return_document=ReturnDocument.AFTER
    )

    became_closed = payload.status == JobStatus.delivered and job["status"] != JobStatus.delivered.value
    if became_closed and job.get("technicianId"):
        await db[TECHNICIANS].update_one(
            {"_id": job["technicianId"]}, {"$inc": {"currentJobs": -1, "completedJobs": 1}}
        )
    return serialize(doc)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(job_id: str):
    result = await get_db()[REPAIR_JOBS].delete_one({"_id": job_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Repair job {job_id} not found")
