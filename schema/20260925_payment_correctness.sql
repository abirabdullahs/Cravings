-- Correct payment timestamps/methods and retain checkout instructions.
-- Apply after 20260925_checkout_idempotency.sql and before procedures.sql.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;

ALTER TABLE payments
  ALTER COLUMN paid_at DROP DEFAULT;

UPDATE payments
SET paid_at = NULL
WHERE status = 'pending';

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);

ALTER TABLE payments
  ALTER COLUMN transaction_id TYPE VARCHAR(100),
  ALTER COLUMN transaction_id DROP NOT NULL;

ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS ck_payments_method;

UPDATE payments
SET payment_method = CASE payment_method
  WHEN 'mobile_banking' THEN 'bkash'
  WHEN 'bank_transfer' THEN 'card'
  ELSE payment_method
END;

ALTER TABLE payments
  ADD CONSTRAINT ck_payments_method
  CHECK (payment_method IN ('cash', 'bkash', 'nagad', 'card'));
