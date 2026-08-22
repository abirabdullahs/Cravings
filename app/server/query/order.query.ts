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

// // orders of one user
//orders of one restaurant

//order detail of one
const Find_Order_Detail = `SELECT O.id, R.name restaurant_name, M.item_name menu_item_name, OI.quantity, OI.unit_price, OI.subtotal  
  FROM orders O JOIN restaurants R ON R.id = O.restaurant_id
  LEFT JOIN orderItems OI ON O.id = OI.order_id
  JOIN menuItems MI ON MI.id = OI.menu_item_id
  WHERE O.id = $1
  ;`;

//cancel order by user
const Cancel_Order = `UPDATE orders SET status = 'CANCELLED' WHERE id = $1 RETURNING *;`;
const Increase_Stock = `
WITH cart_data AS (
SELECT C.menu_item_id, C.quantity
FROM cartItems C 
WHERE C.cart_id = $1
)
UPDATE menuItems SET stock = stock - cart_data.quantity WHERE id = cart_data.menu_item_id;
`

