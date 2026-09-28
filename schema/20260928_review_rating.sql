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
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reviews_update_restaurant_rating ON reviews;

CREATE TRIGGER trg_reviews_update_restaurant_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();

UPDATE restaurants restaurant
SET rating = (
  SELECT COALESCE(ROUND(AVG(review.rating)::numeric, 1), 0.0)
  FROM reviews review
  WHERE review.restaurant_id = restaurant.id
);
