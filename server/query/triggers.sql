CREATE OR REPLACE FUNCTION fn_calculate_discount(
  p_disc_value INT,
  p_disc_type VARCHAR,
  p_total_amount INT
) RETURNS INT AS 
$$
BEGIN
  IF(p_disc_type = 'PERCENT') THEN RETURN COALESCE(p_total_amount * (p_disc_value/100),0);
  ELSE IF(p_disc_type = 'PRECISE') THEN RETURN COALESCE(p_disc_value,0);
  ELSE RETURN 0;
  END IF;
END;
$$ 
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_delete_empty_items()
RETURNS TRIGGER AS
$$
BEGIN
  IF(NEW.quantity <= 0) THEN
    DELETE FROM cartItems WHERE id = OLD.id;
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER tr_delete_empty_items
BEFORE UPDATE ON cartItems
FOR EACH ROW
EXECUTE FUNCTION fn_delete_empty_items();
