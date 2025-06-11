from app.database import Base, engine, SessionLocal
from app.models import Department, Role, User


def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Create sample departments
    warehouse = Department(name="Warehouse")
    it = Department(name="IT")
    db.add_all([warehouse, it])

    # Create sample roles
    admin_role = Role(name="admin")
    warehouse_role = Role(name="warehouse")
    tech_support_role = Role(name="technical_support")
    db.add_all([admin_role, warehouse_role, tech_support_role])

    # Sample users
    admin = User(username="admin", role=admin_role, department=it)
    worker = User(username="worker", role=warehouse_role, department=warehouse)
    tech = User(username="tech", role=tech_support_role, department=it)
    db.add_all([admin, worker, tech])

    db.commit()
    db.close()


if __name__ == "__main__":
    init_db()
