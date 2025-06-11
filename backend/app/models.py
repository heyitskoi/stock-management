from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)


class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)

    company = relationship("Company")


class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)

    company = relationship("Company")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role_id = Column(Integer, ForeignKey("roles.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)

    role = relationship("Role")
    department = relationship("Department")
    company = relationship("Company")


class StockItem(Base):
    __tablename__ = "stock_items"
    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    quantity = Column(Integer, default=0)
    department_id = Column(Integer, ForeignKey("departments.id"))
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    is_faulty = Column(Boolean, default=False)
    par_level = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    department = relationship("Department")
    company = relationship("Company")


class StockHistory(Base):
    __tablename__ = "stock_history"
    id = Column(Integer, primary_key=True)
    stock_item_id = Column(Integer, ForeignKey("stock_items.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    reason = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)

    stock_item = relationship("StockItem")
    user = relationship("User")
    company = relationship("Company")


class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True)
    stock_item_id = Column(Integer, ForeignKey("stock_items.id"))
    assignee_user_id = Column(Integer, ForeignKey("users.id"))
    assigned_by_id = Column(Integer, ForeignKey("users.id"))
    assigned_at = Column(DateTime, default=datetime.utcnow)
    returned_at = Column(DateTime, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)

    stock_item = relationship("StockItem")
    assignee = relationship("User", foreign_keys=[assignee_user_id])
    assigned_by = relationship("User", foreign_keys=[assigned_by_id])
    company = relationship("Company")
