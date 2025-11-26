<?php
/**
 * Migration: Add productBackgroundColor field to contact_info table
 * Run this script to add global product background color setting
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

try {
    // Check if column already exists
    $checkColumn = dbQuery("SHOW COLUMNS FROM contact_info LIKE 'productBackgroundColor'");
    
    if (count($checkColumn) > 0) {
        echo "Column 'productBackgroundColor' already exists. Migration skipped.\n";
        exit(0);
    }
    
    // Add productBackgroundColor column
    $sql = "ALTER TABLE contact_info ADD COLUMN productBackgroundColor VARCHAR(50) NULL DEFAULT '#000000' AFTER socialMedia";
    dbExecute($sql);
    
    echo "Successfully added 'productBackgroundColor' column to contact_info table.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

