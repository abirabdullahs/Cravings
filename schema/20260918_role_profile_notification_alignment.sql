-- Align the merged approval flow with the columns used by the application.
-- Run this once against PostgreSQL before approving new rider or owner requests.

ALTER TABLE riders ADD COLUMN IF NOT EXISTS nid_number VARCHAR;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS vehicle_plate VARCHAR;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS license_number VARCHAR;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS vehicle_number VARCHAR;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'riders' AND column_name = 'vehicle_plate') THEN
    UPDATE riders
    SET vehicle_number = COALESCE(vehicle_number, vehicle_plate)
    WHERE vehicle_number IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'riders' AND column_name = 'license_number') THEN
    UPDATE riders
    SET license_number = COALESCE(license_number, 'UNKNOWN')
    WHERE license_number IS NULL;
  END IF;
END $$;
ALTER TABLE riders ALTER COLUMN vehicle_number DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_riders_user_id ON riders (user_id);

CREATE TABLE IF NOT EXISTS restaurant_owners (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  nid_number VARCHAR,
  business_name VARCHAR,
  trade_licence VARCHAR,
  address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_role_requests_pending_user
  ON role_requests (user_id, requested_role, status);
CREATE INDEX IF NOT EXISTS ix_notifications_user_created
  ON notifications (user_id, created_at DESC);