
CREATE TYPE role_enum AS ENUM (
  'admin',
  'customer',
  'owner',
  'rider'
);

CREATE TYPE rider_status_enum AS ENUM (
  'offline',
  'idle',
  'busy'
);

CREATE TYPE order_status_enum AS ENUM (
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

CREATE TYPE delivery_status_enum AS ENUM (
  'unassigned',
  'accepted',
  'arrived_at_store',
  'picked_up',
  'arrived_at_destination',
  'delivered',
  'cancelled'
);

CREATE TYPE payment_status_enum AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);

CREATE TYPE role_request_status_enum AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED'
);

CREATE TYPE discount_type_enum AS ENUM (
  'percentage',
  'fixed_amount'
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 NUMERIC,
  lon1 NUMERIC,
  lat2 NUMERIC,
  lon2 NUMERIC
)
RETURNS NUMERIC
LANGUAGE SQL
IMMUTABLE
STRICT
AS $$
  SELECT 6371.0 * 2 * ASIN(SQRT(
    POWER(SIN(RADIANS(lat2 - lat1) / 2), 2) +
    COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
    POWER(SIN(RADIANS(lon2 - lon1) / 2), 2)
  ));
$$;

CREATE OR REPLACE FUNCTION calculate_delivery_fee(distance_km NUMERIC)
RETURNS NUMERIC(10,2)
LANGUAGE SQL
IMMUTABLE
STRICT
AS $$
  SELECT CASE
    WHEN distance_km <= 2 THEN 40.00
    WHEN distance_km <= 5 THEN 60.00
    WHEN distance_km <= 8 THEN 80.00
    ELSE 80.00 + CEIL(distance_km - 8) * 10.00
  END::NUMERIC(10,2);
$$;

CREATE TABLE users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  password_hash VARCHAR NOT NULL,
  role role_enum NOT NULL DEFAULT 'customer',
  profile_image VARCHAR,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_users_email_lower ON users (LOWER(email));

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE user_addresses (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  label VARCHAR,
  address TEXT NOT NULL,
  street VARCHAR,
  apartment_name VARCHAR,
  city VARCHAR NOT NULL,
  postal_code VARCHAR,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  CONSTRAINT fk_user_addresses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT ck_user_addresses_latitude_range CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CONSTRAINT ck_user_addresses_longitude_range CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);

CREATE INDEX ix_user_addresses_user ON user_addresses (user_id);

