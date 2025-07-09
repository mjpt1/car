const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres', // Default user for local development
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'car_rental_db', // Choose a name for your DB
  password: process.env.DB_PASSWORD || 'your_password', // Set your local DB password
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // For production with SSL
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Export pool if direct access is needed
};
