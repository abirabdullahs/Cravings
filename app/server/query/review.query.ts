export const SUBMIT_REVIEW = `
INSERT INTO reviews (menu_item_id, user_id, order_id, rating, comment, created_at)
SELECT $1, $2, $3, $4, $5, NOW()
WHERE EXISTS (
  SELECT 1 FROM orders WHERE id = $3 AND user_id = $2 AND status = 'delivered'
)
RETURNING *
`;

export const GET_PRODUCT_REVIEWS = `
SELECT rv.rating, rv.comment, rv.created_at, u.name AS customer_name
FROM reviews rv
JOIN users u ON u.id = rv.user_id
WHERE rv.menu_item_id = $1
ORDER BY rv.created_at DESC
LIMIT $2 OFFSET $3
`;
