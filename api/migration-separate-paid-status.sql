-- Migration: Separate paid status from order status
-- Run this SQL to update the existing database schema
-- Date: 2025-01-XX

USE olivia_products;

-- Step 1: Add isPaid and paidAt fields
ALTER TABLE orders 
ADD COLUMN isPaid BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN paidAt TIMESTAMP NULL AFTER isPaid;

-- Step 2: Migrate existing 'paid' status to isPaid = true
UPDATE orders 
SET isPaid = TRUE, paidAt = updatedAt 
WHERE status = 'paid';

-- Step 3: Update orders with 'paid' status to 'processing' (or keep their previous status logic)
-- If you want to set them to a specific status, uncomment and modify:
-- UPDATE orders SET status = 'processing' WHERE status = 'paid';

-- Step 4: Remove 'paid' from status ENUM
ALTER TABLE orders 
MODIFY COLUMN status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') 
DEFAULT 'pending';

-- Step 5: Add index for isPaid for better query performance
ALTER TABLE orders ADD INDEX idx_isPaid (isPaid);

