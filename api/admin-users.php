<?php
/**
 * Admin Users CRUD API
 * Endpoints:
 * GET    /api/admin-users.php - List all admin users (requires admin role)
 * GET    /api/admin-users.php?id=1 - Get single user (requires admin role)
 * POST   /api/admin-users.php - Create user (requires admin role)
 * PUT    /api/admin-users.php?id=1 - Update user (requires admin role)
 * DELETE /api/admin-users.php?id=1 - Delete user (requires admin role, cannot delete id=1)
 */

ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
$input = file_get_contents('php://input');
$data = json_decode($input, true);

try {
    switch ($method) {
        case 'GET':
            handleGet();
            break;
        case 'POST':
            handlePost();
            break;
        case 'PUT':
            handlePut();
            break;
        case 'DELETE':
            handleDelete();
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
    error_log('Admin Users API error: ' . $e->getMessage());
}

ob_end_flush();

function handleGet() {
    // Require admin role
    $currentUser = requireRole('admin');
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if ($id) {
        // Get single user
        $user = dbQueryOne(
            "SELECT au.id, au.username, au.email, au.fullName, au.isActive, au.lastLogin, au.createdAt, au.updatedAt,
                    COALESCE(r.name, au.role) as role, r.id as roleId, r.name as roleName
             FROM admin_users au
             LEFT JOIN roles r ON au.roleId = r.id
             WHERE au.id = ?",
            [$id]
        );
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found']);
            return;
        }
        
        $user['isActive'] = (bool)$user['isActive'];
        
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
    } else {
        // Get all users
        $users = dbQuery(
            "SELECT au.id, au.username, au.email, au.fullName, au.isActive, au.lastLogin, au.createdAt, au.updatedAt,
                    COALESCE(r.name, au.role) as role, r.id as roleId, r.name as roleName
             FROM admin_users au
             LEFT JOIN roles r ON au.roleId = r.id
             ORDER BY au.createdAt DESC"
        );
        
        foreach ($users as &$user) {
            $user['isActive'] = (bool)$user['isActive'];
        }
        
        echo json_encode([
            'success' => true,
            'users' => $users,
            'total' => count($users)
        ]);
    }
}

