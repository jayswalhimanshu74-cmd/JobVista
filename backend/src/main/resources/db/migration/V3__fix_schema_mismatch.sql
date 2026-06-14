-- V3: Fix schema mismatches between V1 baseline and JPA entities

-- 1. Rename saved_job to saved_jobs safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'saved_jobs'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'saved_job'
    ) THEN
        ALTER TABLE saved_job RENAME TO saved_jobs;
    END IF;
END $$;

-- 2. Rename recently_viewed_job to recently_viewed_jobs safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'recently_viewed_jobs'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'recently_viewed_job'
    ) THEN
        ALTER TABLE recently_viewed_job RENAME TO recently_viewed_jobs;
    END IF;
END $$;

-- 3. Add viewed_id column to recently_viewed_jobs safely
ALTER TABLE recently_viewed_jobs ADD COLUMN IF NOT EXISTS viewed_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'recently_viewed_jobs_viewed_id_key'
    ) THEN
        UPDATE recently_viewed_jobs SET viewed_id = gen_random_uuid() WHERE viewed_id IS NULL;
        ALTER TABLE recently_viewed_jobs ALTER COLUMN viewed_id SET NOT NULL;
        ALTER TABLE recently_viewed_jobs ADD CONSTRAINT recently_viewed_jobs_viewed_id_key UNIQUE (viewed_id);
    END IF;
END $$;

-- 4. Alter notification table columns safely
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'notification' AND column_name = 'created_at'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'notification' AND column_name = 'timestamp'
    ) THEN
        ALTER TABLE notification RENAME COLUMN created_at TO timestamp;
    END IF;
END $$;

ALTER TABLE notification ALTER COLUMN user_id TYPE VARCHAR(255);
