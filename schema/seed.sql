-- Complete demonstration data for a fresh local development database.
-- Every demo account uses the password: Demo123!
-- This file is destructive and must only be run through the guarded local scripts.

TRUNCATE TABLE
  notifications,
  role_requests,
  reviews,
  delivery_location_history,
  deliveries,
  payments,
  order_items,
  orders,
  cart_items,
  carts,
  user_coupons,
  coupons,
  restaurant_owners,
  riders,
  menu_items,
  categories,
  restaurants,
  user_addresses,
  users
RESTART IDENTITY CASCADE;

-- IDs 1-14: administrator, customers/applicants, owners, and riders.
INSERT INTO users
  (name, email, phone, password_hash, role, profile_image, created_at)
VALUES
  ('Cravings Admin', 'admin@cravings.local', '01700000001', '$2b$10$R4puf8zHBHPm8H043pG0JOHyVfHKhsmxnj1Y4496DT.9COwIih7SG', 'admin', '/placeholder-user.jpg', NOW() - INTERVAL '180 days'),
  ('Aisha Rahman', 'customer@cravings.local', '01710000001', '$2b$10$R4puf8zHBHPm8H043pG0JOHyVfHKhsmxnj1Y4496DT.9COwIih7SG', 'customer', '/placeholder-user.jpg', NOW() - INTERVAL '90 days'),
  ('Fahim Ahmed', 'customer2@cravings.local', '01710000002', '$2b$10$R4puf8zHBHPm8H043pG0JOHyVfHKhsmxnj1Y4496DT.9COwIih7SG', 'customer', '/placeholder-user.jpg', NOW() - INTERVAL '75 days'),
  ('Nusrat Jahan', 'customer3@cravings.local', '01710000003', '$2b$10$R4puf8zHBHPm8H043pG0JOHyVfHKhsmxnj1Y4496DT.9COwIih7SG', 'customer', '/placeholder-user.jpg', NOW() - INTERVAL '45 days'),
  ('Tanvir Hasan', 'owner.pending@cravings.local', '01710000004', '$2b$10$R4puf8zHBHPm8H043pG0JOHyVfHKhsmxnj1Y4496DT.9COwIih7SG', 'customer', '/placeholder-user.jpg', NOW() - INTERVAL '10 days'),
  ('Rafi Islam', 'rider.rejected@cravings.local', '01710000005', '$2b$10$R4puf8zHBHPm8H043pG0JOHyVfHKhsmxnj1Y4496DT.9COwIih7SG', 'customer', '/placeholder-user.jpg', NOW() - INTERVAL '20 days'),
  ('Sultan Foods Owner', 'owner@cravings.local', '01810000001', '$2b$10$R4puf8zHBHPm8H043pG0JOHyVfHKhsmxnj1Y4496DT.9COwIih7SG', 'owner', '/placeholder-user.jpg', NOW() - INTERVAL '150 days'),
  ('Chillox Group Owner', 'owner2@cravings.local', '01810000002', '$2b$10$R4puf8zHBHPm8H043pG0JOHyVfHKhsmxnj1Y4496DT.9COwIih7SG', 'owner', '/placeholder-user.jpg', NOW() - INTERVAL '140 days'),
  ('Dhaka Cafe Owner', 'owner3@cravings.local', '01810000003', '$2b$10$R4puf8zHBHPm8H043pG0JOHyVfHKhsmxnj1Y4496DT.9COwIih7SG', 'owner', '/placeholder-user.jpg', NOW() - INTERVAL '120 days'),
  ('Rahim Uddin', 'rider@cravings.local', '01910000001', '$2b$10$R4puf8zHBHPm8H043pG0JOHyVfHKhsmxnj1Y4496DT.9COwIih7SG', 'rider', '/placeholder-user.jpg', NOW() - INTERVAL '100 days'),
  ('Karim Mia', 'rider2@cravings.local', '01910000002', '$2b$10$R4puf8zHBHPm8H043pG0JOHyVfHKhsmxnj1Y4496DT.9COwIih7SG', 'rider', '/placeholder-user.jpg', NOW() - INTERVAL '95 days'),
  ('Nabila Akter', 'rider3@cravings.local', '01910000003', '$2b$10$R4puf8zHBHPm8H043pG0JOHyVfHKhsmxnj1Y4496DT.9COwIih7SG', 'rider', '/placeholder-user.jpg', NOW() - INTERVAL '80 days'),
  ('Imran Hossain', 'rider4@cravings.local', '01910000004', '$2b$10$R4puf8zHBHPm8H043pG0JOHyVfHKhsmxnj1Y4496DT.9COwIih7SG', 'rider', '/placeholder-user.jpg', NOW() - INTERVAL '65 days'),
  ('Maliha Noor', 'rider5@cravings.local', '01910000005', '$2b$10$R4puf8zHBHPm8H043pG0JOHyVfHKhsmxnj1Y4496DT.9COwIih7SG', 'rider', '/placeholder-user.jpg', NOW() - INTERVAL '50 days');

