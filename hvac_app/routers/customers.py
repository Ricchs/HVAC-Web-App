from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *

router = APIRouter()

@router.get("/customers")
def get_customers(db: Session = Depends(get_db)):
    customers = db.query(models.Customers).all()
    return customers

@router.post("/customers")
def create_customers(customer: CustomerCreate, db: Session = Depends(get_db)):
    new_customer = models.Customers(
        full_name = customer.full_name,
        phone = customer.phone,
        company_name = customer.company_name,
        address = customer.address,
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
    existing_customer.address = customer.address or existing_customer.address
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