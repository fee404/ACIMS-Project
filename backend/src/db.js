const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'acims_db',
});

pool.on('error', (err) => {
  console.error('Unexpected error on PostgreSQL pool:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
