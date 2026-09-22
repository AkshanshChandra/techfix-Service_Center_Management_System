from pydantic import BaseModel, Field


class PartBase(BaseModel):
    name: str
    category: str
    stock: int = Field(default=0, ge=0)
    minStock: int = Field(default=0, ge=0)
    supplier: str = ""
    price: float = 0
    sku: str


class PartCreate(PartBase):
    pass


class PartUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    stock: int | None = Field(default=None, ge=0)
    minStock: int | None = Field(default=None, ge=0)
    supplier: str | None = None
    price: float | None = None


class StockAdjustment(BaseModel):
    delta: int


class Part(PartBase):
    id: str
    status: str


def stock_status(stock: int, min_stock: int) -> str:
    if stock == 0:
        return "Out of Stock"
    if stock <= min_stock:
        return "Low Stock"
    return "Available"
