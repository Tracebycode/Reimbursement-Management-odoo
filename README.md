# 💼 Reimbursement Management System

A backend system for managing employee expense reimbursements with **multi-level, sequential approval workflows**. Built for organizations that need structured expense approval with role-based access control.

---

## 📋 Problem Statement

Companies often struggle with **manual expense reimbursement processes** that are time-consuming, error-prone, and lack transparency. There is no simple way to:

- Define **approval flows** based on organizational hierarchy
- Manage **multi-level approvals** (Manager → Finance → Director)
- Support **flexible approval rules** per employee
- Track expense status across multiple approval stages

This system solves these problems by providing a clean API-driven backend for expense submission, workflow configuration, and sequential approval processing.

---

## 🏗️ System Architecture

```
src/
├── app.ts                          # Express app setup
├── server.ts                       # Server entry point
├── libs/
│   └── db.ts                       # PostgreSQL connection pool
├── middleware/
│   └── globalerrorhandler.ts       # Centralized error handling
├── utils/
│   └── Apperror.ts                 # Custom AppError class
└── modules/
    ├── users/                      # User management (Admin)
    │   ├── user.controller.ts
    │   ├── user.routes.ts
    │   └── users.repository.ts
    ├── employee/                   # Workflow management
    │   ├── employee.repository.ts
    │   ├── workflow.controller.ts
    │   └── workflow.routes.ts
    ├── expense/                    # Expense submission
    │   ├── expense.controller.ts
    │   ├── expense.repository.ts
    │   └── expense.routes.ts
    └── approval/                   # Approval processing
        ├── approval.controller.ts
        ├── approval.repository.ts
        └── approval.routes.ts
```

### Module Responsibilities

| Module | Owner | Purpose |
|--------|-------|---------|
| **users** | Admin | Create users, assign roles, set managers |
| **employee** | Admin | Define approval workflows per employee |
| **expense** | Employee | Submit expenses, view expense history |
| **approval** | Manager/Approver | View pending approvals, approve/reject |

---

## 🗄️ Database Design

```
┌──────────────────┐       ┌──────────────────────────┐
│  organizations   │       │         users             │
├──────────────────┤       ├──────────────────────────┤
│ id (PK)          │◄──┐   │ id (PK)                  │
│ name             │   │   │ org_id (FK) ─────────────┘
│ currency         │   │   │ name                     │
│ created_at       │   │   │ email (UNIQUE)           │
└──────────────────┘   │   │ role                     │
                       │   │ manager_id (FK → users)  │
                       │   │ created_at               │
                       │   └──────────┬───────────────┘
                       │              │
          ┌────────────┘              │
          │                           │
┌─────────┴────────────┐   ┌─────────┴────────────────┐
│ employee_workflow_    │   │       expenses            │
│ steps                 │   ├──────────────────────────┤
├──────────────────────┤   │ id (PK)                  │
│ id (PK)              │   │ org_id (FK)              │
│ employee_id (FK)     │   │ user_id (FK)             │
│ step_order           │   │ amount                   │
│ role                 │   │ description              │
└──────────────────────┘   │ status                   │
                           │ created_at               │
                           └──────────┬───────────────┘
                                      │
                           ┌──────────┴───────────────┐
                           │   expense_approvals       │
                           ├──────────────────────────┤
                           │ id (PK)                  │
                           │ expense_id (FK)          │
                           │ approver_id (FK)         │
                           │ step_order               │
                           │ status                   │
                           │ comment                  │
                           └──────────────────────────┘
```

### Key Relationships

- Each **user** belongs to one **organization**
- Each **employee** can have a **manager** (`manager_id → users`)
- Each **employee** has customizable **workflow steps** (approval chain)
- Each **expense** generates **approval rows** (copied from workflow at creation time)

---

## 📡 API Endpoints

### Users (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users` | Create a new user |
| `GET` | `/api/users?org_id=1` | List all users in an organization |
| `GET` | `/api/users/:id` | Get a single user by ID |

### Workflow (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/workflow` | Set approval workflow for an employee |
| `GET` | `/api/workflow/:employee_id` | Get workflow steps for an employee |
| `DELETE` | `/api/workflow/:employee_id` | Delete all workflow steps for an employee |

### Expenses (Employee)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/expense` | Submit a new expense |
| `GET` | `/api/expenses?user_id=1` | Get all expenses for a user |

### Approvals (Manager/Approver)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/approve` | Approve or reject an expense step |
| `GET` | `/api/pending-approvals?approver_id=5` | Get pending approvals for an approver |

---

## 🔄 How the Approval Workflow Works

### 1. Admin Configures Workflow

The admin defines the approval chain **per employee**:

```json
POST /api/workflow
{
  "employee_id": 3,
  "steps": [
    { "step_order": 1, "role": "manager" },
    { "step_order": 2, "role": "finance" },
    { "step_order": 3, "role": "director" }
  ]
}
```

