from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *

router = APIRouter()

@router.get("/suppliers")
def get_suppliers(db: Session = Depends(get_db)):
    suppliers = db.query(models.Suppliers).all()
    return suppliers

@router.get("/suppliers/{supplier_id}")
def get_suppliers(supplier_id: int, db: Session = Depends(get_db)):
    existing_supplier = db.query(models.Suppliers).filter(models.Suppliers.id == supplier_id).first()
    return existing_supplier

@router.post("/suppliers")
def create_suppliers(supplier: SupplierCreate, db: Session = Depends(get_db)):
    new_supplier = models.Suppliers(
        company_name = supplier.company_name,
        contact_name = supplier.contact_name,
        phone = supplier.phone,
        email = supplier.email,
    )
    
    db.add(new_supplier)
    db.commit()
    db.refresh(new_supplier)
    return new_supplier

@router.put("/suppliers/{suppliers_id}")
def update_suppliers(suppliers_id: int, supplier: SupplierUpdate, db: Session = Depends(get_db)):
    existing_supplier = db.query(models.Suppliers).filter(models.Suppliers.id == suppliers_id).first()
    existing_supplier.company_name = supplier.company_name or existing_supplier.company_name
    existing_supplier.contact_name = supplier.contact_name or existing_supplier.contact_name
    existing_supplier.phone = supplier.phone or existing_supplier.phone
    existing_supplier.email =supplier.email or existing_supplier.email

    db.commit()
    db.refresh(existing_supplier)
    return existing_supplier

@router.delete("/suppliers/{supplier_id}")
def delete_suppliers(supplier_id: int, db: Session = Depends(get_db)):
    existing_supplier = db.query(models.Suppliers).filter(models.Suppliers.id == supplier_id).first()
    items = db.query(models.Inventory).filter(models.Inventory.suppliers_id == supplier_id).first()
    company_name = existing_supplier.company_name
    if items:
        raise HTTPException(status_code=400, detail=f"Cannot delete: '{company_name}' is still linked to other items.")
    db.delete(existing_supplier)
    db.commit()
    return {"message": f"Supplier '{company_name}' deleted successfully", "company_name": company_name}