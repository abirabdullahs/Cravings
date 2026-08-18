export const Find_User_By_Email = "select * from users where email = $1;";
export const Create_User = `INSERT INTO users (email, name, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;

export const Complete_User = `UPDATE users SET role = $1, phone = $2 WHERE id = $3 RETURNING *;`;
