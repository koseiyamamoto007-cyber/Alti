-- Add missing columns for Task Manager
ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS default_duration INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;

-- Re-apply RLS if needed (but usually policy persists)
-- Ensure policies allow updates to these columns (RLS polices are row-based, so checking 'USING' cluse is enough)
