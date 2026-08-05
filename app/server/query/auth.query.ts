export const Find_User_By_Email = 'select * from users where email = $1';
export const Create_User = `INSERT INTO users (email, name, password, number, role) VALUES ($1, $2, $3, $4, $5) RETURNING *`; 


