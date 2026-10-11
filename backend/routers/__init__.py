from . import (
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

all_routers = [
    customers.router,
    inventory.router,
    jobs.router,
    jobs_items.router,
    payroll.router,
    sales.router,
    sales_items.router,
    shifts.router,
    suppliers.router,
    technicians.router
]