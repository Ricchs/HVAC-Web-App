from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *

router = APIRouter()

@router.get("/technicians")
def get_technicians(db: Session = Depends(get_db)):
    result = db.query(models.Technicians, func.max(models.Payroll.pay_date), func.max(models.Shifts.date)\
            .label('last_shift'))\
            .outerjoin(models.Payroll, models.Payroll.technicians_id == models.Technicians.id)\
            .outerjoin(models.Shifts, models.Shifts.technicians_id == models.Technicians.id)\
            .group_by(models.Technicians.id)\
            .all()
    return [{
        'id': technician.id,
        'full_name': technician.full_name,
        'phone': technician.phone,
        'email': technician.email,
        'hourly_rate': technician.hourly_rate,
        'last_paid_date': last_paid_date if last_paid_date else None,
        'last_shift': last_shift if last_shift else None
    }for technician, last_paid_date, last_shift in result]

@router.get("/technicians/{technicians_id}")
def get_technicians(technicians_id: int, db: Session = Depends(get_db)):
    technician = db.query(models.Technicians)\
    .filter(models.Technicians.id == technicians_id).first()

    if not technician:
        raise HTTPException(status_code=404, detail="Technician not found")

    last_paid_date = db.query(func.max(models.Payroll.pay_date))\
    .filter(models.Payroll.technicians_id == technicians_id).scalar()

    shifts = db.query(models.Shifts)\
    .filter(models.Shifts.technicians_id == technicians_id).order_by(models.Shifts.date.desc()).all()

    shift_list = [{
        'id': shift.id,
        'date': shift.date,
        'start_time': shift.start_time,
        'end_time': shift.end_time,
        'total_pay': shift.total_pay,
        'payroll_id': shift.payroll_id,
    } for shift in shifts]

    last_shift = max((shift.date for shift in shifts), default=None)

    return {
        'id': technician.id,
        'full_name': technician.full_name,
        'phone': technician.phone,
        'email': technician.email,
        'hourly_rate': technician.hourly_rate,
        'last_paid_date': last_paid_date,
        'last_shift': last_shift if last_shift else None,
        'shifts': shift_list
    }

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