-- Create database (run this separately)
-- CREATE DATABASE resume_builder;

-- Connect to the database
-- \c resume_builder;

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT 'Untitled Resume',
  personal_info JSONB NOT NULL DEFAULT '{}',
  education JSONB NOT NULL DEFAULT '[]',
  experience JSONB NOT NULL DEFAULT '[]',
  projects JSONB DEFAULT '[]',
  skills JSONB NOT NULL DEFAULT '{}',
  template_name VARCHAR(50) NOT NULL DEFAULT 'modern',
  thumbnail_url VARCHAR(255),
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes (created_at DESC);