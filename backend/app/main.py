from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import connect, disconnect, get_db
from .routers import customers, dashboard, devices, inventory, invoices, repair_jobs, technicians


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect()
    yield
    await disconnect()


app = FastAPI(
    title="TechFix Service Center API",
    description="Backend for the TechFix service center management system.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for module in (customers, devices, repair_jobs, technicians, inventory, invoices, dashboard):
    app.include_router(module.router)


@app.get("/api/health", tags=["health"])
async def health():
    await get_db().command("ping")
    return {"status": "ok", "database": settings.database_name}