-- Saved customer addresses include coordinates so quotes and maps work immediately.
INSERT INTO user_addresses
  (user_id, label, address, street, apartment_name, city, postal_code, latitude, longitude)
VALUES
  (2, 'Home', 'House 18, Road 7A, Dhanmondi, Dhaka', 'Road 7A', 'Lake View', 'Dhaka', '1209', 23.746500, 90.376000),
  (2, 'Office', 'Road 11, Banani, Dhaka', 'Road 11', 'City Tower', 'Dhaka', '1213', 23.793800, 90.405500),
  (3, 'Home', 'Road 53, Gulshan 2, Dhaka', 'Road 53', 'Gulshan Heights', 'Dhaka', '1212', 23.794700, 90.414000),
  (3, 'Office', 'Dilkusha Commercial Area, Motijheel, Dhaka', 'Dilkusha Road', 'Commerce Bhaban', 'Dhaka', '1000', 23.727000, 90.417300),
  (4, 'Home', 'Section 10, Mirpur, Dhaka', 'Road 5', 'Mirpur Residency', 'Dhaka', '1216', 23.806900, 90.368700),
  (5, 'Home', 'Sector 7, Uttara, Dhaka', 'Road 12', 'Uttara Homes', 'Dhaka', '1230', 23.871500, 90.400200);

INSERT INTO restaurant_owners
  (user_id, nid_number, business_name, trade_licence, address, created_at)
VALUES
  (7, '1975100100011', 'Sultan Foods Limited', 'TRAD-DHK-1001', 'Dhanmondi, Dhaka', NOW() - INTERVAL '145 days'),
  (8, '1982100100022', 'Chillox Group', 'TRAD-DHK-1002', 'Banani, Dhaka', NOW() - INTERVAL '135 days'),
  (9, '1988100100033', 'Dhaka Cafe Company', 'TRAD-DHK-1003', 'Gulshan, Dhaka', NOW() - INTERVAL '115 days');

INSERT INTO riders
  (user_id, vehicle_type, vehicle_plate, license_number, nid_number, status)
VALUES
  (10, 'Motorbike', 'DHAKA-METRO-LA-11-1001', 'DL-R-1001', '1993100100011', 'busy'),
  (11, 'Motorbike', 'DHAKA-METRO-LA-11-1002', 'DL-R-1002', '1994100100022', 'busy'),
  (12, 'Bicycle', 'BICYCLE-1003', 'DL-R-1003', '1995100100033', 'busy'),
  (13, 'Motorbike', 'DHAKA-METRO-LA-11-1004', 'DL-R-1004', '1996100100044', 'idle'),
  (14, 'Scooter', 'DHAKA-METRO-LA-11-1005', 'DL-R-1005', '1997100100055', 'offline');

-- Six branches: four visible, one temporarily closed, and one archived for restore demos.
INSERT INTO restaurants
  (owner_id, name, description, phone, email, address, area, latitude, longitude,
   opening_time, closing_time, delivery_fee, minimum_order, active_status, cuisines,
   rating, image, archived_at, created_at)
VALUES
  (7, 'Sultan''s Dine', 'Authentic kacchi biryani, borhani, and traditional desserts.', '01711111111', 'dhanmondi@sultansdine.local', 'House 4, Road 7, Dhanmondi, Dhaka', 'Dhanmondi', 23.746100, 90.374200, '00:00', '23:59', 60.00, 300.00, TRUE, ARRAY['kacchi','biryani','bangladeshi'], 0, '/food/sultans-dine.png', NULL, NOW() - INTERVAL '140 days'),
  (8, 'Chillox', 'Juicy burgers, fried chicken, fries, and shakes.', '01722222222', 'banani@chillox.local', 'Block F, Road 11, Banani, Dhaka', 'Banani', 23.793700, 90.406600, '00:00', '23:59', 50.00, 200.00, TRUE, ARRAY['burger','fried-chicken','fast-food'], 0, '/food/chillox.png', NULL, NOW() - INTERVAL '130 days'),
  (7, 'Kacchi Bhai', 'Traditional kacchi, morog polao, tehari, and Bengali sides.', '01733333333', 'gulshan@kacchibhai.local', 'Pink City, Gulshan 2, Dhaka', 'Gulshan', 23.794900, 90.414300, '00:00', '23:59', 70.00, 250.00, TRUE, ARRAY['kacchi','biryani','bangladeshi'], 0, '/food/kacchi-bhai.png', NULL, NOW() - INTERVAL '110 days'),
  (8, 'Ambala Sweets & Foods', 'Bengali breakfast, snacks, sweets, and yogurt.', '01744444444', 'olddhaka@ambala.local', 'Nazimuddin Road, Old Dhaka', 'Old Dhaka', 23.718600, 90.398000, '00:00', '23:59', 40.00, 150.00, TRUE, ARRAY['bangladeshi','breakfast','dessert'], 0, '/food/ambala.png', NULL, NOW() - INTERVAL '100 days'),
  (9, 'Dhaka Bean', 'Coffee, cold drinks, and a small bakery menu.', '01755555555', 'gulshan@dhakabean.local', 'Avenue 5, Gulshan 1, Dhaka', 'Gulshan', 23.780800, 90.416900, '07:00', '23:00', 50.00, 200.00, FALSE, ARRAY['cafe','coffee','bakery'], 0, '/food/hero-spread.png', NULL, NOW() - INTERVAL '75 days'),
  (9, 'Pizza Point', 'Stone-baked pizza, garlic bread, and cold drinks.', '01766666666', 'uttara@pizzapoint.local', 'Sector 4, Uttara, Dhaka', 'Uttara', 23.864400, 90.400100, '11:00', '23:30', 70.00, 350.00, TRUE, ARRAY['pizza','italian','fast-food'], 0, '/placeholder.jpg', NOW() - INTERVAL '2 days', NOW() - INTERVAL '60 days');

