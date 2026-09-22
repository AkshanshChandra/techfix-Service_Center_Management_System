from fastapi import APIRouter

from ..database import (
    CUSTOMERS,
    DEVICES,
    INVENTORY,
    INVOICES,
    REPAIR_JOBS,
    TECHNICIANS,
    get_db,
    serialize,
)

router = APIRouter(prefix="/api", tags=["analytics"])

OPEN_STATUSES = ["Received", "Diagnosing", "Waiting Parts", "Repairing", "Quality Check"]


async def _count_by(collection: str, field: str) -> list[dict]:
    pipeline = [{"$group": {"_id": f"${field}", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}]
    rows = await get_db()[collection].aggregate(pipeline).to_list(length=None)
    return [{"label": r["_id"], "count": r["count"]} for r in rows]


@router.get("/dashboard/stats")
async def dashboard_stats():
    db = get_db()

    total_customers = await db[CUSTOMERS].count_documents({})
    active_repairs = await db[REPAIR_JOBS].count_documents({"status": {"$in": OPEN_STATUSES}})
    completed = await db[REPAIR_JOBS].count_documents({"status": "Delivered"})
    devices_waiting = await db[REPAIR_JOBS].count_documents({"status": {"$in": ["Ready", "Waiting Parts"]}})
    parts_available = await db[INVENTORY].count_documents({"status": "Available"})
    pending_invoices = await db[INVOICES].count_documents({"status": "Pending"})

    paid = await db[INVOICES].aggregate(
        [{"$match": {"status": "Paid"}}, {"$group": {"_id": None, "total": {"$sum": "$total"}}}]
    ).to_list(length=1)
    outstanding = await db[INVOICES].aggregate(
        [{"$match": {"status": {"$ne": "Paid"}}}, {"$group": {"_id": None, "total": {"$sum": "$total"}}}]
    ).to_list(length=1)

    recent_jobs = await db[REPAIR_JOBS].find().sort("_id", -1).limit(5).to_list(length=5)
    low_stock = (
        await db[INVENTORY]
        .find({"status": {"$in": ["Low Stock", "Out of Stock"]}})
        .sort("stock", 1)
        .limit(5)
        .to_list(length=5)
    )

    return {
        "totalCustomers": total_customers,
        "activeRepairs": active_repairs,
        "completedRepairs": completed,
        "devicesWaiting": devices_waiting,
        "partsAvailable": parts_available,
        "pendingInvoices": pending_invoices,
        "revenue": round(paid[0]["total"], 2) if paid else 0,
        "outstanding": round(outstanding[0]["total"], 2) if outstanding else 0,
        "statusBreakdown": await _count_by(REPAIR_JOBS, "status"),
        "categoryBreakdown": await _count_by(REPAIR_JOBS, "category"),
        "recentJobs": [serialize(j) for j in recent_jobs],
        "lowStockParts": [serialize(p) for p in low_stock],
    }


@router.get("/reports/summary")
async def reports_summary():
    db = get_db()

    monthly = await db[INVOICES].aggregate(
        [
            {
                "$group": {
                    "_id": {"$substr": ["$date", 0, 7]},
                    "revenue": {"$sum": "$total"},
                    "invoices": {"$sum": 1},
                }
            },
            {"$sort": {"_id": 1}},
        ]
    ).to_list(length=None)

    technicians = await db[TECHNICIANS].find().sort("efficiency", -1).to_list(length=None)
    total_jobs = await db[REPAIR_JOBS].count_documents({})
    ratings = [t["rating"] for t in technicians if t.get("rating")]

    return {
        "monthlyRevenue": [
            {"month": m["_id"], "revenue": round(m["revenue"], 2), "repairs": m["invoices"]}
            for m in monthly
        ],
        "categoryRepairs": await _count_by(REPAIR_JOBS, "category"),
        "brandBreakdown": await _count_by(DEVICES, "brand"),
        "priorityBreakdown": await _count_by(REPAIR_JOBS, "priority"),
        "technicianPerformance": [
            {
                "id": t["_id"],
                "name": t["name"],
                "avatar": t.get("avatar", ""),
                "avatarColor": t.get("avatarColor", ""),
                "completedJobs": t.get("completedJobs", 0),
                "currentJobs": t.get("currentJobs", 0),
                "efficiency": t.get("efficiency", 0),
                "rating": t.get("rating", 0),
            }
            for t in technicians
        ],
        "totalJobs": total_jobs,
        "averageRating": round(sum(ratings) / len(ratings), 2) if ratings else 0,
    }
