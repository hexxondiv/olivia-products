<?php
/**
 * Migration: Add Home Slides Table
 * Run this script to create the home_slides table
 * Usage: php migrate-add-home-slides.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

echo "Starting migration: Add Home Slides Table\n";

try {
    // Read the SQL file
    $sqlFile = __DIR__ . '/migration-add-home-slides.sql';
    
    if (!file_exists($sqlFile)) {
        throw new Exception("SQL file not found: $sqlFile");
    }
    
    $sql = file_get_contents($sqlFile);
    
    if ($sql === false) {
        throw new Exception("Failed to read SQL file: $sqlFile");
    }
    
    // Split SQL into individual statements
    // Remove comments and empty lines
    $sql = preg_replace('/--.*$/m', '', $sql);
    $sql = preg_replace('/\/\*.*?\*\//s', '', $sql);
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt);
        }
    );
    
    // Execute each statement
    foreach ($statements as $statement) {
        if (!empty(trim($statement))) {
            echo "Executing: " . substr($statement, 0, 50) . "...\n";
            $result = dbExecute($statement);
            if ($result === false) {
                // Check if it's a "table already exists" error, which is okay
                $pdo = getDBConnection();
                if ($pdo) {
                    $errorInfo = $pdo->errorInfo();
                    if (strpos($errorInfo[2] ?? '', 'already exists') !== false) {
                        echo "  Table already exists, skipping...\n";
                        continue;
                    }
                }
                throw new Exception("Failed to execute SQL statement: " . ($pdo ? $pdo->errorInfo()[2] : 'Unknown error'));
            }
        }
    }
    
    echo "\nMigration completed successfully!\n";
    echo "Home slides table has been created.\n";
    
} catch (Exception $e) {
    echo "\nError: " . $e->getMessage() . "\n";
    exit(1);
}

