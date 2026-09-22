# TechFix Backend

FastAPI + MongoDB Atlas backend for the TechFix service center management system.

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Connect MongoDB Atlas

1. In Atlas: **Database → Connect → Drivers → Python** and copy the connection string.
2. Under **Network Access**, add your current IP address (or `0.0.0.0/0` while developing).
3. Create `backend/.env` from the template and paste the string in, replacing `<password>`:

```bash
cp .env.example .env
```

```
MONGODB_URL=mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=techfix
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

A local `mongodb://localhost:27017` works too if you'd rather develop offline.

## Load the sample data

Replaces every collection with the dataset in `seed_data/`:

```bash
python -m app.seed
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: <http://localhost:8000/docs>

Then start the frontend in a second terminal (`npm run dev` from the project root). It reads
`VITE_API_URL` and defaults to `http://localhost:8000`.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service and database check |
| GET/POST | `/api/customers` | List (filters: `search`, `status`) / create |
| GET/PUT/DELETE | `/api/customers/{id}` | Single customer |
| GET/POST | `/api/devices` | List (`search`, `category`, `brand`, `status`, `customerId`) / create |
| GET/PUT/DELETE | `/api/devices/{id}` | Single device |
| GET/POST | `/api/repair-jobs` | List (`search`, `status`, `priority`, `customerId`, `technicianId`) / create |
| GET/PUT/DELETE | `/api/repair-jobs/{id}` | Single job |
| PATCH | `/api/repair-jobs/{id}/status` | Move a job between kanban columns |
| GET/POST | `/api/technicians` | List (`search`, `availability`) / create |
| GET/PUT/DELETE | `/api/technicians/{id}` | Single technician |
| GET/POST | `/api/inventory` | List (`search`, `category`, `status`) / create |
| GET | `/api/inventory/low-stock` | Parts at or below their minimum |
| PATCH | `/api/inventory/{id}/stock` | Consume or restock (`{"delta": -2}`) |
| GET/POST | `/api/invoices` | List (`search`, `status`, `customerId`) / create |
| GET/PUT/DELETE | `/api/invoices/{id}` | Single invoice |
| GET | `/api/dashboard/stats` | Dashboard counters, breakdowns, alerts |
| GET | `/api/reports/summary` | Monthly revenue and technician performance |

## Data model

Six collections: `customers`, `devices`, `repair_jobs`, `technicians`, `inventory`, `invoices`.

Documents keep the human-readable identifiers the system already used (`C001`, `D001`, `J2415`,
`T001`, `P001`, `INV-2415`) as their `_id`, and the API exposes that field as `id`. New ids
continue the sequence; an invoice takes its number from the job it bills (`J2416` → `INV-2416`).

Some writes span collections:

- Creating a job increments the customer's `totalRepairs` and fills in the customer and
  technician names from their records.
- Moving a job to **Delivered** decrements the technician's `currentJobs` and increments
  `completedJobs`.
- Changing an invoice's status updates the copy embedded in the customer document.
- Stock adjustments recompute `Available` / `Low Stock` / `Out of Stock` and refuse to oversell.

GST is fixed at 18% and calculated server-side, so invoice totals can't drift from the frontend.
