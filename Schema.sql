-- 1. Custom Enum Types
CREATE TYPE role_enum AS ENUM (
  'ADMIN',
  'CUSTOMER',
  'RIDER',
  'OWNER'
);

-- Order Status Lifecycle
CREATE TYPE order_status_enum AS ENUM (
  'PENDING',           -- Order placed, awaiting restaurant acceptance
  'CONFIRMED',         -- Restaurant accepted the order
  'PREPARING',         -- Kitchen is making the food
  'READY_FOR_PICKUP',  -- Food is ready for rider to collect
  'OUT_FOR_DELIVERY',  -- Rider picked up food and is on the way
  'DELIVERED',         -- Order completed successfully
  'CANCELLED'          -- Order cancelled by user, restaurant, or admin
);

-- Delivery Status Lifecycle
CREATE TYPE delivery_status_enum AS ENUM (
  'UNASSIGNED',        -- Searching for a nearby rider
  'ASSIGNED',          -- Rider accepted/assigned to the delivery
  'ARRIVED_AT_STORE',  -- Rider reached the restaurant
  'PICKED_UP',         -- Rider collected order from restaurant
  'DELIVERED',         -- Rider handed order to customer
  'FAILED'             -- Delivery failed (customer unavailable, bad address, etc.)
);

-- Payment Status Lifecycle
CREATE TYPE payment_status_enum AS ENUM (
  'PENDING',           -- Payment initiated/awaiting cash on delivery
  'COMPLETED',         -- Payment successfully processed
  'FAILED',            -- Payment gateway error or card declined
  'REFUNDED'           -- Order cancelled, money refunded
);

-- 2. Base Entity Tables
CREATE TABLE users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR,
  password_hash VARCHAR NOT NULL,
  role role_enum NOT NULL DEFAULT 'CUSTOMER',
  profile_image VARCHAR,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE categories (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_name VARCHAR UNIQUE NOT NULL,
  category_img VARCHAR
);

CREATE TABLE coupons (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code VARCHAR UNIQUE NOT NULL,
  discount_type VARCHAR NOT NULL,
  discount_value INT NOT NULL,
  minimum_order INT DEFAULT 0,
  expiry_date DATE
);

-- 3. Dependent Tables (User level)
CREATE TABLE user_addresses (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  label VARCHAR,
  address TEXT NOT NULL,
  street VARCHAR,
  apparment_name VARCHAR,
  city VARCHAR NOT NULL,
  postal_code VARCHAR,
  latitude DECIMAL,
  longitude DECIMAL,
  CONSTRAINT fk_user_addresses_user FOREIGN KEY (user_id) REFERENCES users (id) DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE riders (
  user_id INT PRIMARY KEY,
  vehicle_type VARCHAR NOT NULL,
  vehicle_number VARCHAR NOT NULL,
  status BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_riders_user FOREIGN KEY (user_id) REFERENCES users (id) DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE user_coupons (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  coupon_id INT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_user_coupons_user FOREIGN KEY (user_id) REFERENCES users (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_user_coupons_coupon FOREIGN KEY (coupon_id) REFERENCES coupons (id) DEFERRABLE INITIALLY IMMEDIATE
);

-- 4. Restaurant & Menu Management
CREATE TABLE restaurants (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id INT NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  phone VARCHAR,
  email VARCHAR,
  address TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  opening_time TIME,
  closing_time TIME,
  delivery_fee INT,
  minimum_order INT DEFAULT 0,
  status BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_restaurants_owner FOREIGN KEY (owner_id) REFERENCES users (id) DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE menu_items (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id INT NOT NULL,
  category_id INT,
  item_name VARCHAR NOT NULL,
  description TEXT,
  price INT NOT NULL,
  item_img VARCHAR,
  stock INT DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_menu_items_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_menu_items_category FOREIGN KEY (category_id) REFERENCES categories (id) DEFERRABLE INITIALLY IMMEDIATE
);

-- 5. Cart Management
CREATE TABLE cart (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  user_coupons_id INT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_restaurant UNIQUE (user_id, restaurant_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_cart_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_cart_coupon FOREIGN KEY (user_coupons_id) REFERENCES user_coupons (id) DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE cart_items (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cart_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES cart (id) DEFERRABLE INITIALLY IMMEDIATE ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) DEFERRABLE INITIALLY IMMEDIATE
);

-- 6. Order Processing
CREATE TABLE orders (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  address_id INT NOT NULL,
  total_amount INT NOT NULL,
  delivery_fee INT DEFAULT 0,
  discount INT DEFAULT 0,
  order_status VARCHAR NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_orders_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES user_addresses (id) DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE order_items (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  unit_price INT NOT NULL,
  quantity INT NOT NULL,
  subtotal INT NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_order_items_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) DEFERRABLE INITIALLY IMMEDIATE
);

-- 7. Post-Order Entities (Payments, Deliveries, Reviews, Notifications)
CREATE TABLE payments (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id INT NOT NULL,
  transaction_id VARCHAR,
  payment_method VARCHAR NOT NULL,
  amount INT NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'PENDING',
  paid_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE deliveries (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id INT NOT NULL,
  rider_id INT,
  assigned_at TIMESTAMP,
  delivered_at TIMESTAMP,
  status VARCHAR NOT NULL DEFAULT 'UNASSIGNED',
  CONSTRAINT fk_deliveries_order FOREIGN KEY (order_id) REFERENCES orders (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_deliveries_rider FOREIGN KEY (rider_id) REFERENCES riders (user_id) DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE reviews (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  order_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES orders (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_reviews_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE notifications (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  order_id INT,
  title VARCHAR NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_notifications_order FOREIGN KEY (order_id) REFERENCES orders (id) DEFERRABLE INITIALLY IMMEDIATE
);