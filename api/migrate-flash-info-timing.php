<?php
/**
 * Run Flash Info Timing Migration
 * This script adds delayMs and storageExpiryHours fields to the flash_info table
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

echo "Running flash info timing migration...\n\n";

try {
    $pdo = getDBConnection();
    if (!$pdo) {
        echo "Error: Could not connect to database\n";
        exit(1);
    }
    
    // Check if columns already exist
    $columns = $pdo->query("SHOW COLUMNS FROM flash_info LIKE 'delayMs'")->fetchAll();
    if (count($columns) > 0) {
        echo "Column 'delayMs' already exists. Skipping...\n";
    } else {
        $pdo->exec("ALTER TABLE flash_info ADD COLUMN delayMs INT DEFAULT 3000 COMMENT 'Delay in milliseconds before showing modal'");
        echo "✓ Added delayMs column\n";
    }
    
    $columns = $pdo->query("SHOW COLUMNS FROM flash_info LIKE 'storageExpiryHours'")->fetchAll();
    if (count($columns) > 0) {
        echo "Column 'storageExpiryHours' already exists. Skipping...\n";
    } else {
        $pdo->exec("ALTER TABLE flash_info ADD COLUMN storageExpiryHours INT DEFAULT 24 COMMENT 'Hours before showing again (0 = always show)'");
        echo "✓ Added storageExpiryHours column\n";
    }
    
    echo "\nMigration completed successfully!\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

