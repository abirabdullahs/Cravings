CREATE OR REPLACE PROCEDURE creation_of_order (
    p_user_id INT,
    p_cart_id INT,
    p_adress_id INT,
    p_delivery_fee INT,
    p_payment_method VARCHAR(255),
    INOUT p_order_id INT DEFAULT NULL  )
  LANGUAGE plpgsql AS $$

  DECLARE 
    v_restaurant_id INT,
    v_total_amount INT,
    v_discount INT
  BEGIN

    SELECT  C.restaurant_id, COALESCE(SUM(ci.quantity * mi.price), 0), fn_calculate_discount(CU.discount_value, CU.discount_type, COALESCE(SUM(ci.quantity * mi.price), 0))
    FROM carts C LEFT
    JOIN cartItems CI ON C.id = CI.cart_id
    JOIN menuItems M ON CI.menu_item_id=M.id
    LEFT JOIN userCoupons UC ON UC.id = C.user_coupons_id 
    JOIN coupons CU ON CU.id = UC.coupon_id
    WHERE C.id = p_cart_id
    GROUP BY C.restaurant_id, CU.discount_type, CU.discount_value ;
    
    INSERT INTO orders (user_id, restaurant_id, address_id, total_amount, delivery_fee, discount)
    VALUES (p_user_id, v_restaurant_id, p_adress_id, v_total_amount, p_delivery_fee, v_discount)
    RETURNING id INTO p_order_id;

    INSERT INTO orderItems (menu_item_id, quantity, unit_price, subtotal, order_id)
    SELECT C.menu_item_id, C.quantity, M.price unit_price, C.quantity * M.price  subtotal, p_order_id  order_id
    FROM cartItems C JOIN menuItems M ON C.menu_item_id=M.id
    WHERE C.cart_id = p_cart_id;

    
    INSERT INTO payments (order_id, amount, payment_method) VALUES (p_order_id, v_total_amount - v_discount + p_delivery_fee, p_payment_method);

    INSERT INTO deliveries (order_id, rider_id, order_status) VALUES (p_order_id, NULL, 'UNASSIGNED');


    DELETE FROM carts WHERE id = p_cart_id;
    -- cartItems delete handled by on cascade

    -- UPDATE menuItems SET stock = stock - 1 WHERE id IN (
    -- SELECT C.menu_item_id
    -- FROM cartItems C JOIN menuItems M ON C.menu_item_id=M.id
    -- WHERE C.cart_id = p_cart_id );

    DELETE FROM userCoupons WHERE id = (
    SELECT C.user_coupons_id
    FROM carts C
    WHERE C.id = p_cart_id);

    

    END;
  $$; 