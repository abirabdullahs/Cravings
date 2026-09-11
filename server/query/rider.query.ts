export const GET_AVAILABLE_REQUESTS = `
SELECT o.id AS order_id, o.restaurant_id, r.name AS restaurant_name, o.total_amount, o.created_at
FROM orders o
JOIN restaurants r ON r.id = o.restaurant_id
LEFT JOIN deliveries d ON d.order_id = o.id
WHERE o.order_status IN ('pending','confirmed') AND d.status = 'unassigned' AND d.rider_id IS NULL
ORDER BY o.created_at ASC
`;

export const ACCEPT_REQUEST = `
UPDATE deliveries
SET status = 'accepted', rider_id = $2, assigned_at = NOW()
WHERE order_id = $1 AND rider_id IS NULL AND status = 'unassigned'
RETURNING id, status, rider_id, assigned_at;
`;

// export const UPDATE_ORDER_STATUS_RIDER_ASSIGNED = `
// UPDATE orders SET status = 'assigned' WHERE id = $1
// `;

export const MARK_ARRIVED_AT_STORE = `
UPDATE deliveries
SET status = 'arrived_at_store'
WHERE order_id = $1 AND rider_id = $2 AND status = 'accepted'
RETURNING id, status;`;

export const MARK_PICKED_UP = `
UPDATE deliveries
SET status = 'picked_up'
WHERE order_id = $1 AND rider_id = $2 AND status = 'arrived_at_store'
RETURNING id, status;
`;

export const UPDATE_ORDER_STATUS_OUT_FOR_DELIVERY = `
UPDATE orders SET order_status = 'out_for_delivery'
WHERE id = $1 AND order_status = 'ready'
RETURNING id, order_status;
`;

export const MARK_DELIVERED = `
UPDATE deliveries
SET status = 'delivered', delivered_at = NOW()
WHERE order_id = $1 AND rider_id = $2 AND status = 'picked_up'
RETURNING id, status, delivered_at;
`;

export const UPDATE_ORDER_STATUS_DELIVERED = `
UPDATE orders SET order_status = 'delivered'
WHERE id = $1 AND order_status = 'out_for_delivery'
RETURNING id, order_status;
`;

export const SET_RIDER_STATUS = `
UPDATE riders SET status = $2
WHERE user_id = $1
RETURNING user_id, status;
`;

export const GET_RIDER_EARNINGS_BY_DATE = `
SELECT DATE(d.delivered_at) AS delivery_date, COUNT(*) AS total_deliveries,
    SUM(o.delivery_fee) AS total_income
FROM deliveries d
JOIN orders o ON o.id = d.order_id
WHERE d.rider_id = $1 AND d.status = 'delivered' AND DATE(d.delivered_at) = $2
GROUP BY DATE(d.delivered_at)
`;

export const GET_RIDER_PROFILE = `
SELECT id, name, phone, profile_image
FROM users
WHERE id = $1
`;

export const GET_ACTIVE_DELIVERY_FOR_RIDER = `
SELECT
  o.id AS order_id,
  o.order_status,
  d.status AS delivery_status,
  d.assigned_at,
  r.name AS restaurant_name,
  r.address AS restaurant_address,
  r.phone AS restaurant_phone,
  u.name AS customer_name,
  u.phone AS customer_phone,
  ua.address AS dropoff_address,
  o.total_amount,
  p.payment_method,
  (SELECT COUNT(*)::int FROM order_items oi WHERE oi.order_id = o.id) AS item_count
FROM deliveries d
JOIN orders o ON o.id = d.order_id
JOIN restaurants r ON r.id = o.restaurant_id
JOIN users u ON u.id = o.user_id
JOIN user_addresses ua ON ua.id = o.address_id
LEFT JOIN payments p ON p.order_id = o.id
WHERE d.rider_id = $1 AND d.status IN ('accepted', 'arrived_at_store', 'picked_up')
ORDER BY d.assigned_at DESC NULLS LAST
LIMIT 1
`;
