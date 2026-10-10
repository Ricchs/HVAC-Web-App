from fastapi import APIRouter, Depends
from sqlalchemy import distinct, func
from sqlalchemy.orm import Session

from backend import models
from backend.database import get_db
from backend.schemas import *

router = APIRouter()


@router.get("/customers")
def get_customers(search: str | None = None, db: Session = Depends(get_db)):
    result = (
        db.query(
            models.Customers,
            func.count(distinct(models.Sales.id)),
            func.coalesce(
                func.sum(models.SalesItems.quantity * models.SalesItems.price), 0
            ),
        )
        .outerjoin(models.Sales, models.Sales.customers_id == models.Customers.id)
        .outerjoin(models.SalesItems, models.SalesItems.sales_id == models.Sales.id)
        .group_by(models.Customers.id)
    )

    if search:
        similarity = func.greatest(
            func.word_similarity(search, models.Customers.full_name),
            func.word_similarity(search, models.Customers.phone),
            func.word_similarity(search, func.coalesce(models.Customers.email, '')),
            func.word_similarity(search, func.coalesce(models.Customers.company_name, ''))
        )

        result = (
            result
            .filter(
                similarity > 0.2
            )
            .order_by(
                similarity.desc()
            )
            .all()
        )
    else:
        result = result.all()

    return [
        {
            "full_name": customer.full_name,
            "phone": customer.phone,
            "email": customer.email,
            "company_name": customer.company_name,
            "business_phone": customer.business_phone,
            "street_address": customer.street_address,
            "city": customer.city,
            "postal_code": customer.postal_code,
            "country": customer.country,
            "province": customer.province,
            "rbq": customer.rbq,
            "ccq": customer.ccq,
            "order_count": order_count,
            "total_spent": total_spent,
            "id": customer.id,
        }
        for customer, order_count, total_spent in result
    ]


@router.get("/customers/{customer_id}")
def get_one_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = (
        db.query(models.Customers).filter(models.Customers.id == customer_id).first()
    )

    sales = (
        db.query(
            models.Sales,
            func.coalesce(func.sum(models.SalesItems.quantity), 0).label(
                "items_amount"
            ),
            func.coalesce(
                func.sum(models.SalesItems.quantity * models.SalesItems.price), 0
            ).label("amount"),
        )
        .filter(models.Sales.customers_id == customer_id)
        .outerjoin(models.SalesItems, models.SalesItems.sales_id == models.Sales.id)
        .group_by(models.Sales.id)
        .all()
    )

    return {
        "full_name": customer.full_name,
        "phone": customer.phone,
        "email": customer.email,
        "company_name": customer.company_name,
        "business_phone": customer.business_phone,
        "street_address": customer.street_address,
        "city": customer.city,
        "postal_code": customer.postal_code,
        "country": customer.country,
        "province": customer.province,
        "rbq": customer.rbq,
        "ccq": customer.ccq,
        "notes": customer.notes,
        "total_sales": sum(amount for sale, items_amount, amount in sales),
        "total_orders": len(sales),
        "outstanding": sum(
            amount
            for sale, items_amount, amount in sales
            if sale.payment_status != "Paid"
        ),
        "first_order": min(
            (sale.date for sale, items_amount, amount in sales), default=None
        ),
        "last_order": max(
            (sale.date for sale, items_amount, amount in sales), default=None
        ),
        "sales": [
            {
                "id": sale.id,
                "date": sale.date,
                "items_amount": items_amount,
                "amount": amount,
                "status": sale.payment_status,
            }
            for sale, items_amount, amount in sales
        ],
    }


@router.post("/customers")
def create_customers(customer: CustomerCreate, db: Session = Depends(get_db)):
    new_customer = models.Customers(
        full_name=customer.full_name,
        phone=customer.phone,
        company_name=customer.company_name,
        business_phone=customer.business_phone,
        street_address=customer.street_address,
        city=customer.city,
        postal_code=customer.postal_code,
        country=customer.country,
        province=customer.province,
        email=customer.email,
        rbq=customer.rbq,
        ccq=customer.ccq,
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer


@router.put("/customers/{customer_id}")
def update_customers(
    customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db)
):
    existing_customer = (
        db.query(models.Customers).filter(models.Customers.id == customer_id).first()
    )

    for field, value in customer.model_dump(exclude_unset=True).items():
        setattr(existing_customer, field, value)

    db.commit()
    db.refresh(existing_customer)
    return existing_customer


@router.put("/customers/{customer_id}/notes")
def update_customer_notes(
    customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db)
):
    existing_customer = (
        db.query(models.Customers).filter(models.Customers.id == customer_id).first()
    )
    if customer.notes is not None:
        existing_customer.notes = customer.notes

    db.commit()
    db.refresh(existing_customer)
    return {"notes": existing_customer.notes}


@router.delete("/customers/{customer_id}")
def delete_customers(customer_id: int, db: Session = Depends(get_db)):
    existing_customer = (
        db.query(models.Customers).filter(models.Customers.id == customer_id).first()
    )
    db.delete(existing_customer)
    db.commit()
    return {"message": "Customer deleted successfully"}
