<?php
/**
 * Database Schema Installation Script
 * Runs schema.sql to create database and all tables
 * 
 * Usage via URL: https://celineolivia.com/api/install-schema.php?run=1
 * Usage via command line: php api/install-schema.php
 * 
 * WARNING: This will create/recreate the database and tables.
 * Make sure you have backups if running on production!
 * 
 * SECURITY: After installation, consider:
 * - Deleting this file
 * - Or protecting it with .htaccess
 * - Or moving it outside the web root
 */

require_once __DIR__ . '/config.php';

// Security: Require explicit parameter to run from web
$isWebRequest = isset($_SERVER['REQUEST_METHOD']);
$runFromWeb = isset($_GET['run']) && $_GET['run'] === '1';

if ($isWebRequest && !$runFromWeb) {
    header('Content-Type: text/html; charset=utf-8');
    http_response_code(403);
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Database Schema Installation</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .error { background: #f8d7da; border: 1px solid #dc3545; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .info { background: #d1ecf1; border: 1px solid #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; }
            code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <h1>Database Schema Installation</h1>
        <div class="error">
            <strong>Access Denied</strong><br>
            Add <code>?run=1</code> to the URL to execute the installation.
        </div>
        <div class="warning">
            <strong>⚠️ Warning:</strong> This will create/recreate the database and all tables.
            Make sure you have backups if running on production!
        </div>
        <div class="info">
            <strong>To run the installation:</strong><br>
            <a href="?run=1">Click here to run the schema installation</a><br>
            Or visit: <code><?php echo htmlspecialchars($_SERVER['REQUEST_URI']); ?>?run=1</code>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Set content type for output
if ($isWebRequest) {
    header('Content-Type: text/html; charset=utf-8');
} else {
    header('Content-Type: text/plain; charset=utf-8');
}

function output($message, $type = 'info') {
    global $isWebRequest;
    
    if ($isWebRequest) {
        $colors = [
            'info' => '#d1ecf1',
            'success' => '#d4edda',
            'error' => '#f8d7da',
            'warning' => '#fff3cd'
        ];
        $borders = [
            'info' => '#0c5460',
            'success' => '#155724',
            'error' => '#dc3545',
            'warning' => '#ffc107'
        ];
        $color = $colors[$type] ?? $colors['info'];
        $border = $borders[$type] ?? $borders['info'];
        echo "<div style='background: $color; border: 1px solid $border; padding: 10px; margin: 5px 0; border-radius: 5px;'>$message</div>";
    } else {
        echo $message . "\n";
    }
}

function outputHeader() {
    global $isWebRequest;
    if ($isWebRequest) {
        echo "<!DOCTYPE html><html><head><title>Database Schema Installation</title>";
        echo "<style>body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }</style>";
        echo "</head><body><h1>Database Schema Installation</h1>";
    }
}

function outputFooter() {
    global $isWebRequest;
    if ($isWebRequest) {
        echo "</body></html>";
    }
}

outputHeader();

output("Starting database schema installation...", 'info');
output("Database: " . DB_NAME, 'info');
output("Host: " . DB_HOST, 'info');

try {
    // First, connect without specifying database to create it if needed
    $dsn = "mysql:host=" . DB_HOST . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];
    
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    
    // Read schema.sql file
    $schemaFile = __DIR__ . '/schema.sql';
    
    if (!file_exists($schemaFile)) {
        throw new Exception("Schema file not found: $schemaFile");
    }
    
    output("Reading schema file: $schemaFile", 'info');
    $sql = file_get_contents($schemaFile);
    
    if (empty($sql)) {
        throw new Exception("Schema file is empty");
    }
    
    // Split SQL into individual statements
    // Remove comments and split by semicolons
    $sql = preg_replace('/--.*$/m', '', $sql); // Remove single-line comments
    $sql = preg_replace('/\/\*.*?\*\//s', '', $sql); // Remove multi-line comments
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt) && !preg_match('/^\s*$/s', $stmt);
        }
    );
    
    output("Found " . count($statements) . " SQL statements to execute", 'info');
    output("", 'info');
    
    $successCount = 0;
    $errorCount = 0;
    
    // Execute each statement
    foreach ($statements as $index => $statement) {
        $statement = trim($statement);
        if (empty($statement)) {
            continue;
        }
        
        try {
            // Skip USE statements as we'll connect to the database directly
            if (preg_match('/^\s*USE\s+/i', $statement)) {
                // Extract database name and connect to it
                if (preg_match('/USE\s+(\w+)/i', $statement, $matches)) {
                    $dbName = $matches[1];
                    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . $dbName . ";charset=utf8mb4";
                    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
                    output("✓ Connected to database: $dbName", 'success');
                }
                continue;
            }
            
            // Execute the statement
            $pdo->exec($statement);
            
            // Try to identify what was created
            if (preg_match('/CREATE\s+(?:DATABASE|TABLE)\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?/i', $statement, $matches)) {
                $objectName = $matches[1];
                $objectType = preg_match('/CREATE\s+DATABASE/i', $statement) ? 'database' : 'table';
                output("✓ Created $objectType: $objectName", 'success');
            } elseif (preg_match('/INSERT\s+(?:IGNORE\s+)?INTO\s+`?(\w+)`?/i', $statement, $matches)) {
                $tableName = $matches[1];
                output("✓ Inserted data into: $tableName", 'success');
            } else {
                output("✓ Executed statement " . ($index + 1), 'success');
            }
            
            $successCount++;
            
        } catch (PDOException $e) {
            // Some errors are expected (like table already exists with IF NOT EXISTS)
            if (strpos($e->getMessage(), 'already exists') !== false) {
                output("⚠ Statement " . ($index + 1) . ": " . $e->getMessage(), 'warning');
            } else {
                output("✗ Error in statement " . ($index + 1) . ": " . $e->getMessage(), 'error');
                $errorCount++;
            }
        }
    }
    
    output("", 'info');
    output("=== Installation Summary ===", 'info');
    output("Successfully executed: $successCount statements", 'success');
    if ($errorCount > 0) {
        output("Errors encountered: $errorCount statements", 'error');
    }
    
    // Verify tables were created
    output("", 'info');
    output("Verifying tables...", 'info');
    
    $tables = [
        'products', 'orders', 'order_items', 'contact_submissions', 
        'contact_replies', 'wholesale_submissions', 'admin_users',
        'stock_movements', 'stock_alerts', 'testimonials', 'flash_info'
    ];
    
    $existingTables = [];
    $stmt = $pdo->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $existingTables[] = $row[0];
    }
    
    foreach ($tables as $table) {
        if (in_array($table, $existingTables)) {
            output("✓ Table '$table' exists", 'success');
        } else {
            output("✗ Table '$table' NOT found", 'error');
        }
    }
    
    output("", 'info');
    output("=== Installation Complete ===", 'success');
    output("", 'info');
    output("Next steps:", 'info');
    output("1. Run seed-admin.php to create/update admin user: /api/seed-admin.php?run=1", 'info');
    output("2. Update admin password in seed-admin.php before running it", 'warning');
    output("3. Test database connection from your application", 'info');
    
} catch (Exception $e) {
    output("", 'error');
    output("=== Installation Failed ===", 'error');
    output("Error: " . $e->getMessage(), 'error');
    output("", 'error');
    output("Please check:", 'error');
    output("1. Database credentials in config.php", 'error');
    output("2. Database user has CREATE DATABASE and CREATE TABLE permissions", 'error');
    output("3. PHP error logs for more details", 'error');
    
    if ($isWebRequest) {
        output("<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>", 'error');
    }
}

outputFooter();

