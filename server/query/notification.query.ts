export const FIND_NOTIFICATIONS = `
SELECT id, user_id, order_id, title, message, is_read, created_at
FROM notifications
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 20;`;

export const COUNT_UNREAD_NOTIFICATIONS = `
SELECT COUNT(*)::int AS unread_count
FROM notifications
WHERE user_id = $1 AND is_read = FALSE;
`;

export const INSERT_NOTIFICATION = `
INSERT INTO notifications (user_id, order_id, title, message)
VALUES ($1, $2, $3, $4)
RETURNING *;`;

export const MARK_READ = `
UPDATE notifications
SET is_read = true
WHERE id = $1 AND user_id = $2
RETURNING *;`;

export const MARK_ALL_READ = `
UPDATE notifications
SET is_read = TRUE
WHERE user_id = $1 AND is_read = FALSE;`;

export const INSERT_ORDER_NOTIFICATION = `
INSERT INTO notifications (user_id, order_id, title, message)
SELECT user_id, id, $2, $3
FROM orders
WHERE id = $1
RETURNING *;
`;
