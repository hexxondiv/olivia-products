-- Migration: Add productBackgroundColor field to contact_info table
-- Run this SQL to add global product background color setting

USE olivia_products;

ALTER TABLE contact_info 
ADD COLUMN productBackgroundColor VARCHAR(50) NULL DEFAULT '#000000' AFTER socialMedia;

