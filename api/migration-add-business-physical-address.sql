-- Migration: Add businessPhysicalAddress column to wholesale_submissions table
-- Date: 2024

ALTER TABLE wholesale_submissions 
ADD COLUMN businessPhysicalAddress TEXT NULL AFTER cacRegistrationNumber;

