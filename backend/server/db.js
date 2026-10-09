import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

pool.on('connect', () => {
  console.log('⚡️ Connecté à la base de données');
});

pool.on('error', (err) => {
  console.error('❌ Erreur du pool PostgreSQL :', err);
});

export default pool;