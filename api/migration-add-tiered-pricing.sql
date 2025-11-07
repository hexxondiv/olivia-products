-- Migration: Add Three-Tier Pricing System
-- This migration adds retail, wholesale, and distributor pricing tiers with minimum quantities

ALTER TABLE products
ADD COLUMN retailPrice DECIMAL(10, 2) NULL AFTER price,
ADD COLUMN retailMinQty INT DEFAULT 1 AFTER retailPrice,
ADD COLUMN wholesalePrice DECIMAL(10, 2) NULL AFTER retailMinQty,
ADD COLUMN wholesaleMinQty INT NULL AFTER wholesalePrice,
ADD COLUMN distributorPrice DECIMAL(10, 2) NULL AFTER wholesaleMinQty,
ADD COLUMN distributorMinQty INT NULL AFTER distributorPrice;

-- Migrate existing price to retailPrice for backward compatibility
UPDATE products SET retailPrice = price WHERE retailPrice IS NULL;

-- Set default minimum quantities if not set
UPDATE products SET retailMinQty = 1 WHERE retailMinQty IS NULL OR retailMinQty < 1;

-- Note: wholesalePrice, wholesaleMinQty, distributorPrice, and distributorMinQty 
-- should be set via CMS for products that need tiered pricing

