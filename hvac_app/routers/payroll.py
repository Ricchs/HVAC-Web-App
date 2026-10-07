from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from hvac_app import models
from hvac_app.database import get_db
from hvac_app.schemas import *

router = APIRouter()


@router.get("/payroll")
def get_payroll(search: str | None = None, db: Session = Depends(get_db)):
    result = (
        db.query(models.Payroll, models.Technicians)
        .join(
            models.Technicians, models.Payroll.technicians_id == models.Technicians.id
        )
        .order_by(models.Payroll.pay_date.desc())
    )

    if search:
        similarity = func.word_similarity(
            search,
            models.Technicians.full_name
        )
        result = (
            result
            .filter(similarity > 0.2)
            .all()
        )
    else:
        result = result.all()

    return [
        {
            "id": payroll.id,
            "technicians_id": technician.id,
            "technicians_name": technician.full_name,
            "pay_date": payroll.pay_date,
            "amount": payroll.amount,
        }
        for payroll, technician in result
    ]


@router.get("/payroll/{payroll_id}")
def get_one_payroll(payroll_id: int, db: Session = Depends(get_db)):
    existing_payroll = (
        db.query(models.Payroll).filter(models.Payroll.id == payroll_id).first()
    )
    if existing_payroll is None:
        raise HTTPException(404, "Payroll not found")

    all_shifts = (
        db.query(models.Shifts)
        .filter(
            models.Shifts.technicians_id == existing_payroll.technicians_id,
            or_(
                models.Shifts.payroll_id == None, models.Shifts.payroll_id == payroll_id
            ),
        )
        .order_by(models.Shifts.date.desc())
        .all()
    )

    return {
        "id": existing_payroll.id,
        "technicians_id": existing_payroll.technicians_id,
        "amount": existing_payroll.amount,
        "pay_date": existing_payroll.pay_date,
        "shifts": [
            {
                "id": shift.id,
                "date": shift.date,
                "start_time": shift.start_time,
                "end_time": shift.end_time,
                "total_pay": shift.total_pay,
                "payroll_id": shift.payroll_id,
            }
            for shift in all_shifts
        ],
    }


@router.post("/payroll")
def create_payroll(payroll: PayrollCreate, db: Session = Depends(get_db)):
    if not payroll.shifts:
        raise HTTPException(status_code=400, detail="No shifts selected")
    new_payroll = models.Payroll(
        technicians_id=payroll.technicians_id,
        pay_date=payroll.pay_date,
        amount=payroll.amount,
    )
    db.add(new_payroll)
    db.flush()

    db.query(models.Shifts).filter(models.Shifts.id.in_(payroll.shifts)).update(
        {models.Shifts.payroll_id: new_payroll.id}, synchronize_session=False
    )

    db.commit()
    db.refresh(new_payroll)
    return {"message": f"Payment #{new_payroll.id} was recorded", "id": new_payroll.id}


@router.put("/payroll/{payroll_id}")
def update_payroll(
    payroll_id: int, payroll: PayrollUpdate, db: Session = Depends(get_db)
):
    existing_payroll = (
        db.query(models.Payroll).filter(models.Payroll.id == payroll_id).first()
    )
    existing_payroll.amount = (
        payroll.amount if payroll.amount is not None else existing_payroll.amount
    )
    existing_payroll.pay_date = payroll.pay_date or existing_payroll.pay_date

    existing_shifts = (
        db.query(models.Shifts)
        .filter(models.Shifts.payroll_id == existing_payroll.id)
        .all()
    )
    A = {shift.id for shift in existing_shifts}
    B = set(payroll.shifts)

    # B \ A -> attach shifts newly selected (not currently on this payroll)
    db.query(models.Shifts).filter(models.Shifts.id.in_(list(B - A))).update(
        {models.Shifts.payroll_id: payroll_id}, synchronize_session=False
    )

    # A \ B -> detach shifts that were unchecked shifts (no longer in the selection)
    db.query(models.Shifts).filter(models.Shifts.id.in_(list(A - B))).update(
        {models.Shifts.payroll_id: None}, synchronize_session=False
    )

    db.commit()
    db.refresh(existing_payroll)
    return {
        "message": f"Payment #{existing_payroll.id} updated.",
        "id": existing_payroll.id,
    }


@router.delete("/payroll/{payroll_id}")
def delete_payroll(payroll_id: int, db: Session = Depends(get_db)):
    existing_payroll = (
        db.query(models.Payroll).filter(models.Payroll.id == payroll_id).first()
    )

    db.query(models.Shifts).filter(models.Shifts.payroll_id == payroll_id).update(
        {models.Shifts.payroll_id: None}
    )

    db.delete(existing_payroll)
    db.commit()
    return {"message": f"Payment #{payroll_id} was deleted."}
