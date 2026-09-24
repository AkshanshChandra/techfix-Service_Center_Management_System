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

## Connect Cashfree (online invoice payments)

1. Create a [Cashfree](https://www.cashfree.com/) account and open **Developers → API Keys** in
   the dashboard. Use the **Test/Sandbox** App ID and Secret Key to start — switch to production
   keys only when you're ready to take real payments.
2. Add them to `backend/.env`:

```
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
CASHFREE_ENV=sandbox
FRONTEND_URL=http://localhost:5173
```

3. (Optional, for production) In the Cashfree dashboard, set a webhook URL under
   **Developers → Webhooks** pointing at `https://<your-public-domain>/api/webhooks/cashfree`.
   The app doesn't strictly need this to work: the frontend polls Cashfree directly every 12s
   for any invoice with an active payment link, so payments are reflected in the portal even
   without a public webhook endpoint (useful for pure `localhost` development). The webhook just
   makes that update near-instant once you have a real deployment.

Without these two variables set, "Send Payment Link" fails with a clear
`Cashfree credentials are not configured on the server` error instead of a silent failure.

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
| GET/PUT/DELETE | `/api/invoices/{id}` | Single invoice — `PUT status: "Paid"` is the cash-payment path |
| POST | `/api/invoices/{id}/payment-link` | Create (or reuse) a Cashfree link and email it to the customer |
| POST | `/api/invoices/{id}/payment-link/sync` | Re-check a link's status against Cashfree and apply it |
| POST | `/api/webhooks/cashfree` | Cashfree's payment-notification callback (signature-verified) |
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

## Online payments (Cashfree)

Each invoice can be paid two ways:

- **Cash** — `PUT /api/invoices/{id}` with `status: "Paid"`. If a Cashfree link was already sent
  for that invoice, it's cancelled automatically so the customer can't pay twice.
- **Online** — `POST /api/invoices/{id}/payment-link` creates a Cashfree Payment Link and has
  Cashfree email it to the customer directly (no SMTP setup needed on this side). The invoice
  stores `paymentLinkId`/`paymentLinkUrl`/`paymentLinkStatus` while it's outstanding.

Either the webhook or the frontend's polling can report a completed payment, but neither is
trusted at face value — both just trigger `_sync_invoice_payment`, which calls Cashfree's
"fetch payment link" API directly and applies whatever it reports. That keeps the app correct
even if a webhook payload's shape changes across Cashfree API versions, and means the webhook is
an optimization (faster updates), not a dependency (the app works without one being reachable).
