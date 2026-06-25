from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *

router = APIRouter()

@router.get("/jobs_items")
def get_jobs_items(db: Session = Depends(get_db)):
    jobs_items = db.query(models.JobsItems).all()
    return jobs_items

@router.get("/jobs_items/{jobs_items_id}")
def get_jobs_items(jobs_items_id: int, db: Session = Depends(get_db)):
    existing_job_item = db.query(models.JobsItems).filter(models.JobsItems.id == jobs_items_id).first()
    return existing_job_item

@router.post("/jobs_items")
def create_jobs_items (job_item: JobItemCreate, db: Session = Depends(get_db)):
    new_jobs_item = models.JobsItems(
        jobs_id = job_item.jobs_id,
        items_id = job_item.items_id,
        quantity = job_item.quantity,
        price = job_item.price
    )

    db.add(new_jobs_item)
    db.commit()
    db.refresh(new_jobs_item)
    return new_jobs_item

@router.put("/jobs_items/{jobs_items_id}")
def update_jobs_items(jobs_items_id: int, job_item: JobItemUpdate, db: Session = Depends(get_db)):
    existing_job_item = db.query(models.JobsItems).filter(models.JobsItems.id == jobs_items_id).first()
    existing_job_item.jobs_id = job_item.jobs_id or existing_job_item.jobs_id
    existing_job_item.items_id = job_item.items_id or existing_job_item.items_id
    existing_job_item.quantity = job_item.quantity or existing_job_item.quantity
    existing_job_item.price = job_item.price or existing_job_item.price

    db.commit()
    db.refresh(existing_job_item)
    return existing_job_item

@router.delete("/jobs_items/{jobs_items_id}")
def delete_jobs_items(jobs_items_id: int, db: Session = Depends(get_db)):
    existing_job_item = db.query(models.JobsItems).filter(models.JobsItems.id == jobs_items_id).first()

    db.delete(existing_job_item)
    db.commit()
    return {"message": "jobs item deleted successfully"}