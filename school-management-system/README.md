# School Management System

Production-oriented school group platform for **8 branches**, with a separate Spring Boot API and a React workspace. The frontend never talks to PostgreSQL.

```
Frontend (React + TypeScript + Vite)
        ↓ REST / JWT
Spring Boot modular monolith
        ↓ JDBC
PostgreSQL (Flyway migrations)
```

## Requirements

- Java 17 LTS (or newer)
- Maven 3.9+
- Node.js 20+
- PostgreSQL 16/17
- npm

## Project structure

```
school-management-system/
├── backend/          Spring Boot API
├── frontend/         React + Vite UI
├── scripts/          Local database bootstrap
├── .env.example
├── .gitignore
└── README.md
```

## Environment variables

Copy `.env.example`. Do not commit real secrets.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | JDBC URL |
| `DATABASE_USERNAME` | DB user |
| `DATABASE_PASSWORD` | DB password |
| `JWT_SECRET` | HMAC secret, 32+ bytes |
| `PAYMENT_SECRET` | HMAC secret for payment webhooks |
| `CORS_ORIGINS` | Comma-separated frontend origins |
| `FILE_STORAGE_DIR` | Local upload directory |
| `SPRING_PROFILES_ACTIVE` | `dev` or `prod` |
| `VITE_API_BASE` | Optional. Leave empty if using the Vite proxy |

Production profile **requires** `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET`, and `CORS_ORIGINS`. There are no production defaults for passwords or JWT secrets.

## Database setup

PostgreSQL 17 is expected on `127.0.0.1:5432`.

```sql
CREATE ROLE sms_app LOGIN PASSWORD 'sms_dev_local_only';
CREATE DATABASE school_management OWNER sms_app;
GRANT ALL PRIVILEGES ON DATABASE school_management TO sms_app;
```

Then connect to `school_management` and run:

```sql
GRANT ALL ON SCHEMA public TO sms_app;
ALTER SCHEMA public OWNER TO sms_app;
```

Flyway runs automatically on backend startup and applies `backend/src/main/resources/db/migration/V1__init_schema.sql`. Migrations are additive. Historical academic rows are never deleted when a new year starts.

## Backend

```bash
cd backend
set SPRING_PROFILES_ACTIVE=dev
set DATABASE_URL=jdbc:postgresql://127.0.0.1:5432/school_management
set DATABASE_USERNAME=sms_app
set DATABASE_PASSWORD=sms_dev_local_only
mvn spring-boot:run
```

API base: `http://localhost:8080/api`

### Tests and build

```bash
cd backend
mvn test
mvn -DskipTests package
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: `http://localhost:5173`  
Vite proxies `/api` to `http://localhost:8080`.

```bash
npm test
npm run build
```

## Development accounts

**DEVELOPMENT DATA ONLY.** Seeded when `app.seed.enabled=true` (dev profile). Password for every seeded user:

`Dev@School123!`

| Role | Email |
| --- | --- |
| SUPER_ADMIN | super.admin@sms.local |
| BRANCH_ADMIN | branch.admin@sms.local |
| PRINCIPAL | principal@sms.local |
| TEACHER | teacher@sms.local |
| ACCOUNTANT | accountant@sms.local |
| PARENT | parent@sms.local |
| STUDENT | student@sms.local |

Eight campuses are seeded (`NTH`, `STH`, `EST`, `WST`, `CTR`, `LKV`, `HLS`, `RVR`) plus academic years `2025-26`, `2026-27`, `2027-28`.

## Authentication and authorization

- BCrypt passwords
- JWT access tokens + hashed refresh tokens
- Role checks on the API, not only in the UI
- Branch checks use the authenticated user's branch, never a client-supplied `branchId` as the source of truth
- Parents can only read linked children
- Teachers can mark attendance only for assigned sections
- Login rate limiting on `/api/auth/login`

## Payments

There is no live card gateway in this repository and **no card data is stored**.

Flow:

1. Frontend asks the API to create a payment order
2. Backend calculates the payable amount from the invoice
3. Gateway (or the mock HMAC provider) sends a webhook
4. Backend verifies `X-Payment-Signature`
5. Only then is the invoice marked paid and a receipt generated

A frontend “success” flag is never trusted. Set `PAYMENT_SECRET` in the environment. Offline cash confirmation is an accountant-only API.

## API surface (selected)

- `POST /api/auth/login|refresh|forgot-password|reset-password`
- `GET /api/auth/me`
- `GET/POST /api/branches`, `/api/academic-years`, `/api/classes`, `/api/subjects`
- `GET/POST/PUT /api/students`
- `POST /api/attendance`, `GET /api/attendance/summary`
- `GET/POST /api/timetable`, `/api/homework`, `/api/exams`, `/api/marks`
- `GET/POST /api/fee-structures`, `/api/invoices`, `/api/payments/orders`
- `POST /api/payments/webhook`
- `GET /api/notifications`, notices, complaints, leave, library, transport, reports, audit logs

## Production deployment overview

See **[PILOT-RUNBOOK.md](./PILOT-RUNBOOK.md)** for the controlled real-school pilot checklist.

1. Provision PostgreSQL and a dedicated app role
2. Set production secrets in the runtime environment, not in git (`JWT_SECRET`, `PAYMENT_SECRET`, DB credentials, `CORS_ORIGINS`)
3. Run with `--spring.profiles.active=prod` (never `dev` against pilot data)
4. Create the first SUPER_ADMIN via one-time bootstrap env vars, then disable bootstrap
5. Build `backend/target/school-management-backend-1.0.0.jar`
6. Build the frontend (`npm run build`, `VITE_DEMO_MODE=false`) and serve `frontend/dist` behind TLS
7. Put a reverse proxy in front of both apps; health check: `GET /api/health`
8. Configure a real payment provider by replacing the mock HMAC adapter, keeping webhook signature verification

**v1 payment limitation:** payment orders settle the **full outstanding** amount only (no custom partial installments).

## What is intentionally not included

- Live payment-provider credentials
- Unauthenticated live vehicle tracking IDs
- Production seed payments or fake settled card transactions
