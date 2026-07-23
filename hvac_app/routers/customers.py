from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *

router = APIRouter()

@router.get("/customers")
def get_customers(db: Session = Depends(get_db)):
    result = db.query(models.Customers, func.count(distinct(models.Sales.id)), func.coalesce(func.sum(models.SalesItems.quantity * models.SalesItems.price),0)).outerjoin(models.Sales, models.Sales.customers_id == models.Customers.id).outerjoin(models.SalesItems, models.SalesItems.sales_id == models.Sales.id).group_by(models.Customers.id).all()
    return [{
        'full_name': customer.full_name,
        'company_name': customer.company_name,
        'phone': customer.phone,
        'email': customer.email,
        'street_address': customer.street_address,
        'city': customer.city,
        'postal_code': customer.postal_code,
        'country': customer.country,
        'province': customer.province,
        'rbq': customer.rbq,
        'ccq':customer.ccq,
        'order_count': order_count,
        'total_spent': total_spent,
        'id': customer.id
    } for customer, order_count, total_spent in result]

@router.get("/customers/{customer_id}")
def get_customers(customer_id: int, db: Session = Depends(get_db)):
    existing_customer = db.query(models.Customers).filter(models.Customers.id == customer_id).first()
    return existing_customer

@router.post("/customers")
def create_customers(customer: CustomerCreate, db: Session = Depends(get_db)):
    new_customer = models.Customers(
        full_name = customer.full_name,
        phone = customer.phone,
        company_name = customer.company_name,
        street_address = customer.street_address,
        city = customer.city,
        postal_code = customer.postal_code,
        country = customer.country,
        province = customer.province,
        email = customer.email,
        rbq = customer.rbq,
        ccq = customer.ccq
    )
    
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer

@router.put("/customers/{customer_id}")
def update_customers(customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db)):
    existing_customer = db.query(models.Customers).filter(models.Customers.id == customer_id).first()
    existing_customer.full_name = customer.full_name or existing_customer.full_name
    existing_customer.phone = customer.phone or existing_customer.phone
    existing_customer.company_name = customer.company_name or existing_customer.company_name
    existing_customer.street_address = customer.street_address or existing_customer.street_address
    existing_customer.city = customer.city or existing_customer.city
    existing_customer.postal_code = customer.postal_code or existing_customer.postal_code
    existing_customer.country = customer.country or existing_customer.country
    existing_customer.province = customer.province or existing_customer.province
    existing_customer.email = customer.email or existing_customer.email
    existing_customer.rbq = customer.rbq or existing_customer.rbq
    existing_customer.ccq = customer.ccq or existing_customer.ccq

    db.commit()
    db.refresh(existing_customer)
    return existing_customer

@router.delete("/customers/{customer_id}")
def delete_customers(customer_id: int, db: Session = Depends(get_db)):
    existing_customer = db.query(models.Customers).filter(models.Customers.id == customer_id).first()
    db.delete(existing_customer)
    db.commit()
    return {"message": "Customer deleted successfully"}