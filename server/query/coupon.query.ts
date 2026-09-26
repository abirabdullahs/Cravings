export const FIND_AVAILABLE_USER_COUPONS = `
SELECT assignment.id, coupon.code, coupon.discount_type,
       coupon.discount_value, coupon.minimum_order, coupon.expiry_date
FROM user_coupons assignment
JOIN coupons coupon ON coupon.id = assignment.coupon_id
WHERE assignment.user_id = $1
  AND assignment.used = FALSE
  AND (coupon.expiry_date IS NULL OR coupon.expiry_date >= CURRENT_DATE)
ORDER BY coupon.expiry_date NULLS LAST, coupon.id DESC;
`;

export const SET_CART_USER_COUPON = `
UPDATE carts c
SET user_coupon_id = $3
WHERE c.id = $1
  AND c.user_id = $2
  AND (
    $3::int IS NULL OR EXISTS (
      SELECT 1
      FROM user_coupons assignment
      JOIN coupons coupon ON coupon.id = assignment.coupon_id
      WHERE assignment.id = $3
        AND assignment.user_id = $2
        AND assignment.used = FALSE
        AND (coupon.expiry_date IS NULL OR coupon.expiry_date >= CURRENT_DATE)
    )
  )
RETURNING c.id, c.user_coupon_id;
`;
