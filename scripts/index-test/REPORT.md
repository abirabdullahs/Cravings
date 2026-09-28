# Cravings index benchmark: measured results

Generated: 2026-09-29T02:23:50+06:00
Database: `cravings_index_demo` · PostgreSQL `18.4`

The same seeded data and application queries were measured before and after
creating the secondary indexes from `03_indexes.sql`. Primary-key and UNIQUE
constraint indexes remain in both phases because the application requires them.
Each query has one warm-up followed by repeated `EXPLAIN (ANALYZE, BUFFERS)` runs;
the table reports the median.

| Query | Relevant index | Before | After | Speedup | Plan change | Buffers |
|---|---|---:|---:|---:|---|---:|
| Customer order history | `ix_orders_user, ix_order_items_order` | 127.361 ms | 114.668 ms | **1.1×** | Seq Scan + Bitmap Heap Scan + Bitmap Index Scan (uq_orders_user_idempotency) + Index Scan (users_pkey) → Seq Scan + Bitmap Heap Scan + Bitmap Index Scan (ix_orders_user) + Index Scan (users_pkey) | 13030 → 13031 |
| Restaurant active kitchen queue | `ix_orders_restaurant, ix_order_items_order` | 75.994 ms | 0.719 ms | **105.7×** | Seq Scan + Index Scan (users_pkey) + Index Scan (menu_items_pkey) → Bitmap Heap Scan + Bitmap Index Scan (ix_orders_restaurant) + Index Scan (users_pkey) + Index Scan (ix_order_items_order) + Index Scan (menu_items_pkey) | 10943 → 438 |
| Items of one order | `ix_order_items_order, ix_payments_order` | 56.722 ms | 0.248 ms | **228.7×** | Index Scan (orders_pkey) + Seq Scan + Index Scan (menu_items_pkey) → Index Scan (orders_pkey) + Index Scan (ix_payments_order) + Index Scan (ix_order_items_order) + Index Scan (menu_items_pkey) | 8841 → 26 |
| Restaurant menu | `ix_menu_items_restaurant_archived` | 1.187 ms | 0.370 ms | **3.2×** | Seq Scan → Seq Scan + Bitmap Heap Scan + Bitmap Index Scan (ix_menu_items_restaurant) | 147 → 47 |
| Latest customer notifications | `ix_notifications_user` | 31.835 ms | 5.500 ms | **5.8×** | Seq Scan → Bitmap Heap Scan + Bitmap Index Scan (ix_notifications_user) | 2537 → 2517 |
| Rider active delivery lookup | `ix_deliveries_rider, ix_order_items_order, ix_payments_order, ix_delivery_location_history_delivery_time` | 409.760 ms | 0.337 ms | **1215.9×** | Seq Scan + Index Scan (orders_pkey) + Index Scan (users_pkey) + Index Scan (user_addresses_pkey) → Index Scan (ix_deliveries_rider) + Index Scan (orders_pkey) + Index Scan (restaurants_pkey) + Index Scan (users_pkey) + Index Scan (user_addresses_pkey) + Index Scan (ix_payments_order) + Index Scan (ix_delivery_location_history_delivery_time) + Index Only Scan (ix_delivery_location_history_delivery_time) + Index Scan (ix_order_items_order) | 28168 → 37 |
| Latest GPS point of a delivery | `ix_delivery_location_history_delivery_time` | 49.286 ms | 0.061 ms | **808.0×** | Seq Scan → Index Scan (ix_delivery_location_history_delivery_time) | 5614 → 14 |
| Restaurant reviews | `ix_reviews_restaurant` | 8.925 ms | 5.563 ms | **1.6×** | Seq Scan → Bitmap Heap Scan + Bitmap Index Scan (ix_reviews_restaurant) + Seq Scan | 1100 → 1103 |
| Customer saved addresses | `ix_user_addresses_user` | 2.194 ms | 0.053 ms | **41.4×** | Seq Scan → Index Scan (ix_user_addresses_user) | 458 → 7 |
| Owner restaurant list | `ix_restaurants_owner_archived` | 0.112 ms | 0.062 ms | **1.8×** | Seq Scan → Index Scan (ix_restaurants_owner) | 13 → 6 |

## Storage cost

Database size: **307.4 MB → 370.8 MB** (+63.5 MB, +20.6%).

Indexes reduce reads by avoiding full-table scans, but consume disk and add
maintenance work to INSERT, UPDATE, and DELETE operations. During the demo,
point out the plan change from `Seq Scan` to `Index Scan` or
`Bitmap Index Scan`, plus the reduction in buffers touched.

## Live evaluator demonstration

```powershell
python scripts/index-test/benchmark.py live --query "Items of one order"
```

The command drops only that query's declared secondary indexes inside a
transaction, displays the before plan, rolls back to restore the indexes,
then displays the after plan. It does not mutate application data.

## Queries used

### Customer order history

```sql
SELECT o.id, o.restaurant_id, r.name AS restaurant_name, o.total_amount,
  o.order_status, o.created_at, COUNT(oi.id)::int AS total_items,
  d.rider_id, rider.name AS rider_name,
  EXISTS (SELECT 1 FROM reviews review WHERE review.order_id = o.id) AS is_reviewed
FROM orders o
JOIN restaurants r ON r.id = o.restaurant_id
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN deliveries d ON d.order_id = o.id
LEFT JOIN users rider ON rider.id = d.rider_id
WHERE o.user_id = 777
GROUP BY o.id, r.name, d.rider_id, rider.name
ORDER BY o.created_at DESC;
```

### Restaurant active kitchen queue

