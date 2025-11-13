-- Migration: Add barcode column to products table
-- Date: 2025-11-13

ALTER TABLE products 
ADD COLUMN barcode VARCHAR(50) NULL AFTER name,
ADD INDEX idx_barcode (barcode);

