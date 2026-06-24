from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *

router = APIRouter()

@router.get("/payroll")
def get_payroll(db: Session = Depends(get_db)):
    payroll = db.query(models.Payroll).all()
    return payroll

@router.post("/payroll")
def create_payroll(payroll: PayrollCreate, db: Session = Depends(get_db)):
    new_payroll = models.Payroll(
        technicians_id = payroll.technicians_id,
        paid_status = payroll.paid_status,
        last_paid_date = payroll.last_paid_date
    )

    db.add(new_payroll)
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
    existing_payroll = db.query(models.Payroll).filter(models.Payroll.id == payroll_id).first()
    
    db.delete(existing_payroll)
    db.commit()
    return {"message": "Payroll deleted successfully"}