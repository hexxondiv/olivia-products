<?php
/**
 * Migration Script: Add businessPhysicalAddress field to wholesale_submissions table
 * Run this script to add the businessPhysicalAddress column for storing business physical addresses
 * 
 * Usage:
 *   - Via browser: http://localhost/api/migrate-add-business-physical-address.php
 *   - Via command line: php api/migrate-add-business-physical-address.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

header('Content-Type: text/plain; charset=utf-8');

echo "=== Wholesale Business Physical Address Migration ===\n\n";

try {
    // Check if column already exists
    $checkColumn = dbQuery("SHOW COLUMNS FROM wholesale_submissions LIKE 'businessPhysicalAddress'");
    
    if (count($checkColumn) > 0) {
        echo "✓ 'businessPhysicalAddress' column already exists. Migration not needed.\n";
        exit(0);
    }
    
    echo "Adding businessPhysicalAddress column to wholesale_submissions table...\n";
    
    // Add column
    $sql = "ALTER TABLE wholesale_submissions 
            ADD COLUMN businessPhysicalAddress TEXT NULL AFTER cacRegistrationNumber";
    
    $result = dbExecute($sql, []);
    
    if ($result !== false) {
        echo "✓ Column added successfully.\n\n";
        
        // Verify the change
        $verifyColumn = dbQuery("SHOW COLUMNS FROM wholesale_submissions WHERE Field = 'businessPhysicalAddress'");
        if (count($verifyColumn) > 0) {
            $column = $verifyColumn[0];
            echo "✓ Verification successful.\n";
            echo "  Column: {$column['Field']}\n";
            echo "  Type: {$column['Type']}\n";
            echo "  Null: {$column['Null']}\n\n";
        }
        
        echo "=== Migration Completed Successfully ===\n";
        echo "\nBusiness physical address field is now available in the wholesale form!\n";
        
    } else {
        throw new Exception("Failed to add column. Check database permissions and table structure.");
    }
    
} catch (Exception $e) {
    echo "✗ Migration failed: " . $e->getMessage() . "\n";
    echo "\nYou can also run the SQL directly:\n";
    $dbUser = defined('DB_USER') ? DB_USER : 'root';
    $dbName = defined('DB_NAME') ? DB_NAME : 'olivia_products';
    echo "mysql -u {$dbUser} -p {$dbName} < api/migration-add-business-physical-address.sql\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}

