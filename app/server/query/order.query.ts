export const CALL_CREATE_ORDER_PROCEDURE = `
CALL creation_of_order($1, $2, $3, $4, $5, NULL);
`;
//all orders of one user
export const GET_USER_ORDERS = `
SELECT 
  O.id, 
  R.name restaurant_name, 
  O.total_amount, 
  O.status, 
  O.created_at,
  COUNT(OI.id) total_items
FROM orders O
JOIN restaurants R ON R.id = O.restaurant_id
LEFT JOIN order_items OI ON OI.order_id = O.id
WHERE O.user_id = $1
GROUP BY O.id, R.name
ORDER BY O.created_at DESC
`;
//orders of one restaurant

//order detail of one
export const FIND_ORDER_DETAIL = 
 `SELECT o.id, r.name AS restaurant_name, mi.name AS menu_item_name, oi.quantity, oi.unit_price, oi.subtotal  
  FROM orders O JOIN restaurants R ON R.id = O.restaurant_id
  LEFT JOIN orderItems OI ON O.id = OI.order_id
  JOIN menuItems MI ON MI.id = OI.menu_item_id
  WHERE O.id = $1
  ;`;

//cancel order by user
export const CANCEL_ORDER = `UPDATE orders SET status = 'CANCELLED' WHERE id = $1 AND user_id = $2 RETURNING *;`;
export const CANCEL_DELIVERY_ON_ORDER_CANCEL = `
UPDATE deliveries
SET status = 'cancelled'
WHERE order_id = $1 AND status = 'unassigned';
`;
// const Increase_Stock = `
// WITH cart_data AS (
// SELECT C.menu_item_id, C.quantity
// FROM cartItems C
// WHERE C.cart_id = $1
// )
// UPDATE menuItems SET stock = stock - cart_data.quantity WHERE id = cart_data.menu_item_id;
// `;

//******THIS IS MADE INTO A PROCEDURE*******

/**
 *  press order
 * cart data send in route
 * {
 *   userId
 *   addressId
 *   deliveryFee
 *   cartId
 *   paymentMethod
 * }
 * create order row orderitems
 * reduce restaurant stock
 * DELETE COUPON
 * delete cart cart item
 * add payments
 * add delivery
 *
 * then avaible in rider.
 * rider clicks
 * order update
 * delivery added status chanbed
 *
 */

// const Insert_Order = `INSERT INTO orders (user_id, restaurant_id, address_id, total_amount, delivery_fee, discount)
// SELECT $1, C.restaurant_id, $3, SUM(C.quantity * M.price) total_amount, $4,
//   CASE
//     WHEN CU.discount_type = 'PERCENT' THEN total_amountNOTHERE * (1 - (CU.discount_value / 100.0)).
//     ELSE total_amount - CU.discount_value
//   END
// FROM carts C LEFT JOIN cartItems CI ON C.id = CI.cart_id
// JOIN menuItems M ON CI.menu_item_id=M.id
// LEFT JOIN userCoupouns UC ON UC.id = C.user_coupons_id
// JOIN coupouns CU ON CU.id = UC.coupon_id
// WHERE C.id = $2
// GROUP BY C.restaurant_id, CU.discount_type, CU.discount_value
// RETURNING *;`;

// const Insert_Order_Items =
// `INSERT INTO orderItems (menu_item_id, quantity, unit_price, subtotal, order_id)
// SELECT C.menu_item_id, C.quantity, M.price AS unit_price, C.quantity * M.price AS subtotal, $1 AS order_id
// FROM cartItems C JOIN menuItems M ON C.menu_item_id=M.id
// WHERE C.cart_id = $2
// RETURNING *;
// `
// const Delete_Cart = `DELETE FROM carts WHERE C.id = $1`

// const Reduce_Stock = `UPDATE menuItems SET stock = stock - 1 WHERE  id  IN (
// SELECT C.menu_item_id
// FROM cartItems C JOIN menuItems M ON C.menu_item_id=M.id
// WHERE C.cart_id = $1 )
// RETURNING *;`

// const Delete_User_Coupon = `DELETE FROM userCoupons WHERE id = (
//   SELECT C.user_coupons_id
//   FROM carts C
//   WHERE C.id = $1)
//   RETURNING *;`

// const Insert_Payment = `INSERT INTO payments (order_id, amount, payment_method) VALUES ($1, $2, $3) RETURNING *;`
// const Insert_Delivery = `INSERT INTO deliveries (order_id, rider_id, order_status) VALUES (new_order_id, NULL, 'UNASSIGNED');`

//-----------------------------------------------------------------------------//

//abirs same code
// export const GET_UNAVAILABLE_CART_ITEMS = `
// SELECT ci.product_id, p.name, p.is_available
// FROM cart_items ci
// JOIN products p ON p.id = ci.product_id
// WHERE ci.customer_id = $1 AND p.is_available = false
// `;

// export const CREATE_ORDER = `
// INSERT INTO orders (customer_id, restaurant_id, status, total_amount, delivery_charge, platform_fee, created_at)
// VALUES ($1, $2, 'accepted', $3, $4, $5, NOW())
// RETURNING id
// `;

// export const INSERT_ORDER_ITEMS = `
// INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
// SELECT $1, p.id, c.quantity, p.price, (p.price * c.quantity)
// FROM cart_items c
// JOIN products p ON p.id = c.product_id
// WHERE c.customer_id = $2
// `;

// export const GET_ORDER_STATUS = `
// SELECT id, status, total_amount, delivery_charge, created_at
// FROM orders
// WHERE id = $1
// `;

// export const GET_CUSTOMER_ORDERS = `
// SELECT id, restaurant_id, status, total_amount, created_at
// FROM orders
// WHERE customer_id = $1
// ORDER BY created_at DESC
// LIMIT $2 OFFSET $3
// `;
