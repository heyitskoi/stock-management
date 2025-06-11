from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class StockAddRequest(BaseModel):
    name: str
    quantity: int
    department_id: int
    par_level: Optional[int] = None
    reason: Optional[str] = None

class StockAssignRequest(BaseModel):
    stock_item_id: int
    assignee_user_id: int
    reason: Optional[str] = None

class StockReturnRequest(BaseModel):
    assignment_id: int
    reason: Optional[str] = None

class StockFaultyRequest(BaseModel):
    stock_item_id: int
    reason: Optional[str] = None

class StockTransferRequest(BaseModel):
    stock_item_id: int
    to_department_id: int
    quantity: int
    reason: Optional[str] = None

class ParLevelUpdateRequest(BaseModel):
    par_level: Optional[int]

class StockItemResponse(BaseModel):
    id: int
    name: str
    quantity: int
    department_id: int
    is_faulty: bool
    par_level: Optional[int] = None
    acquired_at: datetime
    age_in_days: int
    created_at: datetime
    below_par: bool

    class Config:
        orm_mode = True

class StockHistoryResponse(BaseModel):
    id: int
    stock_item_id: int
    user_id: Optional[int]
    action: str
    reason: Optional[str] = None
    timestamp: datetime

    class Config:
        orm_mode = True
