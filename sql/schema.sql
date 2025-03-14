-- Create database (run this separately)
-- CREATE DATABASE resume_builder;

-- Connect to the database
-- \c resume_builder;

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id SERIAL PRIMARY KEY,
  personal_info JSONB NOT NULL,
  education JSONB NOT NULL,
  experience JSONB NOT NULL,
  skills JSONB NOT NULL,
  template_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes (created_at DESC);