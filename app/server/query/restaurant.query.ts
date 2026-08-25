export const FIND_RESTAURANTS_BY_OWNER = `
SELECT id, name, description, phone, email, address, opening_time,
			 closing_time, delivery_fee, minimum_order, active_status
FROM restaurants
WHERE owner_id = $1
ORDER BY created_at DESC
`;

export const FIND_RESTAURANT_BY_OWNER = `
SELECT * FROM restaurants WHERE id = $1 AND owner_id = $2
`;

export const INSERT_RESTAURANT = `
INSERT INTO restaurants
	(owner_id, name, description, phone, email, address, opening_time,
	 closing_time, delivery_fee, minimum_order, active_status)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING *
`;

export const INSERT_CATEGORY = `
INSERT INTO categories (restaurant_id, name)
VALUES ($1, $2)
RETURNING id, name
`;

export const INSERT_MENU_ITEM = `
INSERT INTO menu_items (restaurant_id, category_id, item_name, description, price, item_img, is_available)
VALUES ($1, $2, $3, $4, $5, $6, true)
RETURNING *;
`;

export const UPDATE_MENU_ITEM = `
UPDATE menu_items
SET item_name = $3, price = $4, description = $5, category_id = $6, item_img = $7
WHERE id = $1 AND restaurant_id = $2
RETURNING *
`;

export const UPDATE_MENU_ITEM_AVAILABILITY = `
UPDATE menu_items
SET is_available = $3
WHERE id = $1 AND restaurant_id = $2
RETURNING id, is_available
`;

export const DELETE_MENU_ITEM = `
DELETE FROM menu_items WHERE id = $1 AND restaurant_id = $2
`;

export const UPDATE_RESTAURANT = `
UPDATE restaurants
SET name = $3, description = $4, phone = $5, email = $6, address = $7,
	opening_time = $8, closing_time = $9, delivery_fee = $10,
	minimum_order = $11, active_status = $12
WHERE id = $1 AND owner_id = $2
RETURNING *
`;

export const DELETE_RESTAURANT = `
DELETE FROM restaurants WHERE id = $1 AND owner_id = $2
`;

export const FIND_CATEGORIES = `
SELECT id, name FROM categories WHERE restaurant_id = $1 ORDER BY name
`;

export const DELETE_CATEGORY = `
DELETE FROM categories WHERE id = $1 AND restaurant_id = $2
RETURNING id
`;

export const FIND_MENU = `
SELECT mi.id, mi.item_name, mi.description, mi.price, mi.item_img,
	   mi.is_available, mi.category_id, c.name AS category_name
FROM menu_items mi
LEFT JOIN categories c ON c.id = mi.category_id
WHERE mi.restaurant_id = $1
ORDER BY c.name NULLS LAST, mi.item_name
`;

export const FIND_BRANCH_EARNINGS = `
SELECT restaurant_id, SUM(restaurant_earning) AS total_earning, COUNT(*) AS total_orders
FROM sell_inquiry
WHERE restaurant_id = $1 AND created_at BETWEEN $2 AND $3
GROUP BY restaurant_id
`;

export const RESTAURANT_ACCEPT_ORDER = `
UPDATE orders
SET status = 'preparing'
WHERE id = $1 AND restaurant_id = $2
RETURNING id, status;
`;

export const RESTAURANT_MARK_READY = `
UPDATE orders
SET status = 'ready'
WHERE id = $1 AND restaurant_id = $2
RETURNING id, status;
`;

export const RESTAURANT_CANCEL_ORDER = `
UPDATE orders
SET status = 'cancelled'
WHERE id = $1 AND restaurant_id = $2
RETURNING id, status;
`;
