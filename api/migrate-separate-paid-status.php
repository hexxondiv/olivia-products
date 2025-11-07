<?php
/**
 * Migration Script: Separate paid status from order status
 * Run this script to update the database schema
 * Usage: php api/migrate-separate-paid-status.php
 * Or via browser: http://your-domain.com/api/migrate-separate-paid-status.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

header('Content-Type: text/plain; charset=utf-8');

echo "Starting migration: Separate paid status from order status...\n\n";

try {
    $pdo = getDBConnection();
    
    if (!$pdo) {
        throw new Exception("Failed to connect to database");
    }
    
    // Check if isPaid column already exists
    $checkColumn = "SHOW COLUMNS FROM orders LIKE 'isPaid'";
    $stmt = $pdo->query($checkColumn);
    $columnExists = $stmt->fetch();
    
    if ($columnExists) {
        echo "✓ 'isPaid' column already exists. Checking if migration is needed...\n";
    } else {
        // Step 1: Add isPaid and paidAt fields
        echo "Step 1: Adding isPaid and paidAt columns...\n";
        $pdo->exec("ALTER TABLE orders 
                    ADD COLUMN isPaid BOOLEAN DEFAULT FALSE AFTER status,
                    ADD COLUMN paidAt TIMESTAMP NULL AFTER isPaid");
        echo "✓ Columns added successfully\n\n";
    }
    
    // Step 2: Migrate existing 'paid' status to isPaid = true
    echo "Step 2: Migrating existing 'paid' status to isPaid field...\n";
    $stmt = $pdo->prepare("UPDATE orders 
                           SET isPaid = TRUE, paidAt = COALESCE(updatedAt, NOW()) 
                           WHERE status = 'paid'");
    $stmt->execute();
    $affected = $stmt->rowCount();
    echo "✓ Migrated {$affected} orders from 'paid' status to isPaid = true\n\n";
    
    // Step 3: Check current status ENUM
    $checkSql = "SHOW COLUMNS FROM orders WHERE Field = 'status'";
    $stmt = $pdo->query($checkSql);
    $column = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($column && strpos($column['Type'], "'paid'") !== false) {
        // Step 4: Remove 'paid' from status ENUM
        echo "Step 3: Removing 'paid' from status ENUM...\n";
        $pdo->exec("ALTER TABLE orders 
                    MODIFY COLUMN status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') 
                    DEFAULT 'pending'");
        echo "✓ 'paid' removed from status ENUM\n\n";
    } else {
        echo "✓ Status ENUM already updated (no 'paid' found)\n\n";
    }
    
    // Step 5: Add index for isPaid
    echo "Step 4: Adding index for isPaid...\n";
    try {
        $pdo->exec("ALTER TABLE orders ADD INDEX idx_isPaid (isPaid)");
        echo "✓ Index added successfully\n\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "✓ Index already exists\n\n";
        } else {
            throw $e;
        }
    }
    
    // Verify the changes
    echo "Verifying changes...\n";
    $stmt = $pdo->query("SHOW COLUMNS FROM orders WHERE Field IN ('status', 'isPaid', 'paidAt')");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $col) {
        echo "  - {$col['Field']}: {$col['Type']}\n";
    }
    
    echo "\n✓ Migration completed successfully!\n";
    echo "\nThe 'paid' status has been separated into its own field (isPaid).\n";
    echo "Orders with 'paid' status have been migrated to isPaid = true.\n";
    
} catch (Exception $e) {
    echo "✗ Migration failed: " . $e->getMessage() . "\n";
    echo "\nYou can also run the SQL directly:\n";
    $dbUser = defined('DB_USER') ? DB_USER : 'root';
    $dbName = defined('DB_NAME') ? DB_NAME : 'olivia_products';
    echo "mysql -u {$dbUser} -p {$dbName} < api/migration-separate-paid-status.sql\n";
    exit(1);
}

