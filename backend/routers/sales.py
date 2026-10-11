from fastapi import APIRouter, Depends
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from backend import models
from backend.database import get_db
from backend.schemas import *
from backend.utils import get_or_404

router = APIRouter()


@router.get("/sales")
def get_sales(search: str | None = None, db: Session = Depends(get_db)):
    results = (
        db.query(
            models.Sales,
            models.Customers.full_name,
            func.coalesce(func.sum(models.SalesItems.quantity), 0).label(
                "items_amount"
            ),
            func.coalesce(
                func.sum(models.SalesItems.quantity * models.SalesItems.price), 0
            ).label("items_total"),
        )
        .join(models.Customers, models.Sales.customers_id == models.Customers.id)
        .outerjoin(models.SalesItems, models.SalesItems.sales_id == models.Sales.id)
        .group_by(models.Sales.id, models.Customers.full_name)
        .order_by(models.Sales.date.desc())
    )

    if search:
        customer_similarity = func.word_similarity(search, models.Customers.full_name)

        item_match = (
            db.query(models.SalesItems.id)
            .join(models.Inventory, models.Inventory.id == models.SalesItems.items_id)
            .filter(
                models.SalesItems.sales_id == models.Sales.id,
                func.word_similarity(search, models.Inventory.item) > 0.2,
            )
            .exists()
        )

        results = results.filter(or_(customer_similarity > 0.2, item_match)).all()
    else:
        results = results.all()

    return [
        {
            "id": sales.id,
            "customers_name": full_name,
            "date": sales.date,
            "items_amount": items_amount,
            "items_total": items_total,
            "payment_method": sales.payment_method,
            "payment_status": sales.payment_status,
        }
        for sales, full_name, items_amount, items_total in results
    ]


@router.get("/sales/{sales_id}")
def get_one_sale(sales_id: int, db: Session = Depends(get_db)):
    sales_info = get_or_404(db, models.Sales, sales_id, "Sale")

    sale_items = (
        db.query(models.SalesItems).filter(models.SalesItems.sales_id == sales_id).all()
    )

    customer = get_or_404(db, models.Customers, sales_info.customers_id, "Customer")

    return {
        "id": sales_info.id,
        "customer": {"full_name": customer.full_name, "phone": customer.phone},
        "date": sales_info.date,
        "payment_method": sales_info.payment_method,
        "payment_status": sales_info.payment_status,
        "items": [
            {"items_id": i.items_id, "quantity": i.quantity, "price": i.price}
            for i in sale_items
        ],
    }


@router.get("/sales/{sales_id}/items")
def get_sale_invoice(sales_id: int, db: Session = Depends(get_db)):
    sales_info = get_or_404(db, models.Sales, sales_id, "Sale")

    customer = get_or_404(db, models.Customers, sales_info.customers_id, "Customer")

    items_info = (
        db.query(models.SalesItems, models.Inventory.item)
        .join(models.Inventory, models.SalesItems.items_id == models.Inventory.id)
        .filter(models.SalesItems.sales_id == sales_id)
        .all()
    )

    items_info = [
        {
            "item": item_name,
            "quantity": sale.quantity,
            "price": sale.price,
            "subtotal": sale.quantity * sale.price,
        }
        for sale, item_name in items_info
    ]

    return {
        "id": sales_info.id,
        "customer": customer.full_name,
        "customer_phone": customer.phone,
        "customer_company": customer.company_name,
        "customer_rbq": customer.rbq,
        "customer_ccq": customer.ccq,
        "date": sales_info.date,
        "payment_method": sales_info.payment_method,
        "payment_status": sales_info.payment_status,
        "items_info": items_info,
    }


@router.post("/sales")
def create_sales(sale: SaleCreate, db: Session = Depends(get_db)):
    new_sale = models.Sales(
        customers_id=sale.customers_id,
        date=sale.date,
        payment_method=sale.payment_method,
        payment_status=sale.payment_status,
    )

    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)
    return new_sale


@router.put("/sales/{sales_id}")
def update_sales(sales_id: int, sale: SaleUpdate, db: Session = Depends(get_db)):
    existing_sale = get_or_404(db, models.Sales, sales_id, "Sale")

    for field, value in sale.model_dump(exclude_unset=True).items():
        setattr(existing_sale, field, value)

    db.commit()
    db.refresh(existing_sale)
    return existing_sale


@router.delete("/sales/{sales_id}")
def delete_sales(sales_id: int, db: Session = Depends(get_db)):
    db.query(models.SalesItems).filter(models.SalesItems.sales_id == sales_id).delete()

    existing_sale = get_or_404(db, models.Sales, sales_id, "Sale")

    db.delete(existing_sale)

    db.commit()
    return {"message": "Sale deleted successfully"}
