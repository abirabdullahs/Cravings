-- Separate removal from operational availability. Apply this migration, then
-- re-apply server/query/procedures.sql so checkout enforces opening hours and
-- rejects archived catalog records.

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS ix_restaurants_owner_archived
  ON restaurants (owner_id, archived_at);

CREATE INDEX IF NOT EXISTS ix_menu_items_restaurant_archived
  ON menu_items (restaurant_id, archived_at);
