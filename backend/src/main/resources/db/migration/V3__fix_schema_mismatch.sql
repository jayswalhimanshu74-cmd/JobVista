-- V3: Fix schema mismatches between V1 baseline and JPA entities

-- 1. Rename saved_job to saved_jobs
ALTER TABLE IF EXISTS saved_job RENAME TO saved_jobs;

-- 2. Rename recently_viewed_job to recently_viewed_jobs
ALTER TABLE IF EXISTS recently_viewed_job RENAME TO recently_viewed_jobs;

-- 3. Add viewed_id column to recently_viewed_jobs
ALTER TABLE recently_viewed_jobs ADD COLUMN IF NOT EXISTS viewed_id UUID;
UPDATE recently_viewed_jobs SET viewed_id = gen_random_uuid() WHERE viewed_id IS NULL;
ALTER TABLE recently_viewed_jobs ALTER COLUMN viewed_id SET NOT NULL;
ALTER TABLE recently_viewed_jobs ADD CONSTRAINT recently_viewed_jobs_viewed_id_key UNIQUE (viewed_id);

-- 4. Alter notification table columns
ALTER TABLE notification RENAME COLUMN created_at TO timestamp;
ALTER TABLE notification ALTER COLUMN user_id TYPE VARCHAR(255);
