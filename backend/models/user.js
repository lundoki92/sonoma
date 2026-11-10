import db from '../server/db.js';

const PUBLIC_COLUMNS = 'id, username, email';

export async function foundByEmail(email) {
	const { rows } = await db.query(
		`SELECT ${PUBLIC_COLUMNS}, password_hash FROM users WHERE email = $1`,
		[email]
	);
	return rows[0] ?? null;
}

export async function foundById(id) {
	const { rows } = await db.query(
		`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`,
		[id]
	);
	return rows[0] ?? null;
}

export async function create({ username, email, passwordHash }) {
	const { rows } = await db.query(
		`INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING ${PUBLIC_COLUMNS}`,
		[username, email, passwordHash]
	);
	return rows[0];
}