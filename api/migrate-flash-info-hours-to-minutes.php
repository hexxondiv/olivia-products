<?php
/**
 * Run Flash Info Hours to Minutes Migration
 * This script converts storageExpiryHours to storageExpiryMinutes
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

echo "Running flash info hours to minutes migration...\n\n";

try {
    $pdo = getDBConnection();
    if (!$pdo) {
        echo "Error: Could not connect to database\n";
        exit(1);
    }
    
    // Check if new column exists
    $columns = $pdo->query("SHOW COLUMNS FROM flash_info LIKE 'storageExpiryMinutes'")->fetchAll();
    if (count($columns) > 0) {
        echo "Column 'storageExpiryMinutes' already exists.\n";
    } else {
        // Add new column
        $pdo->exec("ALTER TABLE flash_info ADD COLUMN storageExpiryMinutes INT DEFAULT 1440 COMMENT 'Minutes before showing again (0 = always show, 1440 = 24 hours)'");
        echo "✓ Added storageExpiryMinutes column\n";
    }
    
    // Check if old column exists
    $columns = $pdo->query("SHOW COLUMNS FROM flash_info LIKE 'storageExpiryHours'")->fetchAll();
    if (count($columns) > 0) {
        // Convert existing hours to minutes
        $pdo->exec("UPDATE flash_info SET storageExpiryMinutes = COALESCE(storageExpiryHours, 24) * 60 WHERE storageExpiryMinutes IS NULL OR storageExpiryMinutes = 1440");
        echo "✓ Converted existing hours values to minutes\n";
        
        // Optionally drop the old column (uncomment if desired)
        // $pdo->exec("ALTER TABLE flash_info DROP COLUMN storageExpiryHours");
        // echo "✓ Dropped old storageExpiryHours column\n";
    } else {
        echo "Column 'storageExpiryHours' does not exist. No conversion needed.\n";
    }
    
    echo "\nMigration completed successfully!\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

