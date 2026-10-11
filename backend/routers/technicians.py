from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend import models
from backend.database import get_db
from backend.schemas import *
from backend.utils import get_or_404

router = APIRouter()


@router.get("/technicians")
def get_technicians(search: str | None = None, db: Session = Depends(get_db)):
    result = (
        db.query(
            models.Technicians,
            func.max(models.Payroll.pay_date),
            func.max(models.Shifts.date).label("last_shift"),
        )
        .outerjoin(
            models.Payroll, models.Payroll.technicians_id == models.Technicians.id
        )
        .outerjoin(models.Shifts, models.Shifts.technicians_id == models.Technicians.id)
        .group_by(models.Technicians.id)
    )

    if search:
        similarity = func.greatest(
            func.word_similarity(search, models.Technicians.full_name),
            func.word_similarity(search, func.coalesce(models.Technicians.phone, "")),
            func.word_similarity(search, func.coalesce(models.Technicians.email, "")),
        )

        result = result.filter(similarity > 0.2).order_by(similarity.desc()).all()
    else:
        result = result.all()

    return [
        {
            "id": technician.id,
            "full_name": technician.full_name,
            "phone": technician.phone,
            "email": technician.email,
            "hourly_rate": technician.hourly_rate,
            "last_paid_date": last_paid_date if last_paid_date else None,
            "last_shift": last_shift if last_shift else None,
        }
        for technician, last_paid_date, last_shift in result
    ]


@router.get("/technicians/{technicians_id}")
def get_one_technician(technicians_id: int, db: Session = Depends(get_db)):
    technician = get_or_404(db, models.Technicians, technicians_id, "Technician")

    last_paid_date = (
        db.query(func.max(models.Payroll.pay_date))
        .filter(models.Payroll.technicians_id == technicians_id)
        .scalar()
    )

    shifts = (
        db.query(models.Shifts)
        .filter(models.Shifts.technicians_id == technicians_id)
        .order_by(models.Shifts.date.desc())
        .all()
    )

    shift_list = [
        {
            "id": shift.id,
            "date": shift.date,
            "start_time": shift.start_time,
            "end_time": shift.end_time,
            "total_pay": shift.total_pay,
            "payroll_id": shift.payroll_id,
        }
        for shift in shifts
    ]

    last_shift = max((shift.date for shift in shifts), default=None)

    return {
        "id": technician.id,
        "full_name": technician.full_name,
        "phone": technician.phone,
        "email": technician.email,
        "hourly_rate": technician.hourly_rate,
        "last_paid_date": last_paid_date,
        "last_shift": last_shift if last_shift else None,
        "shifts": shift_list,
    }


@router.post("/technicians")
def create_technicians(technician: TechnicianCreate, db: Session = Depends(get_db)):
    new_technician = models.Technicians(
        full_name=technician.full_name,
        phone=technician.phone,
        email=technician.email,
        hourly_rate=technician.hourly_rate,
    )

    db.add(new_technician)
    db.commit()
    db.refresh(new_technician)
    return new_technician


@router.put("/technicians/{technicians_id}")
def update_technicians(
    technicians_id: int, technician: TechnicianUpdate, db: Session = Depends(get_db)
):
    existing_technician = get_or_404(
        db, models.Technicians, technicians_id, "Technician"
    )

    for field, value in technician.model_dump(exclude_unset=True).items():
        setattr(existing_technician, field, value)

    db.commit()
    db.refresh(existing_technician)
    return existing_technician


@router.delete("/technicians/{technicians_id}")
def delete_technicians(technicians_id: int, db: Session = Depends(get_db)):
    existing_technician = get_or_404(
        db, models.Technicians, technicians_id, "Technician"
    )

    name = existing_technician.full_name
    try:
        db.delete(existing_technician)
        db.commit()
    except IntegrityError:
        db.rollback()
        shifts_count = (
            db.query(func.count())
            .filter(models.Shifts.technicians_id == technicians_id)
            .scalar()
        )

        payroll_count = (
            db.query(func.count())
            .filter(models.Payroll.technicians_id == technicians_id)
            .scalar()
        )

        jobs_count = (
            db.query(func.count())
            .filter(models.Jobs.technicians_id == technicians_id)
            .scalar()
        )

        parts = []
        if shifts_count:
            parts.append(f"{shifts_count} shifts")
        if payroll_count:
            parts.append(f"{payroll_count} payments")
        if jobs_count:
            parts.append(f"{jobs_count} jobs")

        detail = (
            f"{name} has {', '.join(parts)}."
            if parts
            else f"{name} is still referenced by other records."
        )

        raise HTTPException(
            status_code=400,
            detail=detail,
        )
    return {"message": "Technician deleted successfully"}
