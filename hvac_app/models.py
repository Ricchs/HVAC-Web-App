from sqlalchemy import Column, Integer, Text, Numeric, Date, Time, ForeignKey
from hvac_app.database import Base

class Suppliers(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key = True)
    company_name = Column(Text)
    contact_name = Column(Text)
    phone = Column(Text)
    email = Column(Text)

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True)
    category = Column(Text)
    item = Column(Text)
    stock = Column(Integer)
    bought_price = Column(Numeric)
    sale_price = Column(Numeric)
    suppliers_id = Column(Integer, ForeignKey("suppliers.id"))

class Customers(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True)
    full_name = Column(Text)
    phone = Column(Text)
    company_name = Column(Text)
    street_address = Column(Text)
    city = Column(Text)
    postal_code = Column(Text)
    country = Column(Text)
    province = Column(Text)
    email = Column(Text)
    rbq = Column(Text)
    ccq = Column(Text)

class Sales(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True)
    customers_id = Column(Integer, ForeignKey("customers.id"))
    date = Column(Date)
    payment_method = Column(Text)
    payment_status = Column(Text)

class SalesItems(Base):
    __tablename__ = "sales_items"
    id = Column(Integer, primary_key=True)
    sales_id = Column(Integer, ForeignKey("sales.id"))
    items_id = Column(Integer, ForeignKey("inventory.id"))
    quantity = Column(Integer)
    price = Column(Numeric)

class Technicians(Base):
    __tablename__ = "technicians"
    id = Column(Integer, primary_key=True)
    full_name = Column(Text)
    phone = Column(Text)
    email = Column(Text)
    hourly_rate = Column(Numeric)

class Shifts(Base):
    __tablename__ = "shifts"
    id = Column(Integer, primary_key=True)
    technicians_id = Column(Integer, ForeignKey("technicians.id"))
    start_time = Column(Time)
    end_time = Column(Time)
    date = Column(Date)
    total_pay = Column(Numeric)

class Payroll(Base):
    __tablename__ = "payroll"
    id = Column(Integer, primary_key=True)
    technicians_id = Column(Integer, ForeignKey("technicians.id"))
    paid_status = Column(Text)
    last_paid_date = Column(Date)

class Jobs(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True)
    customers_id = Column(Integer, ForeignKey("customers.id"))
    job_type = Column(Text)
    technicians_id = Column(Integer, ForeignKey("technicians.id"))
    labour_cost = Column(Numeric)
    scheduled_date = Column(Date)
    completion_status = Column(Text)
    payment_method = Column(Text)
    payment_status = Column(Text)

class JobsItems(Base):
    __tablename__ = "jobs_items"
    id = Column(Integer, primary_key=True)
    jobs_id = Column(Integer, ForeignKey("jobs.id"))
    items_id = Column(Integer, ForeignKey("inventory.id"))
    quantity = Column(Integer)
    price = Column(Numeric)


