export const GET_ALL_RESTAURANTS_WITH_OWNER = `
SELECT r.id, r.name, r.address, r.active_status, r.created_at,
       u.name AS owner_name, u.phone AS owner_phone,
       COUNT(DISTINCT mi.id) AS product_count,
       COUNT(DISTINCT o.id) AS order_count
FROM restaurants r
JOIN users u ON u.id = r.owner_id
LEFT JOIN menu_items mi ON mi.restaurant_id = r.id
LEFT JOIN orders o ON o.restaurant_id = r.id
GROUP BY r.id, u.name, u.phone
ORDER BY r.name
`;

export const GET_RESTAURANT_PRODUCT_SALES = `
SELECT p.id, p.name, p.price,
       COUNT(oi.id) AS total_sold,
       COALESCE(SUM(oi.subtotal), 0) AS total_revenue
FROM menu_items p
LEFT JOIN order_items oi ON oi.menu_item_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id
WHERE p.restaurant_id = $1
  AND (o.created_at IS NULL OR (o.created_at >= NOW() - ($2::int * INTERVAL '1 day')
       AND o.order_status <> 'cancelled'))
GROUP BY p.id, p.name, p.price
ORDER BY total_revenue DESC, p.name
`;

export const GET_RESTAURANT_REVIEWS = `
SELECT rv.id, rv.rating, rv.comment, rv.created_at,
       u.name AS customer_name, r.name AS restaurant_name
FROM reviews rv
JOIN users u ON u.id = rv.user_id
JOIN restaurants r ON r.id = rv.restaurant_id
WHERE rv.restaurant_id = $1
ORDER BY rv.created_at DESC
LIMIT 100
`;

export const GET_ALL_RIDERS = `
SELECT id, name, phone
FROM users
WHERE role = 'rider'
`;

export const GET_ADMIN_USERS = `
SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
       COUNT(DISTINCT o.id)::int AS order_count,
       COUNT(DISTINCT uc.id)::int AS coupon_count,
       COUNT(DISTINCT rr.id)::int AS role_request_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
LEFT JOIN user_coupons uc ON uc.user_id = u.id
LEFT JOIN role_requests rr ON rr.user_id = u.id
WHERE ($1::text = '' OR u.role::text = $1)
  AND ($2::text = '' OR u.name ILIKE '%' || $2 || '%' OR u.email ILIKE '%' || $2 || '%' OR COALESCE(u.phone, '') ILIKE '%' || $2 || '%')
GROUP BY u.id
ORDER BY u.created_at DESC
LIMIT $3 OFFSET $4
`;

export const GET_ADMIN_USER_DETAILS = `
SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
       COUNT(DISTINCT o.id)::int AS order_count,
       COALESCE(SUM(CASE WHEN o.order_status <> 'cancelled' THEN o.total_amount ELSE 0 END), 0) AS total_spend,
       COUNT(DISTINCT uc.id)::int AS coupon_count,
       COUNT(DISTINCT rr.id)::int AS role_request_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
LEFT JOIN user_coupons uc ON uc.user_id = u.id
LEFT JOIN role_requests rr ON rr.user_id = u.id
WHERE u.id = $1
GROUP BY u.id
`;

export const GET_ADMIN_ORDERS = `
SELECT o.id, o.total_amount, o.delivery_fee, o.discount, o.order_status, o.created_at,
       u.name AS customer_name, u.email AS customer_email,
       r.name AS restaurant_name,
       p.status AS payment_status, p.payment_method,
       d.status AS delivery_status, rider.name AS rider_name
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN restaurants r ON r.id = o.restaurant_id
LEFT JOIN payments p ON p.order_id = o.id
LEFT JOIN deliveries d ON d.order_id = o.id
LEFT JOIN users rider ON rider.id = d.rider_id
WHERE ($1::text = '' OR o.order_status::text = $1)
  AND ($2::text = '' OR p.status::text = $2)
  AND ($3::text = '' OR d.status::text = $3)
ORDER BY o.created_at DESC
LIMIT $4 OFFSET $5
`;

export const GET_ADMIN_ORDER_DETAILS = `
SELECT o.id, o.total_amount, o.delivery_fee, o.discount, o.order_status, o.created_at,
       u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
       r.name AS restaurant_name, r.address AS restaurant_address,
       p.status AS payment_status, p.payment_method, p.transaction_id,
       d.status AS delivery_status, rider.name AS rider_name, rider.phone AS rider_phone
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN restaurants r ON r.id = o.restaurant_id
LEFT JOIN payments p ON p.order_id = o.id
LEFT JOIN deliveries d ON d.order_id = o.id
LEFT JOIN users rider ON rider.id = d.rider_id
WHERE o.id = $1
`;

export const GET_ADMIN_ORDER_ITEMS = `
SELECT oi.id, mi.item_name, oi.quantity, oi.unit_price, oi.subtotal
FROM order_items oi
JOIN menu_items mi ON mi.id = oi.menu_item_id
WHERE oi.order_id = $1
ORDER BY oi.id
`;

export const GET_WEEKLY_PLATFORM_PROFIT = `
SELECT DATE_TRUNC('week', created_at) AS week,
       COUNT(*) AS order_count,
       COALESCE(SUM(GREATEST(total_amount - delivery_fee - discount, 0)), 0) AS product_sales,
       COALESCE(SUM(CASE WHEN order_status <> 'cancelled' THEN $1::numeric ELSE 0 END), 0) AS platform_profit
FROM orders
WHERE created_at >= NOW() - ($2::int * INTERVAL '1 day')
GROUP BY week
ORDER BY week DESC
`;

export const GET_RESTAURANT_WISE_PROFIT = `
SELECT r.id, r.name,
       COUNT(o.id) AS order_count,
       COALESCE(SUM(GREATEST(o.total_amount - o.delivery_fee - o.discount, 0)), 0) AS total_sales,
       COALESCE(SUM(CASE WHEN o.order_status <> 'cancelled' THEN $1::numeric ELSE 0 END), 0) AS admin_profit
FROM restaurants r
LEFT JOIN orders o ON o.restaurant_id = r.id
  AND o.created_at >= NOW() - ($2::int * INTERVAL '1 day')
GROUP BY r.id, r.name
ORDER BY total_sales DESC, r.name
`;

export const GET_PLATFORM_TOTALS = `
SELECT COUNT(*) FILTER (WHERE order_status <> 'cancelled') AS order_count,
       COALESCE(SUM(GREATEST(total_amount - delivery_fee - discount, 0))
         FILTER (WHERE order_status <> 'cancelled'), 0) AS product_sales,
       COALESCE(SUM(CASE WHEN order_status <> 'cancelled' THEN $1::numeric ELSE 0 END), 0) AS platform_profit
FROM orders
WHERE created_at >= NOW() - ($2::int * INTERVAL '1 day')
`;
