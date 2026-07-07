from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *


router = APIRouter()

@router.get("/inventory")
def get_inventory(db: Session = Depends(get_db)):
    inventory = db.query(models.Inventory, models.Suppliers.company_name).join(models.Suppliers, models.Inventory.suppliers_id == models.Suppliers.id).all()
    return [
        {
            "id": inv.id,
            "item": inv.item,
            "category": inv.category,
            "stock": inv.stock,
            "status_code": "out" if inv.stock == 0 else ("low" if inv.stock <= 15 else "in"),
            "status": "No stock" if inv.stock == 0 else ("Low stock" if inv.stock <= 15 else "In stock"),
            "bought_price": inv.bought_price,
            "sale_price": inv.sale_price,
            "supplier": company_name,
        }
        for inv, company_name in inventory
    ]

@router.get("/inventory/{items_id}")
def get_inventory(items_id: int, db: Session = Depends(get_db)):
    existing_inventory = (
        db.query(models.Inventory, models.Suppliers.company_name)
        .join(models.Suppliers, models.Inventory.suppliers_id == models.Suppliers.id)
        .filter(models.Inventory.id == items_id).first()
    )

    inv, company_name = existing_inventory
    
    return {
        "id": inv.id,
        "item": inv.item,
        "category": inv.category,
        "stock": inv.stock,
        "bought_price": inv.bought_price,
        "sale_price": inv.sale_price,
        "supplier": company_name,
        }
    
def get_or_create_supplier(db, name):
    supplier = db.query(models.Suppliers).filter(models.Suppliers.company_name == name).first()
    if not supplier:
        supplier = models.Suppliers(
            company_name = name,
            contact_name = "None registered",
            phone = "None registered",
            email = "None registered",
        )
        db.add(supplier)
        db.commit()
        db.refresh(supplier)
    return supplier.id

@router.post("/inventory")
def create_inventory(inventory: InventoryCreate, db: Session = Depends(get_db)):
    suppliers_id = get_or_create_supplier(db, inventory.supplier)
    new_inventory = models.Inventory(
        category = inventory.category,
        item = inventory.item,
        stock = inventory.stock,
        bought_price = inventory.bought_price,
        sale_price = inventory.sale_price,
        suppliers_id = suppliers_id,
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
    try:
        db.delete(existing_inventory)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Can't delete — this item is used in existing jobs.")
    
    return {"message": "Item successfully deleted"}