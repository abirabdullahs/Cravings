export const CALL_CREATE_ORDER_PROCEDURE = `
CALL creation_of_order($1, $2, $3, $4, $5::UUID, $6, NULL);
`;
export const GET_ORDER_QUOTE = `
SELECT subtotal, discount, delivery_fee, tax, final_total
FROM calculate_order_quote($1, $2, $3);
`;
export const GET_USER_ORDERS = `
SELECT 
  o.id,
  o.restaurant_id,
  r.name AS restaurant_name,
  o.total_amount, 
  o.order_status, 
  o.created_at,
  COUNT(oi.id)::int AS total_items,
  d.rider_id,
  rider.name AS rider_name,
  EXISTS (SELECT 1 FROM reviews review WHERE review.order_id = o.id) AS is_reviewed
FROM orders o
JOIN restaurants r ON r.id = o.restaurant_id
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN deliveries d ON d.order_id = o.id
LEFT JOIN users rider ON rider.id = d.rider_id
WHERE o.user_id = $1
GROUP BY o.id, r.name, d.rider_id, rider.name
ORDER BY o.created_at DESC;
`;

export const GET_RESTAURANT_ORDERS = `
SELECT 
  o.id, 
  u.name AS customer_name, 
  o.total_amount, 
  o.order_status, 
  o.created_at,
  COUNT(oi.id)::int AS total_items
FROM orders o
JOIN users u ON u.id = o.user_id
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.restaurant_id = $1
  AND o.order_status IN ('pending', 'confirmed', 'preparing', 'ready')
GROUP BY o.id, u.name
ORDER BY o.created_at DESC;
`;

export const MARK_ORDER_READY = `
UPDATE orders
SET order_status = 'ready'
WHERE id = $1
  AND restaurant_id = $2
  AND order_status IN ('pending', 'confirmed', 'preparing')
RETURNING id, order_status;
`;

export const FIND_ORDER_DETAIL = `
SELECT 
  o.id AS order_id,
  oi.id AS item_id,
  mi.item_name,
  oi.quantity,
  oi.unit_price,
  oi.subtotal AS item_subtotal,
  COALESCE(SUM(oi.subtotal) OVER (), 0)::NUMERIC(10,2) AS subtotal,
  o.discount,
  o.delivery_fee,
  ROUND(
    o.total_amount - COALESCE(SUM(oi.subtotal) OVER (), 0) + o.discount - o.delivery_fee,
    2
  ) AS tax,
  o.total_amount,
  p.paid_at,
  p.transaction_id,
  o.delivery_instructions
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.id = $1 AND o.user_id = $2
ORDER BY oi.id;
`;

export const GET_ORDER_TRACKING_FOR_CUSTOMER = `
SELECT
  o.id AS order_id,
  o.restaurant_id,
  o.order_status,
  d.status AS delivery_status,
  d.assigned_at,
  r.name AS restaurant_name,
  r.address AS restaurant_address,
  r.phone AS restaurant_phone,
  r.latitude AS restaurant_latitude,
  r.longitude AS restaurant_longitude,
  ua.address AS dropoff_address,
  ua.latitude AS dropoff_latitude,
  ua.longitude AS dropoff_longitude,
  rider_user.name AS rider_name,
  rider_user.phone AS rider_phone,
  d.rider_id,
  latest_location.latitude AS rider_latitude,
  latest_location.longitude AS rider_longitude,
  latest_location.recorded_at AS rider_location_recorded_at,
  CASE
    WHEN r.latitude IS NOT NULL AND r.longitude IS NOT NULL
      AND ua.latitude IS NOT NULL AND ua.longitude IS NOT NULL
    THEN calculate_distance_km(r.latitude, r.longitude, ua.latitude, ua.longitude)
    ELSE NULL
  END AS distance_km,
  o.total_amount,
  p.payment_method,
  (SELECT COUNT(*)::int FROM order_items oi WHERE oi.order_id = o.id) AS item_count
FROM orders o
JOIN restaurants r ON r.id = o.restaurant_id
JOIN user_addresses ua ON ua.id = o.address_id
LEFT JOIN deliveries d ON d.order_id = o.id
LEFT JOIN users rider_user ON rider_user.id = d.rider_id
LEFT JOIN LATERAL (
  SELECT latitude, longitude, recorded_at
  FROM delivery_location_history
  WHERE delivery_id = d.id
  ORDER BY recorded_at DESC, id DESC
  LIMIT 1
) latest_location ON TRUE
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.id = $1 AND o.user_id = $2
`;

//cancel order by user
export const CANCEL_ORDER = `UPDATE orders SET order_status = 'cancelled' WHERE id = $1 AND user_id = $2 RETURNING *;`;
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
 *   cartId
 *   paymentMethod
 *   idempotencyKey
 *   deliveryInstructions
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
