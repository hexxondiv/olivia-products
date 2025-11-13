<?php
/**
 * Authentication Helper Functions for CMS
 */

require_once __DIR__ . '/database.php';

/**
 * Verify admin authentication token
 * @param string $token Authentication token
 * @return array|false User data if authenticated, false otherwise
 */
function verifyAuthToken($token) {
    if (empty($token)) {
        return false;
    }
    
    // In production, use JWT or session-based auth
    // For now, using simple token-based auth
    // You should implement proper JWT or session management
    
    // Decode token (simple base64 for now - upgrade to JWT in production)
    $decoded = base64_decode($token, true);
    if ($decoded === false) {
        return false;
    }
    
    $data = json_decode($decoded, true);
    if (!$data || !isset($data['userId']) || !isset($data['expires'])) {
        return false;
    }
    
    // Check if token expired
    if ($data['expires'] < time()) {
        return false;
    }
    
    // Get user from database with role name
    $user = dbQueryOne(
        "SELECT au.id, au.username, au.email, au.fullName, au.isActive, 
                COALESCE(r.name, au.role) as role, r.id as roleId, r.name as roleName
         FROM admin_users au
         LEFT JOIN roles r ON au.roleId = r.id
         WHERE au.id = ? AND au.isActive = 1",
        [$data['userId']]
    );
    
    return $user ?: false;
}

/**
 * Authenticate admin user
 * @param string $username Username or email
 * @param string $password Password
 * @return array|false User data and token if authenticated, false otherwise
 */
function authenticateAdmin($username, $password) {
    if (empty($username) || empty($password)) {
        return false;
    }
    
    // Get user from database with role name
    $user = dbQueryOne(
        "SELECT au.id, au.username, au.email, au.passwordHash, au.fullName, au.isActive,
                COALESCE(r.name, au.role) as role, r.id as roleId, r.name as roleName
         FROM admin_users au
         LEFT JOIN roles r ON au.roleId = r.id
         WHERE (au.username = ? OR au.email = ?) AND au.isActive = 1",
        [$username, $username]
    );
    
    if (!$user) {
        return false;
    }
    
    // Verify password
    if (!password_verify($password, $user['passwordHash'])) {
        return false;
    }
    
    // Update last login
    dbExecute(
        "UPDATE admin_users SET lastLogin = NOW() WHERE id = ?",
        [$user['id']]
    );
    
    // Generate token (simple for now - upgrade to JWT in production)
    $tokenData = [
        'userId' => $user['id'],
        'username' => $user['username'],
        'expires' => time() + (24 * 60 * 60) // 24 hours
    ];
    $token = base64_encode(json_encode($tokenData));
    
    // Remove password hash from response
    unset($user['passwordHash']);
    $user['token'] = $token;
    
    return $user;
}

/**
 * Require authentication for API endpoint
 * @return array|false User data if authenticated, false and sends 401 response otherwise
 */
function requireAuth() {
    $headers = getallheaders();
    $token = null;
    
    // Get token from Authorization header
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }
    
    // Fallback to token parameter
    if (!$token && isset($_GET['token'])) {
        $token = $_GET['token'];
    }
    
    // Fallback to POST token
    if (!$token && isset($_POST['token'])) {
        $token = $_POST['token'];
    }
    
    $user = verifyAuthToken($token);
    
    if (!$user) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Authentication required'
        ]);
        exit();
    }
    
    return $user;
}

/**
 * Check if user has required role
 * @param array $user User data from requireAuth()
 * @param string|array $requiredRole Required role(s)
 * @return bool
 */
function hasRole($user, $requiredRole) {
    if (!isset($user['role'])) {
        return false;
    }
    
    if (is_array($requiredRole)) {
        return in_array($user['role'], $requiredRole);
    }
    
    return $user['role'] === $requiredRole;
}

/**
 * Require specific role for API endpoint
 * @param string|array $requiredRole Required role(s) - accepts 'admin', 'sales', 'support' or old roles ('manager', 'staff')
 * @return array User data
 */
function requireRole($requiredRole) {
    $user = requireAuth();
    
    // Map old role names to new ones for backward compatibility
    $roleMapping = [
        'manager' => 'admin',  // Manager maps to admin for full access
        'staff' => 'support'    // Staff maps to support
    ];
    
    // Normalize required roles
    $normalizedRoles = [];
    if (is_array($requiredRole)) {
        foreach ($requiredRole as $role) {
            $normalizedRoles[] = isset($roleMapping[$role]) ? $roleMapping[$role] : $role;
        }
    } else {
        $normalizedRoles[] = isset($roleMapping[$requiredRole]) ? $roleMapping[$requiredRole] : $requiredRole;
    }
    
    // Get user's role (should already be normalized from database)
    $userRole = $user['role'] ?? null;
    
    if (!hasRole($user, $normalizedRoles)) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Insufficient permissions. Required role: ' . (is_array($requiredRole) ? implode(' or ', $requiredRole) : $requiredRole)
        ]);
        exit();
    }
    
    return $user;
}

