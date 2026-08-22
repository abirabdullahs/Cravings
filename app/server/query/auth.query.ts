export const FIND_USER_BY_EMAIL = `
  SELECT *
  FROM users
  WHERE email = $1;
`;

export const INSERT_USER = `
  INSERT INTO users (email, name, password, phone, role)
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
