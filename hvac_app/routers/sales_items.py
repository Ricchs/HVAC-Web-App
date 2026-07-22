from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *

router = APIRouter()

@router.get("/sales_items")
def get_sales_items(db: Session = Depends(get_db)):
    sales_items = db.query(models.SalesItems).all()
    return sales_items

@router.get("/sales_items/{sales_items_id}")
def get_sales_items(sales_items_id: int, db: Session = Depends(get_db)):
    existing_sale_item = db.query(models.SalesItems).filter(models.SalesItems.id == sales_items_id).first()
    return existing_sale_item

@router.post("/sales_items")
def create_sales_items (sale_item: SaleItemCreate, db: Session = Depends(get_db)):
    new_sales_item = models.SalesItems(
        sales_id = sale_item.sales_id,
        items_id = sale_item.items_id,
        quantity = sale_item.quantity,
        price = sale_item.price
    )

    db.add(new_sales_item)
    db.commit()
    db.refresh(new_sales_item)
    return new_sales_item

@router.put("/sales_items/{sales_items_id}")
def update_sales_items(sales_items_id: int, sale_item: SaleItemUpdate, db: Session = Depends(get_db)):
    existing_sale_item = db.query(models.SalesItems).filter(models.SalesItems.id == sales_items_id).first()
    existing_sale_item.sales_id = sale_item.sales_id or existing_sale_item.sales_id
    existing_sale_item.items_id = sale_item.items_id or existing_sale_item.items_id
    existing_sale_item.quantity = sale_item.quantity or existing_sale_item.quantity
    existing_sale_item.price = sale_item.price or existing_sale_item.price

    db.commit()
    db.refresh(existing_sale_item)
    return existing_sale_item

@router.delete("/sales_items/{sales_items_id}")
def delete_sales_items(sales_items_id: int, db: Session = Depends(get_db)):
    
    existing_sale_item = db.query(models.SalesItems).filter(models.SalesItems.id == sales_items_id).first()

    db.delete(existing_sale_item)
    db.commit()
    return {"message": "Sales item deleted successfully"}