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
