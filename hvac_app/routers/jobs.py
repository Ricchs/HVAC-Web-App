from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *

router = APIRouter()

@router.get("/jobs")
def get_jobs(db: Session = Depends(get_db)):
    jobs = db.query(models.Jobs).all()
    return jobs

@router.post("/jobs")
def create_jobs(job: JobCreate, db: Session = Depends(get_db)):
    new_job = models.Jobs(
        customers_id = job.customers_id,
        job_type = job.job_type,
        technicians_id = job.technicians_id,
        labour_cost = job.labour_cost,
        scheduled_date = job.scheduled_date,
        completion_status = job.completion_status,
        payment_method = job.payment_method,
        payment_status = job.payment_status
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.put("/jobs/{jobs_id}")
def update_jobs(jobs_id: int, job: JobUpdate, db: Session = Depends(get_db)):
    existing_job = db.query(models.Jobs).filter(models.Jobs.id == jobs_id).first()
    existing_job.customers_id = job.customers_id or existing_job.customers_id
    existing_job.job_type = job.job_type or existing_job.job_type
    existing_job.technicians_id = job.technicians_id or existing_job.technicians_id
    existing_job.labour_cost = job.labour_cost or existing_job.labour_cost
    existing_job.scheduled_date = job.scheduled_date or existing_job.scheduled_date
    existing_job.completion_status = job.completion_status or existing_job.completion_status
    existing_job.payment_method = job.payment_method or existing_job.payment_method
    existing_job.payment_status = job.payment_status or existing_job.payment_status

    db.commit()
    db.refresh(existing_job)
    return existing_job

@router.delete("/jobs/{jobs_id}")
def delete_jobs(jobs_id: int, db: Session = Depends(get_db)):
    existing_job = db.query(models.Jobs).filter(models.Jobs.id == jobs_id).first()

    db.delete(existing_job)
    db.commit()
    return {"message": "Job deleted successfully"}