// scripts/db-setup.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'resume_builder',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

// SQL to create the resumes table
const createTableSQL = `
DROP TABLE IF EXISTS resumes;
CREATE TABLE resumes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  personal_info JSONB,
  education JSONB,
  experience JSONB,
  projects JSONB,
  skills JSONB,
  template_name VARCHAR(100),
  thumbnail_url TEXT,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
`;

// Execute the schema
async function setupDatabase() {
  try {
    console.log('Setting up database...');
    await pool.query(createTableSQL);
    console.log('✅ Database setup complete!');
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();