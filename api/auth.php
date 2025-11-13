<?php
/**
 * Authentication API
 * POST /api/auth.php - Login
 * POST /api/auth.php?action=logout - Logout (requires auth)
 * GET  /api/auth.php?action=me - Get current user (requires auth)
 * PUT  /api/auth.php?action=profile - Update profile (name and/or password, requires auth)
 */

ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

ob_clean();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_clean();
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth-helper.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : null;
$input = file_get_contents('php://input');
$data = json_decode($input, true);

try {
    if ($method === 'POST' && !$action) {
        // Login
        handleLogin();
    } elseif ($method === 'GET' && $action === 'me') {
        // Get current user
        handleGetMe();
    } elseif ($method === 'POST' && $action === 'logout') {
        // Logout
        handleLogout();
    } elseif ($method === 'PUT' && $action === 'profile') {
        // Update profile
        handleUpdateProfile();
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid request']);
    }
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
    error_log('Auth API error: ' . $e->getMessage());
}

ob_end_flush();

function handleLogin() {
    global $data;
    
    if (!$data || empty($data['username']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Username and password required']);
        return;
    }
    
    $result = authenticateAdmin($data['username'], $data['password']);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => $result
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid username or password'
        ]);
    }
}

function handleGetMe() {
    $user = requireAuth();
    
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);
}

function handleLogout() {
    // For token-based auth, logout is handled client-side by removing token
    // This endpoint is for future session-based auth
    echo json_encode([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
}

function handleUpdateProfile() {
    global $data;
    $user = requireAuth();
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No data provided']);
        return;
    }
    
    $updates = [];
    $params = [];
    
    // Update full name if provided
    if (isset($data['fullName']) && !empty(trim($data['fullName']))) {
        $updates[] = "fullName = ?";
        $params[] = trim($data['fullName']);
    }
    
    // Update password if provided
    if (isset($data['currentPassword']) && isset($data['newPassword'])) {
        // Verify current password first
        $currentUser = dbQueryOne(
            "SELECT passwordHash FROM admin_users WHERE id = ?",
            [$user['id']]
        );
        
        if (!$currentUser || !password_verify($data['currentPassword'], $currentUser['passwordHash'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
            return;
        }
        
        // Validate new password
        $newPassword = trim($data['newPassword']);
        if (strlen($newPassword) < 6) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters long']);
            return;
        }
        
        $updates[] = "passwordHash = ?";
        $params[] = password_hash($newPassword, PASSWORD_DEFAULT);
    }
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No valid updates provided']);
        return;
    }
    
    // Add user ID to params for WHERE clause
    $params[] = $user['id'];
    
    // Build and execute update query
    $sql = "UPDATE admin_users SET " . implode(', ', $updates) . " WHERE id = ?";
    dbExecute($sql, $params);
    
    // Get updated user data
    $updatedUser = dbQueryOne(
        "SELECT id, username, email, fullName, role, isActive FROM admin_users WHERE id = ?",
        [$user['id']]
    );
    
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => $updatedUser
    ]);
}

