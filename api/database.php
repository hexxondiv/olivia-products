<?php
/**
 * Database Connection and Helper Functions
 */

// Database configuration constants
if (!defined('DB_HOST')) {
    define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
}
if (!defined('DB_NAME')) {
    define('DB_NAME', getenv('DB_NAME') ?: 'olivia_products');
}
if (!defined('DB_USER')) {
    define('DB_USER', getenv('DB_USER') ?: 'root');
}
if (!defined('DB_PASS')) {
    define('DB_PASS', getenv('DB_PASS') ?: '');
}
if (!defined('DB_CHARSET')) {
    define('DB_CHARSET', 'utf8mb4');
}

/**
 * Get database connection
 * @return PDO|null
 */
function getDBConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            return null;
        }
    }
    
    return $pdo;
}

/**
 * Execute a query and return results
 * @param string $sql SQL query
 * @param array $params Parameters for prepared statement
 * @return array|false
 */
function dbQuery($sql, $params = []) {
    $pdo = getDBConnection();
    if (!$pdo) {
        return false;
    }
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        error_log("Database query error: " . $e->getMessage());
        error_log("SQL: " . $sql);
        return false;
    }
}

/**
 * Execute a query and return single row
 * @param string $sql SQL query
 * @param array $params Parameters for prepared statement
 * @return array|false
 */
function dbQueryOne($sql, $params = []) {
    $pdo = getDBConnection();
    if (!$pdo) {
        return false;
    }
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    } catch (PDOException $e) {
        error_log("Database query error: " . $e->getMessage());
        error_log("SQL: " . $sql);
        return false;
    }
}

/**
 * Execute an INSERT/UPDATE/DELETE query
 * @param string $sql SQL query
 * @param array $params Parameters for prepared statement
 * @return int|false Last insert ID for INSERT, affected rows for UPDATE/DELETE
 */
function dbExecute($sql, $params = []) {
    $pdo = getDBConnection();
    if (!$pdo) {
        error_log("dbExecute: No database connection available");
        return false;
    }
    
    try {
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute($params);
        
        if (!$result) {
            $errorInfo = $stmt->errorInfo();
            error_log("dbExecute: Statement execution failed - " . ($errorInfo[2] ?? 'Unknown error'));
            error_log("dbExecute: SQL - " . $sql);
            error_log("dbExecute: Params - " . json_encode($params));
            return false;
        }
        
        // Return last insert ID for INSERT, affected rows for others
        if (stripos($sql, 'INSERT') === 0) {
            $insertId = $pdo->lastInsertId();
            if ($insertId === false || $insertId === '0') {
                error_log("dbExecute: Warning - lastInsertId returned false or 0 for INSERT statement");
                error_log("dbExecute: SQL - " . $sql);
            }
            return $insertId;
        }
        return $stmt->rowCount();
    } catch (PDOException $e) {
        error_log("dbExecute: PDO Exception - " . $e->getMessage());
        error_log("dbExecute: SQL - " . $sql);
        error_log("dbExecute: Params - " . json_encode($params));
        error_log("dbExecute: Error Code - " . $e->getCode());
        return false;
    }
}

/**
 * Begin a transaction
 * @return bool
 */
function dbBeginTransaction() {
    $pdo = getDBConnection();
    if (!$pdo) {
        return false;
    }
    return $pdo->beginTransaction();
}

/**
 * Commit a transaction
 * @return bool
 */
function dbCommit() {
    $pdo = getDBConnection();
    if (!$pdo) {
        return false;
    }
    return $pdo->commit();
}

/**
 * Rollback a transaction
 * @return bool
 */
function dbRollback() {
    $pdo = getDBConnection();
    if (!$pdo) {
        return false;
    }
    return $pdo->rollBack();
}

