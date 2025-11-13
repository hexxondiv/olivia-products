-- Migration: Convert storageExpiryHours to storageExpiryMinutes
-- Converts existing hours values to minutes and renames the column

-- First, add the new column if it doesn't exist
ALTER TABLE flash_info 
ADD COLUMN IF NOT EXISTS storageExpiryMinutes INT DEFAULT 1440 COMMENT 'Minutes before showing again (0 = always show, 1440 = 24 hours)';

-- Convert existing hours to minutes (multiply by 60)
UPDATE flash_info 
SET storageExpiryMinutes = COALESCE(storageExpiryHours, 24) * 60 
WHERE storageExpiryMinutes IS NULL OR storageExpiryMinutes = 1440;

-- Drop the old column (optional - uncomment if you want to remove it)
-- ALTER TABLE flash_info DROP COLUMN storageExpiryHours;

