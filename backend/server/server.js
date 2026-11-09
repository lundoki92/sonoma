import { app } from './index.js';

if (!process.env.JWT_SECRET) {
	console.error('JWT_SECRET manquant : copie .env.example en .env et remplis-le');
	process.exit(1);
}

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
	console.log(`API Lovelace Factory sur http://localhost:${port}`);
});