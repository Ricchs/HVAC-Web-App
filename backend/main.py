from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from backend import models
from backend.database import engine
from backend.routers import (
    customers,
    inventory,
    jobs,
    jobs_items,
    payroll,
    sales,
    sales_items,
    shifts,
    suppliers,
    technicians,
)

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Api routes
app.include_router(customers.router)
app.include_router(suppliers.router)
app.include_router(inventory.router)
app.include_router(technicians.router)
app.include_router(sales.router)
app.include_router(sales_items.router)
app.include_router(shifts.router)
app.include_router(payroll.router)
app.include_router(jobs.router)
app.include_router(jobs_items.router)

# Static files
app.mount("/logo", StaticFiles(directory="logo"), name="logo")
app.mount("/css", StaticFiles(directory="css"), name="css")
app.mount("/js", StaticFiles(directory="js"), name="js")
app.mount("/", StaticFiles(directory="html", html=True), name="html")
