-- Align existing databases with the delivery flow used by the rider UI:
-- accepted -> arrived_at_store -> picked_up -> arrived_at_destination -> delivered.
ALTER TYPE delivery_status_enum
  ADD VALUE IF NOT EXISTS 'arrived_at_store' AFTER 'accepted';

ALTER TYPE delivery_status_enum
  ADD VALUE IF NOT EXISTS 'arrived_at_destination' AFTER 'picked_up';

ALTER TABLE delivery_location_history
  DROP CONSTRAINT IF EXISTS ck_delivery_location_history_event;

ALTER TABLE delivery_location_history
  DROP CONSTRAINT IF EXISTS delivery_location_history_event_check;

ALTER TABLE delivery_location_history
  ADD CONSTRAINT delivery_location_history_event_check
  CHECK (event IN (
    'accepted',
    'arrived_at_store',
    'picked_up',
    'out_for_delivery',
    'arrived_at_destination',
    'delivered'
  ));
