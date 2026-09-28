-- Volume: 20k users, 500 restaurants, 15k menu items, 40k addresses,
--         300k orders, ~900k order_items, 300k deliveries, 600k GPS points,
--         300k notifications, 100k reviews.  (~1-2 min)
SET synchronous_commit = off;

INSERT INTO users (name,email,phone,password_hash,role,created_at)
SELECT 'User '||g, 'user'||g||'@mail.com', '017'||lpad(g::text,8,'0'), 'x',
       CASE WHEN g<=500 THEN 'owner'::role_enum WHEN g<=1500 THEN 'rider'::role_enum ELSE 'customer'::role_enum END,
       NOW() - (random()*700||' days')::interval
FROM generate_series(1,20000) g;

INSERT INTO riders (user_id,vehicle_type,vehicle_plate,license_number)
SELECT id,'bike','DHK-'||id,'LIC-'||id FROM users WHERE role='rider';

INSERT INTO user_addresses (user_id,address,city,latitude,longitude)
SELECT 1+(g%20000), 'House '||g||', Road '||(g%50), 'Dhaka', 23.70+random()*0.15, 90.35+random()*0.10
FROM generate_series(1,40000) g;

INSERT INTO restaurants (owner_id,name,address,area,latitude,longitude,active_status,cuisines,rating,archived_at)
SELECT g, 'Restaurant '||g, 'Addr '||g,
       (ARRAY['Gulshan','Banani','Dhanmondi','Uttara','Mirpur'])[1+g%5],
       23.70+random()*0.15, 90.35+random()*0.10, TRUE, ARRAY['bengali'], 4.0,
       CASE WHEN g%25=0 THEN NOW() END
FROM generate_series(1,500) g;

INSERT INTO categories (name,restaurant_id)
SELECT c, r FROM generate_series(1,500) r, unnest(ARRAY['Starters','Mains','Drinks','Desserts']) c;

INSERT INTO menu_items (restaurant_id,category_id,item_name,price,is_available,archived_at)
SELECT 1+(g%500), NULL, 'Item '||g, 50+(random()*450)::int, (random()>0.1),
       CASE WHEN random()<0.05 THEN NOW() END
FROM generate_series(1,15000) g;

-- Orders: most are old & delivered, a few are live. Restaurant 42 and user 777 are "busy" on purpose.
INSERT INTO orders (user_id,restaurant_id,address_id,idempotency_key,total_amount,delivery_fee,order_status,created_at)
SELECT u, r, 1+((u+g)%40000), gen_random_uuid(), 200+(random()*1500)::int, 60,
       CASE WHEN g > 299000 THEN (ARRAY['pending','confirmed','preparing','ready','out_for_delivery'])[1+g%5]::order_status_enum
            ELSE 'delivered' END,
       NOW() - ((300000-g)*0.002||' hours')::interval
FROM (
  SELECT g,
         CASE WHEN g%100=0 THEN 777 ELSE 1501+(random()*18498)::int END AS u,
         CASE WHEN g%50=0  THEN 42  ELSE 1+(random()*499)::int END AS r
  FROM generate_series(1,300000) g
) s;

INSERT INTO order_items (order_id,menu_item_id,unit_price,quantity,subtotal)
SELECT o.id, 1+((o.id*7+k*131)%15000), 250, 2, 500
FROM orders o, generate_series(1,3) k;

INSERT INTO payments (order_id,transaction_id,payment_method,amount,status)
SELECT id,'TX'||id,'bkash',total_amount,'completed' FROM orders;

INSERT INTO deliveries (order_id,rider_id,assigned_at,status)
SELECT id, 501+(id%1000), created_at,
       CASE WHEN order_status='delivered' THEN 'delivered'::delivery_status_enum ELSE 'accepted'::delivery_status_enum END
FROM orders;

INSERT INTO delivery_location_history (delivery_id,latitude,longitude,event,recorded_at)
SELECT d.id, 23.7+random()*0.1, 90.4+random()*0.1,
       (ARRAY['accepted','picked_up'])[k], NOW() - (d.id*0.002||' hours')::interval + (k||' minutes')::interval
FROM deliveries d, generate_series(1,2) k;

INSERT INTO notifications (user_id,order_id,title,is_read,created_at)
SELECT o.user_id, o.id, 'Order update', (o.id%10<>0), o.created_at FROM orders o;

INSERT INTO reviews (user_id,order_id,restaurant_id,rider_id,rating,created_at)
SELECT user_id, id, restaurant_id, 501+(id%1000), 1+(id%5), created_at
FROM orders WHERE order_status='delivered' AND id%3=0;

ANALYZE;
