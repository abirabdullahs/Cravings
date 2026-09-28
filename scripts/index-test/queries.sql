-- Parameter-filled versions of queries used by the Cravings application.
-- Fixed IDs deliberately have many matching rows in 02_seed.sql.

-- name: Customer order history
-- index: ix_orders_user, ix_order_items_order
-- source: server/query/order.query.ts GET_USER_ORDERS
SELECT o.id, o.restaurant_id, r.name AS restaurant_name, o.total_amount,
  o.order_status, o.created_at, COUNT(oi.id)::int AS total_items,
  d.rider_id, rider.name AS rider_name,
  EXISTS (SELECT 1 FROM reviews review WHERE review.order_id = o.id) AS is_reviewed
FROM orders o
JOIN restaurants r ON r.id = o.restaurant_id
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN deliveries d ON d.order_id = o.id
LEFT JOIN users rider ON rider.id = d.rider_id
WHERE o.user_id = 777
GROUP BY o.id, r.name, d.rider_id, rider.name
ORDER BY o.created_at DESC;

-- name: Restaurant active kitchen queue
-- index: ix_orders_restaurant, ix_order_items_order
-- source: server/query/order.query.ts GET_RESTAURANT_ORDERS
SELECT o.id, u.name AS customer_name, o.total_amount, o.order_status,
  o.created_at, o.delivery_instructions,
  COALESCE(SUM(oi.quantity), 0)::int AS total_items,
  COALESCE(
    json_agg(
      json_build_object(
        'id', oi.id,
        'name', mi.item_name,
        'quantity', oi.quantity
      ) ORDER BY oi.id
    ) FILTER (WHERE oi.id IS NOT NULL),
    '[]'::json
  ) AS items
FROM orders o
JOIN users u ON u.id = o.user_id
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
WHERE o.restaurant_id = 42
  AND o.order_status IN ('pending', 'confirmed', 'preparing', 'ready')
GROUP BY o.id, u.name
ORDER BY o.created_at DESC;

-- name: Items of one order
-- index: ix_order_items_order, ix_payments_order
-- source: server/query/order.query.ts FIND_ORDER_DETAIL (item lookup)
SELECT o.id AS order_id, oi.id AS item_id, mi.item_name, oi.quantity,
  oi.unit_price, oi.subtotal AS item_subtotal,
  COALESCE(SUM(oi.subtotal) OVER (), 0)::NUMERIC(10,2) AS subtotal,
  o.discount, o.delivery_fee,
  ROUND(COALESCE(SUM(oi.subtotal) OVER (), 0) * 0.03, 2) AS tax,
  ROUND(GREATEST(
    o.total_amount - COALESCE(SUM(oi.subtotal) OVER (), 0) + o.discount
      - o.delivery_fee
      - ROUND(COALESCE(SUM(oi.subtotal) OVER (), 0) * 0.03, 2),
    0
  ), 2) AS platform_fee,
  o.total_amount, p.paid_at, p.transaction_id, o.delivery_instructions
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.id = 150000 AND o.user_id = 777
ORDER BY oi.id;

-- name: Restaurant menu
-- index: ix_menu_items_restaurant_archived
-- source: server/query/restaurant.query.ts FIND_MENU
SELECT mi.id, mi.item_name, mi.description, mi.price, mi.item_img AS image,
  mi.is_available, mi.category_id, c.name AS category_name, mi.archived_at
FROM menu_items mi
LEFT JOIN categories c ON c.id = mi.category_id
WHERE mi.restaurant_id = 42 AND mi.archived_at IS NULL
ORDER BY c.name NULLS LAST, mi.item_name;

-- name: Latest customer notifications
-- index: ix_notifications_user
-- source: server/query/notification.query.ts FIND_NOTIFICATIONS
SELECT id, user_id, order_id, title, message, is_read, created_at
FROM notifications
WHERE user_id = 777
ORDER BY created_at DESC
LIMIT 20;

