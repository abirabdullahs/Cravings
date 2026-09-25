DROP FUNCTION IF EXISTS fn_calculate_discount(
  NUMERIC,
  discount_type_enum,
  NUMERIC
);

CREATE FUNCTION fn_calculate_discount(
  p_discount_value NUMERIC,
  p_discount_type discount_type_enum,
  p_subtotal NUMERIC
)
RETURNS NUMERIC(10,2)
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT ROUND(
    GREATEST(
      0,
      LEAST(
        COALESCE(p_subtotal, 0),
        CASE p_discount_type
          WHEN 'percentage' THEN
            COALESCE(p_subtotal, 0) * COALESCE(p_discount_value, 0) / 100
          WHEN 'fixed_amount' THEN COALESCE(p_discount_value, 0)
          ELSE 0
        END
      )
    ),
    2
  )::NUMERIC(10,2);
$$;

CREATE OR REPLACE FUNCTION calculate_order_quote(
  p_user_id INT,
  p_cart_id INT,
  p_address_id INT
)
RETURNS TABLE (
  restaurant_id INT,
  subtotal NUMERIC(10,2),
  discount NUMERIC(10,2),
  delivery_fee NUMERIC(10,2),
  tax NUMERIC(10,2),
  final_total NUMERIC(10,2),
  user_coupon_id INT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_restaurant_latitude NUMERIC;
  v_restaurant_longitude NUMERIC;
  v_address_latitude NUMERIC;
  v_address_longitude NUMERIC;
  v_fallback_delivery_fee NUMERIC(10,2);
BEGIN
  SELECT
    C.restaurant_id,
    C.user_coupon_id,
    R.delivery_fee,
    R.latitude,
    R.longitude,
    A.latitude,
    A.longitude,
    COALESCE(SUM(CI.quantity * MI.price), 0)::NUMERIC(10,2)
  INTO
    restaurant_id,
    user_coupon_id,
    v_fallback_delivery_fee,
    v_restaurant_latitude,
    v_restaurant_longitude,
    v_address_latitude,
    v_address_longitude,
    subtotal
  FROM carts C
  JOIN restaurants R ON R.id = C.restaurant_id
  JOIN user_addresses A
    ON A.id = p_address_id
   AND A.user_id = p_user_id
  LEFT JOIN cart_items CI ON CI.cart_id = C.id
  LEFT JOIN menu_items MI ON MI.id = CI.menu_item_id
  WHERE C.id = p_cart_id
    AND C.user_id = p_user_id
  GROUP BY C.restaurant_id, C.user_coupon_id, R.id, A.id;

  IF restaurant_id IS NULL THEN
    RETURN;
  END IF;

  SELECT fn_calculate_discount(
    CU.discount_value,
    CU.discount_type,
    subtotal
  )
  INTO discount
  FROM user_coupons UC
  JOIN coupons CU ON CU.id = UC.coupon_id
  WHERE UC.id = user_coupon_id
    AND UC.user_id = p_user_id
    AND UC.used = FALSE
    AND (CU.expiry_date IS NULL OR CU.expiry_date >= CURRENT_DATE)
    AND subtotal >= CU.minimum_order;

  IF discount IS NULL THEN
    discount := 0;
    user_coupon_id := NULL;
  END IF;

  IF v_restaurant_latitude IS NOT NULL
    AND v_restaurant_longitude IS NOT NULL
    AND v_address_latitude IS NOT NULL
    AND v_address_longitude IS NOT NULL
  THEN
    delivery_fee := calculate_delivery_fee(
      calculate_distance_km(
        v_restaurant_latitude,
        v_restaurant_longitude,
        v_address_latitude,
        v_address_longitude
      )
    );
  ELSE
    delivery_fee := COALESCE(v_fallback_delivery_fee, 0);
  END IF;

  tax := ROUND(subtotal * 0.03, 2);
  final_total := ROUND(subtotal - discount + delivery_fee + tax, 2);

  RETURN NEXT;
END;
$$;

DROP PROCEDURE IF EXISTS creation_of_order(
  INT,
  INT,
  INT,
  INT,
  VARCHAR,
  INT
);

DROP PROCEDURE IF EXISTS creation_of_order(
  INT,
  INT,
  INT,
  VARCHAR,
  UUID,
  INT
);

CREATE OR REPLACE PROCEDURE creation_of_order(
  p_user_id INT,
  p_cart_id INT,
  p_address_id INT,
  p_payment_method VARCHAR(255),
  p_idempotency_key UUID,
  p_delivery_instructions TEXT,
  INOUT p_order_id INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_restaurant_id INT;
  v_cart_coupon_id INT;
  v_minimum_order NUMERIC(10,2);
  v_restaurant_active BOOLEAN;
  v_item_count INT;
  v_invalid_item_count INT;
  v_subtotal NUMERIC(10,2);
  v_discount NUMERIC(10,2);
  v_delivery_fee NUMERIC(10,2);
  v_final_total NUMERIC(10,2);
  v_user_coupon_id INT;
BEGIN
  IF p_payment_method NOT IN ('cash', 'bkash', 'nagad', 'card') THEN
    RAISE EXCEPTION 'Payment method is invalid';
  END IF;

  -- A retry after a successful checkout returns the original order.
  SELECT O.id
  INTO p_order_id
  FROM orders O
  WHERE O.user_id = p_user_id
    AND O.idempotency_key = p_idempotency_key;

  IF p_order_id IS NOT NULL THEN
    RETURN;
  END IF;

  -- Only one checkout can consume this cart at a time.
  SELECT
    C.restaurant_id,
    C.user_coupon_id,
    R.minimum_order,
    R.active_status
  INTO
    v_restaurant_id,
    v_cart_coupon_id,
    v_minimum_order,
    v_restaurant_active
  FROM carts C
  JOIN restaurants R ON R.id = C.restaurant_id
  WHERE C.id = p_cart_id
    AND C.user_id = p_user_id
  FOR UPDATE OF C
  FOR SHARE OF R;

  IF v_restaurant_id IS NULL THEN
    -- A concurrent request may have completed while this request waited.
    SELECT O.id
    INTO p_order_id
    FROM orders O
    WHERE O.user_id = p_user_id
      AND O.idempotency_key = p_idempotency_key;

    IF p_order_id IS NOT NULL THEN
      RETURN;
    END IF;

    RAISE EXCEPTION 'Cart not found';
  END IF;

  IF NOT v_restaurant_active THEN
    RAISE EXCEPTION 'Restaurant is not accepting orders';
  END IF;

  PERFORM 1
  FROM user_addresses A
  WHERE A.id = p_address_id
    AND A.user_id = p_user_id
    AND BTRIM(A.address) <> ''
    AND BTRIM(A.city) <> ''
  FOR SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Delivery address not found';
  END IF;

  PERFORM 1
  FROM cart_items CI
  JOIN menu_items MI ON MI.id = CI.menu_item_id
  WHERE CI.cart_id = p_cart_id
  FOR UPDATE OF CI
  FOR SHARE OF MI;

  SELECT
    COUNT(*)::INT,
    COUNT(*) FILTER (
      WHERE MI.restaurant_id <> v_restaurant_id
        OR MI.is_available = FALSE
    )::INT
  INTO v_item_count, v_invalid_item_count
  FROM cart_items CI
  JOIN menu_items MI ON MI.id = CI.menu_item_id
  WHERE CI.cart_id = p_cart_id;

  IF v_item_count = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  IF v_invalid_item_count > 0 THEN
    RAISE EXCEPTION 'Cart contains unavailable items';
  END IF;

  IF v_cart_coupon_id IS NOT NULL THEN
    PERFORM 1
    FROM user_coupons UC
    WHERE UC.id = v_cart_coupon_id
    FOR UPDATE;
  END IF;

  SELECT
    Q.subtotal,
    Q.discount,
    Q.delivery_fee,
    Q.final_total,
    Q.user_coupon_id
  INTO
    v_subtotal,
    v_discount,
    v_delivery_fee,
    v_final_total,
    v_user_coupon_id
  FROM calculate_order_quote(p_user_id, p_cart_id, p_address_id) Q;

  IF v_subtotal < v_minimum_order THEN
    RAISE EXCEPTION 'Minimum order amount is %', v_minimum_order;
  END IF;

  IF v_cart_coupon_id IS NOT NULL AND v_user_coupon_id IS NULL THEN
    RAISE EXCEPTION 'Coupon is no longer valid';
  END IF;

  INSERT INTO orders (
    user_id,
    restaurant_id,
    address_id,
    idempotency_key,
    delivery_instructions,
    total_amount,
    delivery_fee,
    discount
  )
  VALUES (
    p_user_id,
    v_restaurant_id,
    p_address_id,
    p_idempotency_key,
    NULLIF(BTRIM(p_delivery_instructions), ''),
    v_final_total,
    v_delivery_fee,
    v_discount
  )
  ON CONFLICT (user_id, idempotency_key) DO NOTHING
  RETURNING id INTO p_order_id;

  IF p_order_id IS NULL THEN
    SELECT O.id
    INTO p_order_id
    FROM orders O
    WHERE O.user_id = p_user_id
      AND O.idempotency_key = p_idempotency_key;
    RETURN;
  END IF;

  INSERT INTO order_items (
    menu_item_id,
    quantity,
    unit_price,
    subtotal,
    order_id
  )
  SELECT
    CI.menu_item_id,
    CI.quantity,
    MI.price,
    CI.quantity * MI.price,
    p_order_id
  FROM cart_items CI
  JOIN menu_items MI ON MI.id = CI.menu_item_id
  WHERE CI.cart_id = p_cart_id;

  INSERT INTO payments (
    order_id,
    amount,
    payment_method,
    status,
    paid_at,
    transaction_id
  )
  VALUES (
    p_order_id,
    v_final_total,
    p_payment_method,
    CASE
      WHEN p_payment_method = 'cash' THEN 'pending'::payment_status_enum
      ELSE 'completed'::payment_status_enum
    END,
    CASE WHEN p_payment_method = 'cash' THEN NULL ELSE NOW() END,
    CASE
      WHEN p_payment_method = 'cash' THEN NULL
      ELSE UPPER(p_payment_method) || '-MOCK-' ||
        SUBSTRING(p_idempotency_key::TEXT, 1, 8)
    END
  );

  INSERT INTO deliveries (order_id, rider_id, status)
  VALUES (p_order_id, NULL, 'unassigned');

  IF v_user_coupon_id IS NOT NULL THEN
    UPDATE user_coupons
    SET used = TRUE
    WHERE id = v_user_coupon_id
      AND used = FALSE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Coupon is no longer valid';
    END IF;
  END IF;

  DELETE FROM carts WHERE id = p_cart_id;
  -- cart_items deleted by cascade
END;
$$;
