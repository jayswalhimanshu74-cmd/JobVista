-- Industry Level Database Optimization for JobVista
-- Run these commands on your PostgreSQL database to improve performance

-- Indexes for Job table
CREATE INDEX IF NOT EXISTS idx_job_job_id ON job(job_id);
CREATE INDEX IF NOT EXISTS idx_job_posted_at ON job(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_title ON job(title);
CREATE INDEX IF NOT EXISTS idx_job_location ON job(location);
CREATE INDEX IF NOT EXISTS idx_job_company_id ON job(company_id);

-- Indexes for Company table
CREATE INDEX IF NOT EXISTS idx_company_company_id ON company(company_id);
CREATE INDEX IF NOT EXISTS idx_company_name ON company(company_name);

-- Indexes for User table
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

-- Indexes for BlackListedToken table
CREATE INDEX IF NOT EXISTS idx_blacklist_token ON black_listed_token(token);

-- Full-text search optimization (Trigram indexes for LIKE queries)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_job_title_trgm ON job USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_job_description_trgm ON job USING gin (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_job_skills_trgm ON job USING gin (required_skills gin_trgm_ops);
