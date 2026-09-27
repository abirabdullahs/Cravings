-- Additive migration for event-based delivery location tracking.
-- Run after schema.sql and before enabling the rider status UI.

ALTER TABLE restaurants
  ADD CONSTRAINT ck_restaurants_latitude_range
  CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90) NOT VALID;

ALTER TABLE restaurants
  ADD CONSTRAINT ck_restaurants_longitude_range
  CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180) NOT VALID;

ALTER TABLE user_addresses
  ADD CONSTRAINT ck_user_addresses_latitude_range
  CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90) NOT VALID;

ALTER TABLE user_addresses
  ADD CONSTRAINT ck_user_addresses_longitude_range
  CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180) NOT VALID;

CREATE TABLE IF NOT EXISTS delivery_location_history (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  delivery_id INT NOT NULL REFERENCES deliveries (id) ON DELETE CASCADE,
  latitude NUMERIC(9,6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude NUMERIC(9,6) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  event VARCHAR(32) NOT NULL CHECK (event IN ('accepted', 'arrived_at_store', 'picked_up', 'out_for_delivery', 'delivered')),
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_delivery_location_history_delivery_time
  ON delivery_location_history (delivery_id, recorded_at DESC);

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