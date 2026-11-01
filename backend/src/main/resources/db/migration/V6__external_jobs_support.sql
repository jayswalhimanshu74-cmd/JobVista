-- V6: Support external jobs without registered company and index external_id

DO $$
BEGIN
    -- Drop NOT NULL on company_id if present
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'job' 
          AND column_name = 'company_id' 
          AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE job ALTER COLUMN company_id DROP NOT NULL;
    END IF;

    -- Alter redirect_url to TEXT if not already text
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'job' 
          AND column_name = 'redirect_url' 
          AND data_type <> 'text'
    ) THEN
        ALTER TABLE job ALTER COLUMN redirect_url TYPE TEXT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_job_external_id ON job(external_id);
