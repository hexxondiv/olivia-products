<?php
/**
 * Migration Script: Add companyLogo field to wholesale_submissions table
 * Run this script to add the companyLogo column for storing company logos
 * 
 * Usage:
 *   - Via browser: http://localhost/api/migrate-add-wholesale-logo.php
 *   - Via command line: php api/migrate-add-wholesale-logo.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

header('Content-Type: text/plain; charset=utf-8');

echo "=== Wholesale Company Logo Migration ===\n\n";

try {
    // Check if column already exists
    $checkColumn = dbQuery("SHOW COLUMNS FROM wholesale_submissions LIKE 'companyLogo'");
    
    if (count($checkColumn) > 0) {
        echo "✓ 'companyLogo' column already exists. Migration not needed.\n";
        exit(0);
    }
    
    echo "Adding companyLogo column to wholesale_submissions table...\n";
    
    // Add column
    $sql = "ALTER TABLE wholesale_submissions 
            ADD COLUMN companyLogo VARCHAR(500) NULL AFTER website";
    
    $result = dbExecute($sql, []);
    
    if ($result !== false) {
        echo "✓ Column added successfully.\n\n";
        
        // Verify the change
        $verifyColumn = dbQuery("SHOW COLUMNS FROM wholesale_submissions WHERE Field = 'companyLogo'");
        if (count($verifyColumn) > 0) {
            $column = $verifyColumn[0];
            echo "✓ Verification successful.\n";
            echo "  Column: {$column['Field']}\n";
            echo "  Type: {$column['Type']}\n";
            echo "  Null: {$column['Null']}\n\n";
        }
        
        echo "=== Migration Completed Successfully ===\n";
        echo "\nCompany logo upload is now available in the wholesale form!\n";
        
    } else {
        throw new Exception("Failed to add column. Check database permissions and table structure.");
    }
    
} catch (Exception $e) {
    echo "✗ Migration failed: " . $e->getMessage() . "\n";
    echo "\nYou can also run the SQL directly:\n";
    $dbUser = defined('DB_USER') ? DB_USER : 'root';
    $dbName = defined('DB_NAME') ? DB_NAME : 'olivia_products';
    echo "mysql -u {$dbUser} -p {$dbName} < api/migration-add-wholesale-logo.sql\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}

