export const FIND_CART = `SELECT * FROM carts WHERE user_id = $1 AND restaurant_id = $2;`;

export const INSERT_CART = `
  INSERT INTO carts (user_id, restaurant_id)
  VALUES ($1, $2)
  RETURNING *;
`;

export const UPSERT_CART_ITEM = `INSERT INTO cart_items (menu_item_id, quantity, cart_id) 
  VALUES ($1, $2, $3)
  ON CONFLICT (cart_id, menu_item_id) 
  DO UPDATE SET quantity =  EXCLUDED.quantity
  RETURNING *;`;

export const FIND_CART_ITEMS = `SELECT CI.id, CI.menu_item_id, cart_id, C.restaurant_id, MI.item_name AS menu_item_name, MI.description, MI.price, quantity, R.name AS restaurant_name , MI.item_img AS image
  FROM cart_items CI
  JOIN carts C ON C.id = CI.cart_id
  JOIN menu_items MI ON MI.id = CI.menu_item_id
  JOIN restaurants R ON R.id = C.restaurant_id
    WHERE ( $1::integer IS NULL OR C.restaurant_id = $1 )
  AND ( C.user_id = $2 )
  ;`;

// create a trigger to delete item when quantity <=0  *done

// export const ADD_TO_CART = `
// INSERT INTO cart_items (customer_id, product_id, quantity)
// VALUES ($1, $2, $3)
// ON CONFLICT (customer_id, product_id)
// DO UPDATE SET quantity = cart_items.quantity + $3
// RETURNING *
// `;

// export const UPDATE_CART_QUANTITY = `
// UPDATE cart_items
// SET quantity = $3
// WHERE customer_id = $1 AND product_id = $2
// RETURNING *
// `;

// export const GET_CART = `
// SELECT ci.product_id, p.name, p.price, ci.quantity,
//        (p.price * ci.quantity) AS subtotal
// FROM cart_items ci
// JOIN products p ON p.id = ci.product_id
// WHERE ci.customer_id = $1
// `;

// export const REMOVE_CART_ITEM = `
// DELETE FROM cart_items WHERE customer_id = $1 AND product_id = $2
// `;

// export const CLEAR_CART = `
// DELETE FROM cart_items WHERE customer_id = $1
// `;
