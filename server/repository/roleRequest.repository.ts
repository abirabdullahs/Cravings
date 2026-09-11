import { pool } from "@/lib/db";

export const listRoleRequestsSql = async () => {
  const result = await pool.query(`
    SELECT rr.*, u.name AS requester_name, u.email AS requester_email, u.role AS source_role
    FROM role_requests rr
    JOIN users u ON u.id = rr.user_id
    ORDER BY rr.created_at DESC
  `);
  return result.rows;
};

export const createRoleRequestSql = async ({
  userId,
  currentRole,
  requestedRole,
  details,
}: {
  userId: string;
  currentRole: string;
  requestedRole: string;
  details?: string;
}) => {
  const result = await pool.query(`
    INSERT INTO role_requests (user_id, source_role, requested_role, status, details, created_at)
    VALUES ($1, $2, $3, 'PENDING', $4, NOW())
    RETURNING *
  `, [userId, currentRole, requestedRole, details ?? ""]);
  return result.rows[0];
};

export const reviewRoleRequestSql = async ({
  requestId,
  status,
  reviewedBy,
  reviewNote,
  rejectionReason,
}: {
  requestId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy: string;
  reviewNote?: string;
  rejectionReason?: string;
}) => {
  const result = await pool.query(`
    UPDATE role_requests
    SET status = $2,
        reviewed_by = $3,
        review_note = $4,
        rejection_reason = $5,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = $6
    RETURNING *
  `, [status, reviewedBy, reviewNote ?? "", rejectionReason ?? "", requestId]);
  return result.rows[0];
};
