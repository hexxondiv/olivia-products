<?php
/**
 * Run Testimonials Migration
 * This script creates the testimonials table in the database
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

echo "Running testimonials migration...\n\n";

$sql = "
CREATE TABLE IF NOT EXISTS testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    rating INT NOT NULL DEFAULT 5,
    backgroundColor VARCHAR(7) DEFAULT '#f5f7fa',
    displayOrder INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_isActive (isActive),
    INDEX idx_displayOrder (displayOrder)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

try {
    $pdo = getDBConnection();
    if (!$pdo) {
        echo "Error: Could not connect to database\n";
        exit(1);
    }
    
    $pdo->exec($sql);
    echo "✓ Testimonials table created successfully!\n\n";
    
    // Check if table exists and show structure
    $result = $pdo->query("SHOW TABLES LIKE 'testimonials'");
    if ($result->rowCount() > 0) {
        echo "Table 'testimonials' exists.\n";
        
        // Count existing records
        $count = $pdo->query("SELECT COUNT(*) FROM testimonials")->fetchColumn();
        echo "Current testimonials count: $count\n\n";
        
        if ($count == 0) {
            echo "Tip: Run 'php api/seed-testimonials.php' to migrate existing JSON data.\n";
        }
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\nMigration completed successfully!\n";

