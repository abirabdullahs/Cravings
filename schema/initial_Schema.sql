


-- ============================================================
-- ENUM TYPES
-- ============================================================
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
  'pending',          -- Order created, payment/confirmation pending
  'confirmed',        -- Order confirmed, sent to kitchen
  'preparing',        -- Kitchen is cooking
  'ready',            -- Food ready for pickup
  'out_for_delivery', -- Rider picked up order and is en route
  'delivered',        -- Order completed
  'cancelled'         -- Order aborted
);

CREATE TYPE delivery_status_enum AS ENUM (
  'unassigned',       -- Waiting for driver acceptance
  'accepted',         -- Driver claimed the job
  'picked_up',        -- Driver collected food from store
  'delivered',        -- Driver handed food to customer
  'cancelled'         -- Delivery task aborted
);

CREATE TYPE payment_status_enum AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);

CREATE TYPE discount_type_enum AS ENUM (
  'percentage',
  'fixed_amount'
);


-- ============================================================
-- Reusable trigger: keep an updated_at column current on UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
  id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name           VARCHAR NOT NULL,
  email          VARCHAR NOT NULL,
  phone          VARCHAR,
  password_hash  VARCHAR NOT NULL,
  role           role_enum NOT NULL DEFAULT 'customer',
  profile_image  VARCHAR,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Case-insensitive email uniqueness ('a@x.com' and 'A@x.com' are the same account)
CREATE UNIQUE INDEX uq_users_email_lower ON users (LOWER(email));

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          VARCHAR NOT NULL,
  category_img  VARCHAR,

  CONSTRAINT uq_categories_name UNIQUE (name)
);


-- ============================================================
-- 3. COUPONS
-- ============================================================
CREATE TABLE coupons (
  id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code            VARCHAR NOT NULL,
  discount_type   discount_type_enum NOT NULL,
  discount_value  NUMERIC(10,2) NOT NULL,
  minimum_order   NUMERIC(10,2) NOT NULL DEFAULT 0,
  expiry_date     DATE,

  CONSTRAINT uq_coupons_code UNIQUE (code),
  CONSTRAINT ck_coupons_value_positive CHECK (discount_value > 0),
  CONSTRAINT ck_coupons_percentage_range
      CHECK (discount_type <> 'percentage' OR discount_value <= 100),
  CONSTRAINT ck_coupons_minimum_order CHECK (minimum_order >= 0)
);


-- ============================================================
-- 4. USER_ADDRESSES
-- ============================================================
CREATE TABLE user_addresses (
  id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         INT NOT NULL,
  label           VARCHAR,
  address         TEXT NOT NULL,
  street          VARCHAR,
  apartment_name  VARCHAR,
  city            VARCHAR NOT NULL,
  postal_code     VARCHAR,
  latitude        NUMERIC(9,6),
  longitude       NUMERIC(9,6),

  CONSTRAINT fk_user_addresses_user FOREIGN KEY (user_id) REFERENCES users (id)
      ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE
);

CREATE INDEX ix_user_addresses_user ON user_addresses (user_id);


-- ============================================================
-- 5. RIDERS
-- ============================================================
CREATE TABLE riders (
  user_id         INT PRIMARY KEY,
  vehicle_type    VARCHAR NOT NULL,
  vehicle_number  VARCHAR NOT NULL,
  status          rider_status_enum NOT NULL DEFAULT 'idle',
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_riders_user FOREIGN KEY (user_id) REFERENCES users (id)
      ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT uq_riders_vehicle_number UNIQUE (vehicle_number)
);

CREATE TRIGGER trg_riders_updated_at
  BEFORE UPDATE ON riders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 6. USER_COUPONS
-- ============================================================
CREATE TABLE user_coupons (
  id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    INT NOT NULL,
  coupon_id  INT NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT FALSE,

  CONSTRAINT fk_user_coupons_user FOREIGN KEY (user_id) REFERENCES users (id)
      ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_user_coupons_coupon FOREIGN KEY (coupon_id) REFERENCES coupons (id)
      DEFERRABLE INITIALLY IMMEDIATE
);

