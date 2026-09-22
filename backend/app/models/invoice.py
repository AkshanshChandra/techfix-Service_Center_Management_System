from pydantic import BaseModel

TAX_RATE = 0.18


class InvoiceBase(BaseModel):
    jobId: str
    customer: str = ""
    customerId: str
    amount: float
    date: str = ""
    dueDate: str = ""
    status: str = "Pending"
    method: str = "Pending"
    device: str = ""
    service: str = ""


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceUpdate(BaseModel):
    amount: float | None = None
    dueDate: str | None = None
    status: str | None = None
    method: str | None = None
    service: str | None = None


class Invoice(InvoiceBase):
    id: str
    tax: float
    total: float
