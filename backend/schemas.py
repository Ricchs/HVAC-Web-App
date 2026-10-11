from datetime import date as date_type
from datetime import time
from typing import Annotated

from pydantic import BaseModel, BeforeValidator, Field, StringConstraints

from backend.utils import normalize_phone


def require_phone(value):
    phone = normalize_phone(value)
    if phone is None:
        raise ValueError("Phone number is required.")
    return phone


def update_phone(value):
    if value is not None and not str(value).strip():
        raise ValueError("Phone number is required.")
    return normalize_phone(value)


Phone = Annotated[str | None, BeforeValidator(normalize_phone)]
RequiredPhone = Annotated[str, BeforeValidator(require_phone)]
UpdatePhone = Annotated[str | None, BeforeValidator(update_phone)]
NonEmptyStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


# Customer
class CustomerCreate(BaseModel):
    full_name: NonEmptyStr
    phone: RequiredPhone
    company_name: str | None = None
    business_phone: Phone = None
    street_address: str | None = None
    city: str | None = None
    postal_code: str | None = None
    country: str | None = None
    province: str | None = None
    email: str | None = None
    rbq: str | None = None
    ccq: str | None = None
    notes: str | None = None


class CustomerUpdate(BaseModel):
    full_name: NonEmptyStr | None = None
    phone: UpdatePhone = None
    company_name: str | None = None
    business_phone: Phone = None
    street_address: str | None = None
    city: str | None = None
    postal_code: str | None = None
    country: str | None = None
    province: str | None = None
    email: str | None = None
    rbq: str | None = None
    ccq: str | None = None
    notes: str | None = None


# Inventory
class InventoryCreate(BaseModel):
    category: str
    item: NonEmptyStr
    stock: int = Field(ge=0)
    bought_price: float = Field(ge=0)
    sale_price: float = Field(ge=0)
    suppliers_id: int


class InventoryUpdate(BaseModel):
    category: str | None = None
    item: NonEmptyStr | None = None
    stock: int | None = Field(default=None, ge=0)
    bought_price: float | None = Field(default=None, ge=0)
    sale_price: float | None = Field(default=None, ge=0)
    suppliers_id: int | None = None


# Supplier
class SupplierCreate(BaseModel):
    company_name: NonEmptyStr
    contact_name: str | None = None
    phone: Phone = None
    email: str | None = None


class SupplierUpdate(BaseModel):
    company_name: NonEmptyStr | None = None
    contact_name: str | None = None
    phone: Phone = None
    email: str | None = None


# Job
class JobCreate(BaseModel):
    customers_id: int
    job_type: str
    technicians_id: int | None = None
    labour_cost: float = Field(ge=0)
    scheduled_date: date_type | None = None
    completion_status: str
    payment_method: str
    payment_status: str


class JobUpdate(BaseModel):
    customers_id: int | None = None
    job_type: str | None = None
    technicians_id: int | None = None
    labour_cost: float | None = Field(default=None, ge=0)
    scheduled_date: date_type | None = None
    completion_status: str | None = None
    payment_method: str | None = None
    payment_status: str | None = None


# Job item
class JobItemCreate(BaseModel):
    jobs_id: int
    items_id: int
    quantity: int = Field(gt=0)
    price: float = Field(ge=0)


class JobItemUpdate(BaseModel):
    jobs_id: int | None = None
    items_id: int | None = None
    quantity: int | None = Field(default=None, gt=0)
    price: float | None = Field(default=None, ge=0)


# Sale
class SaleCreate(BaseModel):
    customers_id: int
    date: date_type
    payment_method: str
    payment_status: str


class SaleUpdate(BaseModel):
    customers_id: int | None = None
    date: date_type | None = None
    payment_method: str | None = None
    payment_status: str | None = None


# Sale item
class SaleItemCreate(BaseModel):
    sales_id: int
    items_id: int
    quantity: int = Field(gt=0)
    price: float = Field(ge=0)


class SaleItemUpdate(BaseModel):
    sales_id: int | None = None
    items_id: int | None = None
    quantity: int | None = Field(default=None, gt=0)
    price: float | None = Field(default=None, ge=0)


# Technician
class TechnicianCreate(BaseModel):
    full_name: NonEmptyStr
    phone: RequiredPhone
    email: str
    hourly_rate: float = Field(ge=0)


class TechnicianUpdate(BaseModel):
    full_name: NonEmptyStr | None = None
    phone: UpdatePhone = None
    email: str | None = None
    hourly_rate: float | None = Field(default=None, ge=0)


# Shift
class ShiftCreate(BaseModel):
    technicians_id: int
    start_time: time
    end_time: time
    date: date_type


class ShiftUpdate(BaseModel):
    technicians_id: int | None = None
    start_time: time | None = None
    end_time: time | None = None
    date: date_type | None = None


# Payroll
class PayrollCreate(BaseModel):
    technicians_id: int
    amount: float = Field(ge=0)
    pay_date: date_type
    shifts: list[int] = []


class PayrollUpdate(BaseModel):
    technicians_id: int | None = None
    amount: float | None = Field(default=None, ge=0)
    pay_date: date_type | None = None
    shifts: list[int] | None = None
