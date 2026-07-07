from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from hvac_app.database import engine
from hvac_app import models
from hvac_app.routers import customers, suppliers, inventory, technicians, sales, sales_items, shifts, payroll, jobs, jobs_items

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

#Api routes
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

#Static files
app.mount("/css", StaticFiles(directory="hvac_app/css"), name="css")
app.mount("/js", StaticFiles(directory="hvac_app/js"), name="js")
app.mount("/", StaticFiles(directory="hvac_app/html", html=True), name="html")