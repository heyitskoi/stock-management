from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class StockAddRequest(BaseModel):
    name: str
    quantity: int
    department_id: int

class StockAssignRequest(BaseModel):
    stock_item_id: int
    assignee_user_id: int

class StockReturnRequest(BaseModel):
    assignment_id: int

class StockFaultyRequest(BaseModel):
    stock_item_id: int

class StockTransferRequest(BaseModel):
    stock_item_id: int
    to_department_id: int
    quantity: int

class StockItemResponse(BaseModel):
    id: int
    name: str
    quantity: int
    department_id: int
    is_faulty: bool

    class Config:
        orm_mode = True

class StockHistoryResponse(BaseModel):
    id: int
    stock_item_id: int
    user_id: Optional[int]
    action: str
    timestamp: datetime

    class Config:
        orm_mode = True
