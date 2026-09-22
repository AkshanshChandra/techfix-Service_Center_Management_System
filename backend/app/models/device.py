from pydantic import BaseModel


class DeviceBase(BaseModel):
    name: str
    brand: str
    category: str
    model: str = ""
    serial: str
    customer: str = ""
    customerId: str
    warranty: str = "None"
    warrantyExpiry: str | None = None
    status: str = "Received"
    color: str = "bg-gradient-to-br from-slate-400 to-slate-600"
    icon: str = "📱"


class DeviceCreate(DeviceBase):
    pass


class DeviceUpdate(BaseModel):
    name: str | None = None
    brand: str | None = None
    category: str | None = None
    model: str | None = None
    serial: str | None = None
    customer: str | None = None
    customerId: str | None = None
    warranty: str | None = None
    warrantyExpiry: str | None = None
    status: str | None = None
    color: str | None = None
    icon: str | None = None


class Device(DeviceBase):
    id: str