-- name: Rider active delivery lookup
-- index: ix_deliveries_rider, ix_order_items_order, ix_payments_order, ix_delivery_location_history_delivery_time
-- source: server/query/rider.query.ts GET_ACTIVE_DELIVERY_FOR_RIDER
SELECT o.id AS order_id, o.order_status, d.id AS delivery_id,
  d.status AS delivery_status, d.assigned_at,
  r.id AS restaurant_id, r.name AS restaurant_name,
  r.address AS restaurant_address, r.phone AS restaurant_phone,
  r.latitude AS restaurant_latitude, r.longitude AS restaurant_longitude,
  u.name AS customer_name, u.phone AS customer_phone,
  ua.address AS dropoff_address, ua.latitude AS dropoff_latitude,
  ua.longitude AS dropoff_longitude,
  dlh.latitude AS rider_latitude, dlh.longitude AS rider_longitude,
  dlh.recorded_at AS rider_location_recorded_at,
  CASE
    WHEN r.latitude IS NOT NULL AND r.longitude IS NOT NULL
      AND ua.latitude IS NOT NULL AND ua.longitude IS NOT NULL
    THEN calculate_distance_km(r.latitude, r.longitude, ua.latitude, ua.longitude)
    WHEN dlh.latitude IS NOT NULL AND dlh.longitude IS NOT NULL
      AND ua.latitude IS NOT NULL AND ua.longitude IS NOT NULL
    THEN calculate_distance_km(dlh.latitude, dlh.longitude, ua.latitude, ua.longitude)
    ELSE NULL
  END AS distance_km,
  o.total_amount, p.payment_method,
  (SELECT COALESCE(SUM(oi.quantity), 0)::int
   FROM order_items oi WHERE oi.order_id = o.id) AS item_count
FROM deliveries d
JOIN orders o ON o.id = d.order_id
JOIN restaurants r ON r.id = o.restaurant_id
JOIN users u ON u.id = o.user_id
JOIN user_addresses ua ON ua.id = o.address_id
LEFT JOIN payments p ON p.order_id = o.id
LEFT JOIN delivery_location_history dlh
  ON dlh.delivery_id = d.id
  AND dlh.recorded_at = (
    SELECT MAX(dlh2.recorded_at)
    FROM delivery_location_history dlh2
    WHERE dlh2.delivery_id = d.id
  )
WHERE d.rider_id = 600
  AND d.status IN ('accepted', 'arrived_at_store', 'picked_up', 'arrived_at_destination')
ORDER BY d.assigned_at DESC NULLS LAST
LIMIT 1;

-- name: Latest GPS point of a delivery
-- index: ix_delivery_location_history_delivery_time
-- source: latest-location subquery in GET_ACTIVE_DELIVERY_FOR_RIDER
SELECT id, delivery_id, latitude, longitude, event, recorded_at
FROM delivery_location_history
WHERE delivery_id = 150000
ORDER BY recorded_at DESC, id DESC
LIMIT 1;

-- name: Restaurant reviews
-- index: ix_reviews_restaurant
-- source: server/query/review.query.ts GET_RESTAURANT_REVIEWS
SELECT rv.id, rv.rating, rv.comment, rv.created_at, u.name AS customer_name
FROM reviews rv
JOIN users u ON u.id = rv.user_id
WHERE rv.restaurant_id = 42
ORDER BY rv.created_at DESC
LIMIT 20;

-- name: Customer saved addresses
-- index: ix_user_addresses_user
-- source: server/query/address.query.ts FIND_USER_ADDRESSES
SELECT id, label, address, street, apartment_name, city, postal_code,
  latitude, longitude
FROM user_addresses
WHERE user_id = 777
ORDER BY id ASC;

-- name: Owner restaurant list
-- index: ix_restaurants_owner_archived
-- source: server/query/restaurant.query.ts FIND_RESTAURANTS_BY_OWNER
SELECT id, name, description, phone, email, address, area, latitude, longitude,
  opening_time, closing_time, delivery_fee, minimum_order, active_status,
  image, rating, cuisines, archived_at
FROM restaurants
WHERE owner_id = 42
  AND ((FALSE::boolean = FALSE AND archived_at IS NULL)
    OR (FALSE::boolean = TRUE AND archived_at IS NOT NULL))
ORDER BY created_at DESC;
