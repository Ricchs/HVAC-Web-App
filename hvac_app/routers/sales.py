from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *

router = APIRouter()

@router.get("/sales")
def get_sales(db: Session = Depends(get_db)):
    results = db.query(
        models.Sales, 
        models.Customers.full_name, 
        func.coalesce(func.sum(models.SalesItems.quantity), 0).label('items_amount'),
        func.coalesce(func.sum(models.SalesItems.quantity * models.SalesItems.price), 0).label('items_total'),
    ).join(models.Customers, models.Sales.customers_id == models.Customers.id).outerjoin(models.SalesItems, models.SalesItems.sales_id == models.Sales.id).group_by(models.Sales.id, models.Customers.full_name).all()
    
    return [
        {
            "id": sales.id,
            "customers_name": full_name,
            "date": sales.date,
            "items_amount": items_amount,
            "items_total": items_total,
            "payment_method": sales.payment_method,
            "payment_status": sales.payment_status
        }
        for sales, full_name, items_amount, items_total in results
    ]

@router.get("/sales/{sales_id}")
def get_sales(sales_id: int, db: Session = Depends(get_db)):
    existing_sale = db.query(models.Sales).filter(models.Sales.id == sales_id).first()
    return existing_sale

@router.get("/sales/{sales_id}/items")
def get_sales(sales_id: int, db: Session = Depends(get_db)):
    result = db.query(models.SalesItems, models.Inventory.item).join(models.Inventory, models.SalesItems.items_id == models.Inventory.id).filter(models.SalesItems.sales_id == sales_id).all()

    return [
        {"item": item_name, "quantity": sale.quantity, "price": sale.price, "subtotal": sale.quantity * sale.price}
        for sale, item_name in result
    ]

@router.post("/sales")
def create_sales(sale: SaleCreate, db: Session = Depends(get_db)):
    new_sale = models.Sales (
        customers_id = sale.customers_id,
        date = sale.date,
        payment_method = sale.payment_method,
        payment_status = sale.payment_status
    )

    db.add(new_sale)
    db.flush()

    for item in sale.items:
        db.add(models.SalesItems(
            sales_id = new_sale.id,
            items_id = item.items_id,
            quantity = item.quantity,
            price = item.price
        ))

    db.commit()
    db.refresh(new_sale)
    return new_sale

@router.put("/sales/{sales_id}")
def update_sales(sales_id: int, sale: SaleUpdate, db: Session = Depends(get_db)):
    existing_sale = db.query(models.Sales).filter(models.Sales.id == sales_id).first()
    existing_sale.customers_id = sale.customers_id or existing_sale.customers_id
    existing_sale.date = sale.date or existing_sale.date
    existing_sale.payment_method = sale.payment_method or existing_sale.payment_method
    existing_sale.payment_status = sale.payment_status or existing_sale.payment_status

    db.commit()
    db.refresh(existing_sale)
    return existing_sale

@router.delete("/sales/{sales_id}")
def delete_sales(sales_id: int, db: Session = Depends(get_db)):
    db.query(models.SalesItems).filter(models.SalesItems.sales_id == sales_id).delete()

    existing_sale = db.query(models.Sales).filter(models.Sales.id == sales_id).first()
    db.delete(existing_sale)
    
    db.commit()
    return {"message": "Sale deleted successfully"}