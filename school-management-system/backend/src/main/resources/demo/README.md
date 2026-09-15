# Demo data (isolated from production)

This folder documents **DEMO_MODE** volume data. It is not applied by Flyway.

## Enable

In `application-dev.yml`:

```
app.seed.enabled: true
app.seed.volume: true
```

`DevDataSeeder` creates login accounts and a small academic skeleton (always, when the user table is empty).

`DemoVolumeSeeder` then fills **8 Delhi NCR demo campuses × 530 students** (4,240 total), plus classes Nursery–12, sections, teachers, guardians, enrollments, sample attendance, invoices, homework, timetable slots, and notices.

`DemoCampusEnricher` (Order 3) adds recent weekday attendance, mid-term exams/marks (sample), buses/routes, library loans, and leave rows. It is idempotent and runs whenever `app.seed.volume=true`.

Records are fictional. Branch names such as “DPS Noida” are **demo labels**, not official school records.

## Disable

Set `app.seed.volume: false`. Volume seeding will not run again.

## Reset

1. Stop the backend.
2. Drop and recreate the `school_management` database (or `flyway clean` only in local/dev).
3. Start the backend with `app.seed.enabled=true` and `app.seed.volume=true`.

Do **not** enable volume seeding in `test` or `prod` profiles.

## Frontend fallback

`frontend/src/demo/` is a last-resort UI fallback when an API is empty or down. Live PostgreSQL data always wins.

Git workflow verified successfully.