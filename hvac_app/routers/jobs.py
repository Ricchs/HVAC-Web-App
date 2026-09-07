from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from hvac_app.database import get_db
from hvac_app import models
from hvac_app.schemas import *

router = APIRouter()

@router.get("/jobs")
def get_jobs( db: Session = Depends(get_db)):
    result = db.query(models.Jobs, models.Customers.full_name, models.Technicians.full_name, func.coalesce(func.sum(models.JobsItems.quantity * models.JobsItems.price), 0))\
        .join(models.Customers, models.Customers.id == models.Jobs.customers_id)\
        .outerjoin(models.Technicians, models.Technicians.id == models.Jobs.technicians_id)\
        .outerjoin(models.JobsItems, models.JobsItems.jobs_id == models.Jobs.id)\
        .group_by(models.Jobs.id, models.Customers.full_name, models.Technicians.full_name)\
        .all()

    return [{
        'id': job.id,
        'type': job.job_type,
        'customer': customer,
        'technician': technician,
        'scheduled_date': job.scheduled_date,
        'job_status': job.completion_status,
        'payment_method': job.payment_method,
        'payment_status': job.payment_status,
        'price': job.labour_cost,
        'total': float(job.labour_cost) + float(items_total),
    } for job, customer, technician, items_total in result]
    

@router.get("/jobs/{jobs_id}")
def get_jobs(jobs_id: int, db: Session = Depends(get_db)):
    result = db.query(models.Jobs, models.Customers.full_name, models.Technicians.full_name)\
        .filter(models.Jobs.id == jobs_id)\
        .join(models.Customers, models.Customers.id == models.Jobs.customers_id)\
        .outerjoin(models.Technicians, models.Technicians.id == models.Jobs.technicians_id)\
        .first()

    job, customer, technician = result

    items = db.query(models.JobsItems, models.Inventory.item)\
            .join(models.Inventory, models.JobsItems.items_id == models.Inventory.id)\
            .filter(models.JobsItems.jobs_id == jobs_id).all()

    return {
        'id': jobs_id,
        'type': job.job_type,
        'customer': customer,
        'technician': technician,
        'scheduled_date': job.scheduled_date,
        'job_status': job.completion_status,
        'payment_method': job.payment_method,
        'payment_status': job.payment_status,
        'price': job.labour_cost,
        'items': [{
            'item': name,
            'quantity': job_item.quantity,
            'price': job_item.price,
            'subtotal': job_item.quantity * job_item.price
        } for job_item, name in items]
    }

@router.get("/jobs/{jobs_id}/invoice")
def get_jobs(jobs_id: int, db: Session = Depends(get_db)):
    result = db.query(models.Jobs, models.Customers, models.Technicians.full_name)\
        .filter(models.Jobs.id == jobs_id)\
        .join(models.Customers, models.Customers.id == models.Jobs.customers_id)\
        .outerjoin(models.Technicians, models.Technicians.id == models.Jobs.technicians_id)\
        .first()

    job, customer, technician = result

    items = db.query(models.JobsItems, models.Inventory.item)\
            .join(models.Inventory, models.JobsItems.items_id == models.Inventory.id)\
            .filter(models.JobsItems.jobs_id == jobs_id).all()

    return {
        'id': jobs_id,
        'type': job.job_type,
        'customer': {
            'full_name': customer.full_name,
            'company_name': customer.company_name,
            'street_address': customer.street_address,
            'city': customer.city,
            'province': customer.province,
            'postal_code': customer.postal_code,
            'country': customer.country,
            'phone': customer.phone,
            'email': customer.email,
            'rbq': customer.rbq,
            'ccq': customer.ccq,
        },
        'technician': technician,
        'scheduled_date': job.scheduled_date,
        'invoice_date': job.created_at,
        'job_status': job.completion_status,
        'payment_method': job.payment_method,
        'payment_status': job.payment_status,
        'price': job.labour_cost,
        'items': [{
            'item': name,
            'quantity': job_item.quantity,
            'price': job_item.price,
            'subtotal': job_item.quantity * job_item.price
        } for job_item, name in items]
    }


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
    db.query(models.JobsItems).filter(models.JobsItems.jobs_id == jobs_id).delete()
    db.query(models.Jobs).filter(models.Jobs.id == jobs_id).delete()

    db.commit()
    return {"message": "Job deleted successfully"}