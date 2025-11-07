-- Stock Management Migration
-- Adds stock tracking fields to products table and creates stock management tables
-- Run this migration to enable stock management features

USE olivia_products;

-- Add stock fields to products table (only if they don't exist)
-- Note: This will error if columns already exist - that's okay, just means migration was already run

SET @dbname = DATABASE();
SET @tablename = 'products';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = 'stockQuantity')
  ) > 0,
  'SELECT 1', -- Column exists, do nothing
  'ALTER TABLE products ADD COLUMN stockQuantity INT DEFAULT 0 AFTER distributorMinQty'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = 'stockEnabled')
  ) > 0,
  'SELECT 1',
  'ALTER TABLE products ADD COLUMN stockEnabled BOOLEAN DEFAULT FALSE AFTER stockQuantity'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = 'lowStockThreshold')
  ) > 0,
  'SELECT 1',
  'ALTER TABLE products ADD COLUMN lowStockThreshold INT DEFAULT 10 AFTER stockEnabled'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = 'allowBackorders')
  ) > 0,
  'SELECT 1',
  'ALTER TABLE products ADD COLUMN allowBackorders BOOLEAN DEFAULT FALSE AFTER lowStockThreshold'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = 'stockStatus')
  ) > 0,
  'SELECT 1',
  'ALTER TABLE products ADD COLUMN stockStatus ENUM(\'in_stock\', \'low_stock\', \'out_of_stock\', \'on_backorder\') DEFAULT \'in_stock\' AFTER allowBackorders'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add indexes for stock fields (check if they exist first)
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (INDEX_NAME = 'idx_stockStatus')
  ) > 0,
  'SELECT 1',
  'ALTER TABLE products ADD INDEX idx_stockStatus (stockStatus)'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (INDEX_NAME = 'idx_stockEnabled')
  ) > 0,
  'SELECT 1',
  'ALTER TABLE products ADD INDEX idx_stockEnabled (stockEnabled)'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (INDEX_NAME = 'idx_stockQuantity')
  ) > 0,
  'SELECT 1',
  'ALTER TABLE products ADD INDEX idx_stockQuantity (stockQuantity)'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
    movementType ENUM('purchase', 'sale', 'adjustment', 'return', 'damaged', 'transfer') NOT NULL,
    quantity INT NOT NULL,
    previousQuantity INT NOT NULL,
    newQuantity INT NOT NULL,
    referenceType ENUM('order', 'manual', 'purchase_order', 'return', 'other') NULL,
    referenceId VARCHAR(100) NULL,
    notes TEXT,
    createdBy INT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_productId (productId),
    INDEX idx_movementType (movementType),
    INDEX idx_createdAt (createdAt),
    INDEX idx_reference (referenceType, referenceId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create stock_alerts table
CREATE TABLE IF NOT EXISTS stock_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
    alertType ENUM('low_stock', 'out_of_stock', 'backorder') NOT NULL,
    isResolved BOOLEAN DEFAULT FALSE,
    resolvedAt TIMESTAMP NULL,
    resolvedBy INT NULL,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (resolvedBy) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_productId (productId),
    INDEX idx_alertType (alertType),
    INDEX idx_isResolved (isResolved),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update existing products to have stockEnabled = FALSE (maintains current behavior)
UPDATE products SET stockEnabled = FALSE WHERE stockEnabled IS NULL;

-- Initialize stockStatus for existing products
UPDATE products SET stockStatus = 'in_stock' WHERE stockStatus IS NULL;

