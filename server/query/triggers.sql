CREATE OR REPLACE FUNCTION fn_calculate_discount(
    p_disc_value NUMERIC,
    p_disc_type discount_type_enum,
    p_total_amount NUMERIC
) RETURNS INT AS $$
  SELECT GREATEST(0, LEAST(
    COALESCE(p_total_amount, 0),
    CASE p_disc_type
      WHEN 'percentage' THEN ROUND(COALESCE(p_total_amount, 0) * (COALESCE(p_disc_value, 0) / 100.0))::INT
      WHEN 'fixed_amount' THEN COALESCE(p_disc_value, 0)
      ELSE 0
    END
  ));
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION fn_delete_empty_items()
RETURNS TRIGGER AS
$$
BEGIN
  IF(NEW.quantity <= 0) THEN
    DELETE FROM cart_items WHERE id = NEW.id;
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER tr_delete_empty_items
AFTER UPDATE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION fn_delete_empty_items();