function handlePost() {
    global $data;
    
    // Require admin role
    $currentUser = requireRole('admin');
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No data provided']);
        return;
    }
    
    // Validate required fields
    if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Username, email, and password are required']);
        return;
    }
    
    // Validate password length
    if (strlen($data['password']) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long']);
        return;
    }
    
    // Check if username already exists
    $existing = dbQueryOne(
        "SELECT id FROM admin_users WHERE username = ?",
        [$data['username']]
    );
    if ($existing) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Username already exists']);
        return;
    }
    
    // Check if email already exists
    $existing = dbQueryOne(
        "SELECT id FROM admin_users WHERE email = ?",
        [$data['email']]
    );
    if ($existing) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        return;
    }
    
    // Get roleId from role name
    $roleName = $data['role'] ?? 'support';
    $role = dbQueryOne(
        "SELECT id FROM roles WHERE name = ?",
        [$roleName]
    );
    
    if (!$role) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid role']);
        return;
    }
    
    $roleId = $role['id'];
    $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
    $fullName = $data['fullName'] ?? '';
    $isActive = isset($data['isActive']) ? (int)$data['isActive'] : 1;
    
    // Insert new user
    $userId = dbExecute(
        "INSERT INTO admin_users (username, email, passwordHash, fullName, roleId, isActive) 
         VALUES (?, ?, ?, ?, ?, ?)",
        [$data['username'], $data['email'], $passwordHash, $fullName, $roleId, $isActive]
    );
    
    if ($userId) {
        // Get created user
        $newUser = dbQueryOne(
            "SELECT au.id, au.username, au.email, au.fullName, au.isActive, au.lastLogin, au.createdAt, au.updatedAt,
                    COALESCE(r.name, au.role) as role, r.id as roleId, r.name as roleName
             FROM admin_users au
             LEFT JOIN roles r ON au.roleId = r.id
             WHERE au.id = ?",
            [$userId]
        );
        
        $newUser['isActive'] = (bool)$newUser['isActive'];
        
        echo json_encode([
            'success' => true,
            'message' => 'User created successfully',
            'user' => $newUser
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create user']);
    }
}

function handlePut() {
    global $data;
    
    // Require admin role
    $currentUser = requireRole('admin');
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User ID is required']);
        return;
    }
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No data provided']);
        return;
    }
    
    // Check if user exists
    $existing = dbQueryOne(
        "SELECT id FROM admin_users WHERE id = ?",
        [$id]
    );
    
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        return;
    }
    
    $updates = [];
    $params = [];
    
    // Update username if provided
    if (isset($data['username'])) {
        // Check if username is already taken by another user
        $usernameTaken = dbQueryOne(
            "SELECT id FROM admin_users WHERE username = ? AND id != ?",
            [$data['username'], $id]
        );
        if ($usernameTaken) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Username already exists']);
            return;
        }
        $updates[] = "username = ?";
        $params[] = $data['username'];
    }
    
    // Update email if provided
    if (isset($data['email'])) {
        // Check if email is already taken by another user
        $emailTaken = dbQueryOne(
            "SELECT id FROM admin_users WHERE email = ? AND id != ?",
            [$data['email'], $id]
        );
        if ($emailTaken) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email already exists']);
            return;
        }
        $updates[] = "email = ?";
        $params[] = $data['email'];
    }
    
    // Update full name if provided
    if (isset($data['fullName'])) {
        $updates[] = "fullName = ?";
        $params[] = $data['fullName'];
    }
    
    // Update password if provided
    if (isset($data['password']) && !empty($data['password'])) {
        if (strlen($data['password']) < 6) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long']);
            return;
        }
        $updates[] = "passwordHash = ?";
        $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
    }
    
    // Update role if provided
    if (isset($data['role'])) {
        $role = dbQueryOne(
            "SELECT id FROM roles WHERE name = ?",
            [$data['role']]
        );
        if (!$role) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid role']);
            return;
        }
        $updates[] = "roleId = ?";
        $params[] = $role['id'];
    }
    
    // Update isActive if provided
    if (isset($data['isActive'])) {
        $updates[] = "isActive = ?";
        $params[] = (int)$data['isActive'];
    }
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No valid updates provided']);
        return;
    }
    
    $params[] = $id;
    
    // Execute update
    $result = dbExecute(
        "UPDATE admin_users SET " . implode(', ', $updates) . " WHERE id = ?",
        $params
    );
    
    if ($result !== false) {
        // Get updated user
        $updatedUser = dbQueryOne(
            "SELECT au.id, au.username, au.email, au.fullName, au.isActive, au.lastLogin, au.createdAt, au.updatedAt,
                    COALESCE(r.name, au.role) as role, r.id as roleId, r.name as roleName
             FROM admin_users au
             LEFT JOIN roles r ON au.roleId = r.id
             WHERE au.id = ?",
            [$id]
        );
        
        $updatedUser['isActive'] = (bool)$updatedUser['isActive'];
        
        echo json_encode([
            'success' => true,
            'message' => 'User updated successfully',
            'user' => $updatedUser
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update user']);
    }
}

function handleDelete() {
    // Require admin role
    $currentUser = requireRole('admin');
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User ID is required']);
        return;
    }
    
    // Prevent deletion of user id 1
    if ($id === 1) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Cannot delete the primary administrator account']);
        return;
    }
    
    // Check if user exists
    $existing = dbQueryOne(
        "SELECT id FROM admin_users WHERE id = ?",
        [$id]
    );
    
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        return;
    }
    
    // Delete user (soft delete by setting isActive to 0, or hard delete)
    // Using soft delete to maintain referential integrity
    $result = dbExecute(
        "UPDATE admin_users SET isActive = 0 WHERE id = ?",
        [$id]
    );
    
    if ($result !== false) {
        echo json_encode([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete user']);
    }
}

