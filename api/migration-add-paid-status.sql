-- Migration: Add 'paid' status to orders table
-- Run this SQL to update the existing database schema
-- Date: 2025-01-XX

USE olivia_products;

-- Modify the status ENUM to include 'paid'
ALTER TABLE orders 
MODIFY COLUMN status ENUM('pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled') 
DEFAULT 'pending';

