export const GET_AVAILABLE_REQUESTS = `
SELECT 
  o.id AS order_id, 
  o.restaurant_id, 
  r.name AS restaurant_name, 
  o.total_amount,
  o.created_at
FROM orders o
JOIN restaurants r ON r.id = o.restaurant_id
JOIN deliveries d ON d.order_id = o.id
WHERE o.order_status IN ('pending', 'confirmed', 'ready', 'preparing')
  AND d.status = 'unassigned'
  AND d.rider_id IS NULL
ORDER BY o.created_at ASC
LIMIT 10;`;

export const ACCEPT_REQUEST = `
UPDATE deliveries
SET status = 'accepted', rider_id = $2, assigned_at = NOW()
WHERE order_id = $1 AND rider_id IS NULL AND status = 'unassigned'
RETURNING id, status, rider_id, assigned_at;
`;

export const LOCK_RIDER_FOR_ACCEPT = `
SELECT user_id, status
FROM riders
WHERE user_id = $1
FOR UPDATE;
`;

export const CANCELL_ALL =`
  UPDATE deliveries 
      SET status = 'cancelled', 
          updated_at = NOW()
      WHERE rider_id = $1 
        AND status IN ('assigned', 'arrived_at_store', 'picked_up');`

export const MARK_ARRIVED_AT_STORE = `
UPDATE deliveries
SET status = 'arrived_at_store'
WHERE order_id = $1 AND rider_id = $2 AND status = 'accepted'
RETURNING id, status;`;

export const INSERT_DELIVERY_LOCATION = `
INSERT INTO delivery_location_history (delivery_id, latitude, longitude, event)
VALUES ($1, $2, $3, $4)
RETURNING id, delivery_id, latitude, longitude, event, recorded_at;
`;

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

export const MARK_ARRIVED_AT_DESTINATION = `
UPDATE deliveries
SET status = 'arrived_at_destination'
WHERE order_id = $1 AND rider_id = $2 AND status = 'picked_up'
RETURNING id, status;
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

export const GET_RIDER_DELIVERIES = `
  SELECT 
    d.id AS delivery_id,
    d.order_id,
    d.status,
    o.order_status,
    o.total_amount,
    o.delivery_fee,
    r.name AS restaurant_name,
    r.address AS restaurant_address,
    ua.address AS dropoff_address,
    d.assigned_at,
    d.delivered_at
  FROM deliveries d
  JOIN orders o ON o.id = d.order_id
  JOIN restaurants r ON r.id = o.restaurant_id
  JOIN user_addresses ua ON ua.id = o.address_id
  WHERE d.rider_id = $1
    AND ($2::date IS NULL OR DATE(d.delivered_at) = $2)
  ORDER BY d.assigned_at DESC;
`;

export const GET_RIDER_PROFILE = `
SELECT id, name, phone, profile_image, status 
FROM users join riders ON users.id = riders.user_id
WHERE id = $1
`;

export const GET_ACTIVE_DELIVERY_FOR_RIDER = `
SELECT 
  o.id AS order_id, 
  o.order_status, 
  d.id AS delivery_id, 
  d.status AS delivery_status, 
  d.assigned_at, 

  r.id AS restaurant_id, 
  r.name AS restaurant_name, 
  r.address AS restaurant_address, 
  r.phone AS restaurant_phone, 
  r.latitude AS restaurant_latitude, 
  r.longitude AS restaurant_longitude, 

  u.name AS customer_name, 
  u.phone AS customer_phone, 

  ua.address AS dropoff_address, 
  ua.latitude AS dropoff_latitude, 
  ua.longitude AS dropoff_longitude, 

  dlh.latitude AS rider_latitude,
  dlh.longitude AS rider_longitude,
  dlh.recorded_at AS rider_location_recorded_at,

  o.total_amount, 
  p.payment_method, 

  (
    SELECT COUNT(*)::int
    FROM order_items oi
    WHERE oi.order_id = o.id
  ) AS item_count

FROM deliveries d 
JOIN orders o 
  ON o.id = d.order_id 
JOIN restaurants r 
  ON r.id = o.restaurant_id 
JOIN users u 
  ON u.id = o.user_id 
JOIN user_addresses ua 
  ON ua.id = o.address_id 

LEFT JOIN payments p 
  ON p.order_id = o.id

LEFT JOIN delivery_location_history dlh
  ON dlh.delivery_id = d.id
  AND dlh.recorded_at = (
    SELECT MAX(dlh2.recorded_at)
    FROM delivery_location_history dlh2
    WHERE dlh2.delivery_id = d.id
  )

WHERE d.rider_id = $1 
  AND d.status IN ('accepted', 'arrived_at_store', 'picked_up') 

ORDER BY d.assigned_at DESC NULLS LAST 
LIMIT 1
`;