export const Find_Restaurants = 
`SELECT id, name, rating, status, opening_time FROM RESTAURANTS R 
WHERE ($1 IS NULL OR name ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%') 
AND ($2 IS NULL OR EXISTS (
  SELECT 1 FROM MENUITEMS M 
  JOIN CATEGORY C ON M.category_id = C.id
  WHERE R.id = M.restaurant_id
  AND C.name = $2)) 
AND ($3 IS NULL OR R.id = $3)
ORDER BY status DESC, rating DESC 
LIMIT $4`;

export const Find_Restaurant = 
`SELECT id, name, rating, status, address, opening_time, closing_time FROM RESTAURANTS WHERE id = $1`;

export const Find_Restaurant_Menu = 
`SELECT id, item_name, description, price, stock, item_img, C.name 
FROM menu_items JOIN categories C ON C.id = category_id
WHERE restaurant_id = $1
ORDER BY C.name`;



