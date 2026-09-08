export const GET_AVAILABLE_REQUESTS = `
SELECT o.id AS order_id, o.restaurant_id, r.name AS restaurant_name, o.total_amount, o.created_at
FROM orders o
JOIN restaurants r ON r.id = o.restaurant_id
LEFT JOIN deliveries d ON d.order_id = o.id
WHERE o.order_status = 'confirmed' AND d.status = 'unassigned' AND d.rider_id IS NULL
ORDER BY o.created_at ASC
`;

export const ACCEPT_REQUEST = `
UPDATE deliveries
SET status = 'accepted', rider_id = $2, assigned_at = NOW()
WHERE order_id = $1 AND rider_id IS NULL AND status = 'unassigned'
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
WHERE id = $1 AND order_status = 'confirmed'
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
