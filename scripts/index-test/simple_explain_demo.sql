
BEGIN;

DROP INDEX ix_order_items_order;

EXPLAIN (ANALYZE, BUFFERS)
SELECT oi.id, oi.menu_item_id, oi.quantity, oi.unit_price, oi.subtotal
FROM order_items oi
WHERE oi.order_id = 150000
ORDER BY oi.id;

-- ROLLBACK restores the dropped index immediately.
ROLLBACK;

-- AFTER: run exactly the same query with the index restored.
EXPLAIN (ANALYZE, BUFFERS)
SELECT oi.id, oi.menu_item_id, oi.quantity, oi.unit_price, oi.subtotal
FROM order_items oi
WHERE oi.order_id = 150000
ORDER BY oi.id;
