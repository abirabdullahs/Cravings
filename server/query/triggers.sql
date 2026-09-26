-- Quantity zero is handled as an explicit DELETE by cart.service.ts.
-- Keeping CHECK (quantity > 0) protects the table from invalid rows; an
-- AFTER UPDATE trigger cannot delete a zero row because the check runs first.
DROP TRIGGER IF EXISTS tr_delete_empty_items ON cart_items;
DROP FUNCTION IF EXISTS fn_delete_empty_items();
