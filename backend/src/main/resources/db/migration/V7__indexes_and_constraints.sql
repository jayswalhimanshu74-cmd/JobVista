-- V7: Indexes and unique constraints for data integrity and query performance

-- 1. Deduplicate job_application if duplicates exist before creating unique index
DELETE FROM job_application a
USING job_application b
WHERE a.job_id = b.job_id
  AND a.job_seeker_id = b.job_seeker_id
  AND a.id > b.id;

-- 2. Deduplicate saved_job if duplicates exist before creating unique index
DELETE FROM saved_job a
USING saved_job b
WHERE a.user_id = b.user_id
  AND a.job_id = b.job_id
  AND a.id > b.id;

-- 3. Deduplicate recently_viewed_job if table exists and duplicates exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'recently_viewed_job'
    ) THEN
        DELETE FROM recently_viewed_job a
        USING recently_viewed_job b
        WHERE a.user_id = b.user_id
          AND a.job_id = b.job_id
          AND a.id > b.id;
    END IF;
END $$;

-- 4. Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS uq_job_application_job_seeker 
    ON job_application (job_id, job_seeker_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_saved_job_user_job 
    ON saved_job (user_id, job_id);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'recently_viewed_job'
    ) THEN
        CREATE UNIQUE INDEX IF NOT EXISTS uq_recently_viewed_user_job 
            ON recently_viewed_job (user_id, job_id);
    END IF;
END $$;

-- 5. Foreign Key & Performance Indexes
CREATE INDEX IF NOT EXISTS idx_job_company_id ON job(company_id);
CREATE INDEX IF NOT EXISTS idx_job_posted_at ON job(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_application_job_id ON job_application(job_id);
CREATE INDEX IF NOT EXISTS idx_job_application_job_seeker_id ON job_application(job_seeker_id);
CREATE INDEX IF NOT EXISTS idx_job_application_status ON job_application(application_status);
CREATE INDEX IF NOT EXISTS idx_saved_job_user_id ON saved_job(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_job_job_id ON saved_job(job_id);
CREATE INDEX IF NOT EXISTS idx_job_seeker_user_id ON job_seeker(user_id);
CREATE INDEX IF NOT EXISTS idx_company_user_id ON company(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_user_id ON notification(user_id);
