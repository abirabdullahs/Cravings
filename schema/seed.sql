

-- Clear target tables cleanly
TRUNCATE TABLE menu_items, categories, restaurants RESTART IDENTITY CASCADE;

-- Assumes owner users exist with user.id = 2 and user.id = 3 in your users table

-- 1. Insert Restaurants
INSERT INTO restaurants 
  (owner_id, name, description, phone, email, address, latitude, longitude, opening_time, closing_time, delivery_fee, minimum_order, active_status, cuisines,rating, image) 
VALUES
  (
    2,
    'Sultan''s Dine', 
    'Famous authentic Kacchi Biryani in Dhaka', 
    '01711111111', 
    'info@sultansdine.com', 
    'House 4, Road 7, Dhanmondi, Dhaka', 
    23.746100, 
    90.374200, 
    '11:00:00', 
    '23:00:00', 
    60.00, 
    300.00, 
    TRUE, 
    ARRAY['kacchi', 'biryani'],
    3,

  ),
  (
    3, 
    'Chillox', 
    'Juicy gourmet burgers and crispy fries', 
    '01722222222', 
    'contact@chillox.bd', 
    'Block F, Road 11, Banani, Dhaka', 
    23.793700, 
    90.406600, 
    '12:00:00', 
    '23:30:00', 
    50.00, 
    200.00, 
    TRUE, 
    ARRAY['burger', 'fried-chicken'],
    4,
    public\food\chillox.png

  ),
  (
    2, 
    'Kacchi Bhai', 
    'Traditional Kacchi with Borhani and Shahi Morog Polao', 
    '01733333333', 
    'order@kacchibhai.com', 
    'Pink City Basement, Gulshan 2, Dhaka', 
    23.794900, 
    90.414300, 
    '11:30:00', 
    '22:30:00', 
    70.00, 
    250.00, 
    TRUE, 
    ARRAY['kacchi', 'biryani', 'bengali'],
    4
  ),
  (
    3, 
    'Ambala Sweets & Foods', 
    'Traditional Bengali breakfast and sweets', 
    '01744444444', 
    'support@ambala.com', 
    'Nazimuddin Road, Old Dhaka', 
    23.718600, 
    90.398000, 
    '08:00:00', 
    '21:00:00', 
    40.00, 
    150.00, 
    FALSE, 
    ARRAY['bengali', 'dessert'],
    5
  );

-- 2. Insert Categories
INSERT INTO categories (restaurant_id, name, category_img) VALUES
  (1, 'Biryani Mains', '/categories/biryani.png'),
  (1, 'Sides & Beverages', '/categories/drinks.png'),
  (2, 'Burgers', '/categories/burgers.png'),
  (2, 'Appetizers & Fries', '/categories/fries.png');

-- 3. Insert Menu Items
INSERT INTO menu_items (restaurant_id, category_id, item_name, description, price, item_img, is_available) VALUES
  -- Sultan's Dine items (restaurant_id = 1)
  (1, 1, 'Mutton Kacchi Half', 'Standard single portion mutton kacchi with 1 pc mutton & 1 aloo', 380.00, '/items/mutton-kacchi-half.png', TRUE),
  (1, 1, 'Mutton Kacchi Full', 'Large portion mutton kacchi with 2 pcs mutton & 1 aloo', 580.00, '/items/mutton-kacchi-full.png', TRUE),
  (1, 2, 'Shahi Borhani 500ml', 'Traditional sour yogurt drink with mustard and spices', 90.00, '/items/borhani.png', TRUE),

  -- Chillox items (restaurant_id = 2)
  (2, 3, 'Beef Juicy Lucy', 'Single beef patty stuffed with melted cheddar cheese', 290.00, '/items/juicy-lucy.png', TRUE),
  (2, 3, 'Chicken Cheese Blast', 'Crispy chicken patty topped with double cheese slice', 260.00, '/items/chicken-cheese.png', TRUE),
  (2, 4, 'Naga Drumsticks 4pcs', 'Extremely spicy deep-fried chicken drumsticks', 220.00, '/items/naga-wings.png', TRUE);

