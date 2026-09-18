export const FIND_NOTIFICATIONS = `
FIND id, title, message, created_at
FROM notifications
WHERE user_id = $1
LIMIT 20;`

export const INSERT_NOTIFICATION = `
INSERT INTO notifications (user_id, order_id, title, message)
VALUES ($1, $2, $3, $4)
RETURNING *;`

export const MARK_READ = `
UPDATE notifications
SET is_read = true
WHERE id = $1
RETURNING *;`

export const MARK_ALL_READ = `
UPDATE notifications
SET is_read = true
WHERE user_id = $1
RETURNING *;`