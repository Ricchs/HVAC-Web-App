# HVAC Business Management Dashboard
A full-stack CRUD web app to help HVAC businesses manage customers, jobs, sales, inventory, suppliers, and technicians. This project aims to reduce repetitive administrative work while also surfacing key business metrics and insights.
## Getting Started
Want to improve the project? Here is how to get the project running locally for development.
### Prerequisites
- Python 3.12
- PostgreSQL
- pip
### Installing
To install Python and pip, use brew. **First check you have brew installed**.
```bash
brew --version
```
If not, install brew.
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
Install python using the following commands and make sure pip was also installed.
```bash
brew install python
python3 --version
pip3 --version
```
Install PostgreSQL and initiate.
```bash
brew install postgresql
brew services start postgresql
```
Clone the repo.
```bash
git clone https://github.com/Ricchs/HVAC-Web-App.git
```
Create and activate a virtual environment.
```bash
cd HVAC-Web-App
python3 -m venv .venv
source .venv/bin/activate
```
Install dependencies.
```bash
pip install -r requirements.txt
```
Create the database. *Note: Tables are created automatically the first time you run the app.*
```bash
createdb office_web_app
```
Create a .env file in root folder with connection string. Replace `YOUR_USERNAME` with your PostgreSQL/Laptop username.
```bash
DATABASE_URL=postgresql://YOUR_USERNAME@localhost/office_web_app
```
Finally, run the app
```bash
python -m uvicorn hvac_app.main:app --reload
```
## Features
- Full CRUD for customers, jobs, sales, inventory, suppliers, and technicians.
- Multi-step job creation wizard with per-step validation.
- Calendar scheduling view with day-level job details as well as interactive cells.
- Customer details page showing sales history, totals, and outstanding balance with editable customer notes.
- Printable invoices for jobs and sales.
- Automatic GST/QST tax calculation on quotes and invoices.
- Metrics widgets/dashboard for inventory, sales, and jobs (e.g. low-stock counts, revenue).
- Client-side pagination across all tables.
- Interactive rows across all tables to show quick summary.
- Toast notifications for create, update, and delete actions.
- Inventory/suppliers referential integrity safeguards to prevent orphaned records.
## Built With
- Python (backend logic)
- FastAPI (backend web framework and REST API)
- SQLAlchemy (ORM for database access)
- PostgreSQL (relational database)
- Pydantic (request/response validation)
- Vanilla JavaScript with ES modules (frontend logic)
- HTML, CSS (structure and styling)
## Road Map
- [ ] Payroll management
- [ ] Search and filtering across tables
- [ ] Home/dashboard landing page
- [ ] Analytics and reporting views once enough data accumulated
- [ ] Migrate to ReactJS
- [ ] Deployment to a live server
- [ ] Authentication and user accounts
## Authors
Richard Cao — [@Ricchs](https://github.com/Ricchs)
