# Stock Management System – Real-World Vision

## 🧭 Mission

This is not a typical SaaS app — it's a **real-world stock tracking system** built to solve the practical pains of managing stock across departments, users, and roles in a company.

The goal is to:
- Track all incoming, outgoing, faulty, and aging stock.
- Assign stock responsibility to departments or users.
- Allow department-based dashboards with scoped access and actions.
- Support role-based visibility and workflows tailored to **why** someone uses the system.

---

## 🧩 Key Concepts

### 🧑‍💼 Users
- Authenticated via JWT, scoped to their company.
- Have roles: `admin`, `warehouse`, `technical_support`, etc.
- Permissions determine what they can **see** and **do**.

### 🏢 Departments
- Stock is **owned by departments** (e.g., Warehouse, IT, Sales).
- Each department has its own dashboard and audit trail.

### 📦 Stock Items
- Can be restocked, transferred, assigned, returned, or marked faulty.
- Belong to a department.
- Can be issued to a staff member (with accountability).
- Can track lifecycle (aging equipment).

### 📝 History / Auditing
- Every action on a stock item is logged:
  - Who did it
  - When
  - Why (optional reason/comment)

---

## 🔐 Access Control Examples

| Role             | View              | Can Do                                                                 |
|------------------|-------------------|------------------------------------------------------------------------|
| `admin`          | Everything         | Manage stock, users, departments, audits                              |
| `warehouse`      | Warehouse dept     | Reassign stock, mark issues, restock                                  |
| `tech_support`   | Only own issued items | Return items, view equipment assigned                                |
| `sales`          | Possibly none      | Can request stock but not manage it directly                         |

---

## 🧠 Smart Behaviors

- When **stock runs low**, par levels trigger a restock warning.
- **Broken items** are marked and excluded from usable counts.
- **Aging assets** can be tracked by acquisition date.
- Staff can be assigned specific equipment (e.g., laptops, phones) with full responsibility trail.

---

## 💻 System Stack

- **Backend**: FastAPI + SQLAlchemy + Alembic
- **Frontend**: Next.js + React + shadcn/ui (via V0.dev)
- **Auth**: JWT + role-based access control
- **Database**: PostgreSQL (or SQLite for dev)
- **Dev Tools**: Codex, Cursor, GitHub

---

## 🧪 Examples of Good Codex Tasks

- ✅ "Generate a React dashboard for a warehouse user that lets them reassign stock between users in the same department."
- ✅ "Create a FastAPI endpoint to issue an item to a user and log the assignment with timestamp and issuer."
- ✅ "Add a QR code scanning input field to the restock form to auto-fill the item."

---

## ❌ Avoid

- ❌ Generic CRUD without context (e.g., “Create product” with no link to department)
- ❌ Single-tenant assumptions — this system must support multiple companies
- ❌ Unstructured UI suggestions — all flows should reflect real operational intent

---

## 🛠️ Setup

```bash
# Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
