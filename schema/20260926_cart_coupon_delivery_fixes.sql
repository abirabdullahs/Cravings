-- Apply once, then apply server/query/procedures.sql so checkout uses the
-- latest creation_of_order procedure.

-- Zero is an operation (delete), not a valid persisted cart quantity.
DROP TRIGGER IF EXISTS tr_delete_empty_items ON cart_items;
DROP FUNCTION IF EXISTS fn_delete_empty_items();

-- Collapse duplicate assignments while preserving cart references.
WITH canonical AS (
  SELECT user_id, coupon_id, MIN(id) AS keep_id
  FROM user_coupons
  GROUP BY user_id, coupon_id
), duplicate_assignments AS (
  SELECT uc.id, canonical.keep_id
  FROM user_coupons uc
  JOIN canonical
    ON canonical.user_id = uc.user_id
   AND canonical.coupon_id = uc.coupon_id
  WHERE uc.id <> canonical.keep_id
)
UPDATE carts c
SET user_coupon_id = duplicate_assignments.keep_id
FROM duplicate_assignments
WHERE c.user_coupon_id = duplicate_assignments.id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, coupon_id ORDER BY id) AS position
  FROM user_coupons
)
DELETE FROM user_coupons uc
USING ranked
WHERE uc.id = ranked.id AND ranked.position > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_coupons_user_coupon
  ON user_coupons (user_id, coupon_id);

DROP VIEW IF EXISTS available_user_coupons;

ALTER TABLE carts DROP CONSTRAINT IF EXISTS fk_cart_coupon;
ALTER TABLE carts
  ADD CONSTRAINT fk_cart_coupon
  FOREIGN KEY (user_coupon_id)
  REFERENCES user_coupons (id)
  ON DELETE SET NULL
  DEFERRABLE INITIALLY IMMEDIATE;

-- Used and expired assignments are retained for history. Customer-facing
-- queries expose only unused, unexpired assignments.
