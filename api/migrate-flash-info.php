<?php
/**
 * Run Flash Info Migration
 * This script creates the flash_info table in the database
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

echo "Running flash info migration...\n\n";

$sql = "
CREATE TABLE IF NOT EXISTS flash_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    contentType ENUM('image', 'video', 'gif', 'text') NOT NULL DEFAULT 'text',
    contentUrl VARCHAR(1000) NULL,
    contentText TEXT NULL,
    displayOrder INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_isActive (isActive),
    INDEX idx_displayOrder (displayOrder),
    INDEX idx_contentType (contentType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

try {
    $pdo = getDBConnection();
    if (!$pdo) {
        echo "Error: Could not connect to database\n";
        exit(1);
    }
    
    $pdo->exec($sql);
    echo "✓ Flash info table created successfully!\n\n";
    
    // Check if table exists and show structure
    $result = $pdo->query("SHOW TABLES LIKE 'flash_info'");
    if ($result->rowCount() > 0) {
        echo "Table 'flash_info' exists.\n";
        
        // Count existing records
        $count = $pdo->query("SELECT COUNT(*) FROM flash_info")->fetchColumn();
        echo "Current flash info items count: $count\n\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\nMigration completed successfully!\n";

