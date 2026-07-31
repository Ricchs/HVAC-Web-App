from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *
from datetime import datetime, date

router = APIRouter()

@router.get("/shifts")
def get_shifts(db: Session = Depends(get_db)):
    shifts = db.query(models.Shifts).all()
    return shifts


@router.get("/shifts/{shifts_id}")
def get_shifts(shifts_id: int, db: Session = Depends(get_db)):
    existing_shift = db.query(models.Shifts).filter(models.Shifts.id == shifts_id).first()
    return existing_shift

@router.post("/shifts")
def create_shifts(shift: ShiftCreate, db: Session = Depends(get_db)):
    technician = db.query(models.Technicians).filter(models.Technicians.id == shift.technicians_id).first()
    start = datetime.combine(date.today(), shift.start_time)
    end = datetime.combine(date.today(), shift.end_time)
    duration = end - start 
    hours = duration.total_seconds() / 3600

    new_shift = models.Shifts(
        technicians_id = shift.technicians_id,
        start_time = shift.start_time,
        end_time = shift.end_time,
        date = shift.date,
        total_pay = hours * float(technician.hourly_rate)
    )

    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    return new_shift

@router.put("/shifts/{shifts_id}")
def update_shifts(shifts_id: int, shift: ShiftUpdate, db: Session = Depends(get_db)):
    existing_shift = db.query(models.Shifts).filter(models.Shifts.id == shifts_id).first()
    existing_shift.technicians_id = shift.technicians_id or existing_shift.technicians_id
    existing_shift.start_time = shift.start_time or existing_shift.start_time
    existing_shift.end_time = shift.end_time or existing_shift.end_time
    existing_shift.date = shift.date or existing_shift.date
    existing_shift.total_pay = shift.total_pay or existing_shift.total_pay
    
    db.commit()
    db.refresh(existing_shift)
    return existing_shift

@router.delete("/shifts/{shifts_id}")
def delete_shifts(shifts_id: int, db: Session = Depends(get_db)):
    existing_shift = db.query(models.Shifts).filter(models.Shifts.id == shifts_id).first()
    
    db.delete(existing_shift)
    db.commit()
    return {"message": "Shift deleted successfully"}