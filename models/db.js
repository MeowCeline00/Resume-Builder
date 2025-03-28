// models/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'resume_builder',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err.stack);
  } else {
    console.log('✅ Database connected successfully at:', res.rows[0].now);
  }
});

// Export the query method for use in other files
module.exports = {
  query: (text, params) => pool.query(text, params),
};