-- IDs 1-12, two menu sections for each restaurant.
INSERT INTO categories (restaurant_id, name, category_img)
VALUES
  (1, 'Kacchi & Biryani', '/food/sultans-dine.png'),
  (1, 'Drinks & Desserts', '/placeholder.jpg'),
  (2, 'Burgers', '/food/chillox.png'),
  (2, 'Sides & Chicken', '/placeholder.jpg'),
  (3, 'Rice Platters', '/food/kacchi-bhai.png'),
  (3, 'Traditional Sides', '/placeholder.jpg'),
  (4, 'Breakfast', '/food/ambala.png'),
  (4, 'Sweets', '/placeholder.jpg'),
  (5, 'Coffee', '/food/hero-spread.png'),
  (5, 'Bakery', '/placeholder.jpg'),
  (6, 'Pizza', '/placeholder.jpg'),
  (6, 'Sides & Drinks', '/placeholder.jpg');

-- IDs 1-30. Local restaurant images are reused where possible; menu placeholders always exist.
INSERT INTO menu_items
  (restaurant_id, category_id, item_name, description, price, item_img, is_available, archived_at)
VALUES
  (1, 1, 'Mutton Kacchi Half', 'Single portion with one piece of mutton and potato.', 380.00, '/food/sultans-dine.png', TRUE, NULL),
  (1, 1, 'Mutton Kacchi Full', 'Large portion with two pieces of mutton and potato.', 580.00, '/food/sultans-dine.png', TRUE, NULL),
  (1, 1, 'Chicken Biryani', 'Aromatic basmati rice with roasted chicken.', 320.00, '/food/sultans-dine.png', TRUE, NULL),
  (1, 2, 'Shahi Borhani', 'Spiced yogurt drink, 500 ml.', 90.00, '/placeholder.jpg', TRUE, NULL),
  (1, 2, 'Firni', 'Chilled traditional rice pudding.', 120.00, '/placeholder.jpg', TRUE, NULL),
  (2, 3, 'Beef Juicy Lucy', 'Beef patty stuffed with melted cheddar.', 290.00, '/food/chillox.png', TRUE, NULL),
  (2, 3, 'Chicken Cheese Blast', 'Crispy chicken burger with double cheese.', 260.00, '/food/chillox.png', TRUE, NULL),
  (2, 3, 'Smoky BBQ Beef', 'Grilled beef burger with smoky barbecue sauce.', 340.00, '/food/chillox.png', TRUE, NULL),
  (2, 4, 'Loaded Fries', 'Fries topped with cheese sauce and chicken.', 150.00, '/placeholder.jpg', TRUE, NULL),
  (2, 4, 'Naga Drumsticks', 'Four spicy fried chicken drumsticks.', 220.00, '/placeholder.jpg', TRUE, NULL),
  (3, 5, 'Special Kacchi Platter', 'Kacchi with mutton, egg, potato, and salad.', 420.00, '/food/kacchi-bhai.png', TRUE, NULL),
  (3, 5, 'Morog Polao', 'Fragrant polao rice with chicken roast.', 330.00, '/food/kacchi-bhai.png', TRUE, NULL),
  (3, 5, 'Beef Tehari', 'Mustard-oil rice with tender beef.', 280.00, '/food/kacchi-bhai.png', TRUE, NULL),
  (3, 6, 'Borhani', 'Traditional spiced yogurt drink.', 100.00, '/placeholder.jpg', TRUE, NULL),
  (3, 6, 'Shahi Jorda', 'Sweet saffron rice with nuts.', 90.00, '/placeholder.jpg', TRUE, NULL),
  (4, 7, 'Bhuna Khichuri', 'Bengali khichuri served with egg.', 180.00, '/food/ambala.png', TRUE, NULL),
  (4, 7, 'Paratha', 'Freshly fried layered flatbread.', 30.00, '/placeholder.jpg', TRUE, NULL),
  (4, 7, 'Sooji Halwa', 'Warm semolina dessert.', 100.00, '/placeholder.jpg', TRUE, NULL),
  (4, 8, 'Roshogolla Box', 'Four pieces of soft cottage-cheese sweets.', 80.00, '/food/ambala.png', TRUE, NULL),
  (4, 8, 'Mishti Doi', 'Traditional sweet yogurt, 500 g.', 200.00, '/food/ambala.png', TRUE, NULL),
  (5, 9, 'Cafe Latte', 'Double espresso with steamed milk.', 220.00, '/food/hero-spread.png', TRUE, NULL),
  (5, 9, 'Americano', 'Double espresso with hot water.', 160.00, '/food/hero-spread.png', TRUE, NULL),
  (5, 9, 'Cold Coffee', 'Blended chilled coffee with milk.', 260.00, '/food/hero-spread.png', TRUE, NULL),
  (5, 10, 'Butter Croissant', 'Flaky butter pastry baked daily.', 190.00, '/placeholder.jpg', TRUE, NULL),
  (5, 10, 'Chocolate Brownie', 'Rich chocolate brownie square.', 180.00, '/placeholder.jpg', FALSE, NULL),
  (6, 11, 'Margherita Pizza', 'Tomato, mozzarella, and basil.', 450.00, '/placeholder.jpg', TRUE, NULL),
  (6, 11, 'Pepperoni Pizza', 'Mozzarella and beef pepperoni.', 620.00, '/placeholder.jpg', TRUE, NULL),
  (6, 11, 'BBQ Chicken Pizza', 'Chicken, onion, cheese, and barbecue sauce.', 580.00, '/placeholder.jpg', TRUE, NULL),
  (6, 12, 'Garlic Bread', 'Toasted bread with garlic butter.', 180.00, '/placeholder.jpg', TRUE, NULL),
  (6, 12, 'Cola', 'Chilled soft drink, 500 ml.', 80.00, '/placeholder.jpg', TRUE, NOW() - INTERVAL '2 days');