CREATE INDEX ix_user_coupons_user ON user_coupons (user_id);


-- ============================================================
-- 7. RESTAURANTS
-- ============================================================
CREATE TABLE restaurants (
  id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id       INT NOT NULL,
  name           VARCHAR NOT NULL,
  description    TEXT,
  phone          VARCHAR,
  email          VARCHAR,
  address        TEXT NOT NULL,
  latitude       NUMERIC(9,6),
  longitude      NUMERIC(9,6),
  opening_time   TIME,
  closing_time   TIME,
  delivery_fee   NUMERIC(10,2) NOT NULL DEFAULT 0,
  minimum_order  NUMERIC(10,2) NOT NULL DEFAULT 0,
  active_status  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_restaurants_owner FOREIGN KEY (owner_id) REFERENCES users (id)
      DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT ck_restaurants_fees CHECK (delivery_fee >= 0 AND minimum_order >= 0)
);

CREATE INDEX ix_restaurants_owner ON restaurants (owner_id);

CREATE TRIGGER trg_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 8. MENU_ITEMS
-- ============================================================
CREATE TABLE menu_items (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id INT NOT NULL,
  category_id   INT,
  item_name     VARCHAR NOT NULL,
  description   TEXT,
  price         NUMERIC(10,2) NOT NULL,
  item_img      VARCHAR,
  is_available  BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_menu_items_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
      ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_menu_items_category FOREIGN KEY (category_id) REFERENCES categories (id)
      ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT ck_menu_items_price CHECK (price >= 0)
);

CREATE INDEX ix_menu_items_restaurant ON menu_items (restaurant_id, is_available);
CREATE INDEX ix_menu_items_category ON menu_items (category_id);

CREATE TRIGGER trg_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 9. CARTS
-- ============================================================
CREATE TABLE carts (
  id               INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          INT NOT NULL,
  restaurant_id    INT NOT NULL,
  user_coupons_id  INT,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_cart_user_restaurant UNIQUE (user_id, restaurant_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id)
      ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_cart_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
      DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_cart_coupon FOREIGN KEY (user_coupons_id) REFERENCES user_coupons (id)
      DEFERRABLE INITIALLY IMMEDIATE
);

CREATE INDEX ix_carts_user ON carts (user_id);


-- ============================================================
-- 10. CART_ITEMS
-- ============================================================
CREATE TABLE cart_items (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cart_id       INT NOT NULL,
  menu_item_id  INT NOT NULL,
  quantity      INT NOT NULL DEFAULT 1,

  CONSTRAINT uq_cart_item UNIQUE (cart_id, menu_item_id),
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts (id)
      ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_cart_items_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
      DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT ck_cart_items_quantity CHECK (quantity > 0)
);

CREATE INDEX ix_cart_items_cart ON cart_items (cart_id);


-- ============================================================
-- 11. ORDERS
-- ============================================================
CREATE TABLE orders (
  id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        INT NOT NULL,
  restaurant_id  INT NOT NULL,
  address_id     INT NOT NULL,
  total_amount   NUMERIC(10,2) NOT NULL,
  delivery_fee   NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount       NUMERIC(10,2) NOT NULL DEFAULT 0,
  order_status   order_status_enum NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id)
      DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_orders_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
      DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES user_addresses (id)
      DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT ck_orders_amounts
      CHECK (total_amount >= 0 AND delivery_fee >= 0 AND discount >= 0)
);

