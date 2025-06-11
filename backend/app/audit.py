from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from . import auth
from .database import get_db
from .models import StockHistory, StockItem
from .schemas import StockHistoryResponse

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/logs", response_model=list[StockHistoryResponse])
def audit_logs(
    item_id: int | None = None,
    user_id: int | None = None,
    department_id: int | None = None,
    current_user=Depends(auth.require_role("admin")),
    db: Session = Depends(get_db),
):
    q = (
        db.query(StockHistory)
        .join(StockItem)
        .filter(StockHistory.company_id == current_user.company_id)
    )
    if item_id is not None:
        q = q.filter(StockHistory.stock_item_id == item_id)
    if user_id is not None:
        q = q.filter(StockHistory.user_id == user_id)
    if department_id is not None:
        q = q.filter(StockItem.department_id == department_id)
    return q.order_by(StockHistory.timestamp.desc()).all()
