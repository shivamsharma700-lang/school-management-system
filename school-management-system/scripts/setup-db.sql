-- Development database bootstrap (safe to re-run).
-- Does not contain production credentials.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'sms_app') THEN
    CREATE ROLE sms_app LOGIN PASSWORD 'sms_dev_local_only';
  END IF;
END
$$;