### 2. Employee Submits Expense

```json
POST /api/expense
{
  "user_id": 3,
  "amount": 1500,
  "description": "Client dinner"
}
```

**What happens internally:**

1. Expense is inserted with `status = 'pending'`
2. System fetches the employee's workflow steps
3. For each step:
   - **If role = `manager`** → Uses `manager_id` from the users table
   - **Otherwise** → Finds a user with that role in the same org
4. Approval rows are inserted into `expense_approvals`

### 3. Sequential Approval Flow

```
Step 1: Manager (pending) ← ACTIVE
Step 2: Finance (pending)
Step 3: Director (pending)

        │
   Manager approves
        │
        ▼

Step 1: Manager (approved) ✅
Step 2: Finance (pending) ← ACTIVE
Step 3: Director (pending)

        │
   Finance approves
        │
        ▼

Step 1: Manager (approved) ✅
Step 2: Finance (approved) ✅
Step 3: Director (pending) ← ACTIVE

        │
   Director approves
        │
        ▼

Step 1: Manager (approved) ✅
Step 2: Finance (approved) ✅
Step 3: Director (approved) ✅
→ Expense status = 'approved' ✅
```

### Key Rules

| Rule | Description |
|------|-------------|
| **Sequential only** | Only one step is active at a time (lowest pending `step_order`) |
| **No skipping** | Each step must be approved before the next activates |
| **Reject = Stop** | If any step rejects → entire expense is rejected immediately |
| **Active-step enforcement** | Only the assigned approver of the active step can act |
| **Manager-first logic** | If workflow includes `manager` role, the employee's direct manager is used |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime |
| **TypeScript** | Type-safe development |
| **Express 5** | HTTP framework |
| **PostgreSQL** | Database (hosted on Supabase) |
| **pg** | PostgreSQL client (no ORM) |

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18+)
- PostgreSQL database (or Supabase account)

### 1. Clone the repository

```bash
git clone <repo-url>
cd Reimbursement-Management-App/Backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the `Backend/` directory:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>
PORT=3000
```

### 4. Run database migrations

Execute the SQL files in order on your PostgreSQL database:

```bash
# Run in order
psql $DATABASE_URL -f Infra/db/001_org.sql
psql $DATABASE_URL -f Infra/db/002_users.sql
psql $DATABASE_URL -f Infra/db/003_employee_workflow_steps.sql
psql $DATABASE_URL -f Infra/db/004_expenses.sql
psql $DATABASE_URL -f Infra/db/005_expenses_approval.sql
```

Or run them manually through the Supabase SQL editor.

### 5. Start the server

```bash
npm run dev
```

Server will start at `http://localhost:3000`.

---

## 📝 Example API Usage

### Step 1: Create an organization (via Supabase SQL)

```sql
INSERT INTO organizations (name, currency) VALUES ('Acme Corp', 'USD');
```

### Step 2: Create users

```bash
# Admin
POST /api/users
{ "org_id": 1, "name": "Alice", "email": "alice@acme.com", "role": "admin" }

# Manager
POST /api/users
{ "org_id": 1, "name": "Bob", "email": "bob@acme.com", "role": "manager" }

# Finance
POST /api/users
{ "org_id": 1, "name": "Carol", "email": "carol@acme.com", "role": "finance" }

# Employee (manager_id = Bob's ID)
POST /api/users
{ "org_id": 1, "name": "Dave", "email": "dave@acme.com", "role": "employee", "manager_id": 2 }
```

### Step 3: Configure Dave's workflow

```bash
POST /api/workflow
{
  "employee_id": 4,
  "steps": [
    { "step_order": 1, "role": "manager" },
    { "step_order": 2, "role": "finance" }
  ]
}
```

### Step 4: Dave submits an expense

```bash
POST /api/expense
{ "user_id": 4, "amount": 250, "description": "Office supplies" }
```

### Step 5: Bob (manager) checks pending approvals

```bash
GET /api/pending-approvals?approver_id=2
```

### Step 6: Bob approves

```bash
POST /api/approve
{ "expense_id": 1, "approver_id": 2, "action": "approved", "comment": "Looks good" }
```

### Step 7: Carol (finance) is now the active approver

```bash
GET /api/pending-approvals?approver_id=3
# → shows Dave's expense

POST /api/approve
{ "expense_id": 1, "approver_id": 3, "action": "approved" }
# → Expense is now fully approved ✅
```

---

## 📁 Project Structure

```
Reimbursement-Management-App/
├── Backend/
│   ├── Infra/db/              # SQL schema files
│   ├── src/
│   │   ├── app.ts             # Express configuration
│   │   ├── server.ts          # Entry point
│   │   ├── libs/              # Database connection
│   │   ├── middleware/        # Error handling
│   │   ├── utils/             # AppError class
│   │   └── modules/           # Feature modules
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── tsconfig.json
└── frontend/                  # (Coming soon)
```

---

## 📜 License

ISC