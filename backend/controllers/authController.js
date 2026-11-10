import * as authService from '../services/authService.js';
import { ErrorHttp } from '../errors.js';

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const TIME_MS_COOKIES = 2 * 60 * 60 * 1000;

// ---------- Validation : la forme des données, avant toute règle métier ----------
function validateRegistration({ username, email, password }) {
	const errors = {};
	if (typeof username !== 'string' || username.trim() === '') {
		errors.username = 'Le pseudo est obligatoire';
	} else if (username.trim().length > 15) {
		errors.username = 'Le pseudo fait au maximum 15 caractères';
	}
	if (typeof email !== 'string' || !EMAIL_FORMAT.test(email.trim())) {
		errors.email = "L'email n'a pas un format valide";
	}
	if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
		errors.password = `Le mot de passe fait au moins ${PASSWORD_MIN_LENGTH} caractères`;
	}
	return errors;
}

// Toujours le même format d'email en base : sans espaces, en minuscules
const normalizeEmail = (email) => email.trim().toLowerCase();

// ---------- Les handlers : reçoivent la requête, appellent le service, répondent ----------
export async function register(req, res) {
	const body = req.body ?? {};
	const errors = validateRegistration(body);
	if (Object.keys(errors).length > 0) {
		throw new ErrorHttp(422, 'Données invalides', errors);
	}

	const user = await authService.register({
		username: body.username.trim(),
		email: normalizeEmail(body.email),
		password: body.password,
	});
	res.status(201).json({ user });
}

function validateLogin({ email, password }) {
	const errors = {};
	if (typeof email !== 'string' || email.trim() === '') errors.email = "L'email est obligatoire";
	if (typeof password !== 'string' || password === '') errors.password = 'Le mot de passe est obligatoire';
	return errors;
}

export async function login(req, res) {
	const body = req.body ?? {};
	const errors = validateLogin(body);
	if (Object.keys(errors).length > 0) {
		throw new ErrorHttp(422, 'Données invalides', errors);
	}

	const { user, token } = await authService.login({
		email: normalizeEmail(body.email),
		password: body.password,
	});

	// Le token voyage dans un cookie httpOnly : le JavaScript du navigateur ne peut pas le lire
	res.cookie('token', token, {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: TIME_MS_COOKIES,
	});
	res.json({ user });
}

export async function logout(req, res) {
	res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
	res.status(204).end();
}

export async function myprofile(req, res) {
	const user = await authService.myprofile(req.user.id);
	res.json({ user });
}