INSERT INTO coupons
  (code, discount_type, discount_value, minimum_order, expiry_date)
VALUES
  ('WELCOME20', 'percentage', 20.00, 300.00, CURRENT_DATE + 30),
  ('SAVE100', 'fixed_amount', 100.00, 700.00, CURRENT_DATE + 15),
  ('FOODIE15', 'percentage', 15.00, 500.00, CURRENT_DATE + 60),
  ('EXPIRED50', 'fixed_amount', 50.00, 300.00, CURRENT_DATE - 1),
  ('WEEKEND10', 'percentage', 10.00, 400.00, CURRENT_DATE + 7);

-- Both available and historical coupon assignments are represented.
INSERT INTO user_coupons (user_id, coupon_id, used)
VALUES
  (2, 1, FALSE),
  (2, 2, TRUE),
  (2, 4, FALSE),
  (3, 1, FALSE),
  (3, 3, FALSE),
  (4, 5, FALSE),
  (4, 2, TRUE),
  (5, 1, FALSE),
  (2, 3, TRUE);

-- Three unfinished carts make cart badges and coupon selection visible.
INSERT INTO carts (user_id, restaurant_id, user_coupon_id, created_at)
VALUES
  (2, 2, 1, NOW() - INTERVAL '20 minutes'),
  (3, 1, NULL, NOW() - INTERVAL '1 hour'),
  (4, 5, 6, NOW() - INTERVAL '2 hours');

INSERT INTO cart_items (cart_id, menu_item_id, quantity)
VALUES
  (1, 6, 1),
  (1, 9, 2),
  (2, 1, 1),
  (2, 4, 2),
  (3, 21, 1),
  (3, 24, 1);

-- IDs 1-12 cover delivered, kitchen, unassigned, active-delivery, and cancelled states.
-- total_amount = item subtotal - discount + delivery fee + 3% tax + Tk 10 platform fee.
INSERT INTO orders
  (user_id, restaurant_id, address_id, idempotency_key, delivery_instructions,
   total_amount, delivery_fee, discount, order_status, created_at, updated_at)
