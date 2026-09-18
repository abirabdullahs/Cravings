export const FIND_NOTIFICATIONS = `
SELECT id, user_id, order_id, title, message, is_read, created_at
FROM notifications
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 20;`;

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
SET is_read = true
WHERE user_id = $1
RETURNING *;`;
