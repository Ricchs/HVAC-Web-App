from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend import models
from backend.database import get_db
from backend.schemas import *
from backend.utils import get_or_404

router = APIRouter()


@router.get("/sales_items")
def get_sales_items(db: Session = Depends(get_db)):
    sales_items = db.query(models.SalesItems).all()
    return sales_items


@router.get("/sales_items/{sales_items_id}")
def get_one_sales_item(sales_items_id: int, db: Session = Depends(get_db)):
    existing_sale_item = get_or_404(db, models.SalesItems, sales_items_id, "Sale item")

    return existing_sale_item


@router.post("/sales_items")
def create_sales_items(sale_item: SaleItemCreate, db: Session = Depends(get_db)):
    new_sales_item = models.SalesItems(
        sales_id=sale_item.sales_id,
        items_id=sale_item.items_id,
        quantity=sale_item.quantity,
        price=sale_item.price,
    )

    db.add(new_sales_item)
    db.commit()
    db.refresh(new_sales_item)
    return new_sales_item


@router.put("/sales_items/{sales_items_id}")
def update_sales_items(
    sales_items_id: int, sale_item: SaleItemUpdate, db: Session = Depends(get_db)
):
    existing_sale_item = get_or_404(db, models.SalesItems, sales_items_id, "Sale item")

    for field, value in sale_item.model_dump(exclude_unset=True).items():
        setattr(existing_sale_item, field, value)

    db.commit()
    db.refresh(existing_sale_item)
    return existing_sale_item


@router.delete("/sales_items/{sales_id}")
def delete_sales_items(sales_id: int, db: Session = Depends(get_db)):
    db.query(models.SalesItems).filter(models.SalesItems.sales_id == sales_id).delete()

    db.commit()
    return {"message": "Sales item deleted successfully"}
