-- Existing installations need the acceptance event before riders can save
-- their first GPS point when claiming a delivery.
ALTER TABLE delivery_location_history
  DROP CONSTRAINT IF EXISTS delivery_location_history_event_check;

ALTER TABLE delivery_location_history
  ADD CONSTRAINT delivery_location_history_event_check
  CHECK (event IN ('accepted', 'arrived_at_store', 'picked_up', 'out_for_delivery', 'delivered'));