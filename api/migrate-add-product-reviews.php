<?php
/**
 * Migration Script: Add Product Reviews Table
 * Run this script to create the product_reviews table
 * Usage: php api/migrate-add-product-reviews.php
 * Or via browser: http://your-domain.com/api/migrate-add-product-reviews.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

header('Content-Type: text/plain; charset=utf-8');

echo "Starting migration: Add Product Reviews Table...\n\n";

try {
    $pdo = getDBConnection();
    
    if (!$pdo) {
        throw new Exception("Failed to connect to database");
    }
    
    // Check if table already exists
    $checkTable = "SHOW TABLES LIKE 'product_reviews'";
    $stmt = $pdo->query($checkTable);
    $tableExists = $stmt->fetch();
    
    if ($tableExists) {
        echo "✓ 'product_reviews' table already exists. Migration not needed.\n";
        exit(0);
    }
    
    // Read and execute SQL migration
    $sql = file_get_contents(__DIR__ . '/migration-add-product-reviews.sql');
    
    echo "Creating product_reviews table...\n";
    $pdo->exec($sql);
    echo "✓ Product reviews table created successfully!\n\n";
    
    // Verify the table was created
    $stmt = $pdo->query($checkTable);
    $tableExists = $stmt->fetch();
    
    if ($tableExists) {
        echo "✓ Migration successful!\n";
        echo "Table 'product_reviews' has been created.\n\n";
        
        // Show table structure
        $stmt = $pdo->query("DESCRIBE product_reviews");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "Table structure:\n";
        foreach ($columns as $col) {
            echo "  - {$col['Field']} ({$col['Type']})\n";
        }
    } else {
        throw new Exception("Migration completed but verification failed");
    }
    
} catch (Exception $e) {
    echo "✗ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\nMigration completed successfully!\n";

