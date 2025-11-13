<?php
/**
 * Migration: Add FAQs and Submitted Questions Tables
 * Run this script to add FAQ management functionality to the database
 * 
 * Usage: php migrate-add-faqs.php
 * Or via web browser: http://your-domain.com/api/migrate-add-faqs.php?run=1
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

// Only allow running via CLI or with ?run=1 parameter for web
$isCli = php_sapi_name() === 'cli';
$isWebRun = isset($_GET['run']) && $_GET['run'] === '1';

if (!$isCli && !$isWebRun) {
    die('This migration script must be run from command line or with ?run=1 parameter');
}

echo "Starting FAQ migration...\n";

try {
    // Read the SQL migration file
    $sqlFile = __DIR__ . '/migration-add-faqs.sql';
    
    if (!file_exists($sqlFile)) {
        throw new Exception("Migration SQL file not found: $sqlFile");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Connect to database using config (works for both localhost and production)
    $pdo = getDBConnection();
    
    if (!$pdo) {
        throw new Exception('Failed to connect to database');
    }
    
    echo "Connected to database: " . DB_NAME . "\n";
    
    // Remove comments and clean up SQL
    $sql = preg_replace('/--.*$/m', '', $sql); // Remove single-line comments
    $sql = preg_replace('/\/\*.*?\*\//s', '', $sql); // Remove multi-line comments
    
    // Split SQL into individual statements by semicolon
    $statements = preg_split('/;\s*(?=\S)/', $sql);
    
    $pdo->beginTransaction();
    
    try {
        $executedCount = 0;
        foreach ($statements as $index => $statement) {
            $statement = trim($statement);
            
            // Skip empty statements
            if (empty($statement)) {
                continue;
            }
            
            // Skip USE statements (we're already connected to the right database)
            if (preg_match('/^\s*USE\s+/i', $statement)) {
                echo "Skipping USE statement\n";
                continue;
            }
            
            // Skip CREATE DATABASE statements
            if (preg_match('/^\s*CREATE\s+DATABASE/i', $statement)) {
                echo "Skipping CREATE DATABASE statement\n";
                continue;
            }
            
            // Execute the statement
            echo "Executing statement " . ($executedCount + 1) . ": " . substr($statement, 0, 60) . "...\n";
            try {
                $result = $pdo->exec($statement);
                echo "  ✓ Success\n";
                $executedCount++;
            } catch (PDOException $e) {
                echo "  ✗ Error: " . $e->getMessage() . "\n";
                echo "  SQL: " . substr($statement, 0, 200) . "...\n";
                throw $e;
            }
        }
        
        // Only commit if transaction is still active
        if ($pdo->inTransaction()) {
            $pdo->commit();
        }
        echo "\nMigration completed! Executed $executedCount statements.\n";
        
        // Verify tables were created
        echo "\nVerifying table creation...\n";
        $tables = $pdo->query("SHOW TABLES LIKE 'faqs'")->fetchAll(PDO::FETCH_COLUMN);
        if (in_array('faqs', $tables)) {
            echo "✓ faqs table exists\n";
        } else {
            echo "✗ faqs table NOT found!\n";
        }
        
        $tables = $pdo->query("SHOW TABLES LIKE 'submitted_questions'")->fetchAll(PDO::FETCH_COLUMN);
        if (in_array('submitted_questions', $tables)) {
            echo "✓ submitted_questions table exists\n";
        } else {
            echo "✗ submitted_questions table NOT found!\n";
        }
        
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }
    
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}

