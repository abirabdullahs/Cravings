export const FIND_USER_ADDRESSES = `
  SELECT id, label, address, street, apartment_name, city, postal_code, latitude, longitude
  FROM user_addresses
  WHERE user_id = $1
  ORDER BY id ASC
`;

export const INSERT_ADDRESS = `
  INSERT INTO user_addresses (user_id, label, address, street, apartment_name, city, postal_code, latitude, longitude)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING id, label, address, street, apartment_name, city, postal_code, latitude, longitude
`;

export const UPDATE_ADDRESS = `
  UPDATE user_addresses
  SET label = $2, address = $3, street = $4, apartment_name = $5, city = $6, postal_code = $7, latitude = $8, longitude = $9
  WHERE id = $1 AND user_id = $10
  RETURNING id, label, address, street, apartment_name, city, postal_code, latitude, longitude
`;

export const DELETE_ADDRESS = `
  DELETE FROM user_addresses
  WHERE id = $1 AND user_id = $2
  RETURNING id
`;

export const FIND_ADDRESS_BY_ID = `
  SELECT id, label, address, street, apartment_name, city, postal_code, latitude, longitude
  FROM user_addresses
  WHERE id = $1 AND user_id = $2
`;
