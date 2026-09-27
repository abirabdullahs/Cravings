export const GET_RESTAURANTS_BY_LOCATION = `
SELECT id, name, address, image
FROM restaurants
WHERE active_status = true AND archived_at IS NULL AND area = $1
ORDER BY name
`;

export const SEARCH_RESTAURANTS_BY_NAME = `
SELECT id, name, address, image, 'restaurant' AS match_type
FROM restaurants
WHERE active_status = true AND archived_at IS NULL AND name ILIKE '%' || $1 || '%'
`;

export const SEARCH_RESTAURANTS_BY_PRODUCT_NAME = `
SELECT DISTINCT r.id, r.name, r.address, r.image, 'product' AS match_type
FROM restaurants r
JOIN menu_items p ON p.restaurant_id = r.id
WHERE r.active_status = true AND r.archived_at IS NULL
  AND p.is_available = true
  AND p.item_name ILIKE '%' || $1 || '%'
`;

export const FIND_RESTAURANT_DETAILS = `
SELECT c.id AS category_id, c.name AS category_name,
       p.id , p.item_name, p.price, p.item_img as image, p.is_available
FROM menu_items p
left JOIN categories c ON p.category_id = c.id
WHERE p.restaurant_id = $1 AND p.is_available = true AND p.archived_at IS NULL
ORDER BY c.name, p.item_name
`;

export const GET_BRANCHES_BY_NAME = `
SELECT id, name, address
FROM restaurants
WHERE name = $1 AND active_status = true AND archived_at IS NULL
`;

export const GET_CUSTOMER_PROFILE = `
SELECT id, name, phone, email, profile_image
FROM users
WHERE id = $1
`;

export const UPDATE_CUSTOMER_PROFILE = `
UPDATE users
SET name = $2, phone = $3, profile_image = $4
WHERE id = $1
RETURNING id, name, phone, profile_image
`;




export const FIND_RESTAURANTS = `SELECT id, name, rating,
  (R.active_status AND
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
  ) AS active_status,
  opening_time, image, minimum_order, delivery_fee, cuisines
FROM RESTAURANTS R 
WHERE ($1::text IS NULL OR name ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%') 
AND ($2::text IS NULL OR $2 = ANY(R.cuisines) )
AND ($3::text IS NULL OR R.area = $3)
AND ($4::int IS NULL OR R.id = $4)
AND R.archived_at IS NULL

`;

// export const Find_Restaurant = `SELECT id, name, rating, status, address, opening_time, closing_time, image FROM RESTAURANTS WHERE id = $1`;

// export const Find_Restaurant_Menu = `SELECT id, item_name, description, price, stock, item_img, C.name 
// FROM menu_items JOIN categories C ON C.id = category_id
// WHERE restaurant_id = $1
// ORDER BY C.name`;
