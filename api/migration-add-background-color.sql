-- Migration: Add backgroundColor field to products table
-- Run this SQL to add background color support for products

USE olivia_products;

ALTER TABLE products 
ADD COLUMN backgroundColor VARCHAR(50) NULL AFTER color;

