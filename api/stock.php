<?php
/**
 * Stock Management API
 * Endpoints:
 * GET    /api/stock.php?productId=X - Get stock info and history
 * GET    /api/stock.php?status=low_stock - Get all low stock products
 * POST   /api/stock.php/adjust - Adjust stock (with movement record)
 * GET    /api/stock.php/alerts - Get active stock alerts
 * PUT    /api/stock.php/alerts/:id/resolve - Resolve stock alert
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
require_once __DIR__ . '/stock-helper.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Parse URL path for special endpoints
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Check if path ends with /adjust or /alerts
$isAdjustEndpoint = strpos($path, '/adjust') !== false || end($pathParts) === 'adjust';
$isAlertsEndpoint = strpos($path, '/alerts') !== false || in_array('alerts', $pathParts);

try {
    // Check for /adjust endpoint
    if ($isAdjustEndpoint && $method === 'POST') {
        // Adjust stock
        handleAdjustStock();
    }
    // Check for /alerts endpoint
    elseif ($isAlertsEndpoint) {
        // Find alerts in path parts
        $alertsIndex = array_search('alerts', $pathParts);
        if ($alertsIndex !== false && isset($pathParts[$alertsIndex + 1]) && is_numeric($pathParts[$alertsIndex + 1]) && $method === 'PUT') {
            // Resolve alert: /alerts/:id/resolve or /alerts/:id
            $alertId = (int)$pathParts[$alertsIndex + 1];
            handleResolveAlert($alertId);
        } else {
            // Get alerts
            handleGetAlerts();
        }
    } else {
        // Default: Get stock info
        handleGet();
    }
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
    error_log('Stock API error: ' . $e->getMessage());
}

ob_end_flush();

function handleGet() {
    $productId = isset($_GET['productId']) ? (int)$_GET['productId'] : null;
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    
    if ($productId) {
        // Get stock info for specific product
        $product = dbQueryOne(
            "SELECT id, name, stockQuantity, stockEnabled, lowStockThreshold, allowBackorders, stockStatus 
             FROM products WHERE id = ?",
            [$productId]
        );
        
        if (!$product) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Product not found']);
            return;
        }
        
        // Get stock history
        $history = getStockHistory($productId, 50);
        
        // Get active alerts for this product
        $alerts = dbQuery(
            "SELECT * FROM stock_alerts WHERE productId = ? AND isResolved = FALSE ORDER BY createdAt DESC",
            [$productId]
        );
        
        $product['stockQuantity'] = (int)$product['stockQuantity'];
        $product['stockEnabled'] = (bool)$product['stockEnabled'];
        $product['lowStockThreshold'] = (int)$product['lowStockThreshold'];
        $product['allowBackorders'] = (bool)$product['allowBackorders'];
        
        echo json_encode([
            'success' => true,
            'data' => [
                'product' => $product,
                'history' => $history,
                'alerts' => $alerts
            ]
        ]);
    } elseif ($status) {
        // Get products by stock status
        $sql = "SELECT id, name, stockQuantity, stockEnabled, lowStockThreshold, allowBackorders, stockStatus 
                FROM products 
                WHERE stockEnabled = TRUE AND stockStatus = ?
                ORDER BY stockQuantity ASC";
        
        $products = dbQuery($sql, [$status]);
        
        foreach ($products as &$product) {
            $product['stockQuantity'] = (int)$product['stockQuantity'];
            $product['stockEnabled'] = (bool)$product['stockEnabled'];
            $product['lowStockThreshold'] = (int)$product['lowStockThreshold'];
            $product['allowBackorders'] = (bool)$product['allowBackorders'];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $products,
            'count' => count($products)
        ]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'productId or status parameter required']);
    }
}

function handleAdjustStock() {
    // Require authentication
    requireRole(['admin', 'manager']);
    
    global $data;
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    $productId = isset($data['productId']) ? (int)$data['productId'] : null;
    $quantity = isset($data['quantity']) ? (int)$data['quantity'] : null;
    $movementType = isset($data['movementType']) ? $data['movementType'] : 'adjustment';
    $referenceType = isset($data['referenceType']) ? $data['referenceType'] : 'manual';
    $referenceId = isset($data['referenceId']) ? $data['referenceId'] : null;
    $notes = isset($data['notes']) ? $data['notes'] : null;
    
    if (!$productId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'productId is required']);
        return;
    }
    
    if ($quantity === null) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'quantity is required']);
        return;
    }
    
    // Get current user ID
    $userId = getCurrentUserId();
    
    $result = updateProductStock(
        $productId,
        $quantity,
        $movementType,
        $referenceType,
        $referenceId,
        $notes,
        $userId
    );
    
    if ($result['success']) {
        // Get updated product info
        $product = dbQueryOne(
            "SELECT id, name, stockQuantity, stockEnabled, lowStockThreshold, allowBackorders, stockStatus 
             FROM products WHERE id = ?",
            [$productId]
        );
        
        $product['stockQuantity'] = (int)$product['stockQuantity'];
        $product['stockEnabled'] = (bool)$product['stockEnabled'];
        $product['lowStockThreshold'] = (int)$product['lowStockThreshold'];
        $product['allowBackorders'] = (bool)$product['allowBackorders'];
        
        echo json_encode([
            'success' => true,
            'message' => $result['message'],
            'data' => $product
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $result['message']
        ]);
    }
}

function handleGetAlerts() {
    // Require authentication for alerts
    requireRole(['admin', 'manager', 'staff']);
    
    $alertType = isset($_GET['type']) ? $_GET['type'] : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    
    $alerts = getActiveStockAlerts($alertType, $limit);
    
    echo json_encode([
        'success' => true,
        'data' => $alerts,
        'count' => count($alerts)
    ]);
}

function handleResolveAlert($alertId) {
    // Require authentication
    requireRole(['admin', 'manager']);
    
    global $data;
    
    $notes = isset($data['notes']) ? $data['notes'] : null;
    $userId = getCurrentUserId();
    
    $result = resolveStockAlert($alertId, $userId, $notes);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Alert resolved successfully'
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to resolve alert'
        ]);
    }
}

function getCurrentUserId() {
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
    
    if (!$token) {
        return null;
    }
    
    // Verify token and get user
    $user = verifyAuthToken($token);
    if ($user && isset($user['id'])) {
        return (int)$user['id'];
    }
    
    return null;
}

