<?php
/**
 * Migration Script: Add 'paid' status to orders table
 * Run this script to update the database schema
 * Usage: php api/migrate-add-paid-status.php
 * Or via browser: http://your-domain.com/api/migrate-add-paid-status.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

header('Content-Type: text/plain; charset=utf-8');

echo "Starting migration: Add 'paid' status to orders table...\n\n";

try {
    $pdo = getDBConnection();
    
    if (!$pdo) {
        throw new Exception("Failed to connect to database");
    }
    
    // Check current ENUM values
    $checkSql = "SHOW COLUMNS FROM orders WHERE Field = 'status'";
    $stmt = $pdo->query($checkSql);
    $column = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($column) {
        echo "Current status ENUM: " . $column['Type'] . "\n";
        
        // Check if 'paid' already exists
        if (strpos($column['Type'], "'paid'") !== false) {
            echo "✓ 'paid' status already exists in the ENUM. No migration needed.\n";
            exit(0);
        }
    }
    
    // Run the migration
    $migrationSql = "ALTER TABLE orders 
                     MODIFY COLUMN status ENUM('pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled') 
                     DEFAULT 'pending'";
    
    echo "Executing migration SQL...\n";
    $pdo->exec($migrationSql);
    
    // Verify the change
    $stmt = $pdo->query($checkSql);
    $column = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($column && strpos($column['Type'], "'paid'") !== false) {
        echo "✓ Migration successful!\n";
        echo "New status ENUM: " . $column['Type'] . "\n";
        echo "\nThe 'paid' status has been added to the orders table.\n";
    } else {
        throw new Exception("Migration completed but verification failed");
    }
    
} catch (Exception $e) {
    echo "✗ Migration failed: " . $e->getMessage() . "\n";
    echo "\nYou can also run the SQL directly:\n";
    $dbUser = defined('DB_USER') ? DB_USER : 'root';
    $dbName = defined('DB_NAME') ? DB_NAME : 'olivia_products';
    echo "mysql -u {$dbUser} -p {$dbName} < api/migration-add-paid-status.sql\n";
    exit(1);
}

