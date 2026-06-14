-- V2: Add verification_token to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
