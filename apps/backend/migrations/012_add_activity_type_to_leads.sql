-- Add activity_type field to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS activity_type VARCHAR(100);

-- Make activity_type required for new records (existing records can be null)
-- We don't set NOT NULL to avoid breaking existing data
