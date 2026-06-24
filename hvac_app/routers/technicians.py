from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *

router = APIRouter()

@router.get("/technicians")
def get_technicians(db: Session = Depends(get_db)):
    technicians = db.query(models.Technicians).all()
    return technicians

@router.post("/technicians")
def create_technicians(technician: TechnicianCreate, db: Session = Depends(get_db)):
    new_technician = models.Technicians(
        full_name = technician.full_name,
        phone = technician.phone,
        email = technician.email,
        hourly_rate = technician.hourly_rate
    )

    db.add(new_technician)
    db.commit()
    db.refresh(new_technician)
    return new_technician

@router.put("/technicians/{technicians_id}")
def update_technicians(technicians_id: int, technician: TechnicianUpdate, db: Session = Depends(get_db)):
    existing_technician = db.query(models.Technicians).filter(models.Technicians.id == technicians_id).first()
    existing_technician.full_name = technician.full_name or existing_technician.full_name
    existing_technician.phone = technician.phone or existing_technician.phone 
    existing_technician.email = technician.email or existing_technician.email
    existing_technician.hourly_rate = technician.hourly_rate or existing_technician.hourly_rate

    db.commit()
    db.refresh(existing_technician)
    return existing_technician

@router.delete("/technicians/{technicians_id}")
def delete_technicians(technicians_id: int, db: Session = Depends(get_db)):
    existing_technician = db.query(models.Technicians).filter(models.Technicians.id == technicians_id).first()

    db.delete(existing_technician)
    db.commit()
    return {"message": "Technician deleted successfully"}