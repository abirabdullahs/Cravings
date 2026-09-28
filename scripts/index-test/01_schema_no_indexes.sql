-- Relevant project schema, minus the 16 secondary (performance) indexes and triggers/functions
-- that don't affect reads. PK / UNIQUE / FK constraints are kept (they create their own indexes).
CREATE TYPE role_enum AS ENUM ('admin','customer','owner','rider');
CREATE TYPE rider_status_enum AS ENUM ('offline','idle','busy');
CREATE TYPE order_status_enum AS ENUM ('pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled');
CREATE TYPE delivery_status_enum AS ENUM ('unassigned','accepted','arrived_at_store','picked_up','arrived_at_destination','delivered','cancelled');
CREATE TYPE payment_status_enum AS ENUM ('pending','completed','failed','refunded');
CREATE TYPE role_request_status_enum AS ENUM ('PENDING','APPROVED','REJECTED');

CREATE FUNCTION calculate_distance_km(
  lat1 NUMERIC, lon1 NUMERIC, lat2 NUMERIC, lon2 NUMERIC
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

CREATE TABLE users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR NOT NULL, email VARCHAR NOT NULL, phone VARCHAR,
  password_hash VARCHAR NOT NULL, role role_enum NOT NULL DEFAULT 'customer',
  profile_image VARCHAR,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX uq_users_email_lower ON users (LOWER(email));

CREATE TABLE user_addresses (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  label VARCHAR, address TEXT NOT NULL, street VARCHAR, apartment_name VARCHAR,
  city VARCHAR NOT NULL, postal_code VARCHAR,
  latitude NUMERIC(9,6), longitude NUMERIC(9,6)
);

CREATE TABLE restaurants (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id INT NOT NULL REFERENCES users (id),
  name VARCHAR NOT NULL, description TEXT, phone VARCHAR, email VARCHAR,
  address TEXT NOT NULL, area VARCHAR,
  latitude NUMERIC(9,6), longitude NUMERIC(9,6),
  opening_time TIME, closing_time TIME,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0, minimum_order NUMERIC(10,2) NOT NULL DEFAULT 0,
  active_status BOOLEAN NOT NULL DEFAULT FALSE,
  cuisines VARCHAR[] NOT NULL DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0.0, image VARCHAR,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR NOT NULL, category_img VARCHAR,
  restaurant_id INT REFERENCES restaurants (id) ON DELETE CASCADE,
  CONSTRAINT uq_categories_name UNIQUE (name, restaurant_id)
);

CREATE TABLE menu_items (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id INT NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  category_id INT REFERENCES categories (id) ON DELETE SET NULL,
  item_name VARCHAR NOT NULL, description TEXT,
  price NUMERIC(10,2) NOT NULL, item_img VARCHAR,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  archived_at TIMESTAMPTZ, updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE riders (
  user_id INT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  vehicle_type VARCHAR NOT NULL, vehicle_plate VARCHAR NOT NULL UNIQUE,
  license_number VARCHAR NOT NULL UNIQUE, nid_number VARCHAR,
  status rider_status_enum NOT NULL DEFAULT 'idle',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users (id),
  restaurant_id INT NOT NULL REFERENCES restaurants (id),
  address_id INT NOT NULL REFERENCES user_addresses (id),
  idempotency_key UUID NOT NULL,
  delivery_instructions TEXT,
  total_amount NUMERIC(10,2) NOT NULL, delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  order_status order_status_enum NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX uq_orders_user_idempotency ON orders (user_id, idempotency_key);

CREATE TABLE order_items (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  menu_item_id INT NOT NULL REFERENCES menu_items (id),
  unit_price NUMERIC(10,2) NOT NULL, quantity INT NOT NULL, subtotal NUMERIC(10,2) NOT NULL
);

CREATE TABLE payments (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders (id),
  transaction_id VARCHAR(100) UNIQUE,
  payment_method VARCHAR NOT NULL, amount NUMERIC(10,2) NOT NULL,
  status payment_status_enum NOT NULL DEFAULT 'pending', paid_at TIMESTAMP
);

CREATE TABLE deliveries (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id INT NOT NULL UNIQUE REFERENCES orders (id),
  rider_id INT REFERENCES riders (user_id) ON DELETE SET NULL,
  assigned_at TIMESTAMP, delivered_at TIMESTAMP,
  status delivery_status_enum NOT NULL DEFAULT 'unassigned',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE delivery_location_history (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  delivery_id INT NOT NULL REFERENCES deliveries (id) ON DELETE CASCADE,
  latitude NUMERIC(9,6) NOT NULL, longitude NUMERIC(9,6) NOT NULL,
  event VARCHAR(32) NOT NULL, recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users (id),
  order_id INT NOT NULL UNIQUE REFERENCES orders (id),
  restaurant_id INT NOT NULL REFERENCES restaurants (id),
  rider_id INT REFERENCES riders (user_id),
  rating INT NOT NULL, rider_rating INT, comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  order_id INT REFERENCES orders (id),
  title VARCHAR NOT NULL, message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
