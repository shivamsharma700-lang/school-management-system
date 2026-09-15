# REAL SCHOOL PILOT RUNBOOK

**Status target:** controlled single-school (or few-branch) pilot  
**Feature freeze:** no new modules; no redesign; no AI/chat; no expenses/refunds in v1

---

## A. Before deployment

1. Confirm PostgreSQL 16/17 host, dedicated DB role, and nightly backup schedule.
2. Confirm TLS reverse proxy (nginx/Caddy/IIS) will terminate HTTPS; app speaks HTTP behind it.
3. Generate secrets offline (do not commit):
   - `JWT_SECRET` ≥ 64 random characters
   - `PAYMENT_SECRET` ≥ 32 random characters
   - Bootstrap admin password ≥ 12 characters
4. Choose empty production database (never point prod at a volume-seeded demo DB).
5. Confirm upload disk path exists and is writable by the app OS user.
6. Confirm frontend will be built with `VITE_DEMO_MODE=false` (default).
7. Set `SPRING_PROFILES_ACTIVE=prod` — **required**. Default profile is `dev` (seeders).

---

## B. Environment variables

| Variable | Required (prod) | Notes |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | **yes** | Must be `prod` |
| `DATABASE_URL` | **yes** | JDBC URL |
| `DATABASE_USERNAME` | **yes** | App DB role |
| `DATABASE_PASSWORD` | **yes** | Strong secret |
| `JWT_SECRET` | **yes** | No default; ≥ 32 bytes (prefer 64+) |
| `PAYMENT_SECRET` | **yes** | No default in prod |
| `CORS_ORIGINS` | **yes** | Exact UI origins, comma-separated, HTTPS |
| `FILE_STORAGE_DIR` | recommended | Absolute path preferred |
| `FILE_MAX_SIZE_MB` | optional | Default `10` |
| `SERVER_PORT` | optional | Default `8080` |
| `JWT_ACCESS_MINUTES` | optional | Default `20` |
| `JWT_REFRESH_DAYS` | optional | Default `7` |
| `PAYMENT_PROVIDER` | optional | Default `mock` until real gateway |
| `BOOTSTRAP_ADMIN_ENABLED` | first boot only | `true` once, then `false` |
| `BOOTSTRAP_ADMIN_EMAIL` | first boot | e.g. `admin@school.edu` |
| `BOOTSTRAP_ADMIN_USERNAME` | first boot | e.g. `superadmin` |
| `BOOTSTRAP_ADMIN_PASSWORD` | first boot | ≥ 12 chars |
| `BOOTSTRAP_ADMIN_FULL_NAME` | optional | Default `Super Admin` |

Frontend build:

| Variable | Value |
| --- | --- |
| `VITE_DEMO_MODE` | `false` |
| `VITE_API_BASE` | Public API base URL (e.g. `https://api.school.edu`) if UI is not same-origin proxied |

---

## C. Database setup

```sql
CREATE ROLE sms_app LOGIN PASSWORD '<strong-password>';
CREATE DATABASE school_management OWNER sms_app;
GRANT ALL PRIVILEGES ON DATABASE school_management TO sms_app;
-- connect to school_management:
GRANT ALL ON SCHEMA public TO sms_app;
ALTER SCHEMA public OWNER TO sms_app;
```

Use a **new empty** database for pilot go-live.

---

## D. Migration

- Flyway is enabled; migrations run automatically on backend startup.
- JPA `ddl-auto: validate` — schema must match migrations (no silent Hibernate DDL).
- Migrations live under `backend/src/main/resources/db/migration/` (`V1`…`V6`).
- Validate after first start: Flyway history table `flyway_schema_history` shows success; app logs no migration errors.
- Do not edit applied migration files after go-live; add a new `V*` if schema change is required later.

---

## E. Admin setup

1. First start with bootstrap env vars set (`BOOTSTRAP_ADMIN_ENABLED=true` + email/username/password).
2. Confirm login as SUPER_ADMIN.
3. Set `BOOTSTRAP_ADMIN_ENABLED=false` (or unset) and **restart**.
4. Password reset later: use Settings/Admin user create + password change via `POST /api/admin/users` (new user) or forgot/reset flow for existing accounts.
5. Never leave bootstrap enabled on a running pilot.

---

## F. School / branch setup

As SUPER_ADMIN:

1. Create branch(es): `POST /api/branches` (UI: Catalog / Branches).
2. Record branch `code` (admission numbers / imports often depend on it).
3. Create BRANCH_ADMIN / PRINCIPAL users scoped to that branch.

---

## G. Academic year setup

1. Create year: `POST /api/academic-years` with name, start/end dates, status.
2. Set one year to `ACTIVE` before enrollments, fees, attendance, or exams.
3. Historical years: set to `ARCHIVED`; do not delete rows.

---

## H. Staff / user creation

