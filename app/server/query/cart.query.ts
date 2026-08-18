const Find_Cart = `SELECT * FROM carts WHERE user_id = $1 AND restaurant_id = $2;`;

const Insert_Cart = `INSERT INTO carts (user_id, restaurant_id) values($1, $2);`;

const Upsert_Cart_Item = 
 `INSERT INTO cartitems (menu_item_id, quantity, cart_id) 
  VALUES ($1, $2, $3)
  ON CONFLICT (cart_id, menu_item_id) 
  DO UPDATE SET quantity = cartitems.quantity + EXCLUDED.quantity
  RETURNING *;`;

// create a trigger to delete item when quantity <=0

const Find_Cart_Items = 
 `SELECT id, cart_id, MI.name menu_item_name, MI.price, quantity, R.name restaurant_name FROM cartItems CI
  JOIN cart C ON C.id = CI.cart_id
  JOIN menuItems MI ON MI.id = CI.menu_item_id
  JOIN restaurants R ON R.id = C.restaurant_id
  WHERE ( $1 is NULL OR C.restaurant_id = $1 )
  AND ( C.user_id = $2 )
  ;`;