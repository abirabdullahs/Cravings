export const FIND_USER_BY_EMAIL = `
  SELECT *
  FROM users
  WHERE email = $1;
`;

export const FIND_USER_BY_ID = `
  SELECT *
  FROM users
  WHERE id = $1;
`;

export const INSERT_USER = `
  INSERT INTO users (email, name, password_hash, phone, role)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
`;

export const COMPLETE_USER = `
  UPDATE users
  SET role = $1,
      phone = $2
  WHERE id = $3
  RETURNING *;
`;

export const INSERT_ROLE_REQUEST = `
  INSERT INTO role_requests (user_id, source_role, requested_role, status, details, verification_data)
  VALUES ($1, $2, $3, 'PENDING', $4, COALESCE($5, '{}'::jsonb))
  RETURNING *;
`;

export const FIND_ACTIVE_ROLE_REQUEST_BY_USER = `
  SELECT *
  FROM role_requests
  WHERE user_id = $1
  ORDER BY created_at DESC
  LIMIT 1;
`;

export const LIST_ROLE_REQUESTS = `
  SELECT
    rr.id,
    rr.user_id,
    rr.source_role,
    rr.requested_role,
    rr.status,
    rr.details,
    rr.created_at,
    rr.reviewed_at,
    rr.review_note,
    rr.rejection_reason,
    u.name AS requester_name,
    u.email AS requester_email,
    u.phone AS requester_phone,
    u.role AS source_role_from_user
  FROM role_requests rr
  JOIN users u ON u.id = rr.user_id
  ORDER BY rr.created_at DESC;
`;

export const GET_ROLE_REQUEST_BY_ID = `
  SELECT *
  FROM role_requests
  WHERE id = $1;
`;

export const UPDATE_ROLE_REQUEST_STATUS = `
  UPDATE role_requests
  SET status = $2,
      reviewed_at = NOW(),
      reviewed_by = $3,
      review_note = $4,
      rejection_reason = $5,
      updated_at = NOW()
  WHERE id = $6
  RETURNING *;
`;

export const APPROVE_ROLE_REQUEST = `
  UPDATE users
  SET role = $2,
      updated_at = NOW()
  WHERE id = $1
  RETURNING *;
`;

export const UPDATE_USER_PROFILE = `
  UPDATE users
  SET name = COALESCE($2, name),
      phone = COALESCE($3, phone),
      profile_image = COALESCE($4, profile_image)
  WHERE id = $1
  RETURNING *;
`;