Roles: `SUPER_ADMIN`, `BRANCH_ADMIN`, `PRINCIPAL`, `TEACHER`, `ACCOUNTANT`, `PARENT`, `STUDENT`.

1. Create staff users via Admin → Users (`POST /api/admin/users`) with role + branch.
2. For teachers: create Staff profile and **Teacher assignments** (section/subject) so attendance/marks RBAC works.
3. Issue temporary passwords; force change on first login if your ops process requires it (document offline).

---

## I. Student import

1. Prefer bulk CSV: `POST /api/bulk/students` (partial success supported — review `created` / `skipped` / errors).
2. Or create individually via Students UI / API.
3. Enroll into class/section for the ACTIVE academic year.
4. Do not reuse a demo/volume database dump.

---

## J. Parent setup

1. Create PARENT users (Admin → Users) or link during student create/import where supported.
2. Link guardian ↔ student records so Parent portal only sees linked children.
3. Smoke-test: parent cannot open unlinked student IDs.

---

## K. Fee setup

1. Create fee structures + components for the branch/year.
2. Generate invoices for enrolled students.
3. Online / mock gateway flow: create payment order → webhook with `PAYMENT_SECRET` signature → receipt.
4. Cash/offline confirmation: accountant-only API.

### Known v1 payment limitation (do not hide)

**Payment orders settle the full outstanding invoice balance.**  
Custom partial installment amounts are **not** supported in v1.  
Communicate this to cashiers and parents before pilot day.

Expenses and refunds are **out of v1**.

---

## L. Attendance setup

1. Ensure teacher assignments exist for each section.
2. Teachers mark only assigned sections.
3. Verify summary endpoints for Parent/Student after a few marked days.

---

## M. Exam setup

1. Create exams + exam subjects for the ACTIVE year.
2. Enter/update marks (upsert supported).
3. Publish report cards only when marks are complete for the intended audience.

---

## N. Backup procedure

Daily (minimum) logical backup of PostgreSQL:

```bash
pg_dump -Fc -h <host> -U sms_app -d school_management -f sms_$(date +%Y%m%d).dump
```

Also back up `FILE_STORAGE_DIR` (uploads) to the same retention policy.

Store dumps off-box. Test restore on a staging DB before pilot week ends.

---

## O. Rollback procedure

1. Stop frontend + backend.
2. Restore DB: `pg_restore -c -h <host> -U sms_app -d school_management sms_YYYYMMDD.dump` (or restore to a fresh DB and repoint `DATABASE_URL`).
3. Restore `FILE_STORAGE_DIR` from the matching backup.
4. Redeploy previous known-good JAR + `frontend/dist` if the release itself is bad.
5. Confirm `GET /api/health` and admin login.
6. Do **not** re-enable `dev` profile or seeders against the restored pilot DB.

---

## P. First-day checklist

- [ ] `SPRING_PROFILES_ACTIVE=prod`
- [ ] Seed/volume flags off (prod profile; seeders are `@Profile` `dev`/`test` only)
- [ ] `VITE_DEMO_MODE=false` in the deployed UI build
- [ ] `GET /api/health` → `{"status":"UP",...}`
- [ ] Admin login works; bootstrap disabled after first user
- [ ] Branch + ACTIVE academic year present
- [ ] At least one teacher with section assignment
- [ ] Sample student + linked parent
- [ ] Fee structure + one invoice path exercised
- [ ] Attendance mark + parent/student summary
- [ ] CORS allows only the real UI origin(s)
- [ ] Uploads write to `FILE_STORAGE_DIR`
- [ ] Backup job ran once successfully
- [ ] Staff briefed: **full outstanding settle only** (no custom partial amounts)

---

## Q. Known v1 limitations

| Area | Limitation |
| --- | --- |
| Payments | Full outstanding amount per order only; **no custom partial installments** |
| Finance | No expenses / refunds module |
| Communication | Notices hub only; **no chat** |
| Payments gateway | Mock HMAC provider unless replaced; no card data stored |
| Demo | Dev seeders and `VITE_DEMO_MODE` must stay off in prod |
| Bootstrap | One-time empty-DB admin only; must be disabled after use |

---

## Production build commands

```bash
# Backend
cd backend
mvn -DskipTests package
java -jar target/school-management-backend-1.0.0.jar --spring.profiles.active=prod

# Frontend
cd frontend
# ensure VITE_DEMO_MODE=false
npm ci
npm run build
# serve frontend/dist behind TLS; proxy /api to backend or set VITE_API_Base at build time
```

## Basic health check

```bash
curl -s https://<api-host>/api/health
# expect: status UP
```

## HTTPS / proxy assumptions

- TLS terminates at the reverse proxy.
- Proxy sets `X-Forwarded-Proto` / `X-Forwarded-For`; prod enables `server.forward-headers-strategy=framework`.
- Browser origin in `CORS_ORIGINS` must match the public UI URL exactly (scheme + host + port).
