-- Prevent duplicate partner applications and identity reuse in existing databases.
-- This migration intentionally fails if legacy duplicate rows exist so an operator
-- can resolve the conflicting identities instead of silently deleting evidence.

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS uq_role_requests_pending_user_role
  ON role_requests (user_id, requested_role)
  WHERE status = 'PENDING';

CREATE UNIQUE INDEX IF NOT EXISTS uq_riders_nid_normalized
  ON riders ((NULLIF(LOWER(REGEXP_REPLACE(nid_number, '[^a-zA-Z0-9]', '', 'g')), '')));

CREATE UNIQUE INDEX IF NOT EXISTS uq_restaurant_owners_nid_normalized
  ON restaurant_owners ((NULLIF(LOWER(REGEXP_REPLACE(nid_number, '[^a-zA-Z0-9]', '', 'g')), '')));

COMMIT;
