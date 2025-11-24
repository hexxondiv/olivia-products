<?php
/**
 * Migration: Add salesWhatsApp column to contact_info table
 * This adds the salesWhatsApp field for managing REACT_APP_SALES_WHATSAPP_NUMBER
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

try {
    // Check if column exists
    $checkColumn = dbQueryOne(
        "SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'contact_info' 
         AND COLUMN_NAME = 'salesWhatsApp'"
    );
    
    if ($checkColumn && $checkColumn['count'] > 0) {
        echo "Column 'salesWhatsApp' already exists in contact_info table.\n";
    } else {
        // Add the column
        dbExecute(
            "ALTER TABLE contact_info 
             ADD COLUMN salesWhatsApp VARCHAR(50) NULL 
             COMMENT 'Sales WhatsApp number (used for REACT_APP_SALES_WHATSAPP_NUMBER)' 
             AFTER whatsapp"
        );
        
        echo "Column 'salesWhatsApp' added successfully.\n";
        
        // Update existing records with default value if they don't have one
        dbExecute(
            "UPDATE contact_info 
             SET salesWhatsApp = '+2348068527731' 
             WHERE salesWhatsApp IS NULL OR salesWhatsApp = ''"
        );
        
        echo "Updated existing records with default sales WhatsApp number.\n";
    }
    
    echo "Migration completed successfully!\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}

