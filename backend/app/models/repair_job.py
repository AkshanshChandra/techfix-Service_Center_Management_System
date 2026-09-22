from enum import Enum

from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    received = "Received"
    diagnosing = "Diagnosing"
    waiting_parts = "Waiting Parts"
    repairing = "Repairing"
    quality_check = "Quality Check"
    ready = "Ready"
    delivered = "Delivered"


class Priority(str, Enum):
    critical = "Critical"
    high = "High"
    medium = "Medium"
    low = "Low"


class RepairJobBase(BaseModel):
    customerId: str
    customerName: str = ""
    customerPhone: str = ""
    device: str
    category: str = ""
    brand: str = ""
    model: str = ""
    serial: str = ""
    issue: str
    priority: Priority = Priority.medium
    status: JobStatus = JobStatus.received
    technicianId: str | None = None
    technicianName: str = ""
    receivedDate: str = ""
    estimatedDelivery: str = ""
    progress: int = Field(default=0, ge=0, le=100)
    diagnosis: str = ""
    partsRequired: list[str] = Field(default_factory=list)
    cost: float = 0
    notes: str = ""
    warranty: str = "30 days"
    images: list[str] = Field(default_factory=list)


class RepairJobCreate(RepairJobBase):
    pass


class RepairJobUpdate(BaseModel):
    device: str | None = None
    category: str | None = None
    brand: str | None = None
    model: str | None = None
    serial: str | None = None
    issue: str | None = None
    priority: Priority | None = None
    status: JobStatus | None = None
    technicianId: str | None = None
    technicianName: str | None = None
    estimatedDelivery: str | None = None
    progress: int | None = Field(default=None, ge=0, le=100)
    diagnosis: str | None = None
    partsRequired: list[str] | None = None
    cost: float | None = None
    notes: str | None = None
    warranty: str | None = None


class StatusUpdate(BaseModel):
    status: JobStatus


class RepairJob(RepairJobBase):
    id: str
