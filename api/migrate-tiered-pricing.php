<?php
/**
 * Migration Script: Add Three-Tier Pricing System
 * Run this script to add the tiered pricing columns to the products table
 * 
 * Usage:
 *   - Via browser: http://localhost/api/migrate-tiered-pricing.php
 *   - Via command line: php api/migrate-tiered-pricing.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

header('Content-Type: text/plain; charset=utf-8');

echo "=== Tiered Pricing Migration ===\n\n";

try {
    // Check if columns already exist
    $checkColumns = dbQuery("SHOW COLUMNS FROM products LIKE 'retailPrice'");
    
    if (count($checkColumns) > 0) {
        echo "✓ Tiered pricing columns already exist. Migration not needed.\n";
        exit(0);
    }
    
    echo "Adding tiered pricing columns...\n";
    
    // Add columns
    $sql = "ALTER TABLE products
            ADD COLUMN retailPrice DECIMAL(10, 2) NULL AFTER price,
            ADD COLUMN retailMinQty INT DEFAULT 1 AFTER retailPrice,
            ADD COLUMN wholesalePrice DECIMAL(10, 2) NULL AFTER retailMinQty,
            ADD COLUMN wholesaleMinQty INT NULL AFTER wholesalePrice,
            ADD COLUMN distributorPrice DECIMAL(10, 2) NULL AFTER wholesaleMinQty,
            ADD COLUMN distributorMinQty INT NULL AFTER distributorPrice";
    
    $result = dbExecute($sql, []);
    
    if ($result !== false) {
        echo "✓ Columns added successfully.\n\n";
        
        // Migrate existing price to retailPrice
        echo "Migrating existing prices to retailPrice...\n";
        $updateSql = "UPDATE products SET retailPrice = price WHERE retailPrice IS NULL";
        $updateResult = dbExecute($updateSql, []);
        
        if ($updateResult !== false) {
            echo "✓ Prices migrated successfully.\n\n";
        } else {
            echo "⚠ Warning: Could not migrate prices (this is okay if table is empty).\n\n";
        }
        
        // Set default minimum quantities
        echo "Setting default minimum quantities...\n";
        $defaultSql = "UPDATE products SET retailMinQty = 1 WHERE retailMinQty IS NULL OR retailMinQty < 1";
        $defaultResult = dbExecute($defaultSql, []);
        
        if ($defaultResult !== false) {
            echo "✓ Default quantities set successfully.\n\n";
        } else {
            echo "⚠ Warning: Could not set default quantities.\n\n";
        }
        
        echo "=== Migration Completed Successfully ===\n";
        echo "\nYou can now use tiered pricing in the CMS!\n";
        
    } else {
        throw new Exception("Failed to add columns. Check database permissions and table structure.");
    }
    
} catch (Exception $e) {
    echo "✗ Migration failed: " . $e->getMessage() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}

