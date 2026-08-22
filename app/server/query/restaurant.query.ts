export const GET_OWNER_BRANCHES = `
SELECT id, name, address, active_status
FROM restaurants
WHERE owner_id = $1
`;

export const ADD_BRANCH = `
INSERT INTO restaurants (owner_id, name, address, active_status)
VALUES ($1, $2, $3, true)
RETURNING id, name, address
`;

export const ADD_CATEGORY = `
INSERT INTO categories (restaurant_id, name)
VALUES ($1, $2)
RETURNING id, name
`;

export const ADD_MENU_ITEM = `
INSERT INTO menuItems (restaurant_id, category_id, name, description, price, image, is_available)
VALUES ($1, $2, $3, $4, $5, $6, true)
RETURNING *;
`;

export const UPDATE_MENU_ITEM = `
UPDATE menuItems
SET name = $3, price = $4, description = $5, category_id = $6
WHERE id = $1 AND restaurant_id = $2
RETURNING *
`;

export const SET_PRODUCT_AVAILABILITY = `
UPDATE menuItems
SET is_available = $3
WHERE id = $1 AND restaurant_id = $2
RETURNING id, is_available
`;

export const REMOVE_PRODUCT = `
DELETE FROM menuItems WHERE id = $1 AND restaurant_id = $2
`;

export const GET_BRANCH_EARNINGS = `
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