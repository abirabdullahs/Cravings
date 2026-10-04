-- Keep the newest customer-created, unassigned order visible to riders.
-- Complete every other open delivery so the rider demo queue is unambiguous.
-- This updates existing rows only; it does not delete or reset data.

DROP TABLE IF EXISTS rider_demo_target_order;
DROP TABLE IF EXISTS rider_demo_completed_orders;

CREATE TEMP TABLE rider_demo_target_order ON COMMIT DROP AS
SELECT delivery.order_id
FROM deliveries AS delivery
JOIN orders AS customer_order ON customer_order.id = delivery.order_id
WHERE delivery.rider_id IS NULL
  AND delivery.status = 'unassigned'
  AND customer_order.order_status IN ('pending', 'confirmed', 'preparing', 'ready')
ORDER BY
  (customer_order.id > 12) DESC,
  customer_order.created_at DESC,
  customer_order.id DESC
LIMIT 1;

CREATE TEMP TABLE rider_demo_completed_orders ON COMMIT DROP AS
WITH completed_deliveries AS (
  UPDATE deliveries AS delivery
  SET
    status = 'delivered',
    delivered_at = COALESCE(delivery.delivered_at, NOW()),
    updated_at = NOW()
  WHERE delivery.status IN (
      'unassigned',
      'accepted',
      'arrived_at_store',
      'picked_up',
      'arrived_at_destination'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM rider_demo_target_order AS target
      WHERE target.order_id = delivery.order_id
    )
  RETURNING delivery.order_id
)
SELECT order_id
FROM completed_deliveries;

UPDATE orders AS customer_order
SET order_status = 'delivered', updated_at = NOW()
FROM rider_demo_completed_orders AS completed
WHERE customer_order.id = completed.order_id
  AND customer_order.order_status <> 'delivered';

UPDATE payments AS payment
SET status = 'completed', paid_at = COALESCE(payment.paid_at, NOW())
FROM rider_demo_completed_orders AS completed
WHERE payment.order_id = completed.order_id
  AND payment.status = 'pending';

UPDATE deliveries AS delivery
SET
  rider_id = NULL,
  assigned_at = NULL,
  delivered_at = NULL,
  status = 'unassigned',
  updated_at = NOW()
FROM rider_demo_target_order AS target
WHERE delivery.order_id = target.order_id;

UPDATE orders AS customer_order
SET order_status = 'pending', updated_at = NOW()
FROM rider_demo_target_order AS target
WHERE customer_order.id = target.order_id;

UPDATE riders
SET status = 'idle', updated_at = NOW()
WHERE status <> 'offline';
