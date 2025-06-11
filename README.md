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
- Admins can query audit logs by item, user, or department.

---

## 🔐 Access Control Examples

| Role           | View                  | Can Do                                             |
|----------------|-----------------------|----------------------------------------------------|
| `admin`        | Everything            | Manage stock, users, departments, audits           |
| `warehouse`    | Warehouse department  | Reassign stock, mark issues, restock               |
| `tech_support` | Only own issued items | Return items, view equipment assigned              |
| `sales`        | Possibly none         | Can request stock but not manage it directly       |

---

## 🧠 Smart Behaviors
- When **stock runs low**, par levels trigger a restock warning.
- Use the `/stock/warnings` endpoint to list items below their par levels.
- Par levels can be updated via `PATCH /stock/par-level/{item_id}`.
- **Broken items** are marked and excluded from usable counts.
- **Aging assets** can be tracked by acquisition date.
- Staff can be assigned specific equipment (e.g., laptops, phones) with full responsibility trail.
- Reports can be filtered by par levels, age, and faulty status.
- Users can see their currently issued equipment via `/my-equipment`.
- The stock listing API also allows filtering results by department or by the user an item is assigned to.


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

## 🛠️ Local Setup

1. **Clone and create a virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r backend/requirements.txt
   ```
2. **Environment variables**
   - Copy `.env.example` to `.env` and adjust values if needed.
   - `DATABASE_URL` defaults to SQLite (`sqlite:///./local.db`). Use a PostgreSQL URL for production.
3. **Initialize the database with sample data**
   ```bash
   python backend/sample_data.py
   ```
4. **Run the backend**
   ```bash
   uvicorn app.main:app --reload --app-dir backend
   ```
5. **Run the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The frontend expects the following environment variables (see `.env.example`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_NAME=Stock Management System
NEXT_PUBLIC_VERSION=1.0.0
```

This project uses SQLite for convenience during development but is designed to work with PostgreSQL in production.
