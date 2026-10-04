-- Incremental, idempotent delivery repair. This file never resets or truncates data.
-- For each rider, the newest active delivery remains active and older ones are completed.

DROP TABLE IF EXISTS delivery_consistency_completed_orders;

CREATE TEMP TABLE delivery_consistency_completed_orders ON COMMIT DROP AS
WITH ranked_active_deliveries AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY rider_id
      ORDER BY assigned_at DESC NULLS LAST, updated_at DESC, id DESC
    ) AS active_rank
  FROM deliveries
  WHERE rider_id IS NOT NULL
    AND status IN (
      'accepted',
      'arrived_at_store',
      'picked_up',
      'arrived_at_destination'
    )
), repaired_deliveries AS (
  UPDATE deliveries AS delivery
  SET
    status = 'delivered',
    delivered_at = COALESCE(delivery.delivered_at, NOW()),
    updated_at = NOW()
  FROM ranked_active_deliveries AS ranked
  WHERE delivery.id = ranked.id
    AND ranked.active_rank > 1
  RETURNING delivery.order_id, delivery.rider_id
)
SELECT order_id, rider_id
FROM repaired_deliveries;

UPDATE orders AS customer_order
SET order_status = 'delivered', updated_at = NOW()
FROM delivery_consistency_completed_orders AS repaired
WHERE customer_order.id = repaired.order_id
  AND customer_order.order_status <> 'delivered';

UPDATE payments AS payment
SET status = 'completed', paid_at = COALESCE(payment.paid_at, NOW())
FROM delivery_consistency_completed_orders AS repaired
WHERE payment.order_id = repaired.order_id
  AND payment.status = 'pending';

UPDATE riders AS rider
SET
  status = CASE
    WHEN EXISTS (
      SELECT 1
      FROM deliveries AS active_delivery
      WHERE active_delivery.rider_id = rider.user_id
        AND active_delivery.status IN (
          'accepted',
          'arrived_at_store',
          'picked_up',
          'arrived_at_destination'
        )
    ) THEN 'busy'::rider_status_enum
    ELSE 'idle'::rider_status_enum
  END,
  updated_at = NOW()
WHERE rider.status = 'busy'
   OR EXISTS (
     SELECT 1
     FROM deliveries AS active_delivery
     WHERE active_delivery.rider_id = rider.user_id
       AND active_delivery.status IN (
         'accepted',
         'arrived_at_store',
         'picked_up',
         'arrived_at_destination'
       )
   );

CREATE UNIQUE INDEX IF NOT EXISTS uq_deliveries_one_active_per_rider
  ON deliveries (rider_id)
  WHERE rider_id IS NOT NULL
    AND status IN (
      'accepted',
      'arrived_at_store',
      'picked_up',
      'arrived_at_destination'
    );
