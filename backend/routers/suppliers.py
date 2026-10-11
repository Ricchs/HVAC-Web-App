from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend import models
from backend.database import get_db
from backend.schemas import *
from backend.utils import get_or_404

router = APIRouter()


@router.get("/suppliers")
def get_suppliers(search: str | None = None, db: Session = Depends(get_db)):
    suppliers = db.query(models.Suppliers)

    if search:
        similarity = func.greatest(
            func.similarity(search, models.Suppliers.company_name),
            func.similarity(search, models.Suppliers.contact_name),
            func.similarity(search, models.Suppliers.phone),
            func.similarity(search, models.Suppliers.email),
        )
        suppliers = suppliers.filter(similarity > 0.2).order_by(similarity.desc())

    suppliers = suppliers.all()

    return suppliers


@router.get("/suppliers/{supplier_id}")
def get_one_supplier(supplier_id: int, db: Session = Depends(get_db)):
    supplier = get_or_404(db, models.Suppliers, supplier_id, "Supplier")

    return supplier


@router.post("/suppliers")
def create_suppliers(supplier: SupplierCreate, db: Session = Depends(get_db)):
    new_supplier = models.Suppliers(
        company_name=supplier.company_name,
        contact_name=supplier.contact_name,
        phone=supplier.phone,
        email=supplier.email,
    )

    db.add(new_supplier)
    db.commit()
    db.refresh(new_supplier)
    return new_supplier


@router.put("/suppliers/{suppliers_id}")
def update_suppliers(
    suppliers_id: int, supplier: SupplierUpdate, db: Session = Depends(get_db)
):
    existing_supplier = get_or_404(db, models.Suppliers, suppliers_id, "Supplier")

    for field, value in supplier.model_dump(exclude_unset=True).items():
        setattr(existing_supplier, field, value)

    db.commit()
    db.refresh(existing_supplier)
    return existing_supplier


@router.delete("/suppliers/{supplier_id}")
def delete_suppliers(supplier_id: int, db: Session = Depends(get_db)):
    existing_supplier = get_or_404(db, models.Suppliers, supplier_id, "Supplier")

    items = (
        db.query(models.Inventory)
        .filter(models.Inventory.suppliers_id == supplier_id)
        .first()
    )
    company_name = existing_supplier.company_name
    if items:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete: '{company_name}' is still linked to other items.",
        )
    db.delete(existing_supplier)
    db.commit()
    return {
        "message": f"Supplier '{company_name}' deleted successfully",
        "company_name": company_name,
    }
