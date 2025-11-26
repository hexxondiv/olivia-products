<?php
/**
 * Migration: Add backgroundColor field to products table
 * Run this script to add background color support for products
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

try {
    // Check if column already exists
    $checkColumn = dbQuery("SHOW COLUMNS FROM products LIKE 'backgroundColor'");
    
    if (count($checkColumn) > 0) {
        echo "Column 'backgroundColor' already exists. Migration skipped.\n";
        exit(0);
    }
    
    // Add backgroundColor column
    $sql = "ALTER TABLE products ADD COLUMN backgroundColor VARCHAR(50) NULL AFTER color";
    dbExecute($sql);
    
    echo "Successfully added 'backgroundColor' column to products table.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

