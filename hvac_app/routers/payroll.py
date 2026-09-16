from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *

router = APIRouter()

@router.get("/payroll")
def get_payroll(db: Session = Depends(get_db)):
    result = db.query(models.Payroll, models.Technicians)\
                .join(models.Technicians, models.Payroll.technicians_id == models.Technicians.id)\
                .order_by(models.Payroll.pay_date.desc())\
                .all()

    return [{
        "id": payroll.id,
        "technicians_id": technician.id,
        "technicians_name": technician.full_name,
        "pay_date": payroll.pay_date,
        "amount": payroll.amount
    } for payroll, technician in result]

@router.get("/payroll/{payroll_id}")
def get_payroll(payroll_id: int, db: Session = Depends(get_db)):
    existing_payroll = db.query(models.Payroll).filter(models.Payroll.id == payroll_id).first()
    return existing_payroll


@router.post("/payroll")
def create_payroll(payroll: PayrollCreate, db: Session = Depends(get_db)):
    shifts = db.query(models.Shifts).filter(models.Shifts.technicians_id == payroll.technicians_id, models.Shifts.payroll_id.is_(None)).all()
    total = sum(shift.total_pay for shift in shifts)

    new_payroll = models.Payroll(
        technicians_id = payroll.technicians_id,
        pay_date = payroll.pay_date,
        amount = total
    )

    db.add(new_payroll)
    db.flush()
    db.query(models.Shifts)\
        .filter(models.Shifts.technicians_id == payroll.technicians_id, models.Shifts.payroll_id.is_(None))\
        .update({models.Shifts.payroll_id: new_payroll.id}, synchronize_session=False)
    db.commit()
    db.refresh(new_payroll)
    return new_payroll

@router.put("/payroll/{payroll_id}")
def update_payroll(payroll_id: int, payroll: PayrollUpdate, db: Session = Depends(get_db)):
    existing_payroll = db.query(models.Payroll).filter(models.Payroll.id == payroll_id).first()
    existing_payroll.technicians_id = payroll.technicians_id or existing_payroll.technicians_id
    existing_payroll.paid_status = payroll.paid_status or existing_payroll.paid_status
    existing_payroll.last_paid_date = payroll.last_paid_date or existing_payroll.last_paid_date

    db.commit()
    db.refresh(existing_payroll)
    return existing_payroll

@router.delete("/payroll/{payroll_id}")
def delete_payroll(payroll_id: int, db: Session = Depends(get_db)):
    existing_payroll = db.query(models.Payroll)\
        .filter(models.Payroll.id == payroll_id)\
        .first()
    
    db.query(models.Shifts)\
        .filter(models.Shifts.payroll_id == payroll_id)\
        .update({models.Shifts.payroll_id: None})
    
    db.delete(existing_payroll)
    db.commit()
    return {"message": f"Payment #{payroll_id} was deleted."}