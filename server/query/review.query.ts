// export const SUBMIT_REVIEW = `
// INSERT INTO reviews (menu_item_id, user_id, order_id, rating, comment, created_at)
// SELECT $1, $2, $3, $4, $5, NOW()
// WHERE EXISTS (
//   SELECT 1 FROM orders WHERE id = $3 AND user_id = $2 AND status = 'delivered'
// )
// RETURNING *
// `;

export const INSERT_REVIEW =`
INSERT INTO reviews (user_id, order_id, restaurant_id, rider_id, rating, rider_rating, comment)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, order_id AS "orderId", rating, rider_rating AS "riderRating", comment, created_at AS "createdAt";
`;

export const GET_PRODUCT_REVIEWS = `
SELECT rv.rating, rv.comment, rv.created_at, u.name AS customer_name
FROM reviews rv
JOIN users u ON u.id = rv.user_id
WHERE rv.menu_item_id = $1
ORDER BY rv.created_at DESC
LIMIT $2 OFFSET $3
`;

export const GET_RESTAURANT_REVIEWS = `
SELECT rv.id, rv.rating, rv.comment, rv.created_at, u.name AS customer_name
FROM reviews rv
JOIN users u ON u.id = rv.user_id
WHERE rv.restaurant_id = $1
ORDER BY rv.created_at DESC
LIMIT 20;
`;

export const GET_RIDER_REVIEWS = `
SELECT rv.id, rv.order_id, rv.rider_rating AS rating, rv.comment,
  rv.created_at, u.name AS customer_name, r.name AS restaurant_name
FROM reviews rv
JOIN users u ON u.id = rv.user_id
JOIN restaurants r ON r.id = rv.restaurant_id
WHERE rv.rider_id = $1 AND rv.rider_rating IS NOT NULL
ORDER BY rv.created_at DESC
LIMIT 20;
`;
