export const GET_RESTAURANTS_BY_LOCATION = `
SELECT id, name, address, image
FROM restaurants
WHERE status = 'active' AND location_area = $1
ORDER BY name
`;

export const SEARCH_RESTAURANTS_BY_NAME = `
SELECT id, name, address, image, 'restaurant' AS match_type
FROM restaurants
WHERE status = 'active' AND name ILIKE '%' || $1 || '%'
`;

export const SEARCH_RESTAURANTS_BY_PRODUCT_NAME = `
SELECT DISTINCT r.id, r.name, r.address, r.image, 'product' AS match_type
FROM restaurants r
JOIN products p ON p.restaurant_id = r.id
WHERE r.status = 'active'
  AND p.is_available = true
  AND p.name ILIKE '%' || $1 || '%'
`;

export const GET_RESTAURANT_DETAIL = `
SELECT c.id AS category_id, c.name AS category_name,
       p.id AS product_id, p.name AS product_name, p.price, p.image, p.is_available
FROM categories c
JOIN products p ON p.category_id = c.id
WHERE c.restaurant_id = $1 AND p.is_available = true
ORDER BY c.name, p.name
`;

export const GET_BRANCHES_BY_NAME = `
SELECT id, name, address
FROM restaurants
WHERE name = $1 AND status = 'active'
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
