from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from hvac_app import models
from hvac_app.database import get_db
from hvac_app.schemas import *

BUSINESS_TZ = ZoneInfo("America/Toronto")

router = APIRouter()


@router.get("/shifts")
def get_shifts(db: Session = Depends(get_db)):
    unpaid_owed = (
        db.query(func.coalesce(func.sum(models.Shifts.total_pay), 0))
        .filter(models.Shifts.payroll_id == None)
        .scalar()
    )

    unpaid_count = (
        db.query(models.Shifts).filter(models.Shifts.payroll_id == None).count()
    )

    today = datetime.now(BUSINESS_TZ).date()
    monday = today - timedelta(days=today.weekday())
    next_monday = monday + timedelta(weeks=1)
    shifts_week = (
        db.query(models.Shifts)
        .filter(models.Shifts.date >= monday, models.Shifts.date < next_monday)
        .count()
    )

    metrics = {
        "unpaid_owed": unpaid_owed,
        "unpaid_count": unpaid_count,
        "shifts_week": shifts_week,
    }

    result = (
        db.query(models.Shifts, models.Technicians.full_name)
        .join(models.Technicians, models.Technicians.id == models.Shifts.technicians_id)
        .order_by(models.Shifts.date.desc())
        .all()
    )
    shifts = [
        {
            "id": shift.id,
            "technician": technician,
            "date": shift.date,
            "time": f"{shift.start_time.strftime('%H:%M')} - {shift.end_time.strftime('%H:%M')}",
            "total_pay": shift.total_pay,
            "payroll_id": shift.payroll_id,
        }
        for shift, technician in result
    ]

    return {"metrics": metrics, "shifts": shifts}


@router.get("/shifts/{shifts_id}")
def get_one_shift(shifts_id: int, db: Session = Depends(get_db)):
    existing_shift = (
        db.query(models.Shifts).filter(models.Shifts.id == shifts_id).first()
    )
    return existing_shift


@router.get("/shifts/technician/{technicians_id}")
def get_technician_shift(technicians_id: int, db: Session = Depends(get_db)):
    result = (
        db.query(models.Shifts)
        .filter(
            models.Shifts.technicians_id == technicians_id,
            models.Shifts.payroll_id == None,
        )
        .order_by(models.Shifts.date.desc())
        .all()
    )

    return [
        {
            "shift_id": shift.id,
            "date": shift.date,
            "start_time": shift.start_time,
            "end_time": shift.end_time,
            "total_pay": shift.total_pay,
        }
        for shift in result
    ]


@router.post("/shifts")
def create_shifts(shift: ShiftCreate, db: Session = Depends(get_db)):
    technician = (
        db.query(models.Technicians)
        .filter(models.Technicians.id == shift.technicians_id)
        .first()
    )
    start = datetime.combine(datetime.now(BUSINESS_TZ), shift.start_time)
    end = datetime.combine(datetime.now(BUSINESS_TZ), shift.end_time)
    duration = end - start
    hours = duration.total_seconds() / 3600
    if hours < 0:
        hours += 24

    new_shift = models.Shifts(
        technicians_id=shift.technicians_id,
        start_time=shift.start_time,
        end_time=shift.end_time,
        date=shift.date,
        total_pay=hours * float(technician.hourly_rate),
    )

    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    return {"message": f"Shift #{new_shift.id} has been created", "id": new_shift.id}


@router.put("/shifts/{shifts_id}")
def update_shifts(shifts_id: int, shift: ShiftUpdate, db: Session = Depends(get_db)):
    existing_shift = (
        db.query(models.Shifts).filter(models.Shifts.id == shifts_id).first()
    )
    if existing_shift.payroll_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot modify a shift that's already been paid. Remove it from the payment first.",
        )

    existing_shift.technicians_id = (
        shift.technicians_id or existing_shift.technicians_id
    )
    existing_shift.start_time = shift.start_time or existing_shift.start_time
    existing_shift.end_time = shift.end_time or existing_shift.end_time
    existing_shift.date = shift.date or existing_shift.date

    today = datetime.now(BUSINESS_TZ).date()
    start = datetime.combine(today, existing_shift.start_time)
    end = datetime.combine(today, existing_shift.end_time)
    hours = (end - start).total_seconds()/3600
    if hours < 0:
        hours += 24

    technician = db.query(models.Technicians).filter(models.Technicians.id == existing_shift.technicians_id).first()
    existing_shift.total_pay = float(technician.hourly_rate) * hours

    db.commit()
    db.refresh(existing_shift)
    return {"message": f"Shift #{existing_shift.id} has been updated."}


@router.delete("/shifts/{shifts_id}")
def delete_shifts(shifts_id: int, db: Session = Depends(get_db)):
    existing_shift = (
        db.query(models.Shifts).filter(models.Shifts.id == shifts_id).first()
    )

    if existing_shift.payroll_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete a shift that's already been paid. Remove it from the payment first.",
        )

    db.delete(existing_shift)
    db.commit()
    return {"message": f"Shift #{shifts_id} deleted successfully"}
