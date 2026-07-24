from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *

router = APIRouter()

@router.get("/technicians")
def get_technicians(db: Session = Depends(get_db)):
    result = db.query(models.Technicians,models.Payroll.paid_status, models.Payroll.last_paid_date, func.max(models.Shifts.date).label('last_shift')).outerjoin(models.Payroll, models.Payroll.technicians_id == models.Technicians.id).outerjoin(models.Shifts, models.Shifts.technicians_id == models.Technicians.id).group_by(models.Technicians.id, models.Payroll.paid_status, models.Payroll.last_paid_date).all()
    return [{
        'id': technician.id,
        'full_name': technician.full_name,
        'phone': technician.phone,
        'email': technician.email,
        'hourly_rate': technician.hourly_rate,
        'paid_status': paid_status if paid_status else None,
        'last_paid_date': last_paid_date if last_paid_date else None,
        'last_shift': last_shift if last_shift else None
    }for technician, paid_status, last_paid_date, last_shift in result]

@router.get("/technicians/{technicians_id}")
def get_technicians(technicians_id: int, db: Session = Depends(get_db)):
    existing_technician = db.query(models.Technicians).filter(models.Technicians.id == technicians_id).first()
    return existing_technician

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