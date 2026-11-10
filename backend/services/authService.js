import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as User from '../models/user.js';
import { ErrorHttp } from '../errors.js';

const COUNT_HASH = 10;          // plus c'est haut, plus c'est lent (et sûr)
const SESSION_TIME = '2h';

export async function register({ username, email, password }) {
	// Règle métier : un email ne sert qu'à un seul compte
	const existing = await User.foundByEmail(email);
	if (existing) {
		throw new ErrorHttp(409, 'Un compte existe déjà avec cet email');
	}

	const passwordHash = await bcrypt.hash(password, COUNT_HASH);

	try {
		return await User.create({ username, email, passwordHash });
	} catch (error) {
		if (error.code === '23505') {
			throw new ErrorHttp(409, 'Un compte existe déjà avec cet email');
		}
		throw error;
	}
}

export async function login({ email, password }) {
	const user = await User.foundByEmail(email);

	// Même message que l'email existe ou non : on ne dit pas quels emails sont inscrits
	const correct = user?.password_hash
		&& await bcrypt.compare(password, user.password_hash);
	if (!correct) {
		throw new ErrorHttp(401, 'Email ou mot de passe incorrect');
	}

	const token = jwt.sign(
		{ sub: user.id, role: user.role },
		process.env.JWT_SECRET,
		{ expiresIn: SESSION_TIME }
	);

	const { password_hash, ...PublicUser } = user;
	return { user: PublicUser, token };
}

export async function profile(id) {
	const user = await User.foundById(id);
	if (!user) {
		throw new ErrorHttp(401, 'Session invalide');
	}
	return user;
}

