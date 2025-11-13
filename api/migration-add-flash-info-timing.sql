-- Migration: Add timing fields to Flash Info Table
-- Adds delayMs and storageExpiryHours fields for per-item configuration

ALTER TABLE flash_info 
ADD COLUMN IF NOT EXISTS delayMs INT DEFAULT 3000 COMMENT 'Delay in milliseconds before showing modal',
ADD COLUMN IF NOT EXISTS storageExpiryHours INT DEFAULT 24 COMMENT 'Hours before showing again (0 = always show)';

