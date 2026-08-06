export const Find_Restaurants = `SELECT * FROM RESTAURANTS R 
WHERE ($1 IS NULL OR name ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%') 
AND ($2 IS NULL OR EXISTS (
  SELECT 1 FROM MENUITEMS M 
  JOIN CATEGORY C ON M.category_id = C.id
  WHERE R.id = M.restaurant_id
  AND C.name = $2)) 
ORDER BY status DESC, rating DESC 
LIMIT $4`;
