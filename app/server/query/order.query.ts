export const GET_UNAVAILABLE_CART_ITEMS = `
SELECT ci.product_id, p.name, p.is_available
FROM cart_items ci
JOIN products p ON p.id = ci.product_id
WHERE ci.customer_id = $1 AND p.is_available = false
`;

export const CREATE_ORDER = `
INSERT INTO orders (customer_id, restaurant_id, status, total_amount, delivery_charge, platform_fee, created_at)
VALUES ($1, $2, 'accepted', $3, $4, $5, NOW())
RETURNING id
`;

export const INSERT_ORDER_ITEMS = `
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
SELECT $1, p.id, c.quantity, p.price, (p.price * c.quantity)
FROM cart_items c
JOIN products p ON p.id = c.product_id
WHERE c.customer_id = $2
`;

export const GET_ORDER_STATUS = `
SELECT id, status, total_amount, delivery_charge, created_at
FROM orders
WHERE id = $1
`;

export const GET_CUSTOMER_ORDERS = `
SELECT id, restaurant_id, status, total_amount, created_at
FROM orders
WHERE customer_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3
`;