CREATE INDEX ix_orders_user ON orders (user_id, created_at);
CREATE INDEX ix_orders_restaurant ON orders (restaurant_id, order_status);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 12. ORDER_ITEMS
-- ============================================================
CREATE TABLE order_items (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id      INT NOT NULL,
  menu_item_id  INT NOT NULL,
  unit_price    NUMERIC(10,2) NOT NULL,
  quantity      INT NOT NULL,
  subtotal      NUMERIC(10,2) NOT NULL,

  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id)
      ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_order_items_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
      DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT ck_order_items_quantity CHECK (quantity > 0),
  CONSTRAINT ck_order_items_amounts CHECK (unit_price >= 0 AND subtotal >= 0)
);

CREATE INDEX ix_order_items_order ON order_items (order_id);


-- ============================================================
-- 13. PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id        INT NOT NULL,
  transaction_id  VARCHAR,
  payment_method  VARCHAR NOT NULL,
  amount          NUMERIC(10,2) NOT NULL,
  status          payment_status_enum NOT NULL DEFAULT 'pending',
  paid_at         TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id)
      DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT uq_payments_transaction_id UNIQUE (transaction_id),
  CONSTRAINT ck_payments_amount CHECK (amount > 0),
  CONSTRAINT ck_payments_method
      CHECK (payment_method IN ('card','mobile_banking','bank_transfer','cash'))
);

CREATE INDEX ix_payments_order ON payments (order_id, status);


-- ============================================================
-- 14. DELIVERIES
-- ============================================================
CREATE TABLE deliveries (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id      INT NOT NULL,
  rider_id      INT,
  assigned_at   TIMESTAMP,
  delivered_at  TIMESTAMP,
  status        delivery_status_enum NOT NULL DEFAULT 'unassigned',
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),

  -- one order has exactly one delivery record
  CONSTRAINT uq_deliveries_order UNIQUE (order_id),
  CONSTRAINT fk_deliveries_order FOREIGN KEY (order_id) REFERENCES orders (id)
      DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_deliveries_rider FOREIGN KEY (rider_id) REFERENCES riders (user_id)
      ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT ck_deliveries_times
      CHECK (delivered_at IS NULL OR assigned_at IS NULL OR delivered_at >= assigned_at)
);

CREATE INDEX ix_deliveries_rider ON deliveries (rider_id, status);

CREATE TRIGGER trg_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 15. REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        INT NOT NULL,
  order_id       INT NOT NULL,
  restaurant_id  INT NOT NULL,
  rating         INT NOT NULL,
  comment        TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),

  -- one review per order
  CONSTRAINT uq_reviews_order UNIQUE (order_id),
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id)
      DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES orders (id)
      DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_reviews_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
      DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT ck_reviews_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX ix_reviews_restaurant ON reviews (restaurant_id);


-- ============================================================
-- 16. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     INT NOT NULL,
  order_id    INT,
  title       VARCHAR NOT NULL,
  message     TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id)
      ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT fk_notifications_order FOREIGN KEY (order_id) REFERENCES orders (id)
      DEFERRABLE INITIALLY IMMEDIATE
);

CREATE INDEX ix_notifications_user ON notifications (user_id, is_read, created_at);


-- ============================================================
-- VIEW: ACTIVE DELIVERIES
-- Dashboard-style view, one row per delivery still in flight.
-- ============================================================
-- CREATE OR REPLACE VIEW vw_active_deliveries AS
-- SELECT
--     d.id            AS delivery_id,
--     o.id            AS order_id,
--     o.order_status,
--     d.status        AS delivery_status,
--     r.name          AS restaurant_name,
--     cu.name         AS customer_name,
--     ru.name         AS rider_name,
--     d.assigned_at,
--     d.delivered_at
-- FROM deliveries d
-- JOIN orders o        ON o.id = d.order_id
-- JOIN restaurants r   ON r.id = o.restaurant_id
-- JOIN users cu        ON cu.id = o.user_id
-- LEFT JOIN riders ri   ON ri.user_id = d.rider_id
-- LEFT JOIN users ru    ON ru.id = ri.user_id
-- WHERE d.status NOT IN ('delivered', 'cancelled');


