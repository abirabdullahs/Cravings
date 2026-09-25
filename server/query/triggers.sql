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
