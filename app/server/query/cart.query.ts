const FIND_CART = `SELECT * FROM carts WHERE user_id = $1 AND restaurant_id = $2;`;

const INSERT_CART = `INSERT INTO carts (user_id, restaurant_id) values($1, $2);`;

const UPSERT_CART_ITEM = 
 `INSERT INTO cartItems (menu_item_id, quantity, cart_id) 
  VALUES ($1, $2, $3)
  ON CONFLICT (cart_id, menu_item_id) 
  DO UPDATE SET quantity = cartitems.quantity + EXCLUDED.quantity
  RETURNING *;`;

// create a trigger to delete item when quantity <=0  *done

const FIND_CART_ITEMS = 
 `SELECT id, cart_id, MI.item_name AS menu_item_name, MI.price, quantity, R.name AS restaurant_name 
  FROM cartItems CI
  JOIN cart C ON C.id = CI.cart_id
  JOIN menuItems MI ON MI.id = CI.menu_item_id
  JOIN restaurants R ON R.id = C.restaurant_id
  WHERE ( $1 is NULL OR C.restaurant_id = $1 )
  AND ( C.user_id = $2 )
  ;`;


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

