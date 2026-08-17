export const GET_AVAILABLE_REQUESTS = `
SELECT o.id AS order_id, o.restaurant_id, r.name AS restaurant_name, o.total_amount, o.created_at
FROM orders o
JOIN restaurants r ON r.id = o.restaurant_id
LEFT JOIN rider_delivery_status rds ON rds.order_id = o.id
WHERE o.status = 'accepted' AND rds.id IS NULL
ORDER BY o.created_at ASC
`;

export const ACCEPT_REQUEST = `
INSERT INTO rider_delivery_status (order_id, rider_id, status, created_at)
VALUES ($1, $2, 'accepted', NOW())
`;

export const UPDATE_ORDER_STATUS_RIDER_ASSIGNED = `
UPDATE orders SET status = 'rider_assigned' WHERE id = $1
`;

export const MARK_PICKED_UP = `
UPDATE rider_delivery_status
SET status = 'picked_up', picked_up_at = NOW()
WHERE order_id = $1 AND rider_id = $2
`;

export const UPDATE_ORDER_STATUS_PICKED_UP = `
UPDATE orders SET status = 'picked_up' WHERE id = $1
`;

export const MARK_DELIVERED = `
UPDATE rider_delivery_status
SET status = 'delivered', delivered_at = NOW()
WHERE order_id = $1
`;

export const UPDATE_ORDER_STATUS_DELIVERED = `
UPDATE orders SET status = 'delivered' WHERE id = $1
`;

export const GET_RIDER_EARNINGS_BY_DATE = `
SELECT DATE(rds.delivered_at) AS delivery_date, COUNT(*) AS total_deliveries,
       SUM(o.delivery_charge) AS total_income
FROM rider_delivery_status rds
JOIN orders o ON o.id = rds.order_id
WHERE rds.rider_id = $1 AND rds.status = 'delivered' AND DATE(rds.delivered_at) = $2
GROUP BY DATE(rds.delivered_at)
`;

export const GET_RIDER_PROFILE = `
SELECT id, name, phone, profile_image
FROM users
WHERE id = $1
`;
