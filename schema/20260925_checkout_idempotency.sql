-- Add retry-safe checkout identifiers to existing databases.
-- Apply this migration before server/query/procedures.sql.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS idempotency_key UUID;

WITH legacy_orders AS (
  SELECT
    id,
    md5('legacy-order-' || id::TEXT) AS key_hash
  FROM orders
  WHERE idempotency_key IS NULL
)
UPDATE orders O
SET idempotency_key = (
  SUBSTRING(L.key_hash, 1, 8) || '-' ||
  SUBSTRING(L.key_hash, 9, 4) || '-' ||
  SUBSTRING(L.key_hash, 13, 4) || '-' ||
  SUBSTRING(L.key_hash, 17, 4) || '-' ||
  SUBSTRING(L.key_hash, 21, 12)
)::UUID
FROM legacy_orders L
WHERE O.id = L.id;

ALTER TABLE orders
  ALTER COLUMN idempotency_key SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_user_idempotency
  ON orders (user_id, idempotency_key);