VALUES
  (2, 1, 1, '00000000-0000-4000-8000-000000000001', 'Call at the gate.', 845.50, 60.00, 100.00, 'delivered', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '55 minutes'),
  (3, 2, 3, '00000000-0000-4000-8000-000000000002', 'No mayonnaise in the burger.', 884.00, 50.00, 0.00, 'delivered', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '45 minutes'),
  (4, 3, 5, '00000000-0000-4000-8000-000000000003', 'Please include extra salad.', 718.60, 70.00, 0.00, 'delivered', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '50 minutes'),
  (2, 1, 2, '00000000-0000-4000-8000-000000000004', 'Reception desk, floor 4.', 760.10, 60.00, 0.00, 'ready', NOW() - INTERVAL '35 minutes', NOW() - INTERVAL '5 minutes'),
  (3, 2, 4, '00000000-0000-4000-8000-000000000005', 'Use the east entrance.', 750.10, 50.00, 0.00, 'preparing', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '10 minutes'),
  (4, 4, 5, '00000000-0000-4000-8000-000000000006', 'Phone when you reach the lane.', 543.20, 80.00, 0.00, 'out_for_delivery', NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '10 minutes'),
  (4, 5, 5, '00000000-0000-4000-8000-000000000007', 'Leave with building security.', 667.40, 60.00, 0.00, 'pending', NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes'),
  (2, 3, 1, '00000000-0000-4000-8000-000000000008', NULL, 512.60, 70.00, 0.00, 'cancelled', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '8 minutes'),
  (2, 5, 2, '00000000-0000-4000-8000-000000000009', 'Please pack the drinks separately.', 623.20, 50.00, 96.00, 'delivered', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '35 minutes'),
  (3, 3, 3, '00000000-0000-4000-8000-000000000010', 'Ring the bell once.', 605.30, 70.00, 0.00, 'confirmed', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '12 minutes'),
  (4, 1, 5, '00000000-0000-4000-8000-000000000011', 'Deliver to apartment 6B.', 772.80, 80.00, 100.00, 'delivered', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '50 minutes'),
  (2, 2, 1, '00000000-0000-4000-8000-000000000012', 'I will meet the rider downstairs.', 646.80, 60.00, 0.00, 'out_for_delivery', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '3 minutes');

INSERT INTO order_items (order_id, menu_item_id, unit_price, quantity, subtotal)
VALUES
  (1, 1, 380.00, 2, 760.00), (1, 4, 90.00, 1, 90.00),
  (2, 6, 290.00, 2, 580.00), (2, 10, 220.00, 1, 220.00),
  (3, 11, 420.00, 1, 420.00), (3, 14, 100.00, 2, 200.00),
  (4, 2, 580.00, 1, 580.00), (4, 4, 90.00, 1, 90.00),
  (5, 7, 260.00, 2, 520.00), (5, 9, 150.00, 1, 150.00),
  (6, 16, 180.00, 2, 360.00), (6, 19, 80.00, 1, 80.00),
  (7, 21, 220.00, 1, 220.00), (7, 25, 180.00, 2, 360.00),
  (8, 11, 420.00, 1, 420.00),
  (9, 23, 260.00, 1, 260.00), (9, 24, 190.00, 2, 380.00),
  (10, 12, 330.00, 1, 330.00), (10, 15, 90.00, 2, 180.00),
  (11, 3, 320.00, 2, 640.00), (11, 5, 120.00, 1, 120.00),
  (12, 8, 340.00, 1, 340.00), (12, 10, 220.00, 1, 220.00);

INSERT INTO payments
  (order_id, transaction_id, payment_method, amount, status, paid_at)
VALUES
  (1, 'CASH-ORDER-0001', 'cash', 845.50, 'completed', NOW() - INTERVAL '20 days' + INTERVAL '55 minutes'),
  (2, 'BKASH-DEMO-0002', 'bkash', 884.00, 'completed', NOW() - INTERVAL '12 days'),
  (3, 'CASH-ORDER-0003', 'cash', 718.60, 'completed', NOW() - INTERVAL '7 days' + INTERVAL '50 minutes'),
  (4, NULL, 'cash', 760.10, 'pending', NULL),
  (5, NULL, 'cash', 750.10, 'pending', NULL),
  (6, NULL, 'cash', 543.20, 'pending', NULL),
  (7, 'NAGAD-DEMO-0007', 'nagad', 667.40, 'completed', NOW() - INTERVAL '10 minutes'),
  (8, 'CARD-DEMO-0008', 'card', 512.60, 'refunded', NOW() - INTERVAL '3 days'),
  (9, 'CARD-DEMO-0009', 'card', 623.20, 'completed', NOW() - INTERVAL '2 days'),
  (10, NULL, 'cash', 605.30, 'pending', NULL),
  (11, 'CASH-ORDER-0011', 'cash', 772.80, 'completed', NOW() - INTERVAL '1 day' + INTERVAL '50 minutes'),
  (12, NULL, 'cash', 646.80, 'pending', NULL);

-- Riders 10-12 each have one active job. Rider 10 also has three completed,
-- reviewed deliveries so rider@cravings.local has useful dashboard history.
-- Rider 13 is idle; rider 14 is offline.
INSERT INTO deliveries
  (order_id, rider_id, assigned_at, delivered_at, status, updated_at)
VALUES
  (1, 10, NOW() - INTERVAL '20 days' + INTERVAL '10 minutes', NOW() - INTERVAL '20 days' + INTERVAL '55 minutes', 'delivered', NOW() - INTERVAL '20 days' + INTERVAL '55 minutes'),
  (2, 10, NOW() - INTERVAL '12 days' + INTERVAL '5 minutes', NOW() - INTERVAL '12 days' + INTERVAL '45 minutes', 'delivered', NOW() - INTERVAL '12 days' + INTERVAL '45 minutes'),
  (3, 12, NOW() - INTERVAL '7 days' + INTERVAL '5 minutes', NOW() - INTERVAL '7 days' + INTERVAL '50 minutes', 'delivered', NOW() - INTERVAL '7 days' + INTERVAL '50 minutes'),
  (4, NULL, NULL, NULL, 'unassigned', NOW() - INTERVAL '5 minutes'),
  (5, 10, NOW() - INTERVAL '18 minutes', NULL, 'accepted', NOW() - INTERVAL '18 minutes'),
  (6, 11, NOW() - INTERVAL '42 minutes', NULL, 'picked_up', NOW() - INTERVAL '15 minutes'),
  (7, NULL, NULL, NULL, 'unassigned', NOW() - INTERVAL '10 minutes'),
  (8, NULL, NULL, NULL, 'cancelled', NOW() - INTERVAL '3 days' + INTERVAL '8 minutes'),
  (9, 10, NOW() - INTERVAL '2 days' + INTERVAL '5 minutes', NOW() - INTERVAL '2 days' + INTERVAL '35 minutes', 'delivered', NOW() - INTERVAL '2 days' + INTERVAL '35 minutes'),
  (10, NULL, NULL, NULL, 'unassigned', NOW() - INTERVAL '12 minutes'),
  (11, 14, NOW() - INTERVAL '1 day' + INTERVAL '5 minutes', NOW() - INTERVAL '1 day' + INTERVAL '50 minutes', 'delivered', NOW() - INTERVAL '1 day' + INTERVAL '50 minutes'),
  (12, 12, NOW() - INTERVAL '55 minutes', NULL, 'arrived_at_destination', NOW() - INTERVAL '3 minutes');

-- GPS points use real Dhaka-area coordinates and every supported milestone.
INSERT INTO delivery_location_history
  (delivery_id, latitude, longitude, event, recorded_at)
VALUES
  (1, 23.745500, 90.373500, 'accepted', NOW() - INTERVAL '20 days' + INTERVAL '10 minutes'),
  (1, 23.746100, 90.374200, 'arrived_at_store', NOW() - INTERVAL '20 days' + INTERVAL '18 minutes'),
  (1, 23.746200, 90.374300, 'picked_up', NOW() - INTERVAL '20 days' + INTERVAL '25 minutes'),
  (1, 23.746450, 90.375800, 'arrived_at_destination', NOW() - INTERVAL '20 days' + INTERVAL '52 minutes'),
  (1, 23.746500, 90.376000, 'delivered', NOW() - INTERVAL '20 days' + INTERVAL '55 minutes'),
  (2, 23.792900, 90.405900, 'accepted', NOW() - INTERVAL '12 days' + INTERVAL '5 minutes'),
  (2, 23.793700, 90.406600, 'arrived_at_store', NOW() - INTERVAL '12 days' + INTERVAL '12 minutes'),
  (2, 23.793800, 90.406500, 'picked_up', NOW() - INTERVAL '12 days' + INTERVAL '20 minutes'),
  (2, 23.794500, 90.413500, 'arrived_at_destination', NOW() - INTERVAL '12 days' + INTERVAL '42 minutes'),
  (2, 23.794700, 90.414000, 'delivered', NOW() - INTERVAL '12 days' + INTERVAL '45 minutes'),
  (3, 23.794000, 90.413000, 'accepted', NOW() - INTERVAL '7 days' + INTERVAL '5 minutes'),
  (3, 23.794900, 90.414300, 'arrived_at_store', NOW() - INTERVAL '7 days' + INTERVAL '12 minutes'),
  (3, 23.794800, 90.414000, 'picked_up', NOW() - INTERVAL '7 days' + INTERVAL '20 minutes'),
  (3, 23.806500, 90.369000, 'arrived_at_destination', NOW() - INTERVAL '7 days' + INTERVAL '47 minutes'),
  (3, 23.806900, 90.368700, 'delivered', NOW() - INTERVAL '7 days' + INTERVAL '50 minutes'),
  (5, 23.790000, 90.410000, 'accepted', NOW() - INTERVAL '18 minutes'),
  (6, 23.720000, 90.400000, 'accepted', NOW() - INTERVAL '42 minutes'),
  (6, 23.718600, 90.398000, 'arrived_at_store', NOW() - INTERVAL '30 minutes'),
  (6, 23.722000, 90.397000, 'picked_up', NOW() - INTERVAL '15 minutes'),
  (9, 23.781000, 90.416500, 'accepted', NOW() - INTERVAL '2 days' + INTERVAL '5 minutes'),
  (9, 23.780800, 90.416900, 'arrived_at_store', NOW() - INTERVAL '2 days' + INTERVAL '10 minutes'),
  (9, 23.780900, 90.416800, 'picked_up', NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'),
  (9, 23.793500, 90.405700, 'arrived_at_destination', NOW() - INTERVAL '2 days' + INTERVAL '32 minutes'),
  (9, 23.793800, 90.405500, 'delivered', NOW() - INTERVAL '2 days' + INTERVAL '35 minutes'),
  (11, 23.746000, 90.374000, 'accepted', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes'),
  (11, 23.746100, 90.374200, 'arrived_at_store', NOW() - INTERVAL '1 day' + INTERVAL '12 minutes'),
  (11, 23.746200, 90.374300, 'picked_up', NOW() - INTERVAL '1 day' + INTERVAL '20 minutes'),
  (11, 23.806500, 90.369000, 'arrived_at_destination', NOW() - INTERVAL '1 day' + INTERVAL '47 minutes'),
  (11, 23.806900, 90.368700, 'delivered', NOW() - INTERVAL '1 day' + INTERVAL '50 minutes'),
  (12, 23.790000, 90.402000, 'accepted', NOW() - INTERVAL '55 minutes'),
  (12, 23.793700, 90.406600, 'arrived_at_store', NOW() - INTERVAL '42 minutes'),
  (12, 23.793500, 90.406000, 'picked_up', NOW() - INTERVAL '32 minutes'),
  (12, 23.746700, 90.376400, 'arrived_at_destination', NOW() - INTERVAL '3 minutes');

-- The rating trigger recalculates restaurant ratings from these rows.
-- Order 3 intentionally remains unreviewed so the review flow can be demonstrated.
INSERT INTO reviews
  (user_id, order_id, restaurant_id, rider_id, rating, rider_rating, comment, created_at)
VALUES
  (2, 1, 1, 10, 5, 5, 'The kacchi arrived hot and the rider was very polite.', NOW() - INTERVAL '19 days'),
  (3, 2, 2, 10, 4, 5, 'Great burgers and quick delivery.', NOW() - INTERVAL '11 days'),
  (2, 9, 5, 10, 5, 4, 'Coffee and croissants were packed carefully.', NOW() - INTERVAL '1 day 20 hours'),
  (4, 11, 1, 14, 4, 4, 'Good biryani and generous portions.', NOW() - INTERVAL '20 hours');

-- Approved records are required by owner/rider page guards. Pending and rejected rows populate admin review screens.
INSERT INTO role_requests
  (user_id, source_role, requested_role, status, details, review_note, rejection_reason,
   verification_data, created_at, reviewed_at, reviewed_by)
VALUES
  (7, 'customer', 'owner', 'APPROVED', 'Application for Sultan Foods Limited.', 'Documents verified.', NULL, '{"nid_number":"1975100100011","restaurant_name":"Sultan Foods Limited","business_address":"Dhanmondi, Dhaka","trade_license":"TRAD-DHK-1001"}', NOW() - INTERVAL '150 days', NOW() - INTERVAL '148 days', 1),
  (8, 'customer', 'owner', 'APPROVED', 'Application for Chillox Group.', 'Documents verified.', NULL, '{"nid_number":"1982100100022","restaurant_name":"Chillox Group","business_address":"Banani, Dhaka","trade_license":"TRAD-DHK-1002"}', NOW() - INTERVAL '145 days', NOW() - INTERVAL '143 days', 1),
  (9, 'customer', 'owner', 'APPROVED', 'Application for Dhaka Cafe Company.', 'Documents verified.', NULL, '{"nid_number":"1988100100033","restaurant_name":"Dhaka Cafe Company","business_address":"Gulshan, Dhaka","trade_license":"TRAD-DHK-1003"}', NOW() - INTERVAL '125 days', NOW() - INTERVAL '123 days', 1),
  (10, 'customer', 'rider', 'APPROVED', 'Motorbike delivery application.', 'Identity and vehicle verified.', NULL, '{"nid_number":"1993100100011","vehicle_type":"Motorbike","vehicle_plate":"DHAKA-METRO-LA-11-1001","license_number":"DL-R-1001"}', NOW() - INTERVAL '105 days', NOW() - INTERVAL '103 days', 1),
  (11, 'customer', 'rider', 'APPROVED', 'Motorbike delivery application.', 'Identity and vehicle verified.', NULL, '{"nid_number":"1994100100022","vehicle_type":"Motorbike","vehicle_plate":"DHAKA-METRO-LA-11-1002","license_number":"DL-R-1002"}', NOW() - INTERVAL '100 days', NOW() - INTERVAL '98 days', 1),
  (12, 'customer', 'rider', 'APPROVED', 'Bicycle delivery application.', 'Identity verified.', NULL, '{"nid_number":"1995100100033","vehicle_type":"Bicycle","vehicle_plate":"BICYCLE-1003","license_number":"DL-R-1003"}', NOW() - INTERVAL '85 days', NOW() - INTERVAL '83 days', 1),
  (13, 'customer', 'rider', 'APPROVED', 'Motorbike delivery application.', 'Identity and vehicle verified.', NULL, '{"nid_number":"1996100100044","vehicle_type":"Motorbike","vehicle_plate":"DHAKA-METRO-LA-11-1004","license_number":"DL-R-1004"}', NOW() - INTERVAL '70 days', NOW() - INTERVAL '68 days', 1),
  (14, 'customer', 'rider', 'APPROVED', 'Scooter delivery application.', 'Identity and vehicle verified.', NULL, '{"nid_number":"1997100100055","vehicle_type":"Scooter","vehicle_plate":"DHAKA-METRO-LA-11-1005","license_number":"DL-R-1005"}', NOW() - INTERVAL '55 days', NOW() - INTERVAL '53 days', 1),
  (5, 'customer', 'owner', 'PENDING', 'New home-style restaurant application.', NULL, NULL, '{"nid_number":"2000100100066","restaurant_name":"Tanvir Home Kitchen","business_address":"Uttara, Dhaka","trade_license":"TRAD-DHK-2001"}', NOW() - INTERVAL '2 days', NULL, NULL),
  (6, 'customer', 'rider', 'REJECTED', 'Application for bicycle delivery.', NULL, 'NID image was unreadable. Please submit a clearer copy.', '{"nid_number":"2001100100077","vehicle_type":"Bicycle","vehicle_plate":"BICYCLE-2002","license_number":"DL-R-2002"}', NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days', 1);

INSERT INTO notifications
  (user_id, order_id, title, message, is_read, created_at)
VALUES
  (2, 12, 'Rider has arrived', 'Your rider has arrived near your delivery address.', FALSE, NOW() - INTERVAL '3 minutes'),
  (2, 4, 'Order ready', 'Sultan''s Dine has marked order #4 ready for pickup.', FALSE, NOW() - INTERVAL '5 minutes'),
  (2, 9, 'Order delivered', 'Order #9 was delivered successfully.', TRUE, NOW() - INTERVAL '2 days'),
  (2, 1, 'Thanks for your review', 'Your review for Sultan''s Dine is now visible.', TRUE, NOW() - INTERVAL '19 days'),
  (3, 5, 'Rider assigned', 'Rahim Uddin accepted order #5.', FALSE, NOW() - INTERVAL '18 minutes'),
  (3, 10, 'Order confirmed', 'Kacchi Bhai confirmed order #10.', FALSE, NOW() - INTERVAL '12 minutes'),
  (3, 2, 'Order delivered', 'Order #2 was delivered successfully.', TRUE, NOW() - INTERVAL '12 days'),
  (4, 6, 'Order picked up', 'Your rider picked up order #6.', FALSE, NOW() - INTERVAL '15 minutes'),
  (4, 7, 'Order placed', 'Dhaka Bean received order #7.', FALSE, NOW() - INTERVAL '10 minutes'),
  (4, 11, 'Order delivered', 'Order #11 was delivered successfully.', TRUE, NOW() - INTERVAL '1 day'),
  (5, NULL, 'Application received', 'Your restaurant-owner application is awaiting review.', FALSE, NOW() - INTERVAL '2 days'),
  (6, NULL, 'Application needs attention', 'Your rider application was rejected. Review the reason and apply again.', FALSE, NOW() - INTERVAL '6 days'),
  (7, 4, 'New kitchen order', 'Order #4 is ready in your kitchen queue.', FALSE, NOW() - INTERVAL '35 minutes'),
  (7, 10, 'New order', 'A new Kacchi Bhai order is waiting for preparation.', FALSE, NOW() - INTERVAL '15 minutes'),
  (8, 5, 'New kitchen order', 'Order #5 is being prepared at Chillox.', TRUE, NOW() - INTERVAL '25 minutes'),
  (8, 6, 'Order picked up', 'Order #6 left Ambala with the rider.', FALSE, NOW() - INTERVAL '15 minutes'),
  (9, 7, 'New order', 'Dhaka Bean received order #7.', FALSE, NOW() - INTERVAL '10 minutes'),
  (10, 5, 'Delivery accepted', 'You accepted delivery for order #5.', TRUE, NOW() - INTERVAL '18 minutes'),
  (11, 6, 'Delivery in progress', 'You picked up order #6 from Ambala.', FALSE, NOW() - INTERVAL '15 minutes'),
  (12, 12, 'Customer reached', 'You marked arrival for order #12.', FALSE, NOW() - INTERVAL '3 minutes'),
  (13, NULL, 'You are available', 'You can accept a new delivery request.', TRUE, NOW() - INTERVAL '1 hour'),
  (14, 11, 'Delivery completed', 'Order #11 was delivered and added to your history.', TRUE, NOW() - INTERVAL '1 day'),
  (1, NULL, 'Pending role application', 'One owner application is waiting for review.', FALSE, NOW() - INTERVAL '2 days');
