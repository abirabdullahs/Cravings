export const GET_RESTAURANTS_BY_LOCATION = `
SELECT id, name, address, image
FROM restaurants
WHERE active_status = true AND location_area = $1
ORDER BY name
`;

export const SEARCH_RESTAURANTS_BY_NAME = `
SELECT id, name, address, image, 'restaurant' AS match_type
FROM restaurants
WHERE active_status = true AND name ILIKE '%' || $1 || '%'
`;

export const SEARCH_RESTAURANTS_BY_PRODUCT_NAME = `
SELECT DISTINCT r.id, r.name, r.address, r.image, 'product' AS match_type
FROM restaurants r
JOIN menuItems p ON p.restaurant_id = r.id
WHERE r.active_status = true
  AND p.is_available = true
  AND p.name ILIKE '%' || $1 || '%'
`;

export const FIND_RESTAURANT_DETAILS = `
SELECT c.id AS category_id, c.name AS category_name,
       p.id , p.item_name, p.price, p.item_img, p.is_available
FROM categories c
JOIN menu_items p ON p.category_id = c.id
WHERE c.restaurant_id = $1 AND p.is_available = true
ORDER BY c.name, p.item_name
`;

export const GET_BRANCHES_BY_NAME = `
SELECT id, name, address
FROM restaurants
WHERE name = $1 AND active_status = true
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




export const FIND_RESTAURANTS = `SELECT id, name, rating, active_status, opening_time, image , minimum_order, delivery_fee, cuisines
FROM RESTAURANTS R 
WHERE ($1::text IS NULL OR name ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%') 
AND ($2::text IS NULL OR $2 = ANY(R.cuisines) )
AND ($3::text IS NULL OR R.area = $3)
AND ($4::int IS NULL OR R.id = $4)

`;

// export const Find_Restaurant = `SELECT id, name, rating, status, address, opening_time, closing_time, image FROM RESTAURANTS WHERE id = $1`;

// export const Find_Restaurant_Menu = `SELECT id, item_name, description, price, stock, item_img, C.name 
// FROM menu_items JOIN categories C ON C.id = category_id
// WHERE restaurant_id = $1
// ORDER BY C.name`;
