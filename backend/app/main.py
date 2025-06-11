from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from . import auth
from .database import Base, engine, get_db
from .models import Department, StockItem

app = FastAPI(title="Stock Management System")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/")
def read_root():
    return {"message": "Stock Management API"}


@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = auth.create_access_token({"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/departments")
def list_departments(current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    departments = (
        db.query(Department)
        .filter(Department.company_id == current_user.company_id)
        .all()
    )
    return departments


@app.get("/stock-items")
def list_stock_items(
    current_user=Depends(auth.require_role("warehouse")),
    db: Session = Depends(get_db),
):
    items = (
        db.query(StockItem)
        .filter(StockItem.company_id == current_user.company_id)
        .all()
    )
    return items
