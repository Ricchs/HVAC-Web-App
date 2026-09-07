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
        'phone': customer.phone,
        'email': customer.email,
        'company_name': customer.company_name,
        'business_phone': customer.business_phone,
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
    customer = db.query(models.Customers)\
                .filter(models.Customers.id == customer_id)\
                .first()

    sales = db.query(models.Sales, 
                    func.coalesce(func.sum(models.SalesItems.quantity), 0).label('items_amount'),
                    func.coalesce(func.sum(models.SalesItems.quantity * models.SalesItems.price), 0).label('amount'))\
        .filter(models.Sales.customers_id == customer_id)\
        .outerjoin(models.SalesItems, models.SalesItems.sales_id == models.Sales.id)\
        .group_by(models.Sales.id)\
        .all()

    return {
        'full_name': customer.full_name,
        'phone': customer.phone,
        'email': customer.email,
        'company_name': customer.company_name,
        'business_phone': customer.business_phone,
        'street_address': customer.street_address,
        'city': customer.city,
        'postal_code': customer.postal_code,
        'country': customer.country,
        'province': customer.province,
        'rbq': customer.rbq,
        'ccq':customer.ccq,
        'notes': customer.notes,
        'total_sales': sum(amount for sale, items_amount, amount in sales),
        'total_orders': len(sales),
        'outstanding': sum(amount for sale, items_amount, amount in sales if sale.payment_status != 'Paid'),
        'first_order': min((sale.date for sale, items_amount, amount in sales), default=None),
        'last_order': max((sale.date for sale, items_amount, amount in sales), default=None),
        'sales': [{
            'id': sale.id,
            'date': sale.date,
            'items_amount': items_amount,
            'amount': amount,
            'status': sale.payment_status,
        } for sale, items_amount, amount in sales]
    }

@router.post("/customers")
def create_customers(customer: CustomerCreate, db: Session = Depends(get_db)):
    new_customer = models.Customers(
        full_name = customer.full_name,
        phone = customer.phone,
        company_name = customer.company_name,
        business_phone = customer.business_phone,
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
    existing_customer.business_phone = customer.business_phone or existing_customer.business_phone
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

@router.put("/customers/{customer_id}/notes")
def update_customers(customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db)):
    existing_customer = db.query(models.Customers).filter(models.Customers.id == customer_id).first()
    if customer.notes is not None:
        existing_customer.notes = customer.notes

    db.commit()
    db.refresh(existing_customer)
    return {"notes": existing_customer.notes}

@router.delete("/customers/{customer_id}")
def delete_customers(customer_id: int, db: Session = Depends(get_db)):
    existing_customer = db.query(models.Customers).filter(models.Customers.id == customer_id).first()
    db.delete(existing_customer)
    db.commit()
    return {"message": "Customer deleted successfully"}