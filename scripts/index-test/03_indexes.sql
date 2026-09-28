-- The secondary indexes from your schema (tables that exist in this demo).
CREATE INDEX ix_user_addresses_user ON user_addresses (user_id);
CREATE INDEX ix_restaurants_owner ON restaurants (owner_id);
CREATE INDEX ix_restaurants_owner_archived ON restaurants (owner_id, archived_at);
CREATE INDEX ix_categories_restaurant ON categories (restaurant_id);
CREATE INDEX ix_menu_items_restaurant ON menu_items (restaurant_id, is_available);
CREATE INDEX ix_menu_items_category ON menu_items (category_id);
CREATE INDEX ix_menu_items_restaurant_archived ON menu_items (restaurant_id, archived_at);
CREATE INDEX ix_orders_user ON orders (user_id, created_at);
CREATE INDEX ix_orders_restaurant ON orders (restaurant_id, order_status);
CREATE INDEX ix_order_items_order ON order_items (order_id);
CREATE INDEX ix_payments_order ON payments (order_id, status);
CREATE INDEX ix_deliveries_rider ON deliveries (rider_id, status);
CREATE INDEX ix_delivery_location_history_delivery_time ON delivery_location_history (delivery_id, recorded_at DESC);
CREATE INDEX ix_reviews_restaurant ON reviews (restaurant_id);
CREATE INDEX ix_reviews_rider ON reviews (rider_id);
CREATE INDEX ix_notifications_user ON notifications (user_id, is_read, created_at);
ANALYZE;
