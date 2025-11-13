-- Migration: Add companyLogo field to wholesale_submissions table
-- Run this SQL to update the existing database schema
-- Date: 2024

USE olivia_products;

ALTER TABLE wholesale_submissions 
ADD COLUMN companyLogo VARCHAR(500) NULL AFTER website;

