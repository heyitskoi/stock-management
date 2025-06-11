from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from . import auth
from .database import Base, engine, get_db
from .models import Department, StockItem, StockHistory, Assignment, User
from .audit import router as audit_router
from .schemas import (
    StockAddRequest,
    StockAssignRequest,
    StockReturnRequest,
    StockFaultyRequest,
    StockTransferRequest,
    StockItemResponse,
    StockHistoryResponse,
)

app = FastAPI(title="Stock Management System")
app.include_router(audit_router)


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


@app.post("/stock/add", response_model=StockItemResponse)
def add_stock(
    payload: StockAddRequest,
    current_user=Depends(auth.require_role("warehouse")),
    db: Session = Depends(get_db),
):
    item = (
        db.query(StockItem)
        .filter(
            StockItem.company_id == current_user.company_id,
            StockItem.department_id == payload.department_id,
            StockItem.name == payload.name,
        )
        .first()
    )
    if item:
        item.quantity += payload.quantity
        if payload.par_level is not None:
            item.par_level = payload.par_level
        db.add(
            StockHistory(
                stock_item=item,
                user_id=current_user.id,
                company_id=current_user.company_id,
                action="add",
                reason=payload.reason,
            )
        )
    else:
        item = StockItem(
            name=payload.name,
            quantity=payload.quantity,
            department_id=payload.department_id,
            company_id=current_user.company_id,
            par_level=payload.par_level,
        )
        db.add(item)
        db.flush()
        db.add(
            StockHistory(
                stock_item=item,
                user_id=current_user.id,
                company_id=current_user.company_id,
                action="create",
                reason=payload.reason,
            )
        )
    db.commit()
    db.refresh(item)
    return item


@app.post("/stock/assign")
def assign_stock(
    payload: StockAssignRequest,
    current_user=Depends(auth.require_role("warehouse")),
    db: Session = Depends(get_db),
):
    item = (
        db.query(StockItem)
        .filter(
            StockItem.id == payload.stock_item_id,
            StockItem.company_id == current_user.company_id,
            StockItem.is_faulty == False,
            StockItem.is_deleted == False,
        )
        .first()
    )
    if not item or item.quantity <= 0:
        raise HTTPException(status_code=400, detail="Item not available")
    assignee = db.query(User).filter(User.id == payload.assignee_user_id).first()
    if not assignee:
        raise HTTPException(status_code=404, detail="User not found")
    if assignee.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Cross-company assignment")

    item.quantity -= 1
    assignment = Assignment(
        stock_item=item,
        assignee=assignee,
        assigned_by=current_user,
        company_id=current_user.company_id,
    )
    db.add(assignment)
    db.add(
        StockHistory(
            stock_item=item,
            user_id=current_user.id,
            company_id=current_user.company_id,
            action="assign",
            reason=payload.reason,
        )
    )
    db.commit()
    return {"detail": "assigned"}


@app.post("/stock/return")
def return_stock(
    payload: StockReturnRequest,
    current_user=Depends(auth.require_role("warehouse")),
    db: Session = Depends(get_db),
):
    assignment = (
        db.query(Assignment)
        .filter(
            Assignment.id == payload.assignment_id,
            Assignment.company_id == current_user.company_id,
            Assignment.returned_at.is_(None),
            Assignment.stock_item.has(is_deleted=False),
        )
        .first()
    )
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    assignment.returned_at = datetime.utcnow()
    assignment.stock_item.quantity += 1
    db.add(
        StockHistory(
            stock_item=assignment.stock_item,
            user_id=current_user.id,
            company_id=current_user.company_id,
            action="return",
            reason=payload.reason,
        )
    )
    db.commit()
    return {"detail": "returned"}


