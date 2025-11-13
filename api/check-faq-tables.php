<?php
/**
 * Check if FAQ tables exist
 * Quick diagnostic script to verify table creation
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

echo "Checking FAQ tables in database: " . DB_NAME . "\n\n";

$pdo = getDBConnection();

if (!$pdo) {
    die("Failed to connect to database\n");
}

// Check if faqs table exists
$faqsExists = false;
$submittedQuestionsExists = false;

try {
    $result = $pdo->query("SHOW TABLES LIKE 'faqs'");
    $faqsExists = $result->rowCount() > 0;
    
    $result = $pdo->query("SHOW TABLES LIKE 'submitted_questions'");
    $submittedQuestionsExists = $result->rowCount() > 0;
    
    if ($faqsExists) {
        echo "✓ faqs table EXISTS\n";
        $result = $pdo->query("DESCRIBE faqs");
        $columns = $result->fetchAll();
        echo "  Columns: " . count($columns) . "\n";
        foreach ($columns as $col) {
            echo "    - {$col['Field']} ({$col['Type']})\n";
        }
    } else {
        echo "✗ faqs table DOES NOT EXIST\n";
    }
    
    echo "\n";
    
    if ($submittedQuestionsExists) {
        echo "✓ submitted_questions table EXISTS\n";
        $result = $pdo->query("DESCRIBE submitted_questions");
        $columns = $result->fetchAll();
        echo "  Columns: " . count($columns) . "\n";
        foreach ($columns as $col) {
            echo "    - {$col['Field']} ({$col['Type']})\n";
        }
    } else {
        echo "✗ submitted_questions table DOES NOT EXIST\n";
    }
    
    echo "\n";
    echo "All tables in database:\n";
    $result = $pdo->query("SHOW TABLES");
    $tables = $result->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $table) {
        echo "  - $table\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

