-- Migration: Add CAC registration number field to wholesale_submissions table
-- Run this SQL to update the existing database schema
-- Date: 2024

USE olivia_products;

ALTER TABLE wholesale_submissions 
ADD COLUMN cacRegistrationNumber VARCHAR(100) NULL AFTER companyLogo;

