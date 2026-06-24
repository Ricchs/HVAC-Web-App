from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *

router = APIRouter()

@router.get("/sales")
def get_sales(db: Session = Depends(get_db)):
    sales = db.query(models.Sales).all()
    return sales

@router.post("/sales")
def create_sales(sale: SaleCreate, db: Session = Depends(get_db)):
    new_sale = models.Sales (
        customers_id = sale.customers_id,
        date = sale.date,
        payment_method = sale.payment_method,
        payment_status = sale.payment_status
    )

    db.add(new_sale)
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
    existing_sale = db.query(models.Sales).filter(models.Sales.id == sales_id).first()
    db.delete(existing_sale)
    db.commit()
    return {"message": "Sale deleted successfully"}