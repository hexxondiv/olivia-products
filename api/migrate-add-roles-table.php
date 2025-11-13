<?php
/**
 * Migration: Add roles table and update admin_users
 * 
 * Usage: php migrate-add-roles-table.php
 * Or via web: /api/migrate-add-roles-table.php?run=1
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

// Only allow running from command line or with explicit parameter
$isWebRequest = isset($_SERVER['REQUEST_METHOD']);
$runFromWeb = isset($_GET['run']) && $_GET['run'] === '1';

if ($isWebRequest && !$runFromWeb) {
    http_response_code(403);
    die("Access denied. Add ?run=1 to execute.");
}

function runMigration() {
    $pdo = getDBConnection();
    if (!$pdo) {
        return ['success' => false, 'message' => 'Database connection failed'];
    }
    
    try {
        // Read and execute migration SQL
        $sqlFile = __DIR__ . '/migration-add-roles-table.sql';
        if (!file_exists($sqlFile)) {
            throw new Exception("Migration file not found: $sqlFile");
        }
        
        $sql = file_get_contents($sqlFile);
        
        // Remove comments
        $sql = preg_replace('/--.*$/m', '', $sql); // Remove single-line comments
        $sql = preg_replace('/\/\*.*?\*\//s', '', $sql); // Remove multi-line comments
        
        // Split SQL into individual statements
        // Better regex to handle multi-line statements
        $statements = preg_split('/;\s*(?=\S)/', $sql);
        
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $executedCount = 0;
        $errors = [];
        $warnings = [];
        
        foreach ($statements as $index => $statement) {
            $statement = trim($statement);
            
            // Skip empty statements
            if (empty($statement)) {
                continue;
            }
            
            try {
                $result = $pdo->exec($statement);
                $executedCount++;
            } catch (PDOException $e) {
                // Check if error is about table/column/constraint already existing
                $errorMsg = $e->getMessage();
                
                // These are expected errors for idempotent migrations
                if (strpos($errorMsg, 'already exists') !== false ||
                    strpos($errorMsg, 'Duplicate column') !== false ||
                    strpos($errorMsg, 'Duplicate key') !== false ||
                    strpos($errorMsg, 'Duplicate entry') !== false ||
                    strpos($errorMsg, 'Duplicate foreign key') !== false) {
                    // These are expected errors, log as warning and continue
                    $warnings[] = "Statement " . ($index + 1) . ": " . $errorMsg;
                    continue;
                } else {
                    // Real error, log it
                    $errors[] = "Statement " . ($index + 1) . ": " . $errorMsg;
                    // Don't throw - continue with other statements
                    // But log the error
                    error_log("Migration error: " . $errorMsg);
                }
            }
        }
        
        // If we have real errors (not just warnings), fail
        if (!empty($errors)) {
            throw new Exception("Migration had errors: " . implode("; ", $errors));
        }
        
        // Verify roles table was created
        $tables = $pdo->query("SHOW TABLES LIKE 'roles'")->fetchAll(PDO::FETCH_COLUMN);
        $rolesTableExists = in_array('roles', $tables);
        
        // Verify roleId column exists
        $columns = $pdo->query("SHOW COLUMNS FROM admin_users LIKE 'roleId'")->fetchAll(PDO::FETCH_COLUMN);
        $roleIdColumnExists = in_array('roleId', $columns);
        
        return [
            'success' => true,
            'message' => 'Migration completed successfully',
            'roles_created' => $rolesTableExists,
            'admin_users_updated' => $roleIdColumnExists,
            'statements_executed' => $executedCount,
            'warnings' => !empty($warnings) ? $warnings : null
        ];
    } catch (Exception $e) {
        if (isset($pdo) && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        return [
            'success' => false,
            'message' => 'Migration failed: ' . $e->getMessage(),
            'error_details' => $e->getTraceAsString()
        ];
    }
}

$result = runMigration();

if ($isWebRequest) {
    header('Content-Type: application/json');
    echo json_encode($result, JSON_PRETTY_PRINT);
} else {
    echo json_encode($result, JSON_PRETTY_PRINT) . "\n";
}

