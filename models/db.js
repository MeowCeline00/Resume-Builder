const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
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
