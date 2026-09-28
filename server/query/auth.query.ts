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

export const INSERT_RIDER_PROFILE = `
INSERT INTO riders (user_id, vehicle_type, vehicle_plate, license_number, nid_number, status, updated_at)
VALUES ($1, $2, $3, $4, $5, 'idle', NOW())
ON CONFLICT (user_id) DO UPDATE SET
  vehicle_type = EXCLUDED.vehicle_type,
  vehicle_plate = EXCLUDED.vehicle_plate,
  license_number = EXCLUDED.license_number,
  nid_number = EXCLUDED.nid_number,
  status = 'idle',
  updated_at = NOW()
RETURNING *;`;

export const INSERT_RESTAURANT_OWNER_PROFILE = `
INSERT INTO restaurant_owners (user_id, nid_number, business_name, trade_licence, address)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (user_id) DO UPDATE SET
  nid_number = EXCLUDED.nid_number,
  business_name = EXCLUDED.business_name,
  trade_licence = EXCLUDED.trade_licence,
  address = EXCLUDED.address
RETURNING *;`;

export const INSERT_ROLE_REQUEST = `
  INSERT INTO role_requests (user_id, source_role, requested_role, status, details, verification_data)
  VALUES ($1, $2, $3, 'PENDING', $4, COALESCE($5, '{}'::jsonb))
  RETURNING *;
`;

export const FIND_APPROVED_ROLE_REQUEST_FOR_CURRENT_ROLE = `
  SELECT rr.*
  FROM role_requests rr
  JOIN users u ON u.id = rr.user_id
  WHERE rr.user_id = $1
    AND rr.status = 'APPROVED'
    AND rr.requested_role = u.role
  ORDER BY rr.reviewed_at DESC NULLS LAST, rr.created_at DESC
  LIMIT 1;
`;

export const FIND_PENDING_ROLE_REQUEST_BY_USER_AND_ROLE = `
  SELECT *
  FROM role_requests
  WHERE user_id = $1
    AND requested_role = $2
    AND status = 'PENDING'
  ORDER BY created_at DESC
  LIMIT 1;
`;

export const FIND_ROLE_REQUEST_FOR_PROFILE = `
  SELECT rr.*
  FROM role_requests rr
  JOIN users u ON u.id = rr.user_id
  WHERE rr.user_id = $1
    AND (
      rr.status = 'PENDING'
      OR (rr.status = 'APPROVED' AND rr.requested_role = u.role)
      OR (rr.status = 'REJECTED' AND u.role = 'customer')
    )
  ORDER BY
    CASE rr.status WHEN 'PENDING' THEN 0 WHEN 'APPROVED' THEN 1 ELSE 2 END,
    rr.created_at DESC
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
    rr.verification_data,
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
  SET status = $1,
      reviewed_at = NOW(),
      reviewed_by = $2,
      review_note = $3,
      rejection_reason = $4,
      updated_at = NOW()
  WHERE id = $5
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
