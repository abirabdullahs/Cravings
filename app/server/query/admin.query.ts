export const GET_ALL_RESTAURANTS_WITH_OWNER = `
SELECT r.id, r.name, r.address, u.name AS owner_name, u.phone AS owner_phone
FROM restaurants r
JOIN users u ON u.id = r.owner_id
ORDER BY r.name
`;

export const GET_RESTAURANT_PRODUCT_SALES = `
SELECT p.id, p.name, p.price,
       COUNT(oi.id) AS total_sold,
       COALESCE(SUM(oi.subtotal), 0) AS total_revenue
FROM menuItems p
LEFT JOIN orderItems oi ON oi.menu_item_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id
WHERE p.restaurant_id = $1
  AND (o.created_at IS NULL OR o.created_at >= NOW() - ($2 || ' days')::interval)
GROUP BY p.id, p.name, p.price
`;

export const GET_ALL_RIDERS = `
SELECT id, name, phone
FROM users
WHERE role = 'rider'
`;

export const GET_WEEKLY_PLATFORM_PROFIT = `
SELECT DATE_TRUNC('week', created_at) AS week, SUM(platform_fee) AS platform_profit
FROM sell_inquiry
GROUP BY week
ORDER BY week DESC
`;

export const GET_RESTAURANT_WISE_PROFIT = `
SELECT r.name, SUM(si.gross_amount) AS total_sales, SUM(si.platform_fee) AS admin_profit
FROM sell_inquiry si
JOIN restaurants r ON r.id = si.restaurant_id
GROUP BY r.name
ORDER BY total_sales DESC
`;
