-- Add default_duration column to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS default_duration INTEGER DEFAULT 60; -- Default 60 mins

-- Add description column
ALTER TABLE goals ADD COLUMN IF NOT EXISTS description TEXT;

-- Add deadline column
ALTER TABLE goals ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ DEFAULT NOW();
