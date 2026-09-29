from datetime import date as date_type
from datetime import time

from pydantic import BaseModel


class CustomerCreate(BaseModel):
    full_name: str
    phone: str
    company_name: str
    business_phone: str
    street_address: str
    city: str
    postal_code: str
    country: str
    province: str
    email: str
    rbq: str
    ccq: str
    notes: str | None = None


class CustomerUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    company_name: str | None = None
    business_phone: str | None = None
    street_address: str | None = None
    city: str | None = None
    postal_code: str | None = None
    country: str | None = None
    province: str | None = None
    email: str | None = None
    rbq: str | None = None
    ccq: str | None = None
    notes: str | None = None


class SupplierCreate(BaseModel):
    company_name: str
    contact_name: str
    phone: str
    email: str


class SupplierUpdate(BaseModel):
    company_name: str | None = None
    contact_name: str | None = None
    phone: str | None = None
    email: str | None = None


class InventoryCreate(BaseModel):
    category: str
    item: str
    stock: int
    bought_price: float
    sale_price: float
    suppliers_id: int


class InventoryUpdate(BaseModel):
    category: str | None = None
    item: str | None = None
    stock: int | None = None
    bought_price: float | None = None
    sale_price: float | None = None
    suppliers_id: int | None = None


class TechnicianCreate(BaseModel):
    full_name: str
    phone: str
    email: str
    hourly_rate: float


class TechnicianUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    email: str | None = None
    hourly_rate: float | None = None


class SaleItemIn(BaseModel):
    items_id: int
    quantity: int
    price: float


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


class SaleItemCreate(BaseModel):
    sales_id: int
    items_id: int
    quantity: int
    price: float


class SaleItemUpdate(BaseModel):
    sales_id: int | None = None
    items_id: int | None = None
    quantity: int | None = None
    price: float | None = None


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
    total_pay: float | None = None


class PayrollCreate(BaseModel):
    technicians_id: int
    amount: float
    pay_date: date_type
    shifts: list[int] = []


class PayrollUpdate(BaseModel):
    technicians_id: int | None = None
    amount: float | None = None
    pay_date: date_type | None = None
    shifts: list[int] | None = None


class JobCreate(BaseModel):
    customers_id: int
    job_type: str
    technicians_id: int | None = None
    labour_cost: float
    scheduled_date: date_type | None = None
    completion_status: str
    payment_method: str
    payment_status: str


class JobUpdate(BaseModel):
    customers_id: int | None = None
    job_type: str | None = None
    technicians_id: int | None = None
    labour_cost: float | None = None
    scheduled_date: date_type | None = None
    completion_status: str | None = None
    payment_method: str | None = None
    payment_status: str | None = None


class JobItemCreate(BaseModel):
    jobs_id: int
    items_id: int
    quantity: int
    price: float


class JobItemUpdate(BaseModel):
    jobs_id: int | None = None
    items_id: int | None = None
    quantity: int | None = None
    price: float | None = None
