from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend import models
from backend.database import get_db
from backend.schemas import *

router = APIRouter()


@router.get("/inventory")
def get_inventory(search: str | None = None, db: Session = Depends(get_db)):
    inventory = (
        db.query(models.Inventory, models.Suppliers.company_name)
        .join(models.Suppliers, models.Inventory.suppliers_id == models.Suppliers.id)
    )

    if search:
        similarity = func.word_similarity(search, models.Inventory.item)

        inventory = (
            inventory
            .filter(similarity > 0.2)
            .order_by(similarity.desc())
            .all()
        )
    else:
        inventory = inventory.all()

    return [
        {
            "id": inv.id,
            "item": inv.item,
            "category": inv.category,
            "stock": inv.stock,
            "status_code": "out"
            if inv.stock == 0
            else ("low" if inv.stock <= 15 else "in"),
            "status": "No stock"
            if inv.stock == 0
            else ("Low stock" if inv.stock <= 15 else "In stock"),
            "bought_price": inv.bought_price,
            "sale_price": inv.sale_price,
            "supplier": company_name,
            "suppliers_id": inv.suppliers_id
        }
        for inv, company_name in inventory
    ]


@router.get("/inventory/{items_id}")
def get_one_item(items_id: int, db: Session = Depends(get_db)):
    existing_inventory = (
        db.query(models.Inventory, models.Suppliers)
        .join(models.Suppliers, models.Inventory.suppliers_id == models.Suppliers.id)
        .filter(models.Inventory.id == items_id)
        .first()
    )

    inv, supplier = existing_inventory

    return {
        "id": inv.id,
        "item": inv.item,
        "category": inv.category,
        "stock": inv.stock,
        "bought_price": inv.bought_price,
        "sale_price": inv.sale_price,
        "supplier": supplier.company_name,
        "suppliers_id": supplier.id
    }

@router.post("/inventory")
def create_inventory(inventory: InventoryCreate, db: Session = Depends(get_db)):
    new_inventory = models.Inventory(
        category=inventory.category,
        item=inventory.item,
        stock=inventory.stock,
        bought_price=inventory.bought_price,
        sale_price=inventory.sale_price,
        suppliers_id=inventory.suppliers_id,
    )

    db.add(new_inventory)
    db.commit()
    db.refresh(new_inventory)
    return new_inventory


@router.put("/inventory/{items_id}")
def update_inventory(
    items_id: int, inventory: InventoryUpdate, db: Session = Depends(get_db)
):
    existing_inventory = (
        db.query(models.Inventory).filter(models.Inventory.id == items_id).first()
    )

    for field, value in inventory.model_dump(exclude_unset=True).items():
        setattr(existing_inventory, field, value)

    db.commit()
    db.refresh(existing_inventory)
    return existing_inventory


@router.delete("/inventory/{items_id}")
def delete_inventory(items_id: int, db: Session = Depends(get_db)):
    existing_inventory = (
        db.query(models.Inventory).filter(models.Inventory.id == items_id).first()
    )
    name = existing_inventory.item
    try:
        db.delete(existing_inventory)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, detail="Can't delete — this item is used in existing jobs."
        )

    return {"message": "Item successfully deleted", "item": name}
