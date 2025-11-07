<?php
/**
 * Seed Admin User
 * Creates or updates the default admin user
 * 
 * Usage: php seed-admin.php
 * Or via web: /api/seed-admin.php?run=1
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

function seedAdmin() {
    $pdo = getDBConnection();
    if (!$pdo) {
        return ['success' => false, 'message' => 'Database connection failed'];
    }
    
    try {
        // Default admin credentials
        $username = 'admin';
        $email = 'admin@oliviaproducts.com';
        $password = 'admin123'; // CHANGE THIS!
        $fullName = 'Administrator';
        $role = 'admin';
        
        // Generate password hash
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        // Check if admin user exists
        $existing = dbQueryOne(
            "SELECT id FROM admin_users WHERE username = ?",
            [$username]
        );
        
        if ($existing) {
            // Update existing admin user
            $sql = "UPDATE admin_users SET 
                    email = ?, 
                    passwordHash = ?, 
                    fullName = ?, 
                    role = ?,
                    isActive = 1
                    WHERE username = ?";
            
            $result = dbExecute($sql, [
                $email,
                $passwordHash,
                $fullName,
                $role,
                $username
            ]);
            
            if ($result !== false) {
                return [
                    'success' => true,
                    'message' => 'Admin user updated successfully',
                    'username' => $username,
                    'password' => $password,
                    'note' => 'CHANGE THE PASSWORD IMMEDIATELY!'
                ];
            } else {
                return ['success' => false, 'message' => 'Failed to update admin user'];
            }
        } else {
            // Create new admin user
            $sql = "INSERT INTO admin_users (username, email, passwordHash, fullName, role, isActive) 
                    VALUES (?, ?, ?, ?, ?, 1)";
            
            $id = dbExecute($sql, [
                $username,
                $email,
                $passwordHash,
                $fullName,
                $role
            ]);
            
            if ($id) {
                return [
                    'success' => true,
                    'message' => 'Admin user created successfully',
                    'username' => $username,
                    'password' => $password,
                    'note' => 'CHANGE THE PASSWORD IMMEDIATELY!'
                ];
            } else {
                return ['success' => false, 'message' => 'Failed to create admin user'];
            }
        }
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ];
    }
}

// Run seeding
$result = seedAdmin();

if ($isWebRequest) {
    header('Content-Type: application/json');
    echo json_encode($result);
} else {
    echo "Admin User Seeding Results:\n";
    echo json_encode($result, JSON_PRETTY_PRINT) . "\n";
}

