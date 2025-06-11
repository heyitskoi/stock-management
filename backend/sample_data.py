from app.database import Base, engine, SessionLocal
from app.models import Company, Department, Role, User, StockItem
from app.auth import get_password_hash


def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Create a sample company
    company = Company(name="ExampleCorp")
    db.add(company)
    db.flush()

    # Create sample departments
    warehouse = Department(name="Warehouse", company_id=company.id)
    it = Department(name="IT", company_id=company.id)
    db.add_all([warehouse, it])

    # Create sample roles
    admin_role = Role(name="admin", company_id=company.id)
    warehouse_role = Role(name="warehouse", company_id=company.id)
    tech_support_role = Role(name="technical_support", company_id=company.id)
    db.add_all([admin_role, warehouse_role, tech_support_role])

    # Sample users with hashed passwords
    admin = User(
        username="admin",
        hashed_password=get_password_hash("admin"),
        role=admin_role,
        department=it,
        company_id=company.id,
    )
    worker = User(
        username="worker",
        hashed_password=get_password_hash("worker"),
        role=warehouse_role,
        department=warehouse,
        company_id=company.id,
    )
    tech = User(
        username="tech",
        hashed_password=get_password_hash("tech"),
        role=tech_support_role,
        department=it,
        company_id=company.id,
    )
    db.add_all([admin, worker, tech])

    # Create sample stock items
    laptop = StockItem(
        name="Laptop",
        quantity=5,
        department_id=warehouse.id,
        company_id=company.id,
        par_level=2,
    )
    phone = StockItem(
        name="Phone",
        quantity=3,
        department_id=it.id,
        company_id=company.id,
        par_level=2,
    )
    db.add_all([laptop, phone])

    db.commit()
    db.close()


if __name__ == "__main__":
    init_db()
