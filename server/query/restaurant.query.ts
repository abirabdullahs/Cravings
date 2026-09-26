export const FIND_RESTAURANTS_BY_OWNER = `
SELECT id, name, description, phone, email, address, area, latitude, longitude,
			 opening_time, closing_time, delivery_fee, minimum_order, active_status,
			 image, rating, cuisines, archived_at
FROM restaurants
WHERE owner_id = $1
  AND (($2::boolean = FALSE AND archived_at IS NULL)
    OR ($2::boolean = TRUE AND archived_at IS NOT NULL))
ORDER BY created_at DESC
`;

export const FIND_RESTAURANT_BY_OWNER = `
SELECT * FROM restaurants WHERE id = $1 AND owner_id = $2
`;

export const FIND_RESTAURANT_BY_ID = `
SELECT R.id, R.name, R.description, R.phone, R.email, R.address, R.area,
  R.latitude, R.longitude, R.opening_time, R.closing_time, R.delivery_fee,
  R.minimum_order, R.image, R.rating, R.cuisines, R.archived_at,
  (R.active_status AND R.archived_at IS NULL AND
    CASE
      WHEN R.opening_time IS NULL OR R.closing_time IS NULL
        OR R.opening_time = R.closing_time THEN TRUE
      WHEN R.opening_time < R.closing_time THEN
        (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Dhaka')::time >= R.opening_time
        AND (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Dhaka')::time < R.closing_time
      ELSE
        (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Dhaka')::time >= R.opening_time
        OR (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Dhaka')::time < R.closing_time
    END
  ) AS active_status
FROM restaurants R
WHERE R.id = $1 AND R.archived_at IS NULL
`;

export const INSERT_RESTAURANT = `
INSERT INTO restaurants
	(owner_id, name, description, phone, email, address, area, latitude, longitude,
	 opening_time, closing_time, delivery_fee, minimum_order, active_status, image, cuisines)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
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
RETURNING id, item_name, description, price, item_img AS image,
          is_available, category_id, NULL::varchar AS category_name;
`;

export const UPDATE_MENU_ITEM = `
UPDATE menu_items
SET item_name = $3, price = $4, description = $5, category_id = $6, item_img = $7
WHERE id = $1 AND restaurant_id = $2
RETURNING id, item_name, description, price, item_img AS image,
          is_available, category_id, NULL::varchar AS category_name
`;

export const UPDATE_MENU_ITEM_AVAILABILITY = `
UPDATE menu_items
SET is_available = $3
WHERE id = $1 AND restaurant_id = $2
RETURNING id, is_available
`;

export const ARCHIVE_MENU_ITEM = `
UPDATE menu_items
SET archived_at = CURRENT_TIMESTAMP
WHERE id = $1 AND restaurant_id = $2
`;

export const RESTORE_MENU_ITEM = `
UPDATE menu_items
SET archived_at = NULL
WHERE id = $1 AND restaurant_id = $2
RETURNING id
`;

export const UPDATE_RESTAURANT = `
UPDATE restaurants
SET name = $3, description = $4, phone = $5, email = $6, address = $7,
	area = $8, latitude = $9, longitude = $10, opening_time = $11,
	closing_time = $12, delivery_fee = $13, minimum_order = $14,
	active_status = $15, image = $16, cuisines = $17
WHERE id = $1 AND owner_id = $2
RETURNING *
`;

export const ARCHIVE_RESTAURANT = `
UPDATE restaurants
SET archived_at = CURRENT_TIMESTAMP
WHERE id = $1 AND owner_id = $2
`;

export const RESTORE_RESTAURANT = `
UPDATE restaurants
SET archived_at = NULL
WHERE id = $1 AND owner_id = $2
RETURNING id
`;

export const FIND_CATEGORIES = `
SELECT id, name FROM categories WHERE restaurant_id = $1 ORDER BY name
`;

export const FIND_CATEGORY_FOR_RESTAURANT = `
SELECT id, name FROM categories WHERE id = $1 AND restaurant_id = $2
`;

export const DELETE_CATEGORY = `
DELETE FROM categories WHERE id = $1 AND restaurant_id = $2
RETURNING id
`;

export const FIND_MENU = `
SELECT mi.id, mi.item_name, mi.description, mi.price, mi.item_img AS image,
	   mi.is_available, mi.category_id, c.name AS category_name, mi.archived_at
FROM menu_items mi
LEFT JOIN categories c ON c.id = mi.category_id
WHERE mi.restaurant_id = $1 AND mi.archived_at IS NULL
ORDER BY c.name NULLS LAST, mi.item_name
`;

export const FIND_ARCHIVED_MENU = `
SELECT mi.id, mi.item_name, mi.description, mi.price, mi.item_img AS image,
	   mi.is_available, mi.category_id, c.name AS category_name, mi.archived_at
FROM menu_items mi
LEFT JOIN categories c ON c.id = mi.category_id
WHERE mi.restaurant_id = $1 AND mi.archived_at IS NOT NULL
ORDER BY mi.archived_at DESC, mi.item_name
`;

export const FIND_BRANCH_EARNINGS = `
SELECT restaurant_id, SUM(restaurant_earning) AS total_earning, COUNT(*) AS total_orders
FROM sell_inquiry
WHERE restaurant_id = $1 AND created_at BETWEEN $2 AND $3
GROUP BY restaurant_id
`;