CREATE TABLE restaurants (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id INT NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  phone VARCHAR,
  email VARCHAR,
  address TEXT NOT NULL,
  area VARCHAR,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  opening_time TIME,
  closing_time TIME,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  minimum_order NUMERIC(10,2) NOT NULL DEFAULT 0,
  active_status BOOLEAN NOT NULL DEFAULT FALSE,
  cuisines VARCHAR[] NOT NULL DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0.0,
  image VARCHAR,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_restaurants_owner FOREIGN KEY (owner_id) REFERENCES users (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT ck_restaurants_fees CHECK (delivery_fee >= 0 AND minimum_order >= 0),
  CONSTRAINT ck_restaurants_latitude_range CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CONSTRAINT ck_restaurants_longitude_range CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);

CREATE INDEX ix_restaurants_owner ON restaurants (owner_id);

CREATE TRIGGER trg_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE categories (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR NOT NULL,
  category_img VARCHAR,
  restaurant_id INT REFERENCES restaurants (id) ON DELETE CASCADE,
  CONSTRAINT uq_categories_name UNIQUE (name, restaurant_id)
);

CREATE INDEX ix_categories_restaurant ON categories (restaurant_id);

CREATE TABLE menu_items (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id INT NOT NULL,
  category_id INT,
  item_name VARCHAR NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  item_img VARCHAR,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_menu_items_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_menu_items_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT ck_menu_items_price CHECK (price >= 0)
);

CREATE INDEX ix_menu_items_restaurant ON menu_items (restaurant_id, is_available);
CREATE INDEX ix_menu_items_category ON menu_items (category_id);

CREATE TRIGGER trg_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE riders (
  user_id INT PRIMARY KEY,
  vehicle_type VARCHAR NOT NULL,
  vehicle_plate VARCHAR NOT NULL,
  license_number VARCHAR NOT NULL,
  status rider_status_enum NOT NULL DEFAULT 'idle',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_riders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT uq_riders_vehicle_number UNIQUE (vehicle_number)
);

CREATE TRIGGER trg_riders_updated_at
  BEFORE UPDATE ON riders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE coupons (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code VARCHAR NOT NULL,
  discount_type discount_type_enum NOT NULL,
  discount_value NUMERIC(10,2) NOT NULL,
  minimum_order NUMERIC(10,2) NOT NULL DEFAULT 0,
  expiry_date DATE,
  CONSTRAINT uq_coupons_code UNIQUE (code),
  CONSTRAINT ck_coupons_value_positive CHECK (discount_value > 0),
  CONSTRAINT ck_coupons_percentage_range CHECK (discount_type <> 'percentage' OR discount_value <= 100),
  CONSTRAINT ck_coupons_minimum_order CHECK (minimum_order >= 0)
);

CREATE TABLE user_coupons (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  coupon_id INT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_user_coupons_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_user_coupons_coupon FOREIGN KEY (coupon_id) REFERENCES coupons (id) DEFERRABLE INITIALLY IMMEDIATE
);

CREATE INDEX ix_user_coupons_user ON user_coupons (user_id);

CREATE TABLE carts (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  user_coupons_id INT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_cart_user_restaurant UNIQUE (user_id, restaurant_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_cart_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_cart_coupon FOREIGN KEY (user_coupons_id) REFERENCES user_coupons (id) DEFERRABLE INITIALLY IMMEDIATE
);

CREATE INDEX ix_carts_user ON carts (user_id);

CREATE TABLE cart_items (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cart_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  CONSTRAINT uq_cart_item UNIQUE (cart_id, menu_item_id),
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_cart_items_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT ck_cart_items_quantity CHECK (quantity > 0)
);

CREATE INDEX ix_cart_items_cart ON cart_items (cart_id);

CREATE TABLE orders (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  address_id INT NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  order_status order_status_enum NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_orders_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES user_addresses (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT ck_orders_amounts CHECK (total_amount >= 0 AND delivery_fee >= 0 AND discount >= 0)
);

CREATE INDEX ix_orders_user ON orders (user_id, created_at);
CREATE INDEX ix_orders_restaurant ON orders (restaurant_id, order_status);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE order_items (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_order_items_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT ck_order_items_quantity CHECK (quantity > 0),
  CONSTRAINT ck_order_items_amounts CHECK (unit_price >= 0 AND subtotal >= 0)
);

CREATE INDEX ix_order_items_order ON order_items (order_id);

CREATE TABLE payments (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id INT NOT NULL,
  transaction_id VARCHAR,
  payment_method VARCHAR NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status payment_status_enum NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT uq_payments_transaction_id UNIQUE (transaction_id),
  CONSTRAINT ck_payments_amount CHECK (amount > 0),
  CONSTRAINT ck_payments_method CHECK (payment_method IN ('card','mobile_banking','bank_transfer','cash'))
);

CREATE INDEX ix_payments_order ON payments (order_id, status);

CREATE TABLE deliveries (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id INT NOT NULL,
  rider_id INT,
  assigned_at TIMESTAMP,
  delivered_at TIMESTAMP,
  status delivery_status_enum NOT NULL DEFAULT 'unassigned',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_deliveries_order UNIQUE (order_id),
  CONSTRAINT fk_deliveries_order FOREIGN KEY (order_id) REFERENCES orders (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_deliveries_rider FOREIGN KEY (rider_id) REFERENCES riders (user_id) ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT ck_deliveries_times CHECK (delivered_at IS NULL OR assigned_at IS NULL OR delivered_at >= assigned_at)
);

CREATE INDEX ix_deliveries_rider ON deliveries (rider_id, status);

CREATE TRIGGER trg_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE delivery_location_history (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  delivery_id INT NOT NULL,
  latitude NUMERIC(9,6) NOT NULL,
  longitude NUMERIC(9,6) NOT NULL,
  event VARCHAR(32) NOT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_delivery_location_history_delivery FOREIGN KEY (delivery_id) REFERENCES deliveries (id) ON DELETE CASCADE,
  CONSTRAINT ck_delivery_location_history_lat CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT ck_delivery_location_history_lng CHECK (longitude BETWEEN -180 AND 180),
  CONSTRAINT ck_delivery_location_history_event CHECK (event IN ('accepted', 'arrived_at_store', 'picked_up', 'out_for_delivery', 'delivered'))
);

CREATE INDEX ix_delivery_location_history_delivery_time ON delivery_location_history (delivery_id, recorded_at DESC);


CREATE TABLE reviews (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  order_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  rider_id INT, -- Optional link to rate the delivery rider
  rating INT NOT NULL, -- Restaurant / Food rating (1-5)
  rider_rating INT, -- Delivery service rating (1-5)
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_reviews_order UNIQUE (order_id),
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES orders (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_reviews_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_reviews_rider FOREIGN KEY (rider_id) REFERENCES riders (user_id) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT ck_reviews_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT ck_reviews_rider_rating CHECK (rider_rating IS NULL OR rider_rating BETWEEN 1 AND 5)
);

CREATE INDEX ix_reviews_restaurant ON reviews (restaurant_id);
CREATE INDEX ix_reviews_rider ON reviews (rider_id);

CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE restaurants
  SET rating = (
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0.0)
    FROM reviews
    WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
  )
  WHERE id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_update_restaurant_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();

CREATE TABLE role_requests (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  source_role role_enum NOT NULL DEFAULT 'customer',
  requested_role role_enum NOT NULL,
  status role_request_status_enum NOT NULL DEFAULT 'PENDING',
  details TEXT,
  review_note TEXT,
  rejection_reason TEXT,
  verification_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by INT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_role_requests_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_role_requests_reviewer FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT chk_role_request_requested_role CHECK (requested_role IN ('owner', 'rider'))
);

CREATE INDEX ix_role_requests_user ON role_requests (user_id, status, created_at);
CREATE INDEX ix_role_requests_status ON role_requests (status, requested_role);

CREATE TRIGGER trg_role_requests_updated_at
  BEFORE UPDATE ON role_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE notifications (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  order_id INT,
  title VARCHAR NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_notifications_order FOREIGN KEY (order_id) REFERENCES orders (id) DEFERRABLE INITIALLY IMMEDIATE
);

CREATE INDEX ix_notifications_user ON notifications (user_id, is_read, created_at);