```sql
SELECT o.id, u.name AS customer_name, o.total_amount, o.order_status,
  o.created_at, o.delivery_instructions,
  COALESCE(SUM(oi.quantity), 0)::int AS total_items,
  COALESCE(
    json_agg(
      json_build_object(
        'id', oi.id,
        'name', mi.item_name,
        'quantity', oi.quantity
      ) ORDER BY oi.id
    ) FILTER (WHERE oi.id IS NOT NULL),
    '[]'::json
  ) AS items
FROM orders o
JOIN users u ON u.id = o.user_id
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
WHERE o.restaurant_id = 42
  AND o.order_status IN ('pending', 'confirmed', 'preparing', 'ready')
GROUP BY o.id, u.name
ORDER BY o.created_at DESC;
```

### Items of one order

```sql
SELECT o.id AS order_id, oi.id AS item_id, mi.item_name, oi.quantity,
  oi.unit_price, oi.subtotal AS item_subtotal,
  COALESCE(SUM(oi.subtotal) OVER (), 0)::NUMERIC(10,2) AS subtotal,
  o.discount, o.delivery_fee,
  ROUND(COALESCE(SUM(oi.subtotal) OVER (), 0) * 0.03, 2) AS tax,
  ROUND(GREATEST(
    o.total_amount - COALESCE(SUM(oi.subtotal) OVER (), 0) + o.discount
      - o.delivery_fee
      - ROUND(COALESCE(SUM(oi.subtotal) OVER (), 0) * 0.03, 2),
    0
  ), 2) AS platform_fee,
  o.total_amount, p.paid_at, p.transaction_id, o.delivery_instructions
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.id = 150000 AND o.user_id = 777
ORDER BY oi.id;
```

### Restaurant menu

```sql
SELECT mi.id, mi.item_name, mi.description, mi.price, mi.item_img AS image,
  mi.is_available, mi.category_id, c.name AS category_name, mi.archived_at
FROM menu_items mi
LEFT JOIN categories c ON c.id = mi.category_id
WHERE mi.restaurant_id = 42 AND mi.archived_at IS NULL
ORDER BY c.name NULLS LAST, mi.item_name;
```

### Latest customer notifications

```sql
SELECT id, user_id, order_id, title, message, is_read, created_at
FROM notifications
WHERE user_id = 777
ORDER BY created_at DESC
LIMIT 20;
```

### Rider active delivery lookup

```sql
SELECT o.id AS order_id, o.order_status, d.id AS delivery_id,
  d.status AS delivery_status, d.assigned_at,
  r.id AS restaurant_id, r.name AS restaurant_name,
  r.address AS restaurant_address, r.phone AS restaurant_phone,
  r.latitude AS restaurant_latitude, r.longitude AS restaurant_longitude,
  u.name AS customer_name, u.phone AS customer_phone,
  ua.address AS dropoff_address, ua.latitude AS dropoff_latitude,
  ua.longitude AS dropoff_longitude,
  dlh.latitude AS rider_latitude, dlh.longitude AS rider_longitude,
  dlh.recorded_at AS rider_location_recorded_at,
  CASE
    WHEN r.latitude IS NOT NULL AND r.longitude IS NOT NULL
      AND ua.latitude IS NOT NULL AND ua.longitude IS NOT NULL
    THEN calculate_distance_km(r.latitude, r.longitude, ua.latitude, ua.longitude)
    WHEN dlh.latitude IS NOT NULL AND dlh.longitude IS NOT NULL
      AND ua.latitude IS NOT NULL AND ua.longitude IS NOT NULL
    THEN calculate_distance_km(dlh.latitude, dlh.longitude, ua.latitude, ua.longitude)
    ELSE NULL
  END AS distance_km,
  o.total_amount, p.payment_method,
  (SELECT COALESCE(SUM(oi.quantity), 0)::int
   FROM order_items oi WHERE oi.order_id = o.id) AS item_count
FROM deliveries d
JOIN orders o ON o.id = d.order_id
JOIN restaurants r ON r.id = o.restaurant_id
JOIN users u ON u.id = o.user_id
JOIN user_addresses ua ON ua.id = o.address_id
LEFT JOIN payments p ON p.order_id = o.id
LEFT JOIN delivery_location_history dlh
  ON dlh.delivery_id = d.id
  AND dlh.recorded_at = (
    SELECT MAX(dlh2.recorded_at)
    FROM delivery_location_history dlh2
    WHERE dlh2.delivery_id = d.id
  )
WHERE d.rider_id = 600
  AND d.status IN ('accepted', 'arrived_at_store', 'picked_up', 'arrived_at_destination')
ORDER BY d.assigned_at DESC NULLS LAST
LIMIT 1;
```

### Latest GPS point of a delivery

```sql
SELECT id, delivery_id, latitude, longitude, event, recorded_at
FROM delivery_location_history
WHERE delivery_id = 150000
ORDER BY recorded_at DESC, id DESC
LIMIT 1;
```

### Restaurant reviews

```sql
SELECT rv.id, rv.rating, rv.comment, rv.created_at, u.name AS customer_name
FROM reviews rv
JOIN users u ON u.id = rv.user_id
WHERE rv.restaurant_id = 42
ORDER BY rv.created_at DESC
LIMIT 20;
```

### Customer saved addresses

```sql
SELECT id, label, address, street, apartment_name, city, postal_code,
  latitude, longitude
FROM user_addresses
WHERE user_id = 777
ORDER BY id ASC;
```

### Owner restaurant list

```sql
SELECT id, name, description, phone, email, address, area, latitude, longitude,
  opening_time, closing_time, delivery_fee, minimum_order, active_status,
  image, rating, cuisines, archived_at
FROM restaurants
WHERE owner_id = 42
  AND ((FALSE::boolean = FALSE AND archived_at IS NULL)
    OR (FALSE::boolean = TRUE AND archived_at IS NOT NULL))
ORDER BY created_at DESC;
```
