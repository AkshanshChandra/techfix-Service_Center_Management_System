# TechFix — Service Center Management System

Full-stack application for running an electronics repair service center: customer records,
device intake, a kanban repair workflow, technician assignment, parts inventory and GST invoicing.

- **Frontend** — React 19, Vite, Tailwind CSS, Framer Motion, React Router
- **Backend** — FastAPI (Python), Motor async driver
- **Database** — MongoDB Atlas

## Running it

Two terminals. Backend first, since the frontend has no local data of its own.

**1. Backend** (see [backend/README.md](backend/README.md) for the Atlas connection string setup):

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # paste your Atlas connection string into this file
python -m app.seed          # load the sample dataset
uvicorn app.main:app --reload --port 8000
```

**2. Frontend:**

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. API docs are at <http://localhost:8000/docs>.

To point the frontend at a different API host, set `VITE_API_URL` in a `.env` file at the
project root. It defaults to `http://localhost:8000`.

## Layout

```
src/
  api/client.js      All HTTP calls to the backend
  hooks/useApi.js    Fetch + loading/error state for pages
  pages/             One page per route
  components/        Shared UI (modal, badges, stat cards, toasts)
  data/constants.js  UI-only constants (kanban columns, filter options)
backend/
  app/models/        Pydantic request and response schemas
  app/routers/       One router per resource, plus analytics
  app/database.py    Connection, indexes, id generation
  app/seed.py        Loads seed_data/*.json into MongoDB
  seed_data/         Sample dataset
```

## What the backend enforces

Business rules live on the server, not in the UI — the frontend sends intent and renders what
comes back. Creating a job updates the customer's repair count and pulls the technician's name
from their record; delivering one moves the job off that technician's active load; invoice totals
are computed with 18% GST server-side; and stock adjustments recompute availability and refuse to
oversell a part. Unique indexes cover customer email, device serial, technician email and part SKU.
