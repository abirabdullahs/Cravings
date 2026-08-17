export const ADD_TO_CART = `
INSERT INTO cart_items (customer_id, product_id, quantity)
VALUES ($1, $2, $3)
ON CONFLICT (customer_id, product_id)
DO UPDATE SET quantity = cart_items.quantity + $3
RETURNING *
`;

export const UPDATE_CART_QUANTITY = `
UPDATE cart_items
SET quantity = $3
WHERE customer_id = $1 AND product_id = $2
RETURNING *
`;

export const GET_CART = `
SELECT ci.product_id, p.name, p.price, ci.quantity,
       (p.price * ci.quantity) AS subtotal
FROM cart_items ci
JOIN products p ON p.id = ci.product_id
WHERE ci.customer_id = $1
`;

export const REMOVE_CART_ITEM = `
DELETE FROM cart_items WHERE customer_id = $1 AND product_id = $2
`;

export const CLEAR_CART = `
DELETE FROM cart_items WHERE customer_id = $1
`;
