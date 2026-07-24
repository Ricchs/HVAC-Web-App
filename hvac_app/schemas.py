from pydantic import BaseModel
from typing import Optional
from datetime import date as date_type, time

class CustomerCreate(BaseModel):
    full_name: str
    phone: str
    company_name: str
    street_address: str
    city: str
    postal_code: str
    country: str
    province: str
    email: str
    rbq: str
    ccq: str

class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    street_address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    province: Optional[str] = None
    email: Optional[str] = None
    rbq: Optional[str] = None
    ccq: Optional[str] = None

class SupplierCreate(BaseModel):
    company_name: str
    contact_name: str
    phone: str
    email: str

class SupplierUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class InventoryCreate(BaseModel):
    category: str
    item: str
    stock: int
    bought_price: float
    sale_price: float
    supplier: str

class InventoryUpdate(BaseModel):
    category: Optional[str] = None
    item: Optional[str] = None
    stock: Optional[int] = None
    bought_price: Optional[float] = None
    sale_price: Optional[float] = None
    supplier: Optional[str] = None

class TechnicianCreate(BaseModel):
    full_name: str
    phone: str
    email: str
    hourly_rate: float

class TechnicianUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    hourly_rate: Optional[float] = None

class SaleItemIn(BaseModel):
    items_id: int
    quantity: int
    price: float

class SaleCreate(BaseModel):
    customers_id: int
    date: date_type
    payment_method: str
    payment_status: str
    items: list[SaleItemIn]

class SaleUpdate(BaseModel):
    customers_id: Optional[int] = None
    date: Optional[date_type] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None

class SaleItemCreate(BaseModel):
    sales_id: int
    items_id: int
    quantity: int
    price: float

class SaleItemUpdate(BaseModel):
    sales_id: Optional[int] = None
    items_id: Optional[int] = None
    quantity: Optional[int] = None
    price: Optional[float] = None

class ShiftCreate(BaseModel):
    technicians_id: int
    start_time: time 
    end_time: time
    date: date_type
    total_pay: float

class ShiftUpdate(BaseModel):
    technicians_id: Optional[int] = None
    start_time: Optional[time] = None 
    end_time: Optional[time] = None
    date: Optional[date_type] = None
    total_pay: Optional[float] = None

class PayrollCreate(BaseModel):
    technicians_id: int
    paid_status: str
    last_paid_date: date_type

class PayrollUpdate(BaseModel):
    technicians_id: Optional[int] = None
    paid_status: Optional[str] = None
    last_paid_date: Optional[date_type] = None

class JobCreate(BaseModel): 
    customers_id: int
    job_type: str
    technicians_id: int
    labour_cost: float
    scheduled_date: date_type
    completion_status: str
    payment_method: str
    payment_status: str  

class JobUpdate(BaseModel): 
    customers_id: Optional[int] = None
    job_type: Optional[str] = None
    technicians_id: Optional[int] = None
    labour_cost: Optional[float] = None
    scheduled_date: Optional[date_type] = None
    completion_status: Optional[str] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None

class JobItemCreate(BaseModel):
    jobs_id: int
    items_id: int
    quantity: int
    price: float

class JobItemUpdate(BaseModel):
    jobs_id: Optional[int] = None
    items_id: Optional[int] = None
    quantity: Optional[int] = None
    price: Optional[float] = None