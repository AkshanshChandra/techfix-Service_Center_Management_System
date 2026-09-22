from pydantic import BaseModel, Field


class RepairHistoryEntry(BaseModel):
    id: str
    device: str
    issue: str
    date: str
    cost: float
    status: str


class InvoiceSummary(BaseModel):
    id: str
    amount: float
    date: str
    status: str


class Warranty(BaseModel):
    status: str = "None"
    expires: str | None = None
    coverage: str = "No active warranty"


class CustomerBase(BaseModel):
    name: str
    email: str
    phone: str
    address: str = ""
    avatar: str = ""
    avatarColor: str = "bg-blue-500"
    totalRepairs: int = 0
    currentDevice: str = ""
    status: str = "Active"
    joinDate: str = ""
    repairHistory: list[RepairHistoryEntry] = Field(default_factory=list)
    invoices: list[InvoiceSummary] = Field(default_factory=list)
    warranty: Warranty = Field(default_factory=Warranty)


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    avatar: str | None = None
    avatarColor: str | None = None
    totalRepairs: int | None = None
    currentDevice: str | None = None
    status: str | None = None
    warranty: Warranty | None = None


class Customer(CustomerBase):
    id: str