@app.post("/stock/faulty")
def mark_faulty(
    payload: StockFaultyRequest,
    current_user=Depends(auth.require_role("warehouse")),
    db: Session = Depends(get_db),
):
    item = (
        db.query(StockItem)
        .filter(
            StockItem.id == payload.stock_item_id,
            StockItem.company_id == current_user.company_id,
            StockItem.is_deleted == False,
        )
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.is_faulty = True
    db.add(
        StockHistory(
            stock_item=item,
            user_id=current_user.id,
            company_id=current_user.company_id,
            action="faulty",
            reason=payload.reason,
        )
    )
    db.commit()
    return {"detail": "marked faulty"}


@app.post("/stock/transfer")
def transfer_stock(
    payload: StockTransferRequest,
    current_user=Depends(auth.require_role("warehouse")),
    db: Session = Depends(get_db),
):
    item = (
        db.query(StockItem)
        .filter(
            StockItem.id == payload.stock_item_id,
            StockItem.company_id == current_user.company_id,
            StockItem.is_faulty == False,
            StockItem.is_deleted == False,
        )
        .first()
    )
    if not item or item.quantity < payload.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")
    dest_item = (
        db.query(StockItem)
        .filter(
            StockItem.name == item.name,
            StockItem.department_id == payload.to_department_id,
            StockItem.company_id == current_user.company_id,
            StockItem.is_deleted == False,
        )
        .first()
    )
    if dest_item:
        dest_item.quantity += payload.quantity
    else:
        dest_item = StockItem(
            name=item.name,
            quantity=payload.quantity,
            department_id=payload.to_department_id,
            company_id=current_user.company_id,
        )
        db.add(dest_item)

    item.quantity -= payload.quantity
    db.add(
        StockHistory(
            stock_item=item,
            user_id=current_user.id,
            company_id=current_user.company_id,
            action="transfer",
            reason=payload.reason,
        )
    )
    db.commit()
    return {"detail": "transferred"}


@app.post("/stock/delete/{item_id}")
def delete_stock(
    item_id: int,
    reason: str | None = None,
    current_user=Depends(auth.require_role("warehouse")),
    db: Session = Depends(get_db),
):
    item = (
        db.query(StockItem)
        .filter(
            StockItem.id == item_id,
            StockItem.company_id == current_user.company_id,
            StockItem.is_deleted == False,
        )
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.is_deleted = True
    db.add(
        StockHistory(
            stock_item=item,
            user_id=current_user.id,
            company_id=current_user.company_id,
            action="delete",
            reason=reason,
        )
    )
    db.commit()
    return {"detail": "deleted"}


@app.get("/stock", response_model=list[StockItemResponse])
def view_stock(
    department_id: int | None = None,
    user_id: int | None = None,
    below_par: bool | None = None,
    older_than_days: int | None = None,
    status: str | None = None,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    if user_id is not None:
        assign_q = (
            db.query(Assignment)
            .join(StockItem)
            .filter(
                Assignment.assignee_user_id == user_id,
                Assignment.returned_at.is_(None),
                Assignment.company_id == current_user.company_id,
                StockItem.is_deleted == False,
            )
        )
        if department_id is not None:
            assign_q = assign_q.filter(StockItem.department_id == department_id)
        assignments = assign_q.all()
        return [a.stock_item for a in assignments]
    q = db.query(StockItem).filter(
        StockItem.company_id == current_user.company_id,
        StockItem.is_deleted == False,
    )
    if department_id is not None:
        q = q.filter(StockItem.department_id == department_id)
    if below_par:
        q = q.filter(StockItem.par_level.isnot(None)).filter(StockItem.quantity < StockItem.par_level)
    if older_than_days is not None:
        cutoff = datetime.utcnow() - timedelta(days=older_than_days)
        q = q.filter(StockItem.created_at < cutoff)
    if status == "faulty":
        q = q.filter(StockItem.is_faulty == True)
    elif status == "ok":
        q = q.filter(StockItem.is_faulty == False)
    return q.all()


@app.get("/my-equipment", response_model=list[StockItemResponse])
def my_equipment(
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    assignments = (
        db.query(Assignment)
        .join(StockItem)
        .filter(
            Assignment.assignee_user_id == current_user.id,
            Assignment.returned_at.is_(None),
            Assignment.company_id == current_user.company_id,
            StockItem.is_deleted == False,
        )
        .all()
    )
    return [a.stock_item for a in assignments]


@app.get("/stock/history/{item_id}", response_model=list[StockHistoryResponse])
def stock_history(
    item_id: int,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    history = (
        db.query(StockHistory)
        .filter(
            StockHistory.stock_item_id == item_id,
            StockHistory.company_id == current_user.company_id,
        )
        .order_by(StockHistory.timestamp.desc())
        .all()
    )
    return history


