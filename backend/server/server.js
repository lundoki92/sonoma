import { app } from './index.js';

const required = ['JWT_SECRET', 'SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'];
const missing = required.filter(k => !process.env[k]);

if (missing.length > 0) {
  console.error(`Variables manquantes : ${missing.join(', ')}`);
  console.error('Copie .env.example vers .env et remplis les valeurs.');
  process.exit(1); // Arrêt propre avec message explicite
}

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
	console.log(`API Lovelace Factory sur http://localhost:${port}`);
});