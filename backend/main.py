from fastapi import APIRouter, FastAPI
from fastapi.staticfiles import StaticFiles

from backend import models
from backend.database import engine
from backend.routers import all_routers

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
api = APIRouter(prefix='/api')

# Api routes
for router in all_routers:
    api.include_router(router)
app.include_router(api)

# Static files
app.mount("/logo", StaticFiles(directory="frontend/public"), name="logo")
app.mount("/css", StaticFiles(directory="old files/css"), name="css")
app.mount("/js", StaticFiles(directory="old files/js"), name="js")
app.mount("/", StaticFiles(directory="old files/html", html=True), name="html")
