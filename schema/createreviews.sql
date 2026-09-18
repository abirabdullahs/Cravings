BEGIN;

-- Create reviews table
drop table reviews;
CREATE TABLE IF NOT EXISTS reviews (
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


-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Auto-update updated_at timestamp function & trigger
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_reviews_updated_at ON reviews;
CREATE TRIGGER trigger_update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

COMMIT;