from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *

router = APIRouter()

@router.get("/inventory")
def get_inventory(db: Session = Depends(get_db)):
    inventory = db.query(models.Inventory).all()
    return inventory

@router.get("/inventory/{items_id}")
def get_inventory(items_id: int, db: Session = Depends(get_db)):
    existing_inventory = db.query(models.Inventory).filter(models.Inventory.id == items_id).first()
    return existing_inventory
    

@router.post("/inventory")
def create_inventory(inventory: InventoryCreate, db: Session = Depends(get_db)):
    new_inventory = models.Inventory(
        category = inventory.category,
        item = inventory.item,
        stock = inventory.stock,
        bought_price = inventory.bought_price,
        sale_price = inventory.sale_price,
        suppliers_id = inventory.suppliers_id,
    )

    db.add(new_inventory)
    db.commit()
    db.refresh(new_inventory)
    return new_inventory


@router.put("/inventory/{items_id}")
def update_inventory (items_id: int, inventory: InventoryUpdate, db: Session = Depends(get_db)):
    existing_inventory = db.query(models.Inventory).filter(models.Inventory.id == items_id).first()
    existing_inventory.category = inventory.category or existing_inventory.category
    existing_inventory.item = inventory.item or existing_inventory.item
    existing_inventory.stock = inventory.stock or existing_inventory.stock
    existing_inventory.bought_price = inventory.bought_price or existing_inventory.bought_price
    existing_inventory.sale_price = inventory.sale_price or existing_inventory.sale_price
    existing_inventory.suppliers_id = inventory.suppliers_id or existing_inventory.suppliers_id

    db.commit()
    db.refresh(existing_inventory)
    return existing_inventory

@router.delete("/inventory/{items_id}")
def delete_inventory(items_id: int, db: Session = Depends(get_db)):
    existing_inventory = db.query(models.Inventory).filter(models.Inventory.id == items_id).first()
    db.delete(existing_inventory)
    db.commit()
    return {"message": "Item successfully deleted"}