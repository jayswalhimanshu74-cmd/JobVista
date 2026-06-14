-- V5: Rename logo_url to logo in company table if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'company' AND column_name = 'logo_url'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'company' AND column_name = 'logo'
    ) THEN
        ALTER TABLE company RENAME COLUMN logo_url TO logo;
    END IF;
END $$;
