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

// Check if path ends with /adjust, /alerts, or /reports
$isAdjustEndpoint = strpos($path, '/adjust') !== false || end($pathParts) === 'adjust';
$isAlertsEndpoint = strpos($path, '/alerts') !== false || in_array('alerts', $pathParts);
$isReportsEndpoint = strpos($path, '/reports') !== false || in_array('reports', $pathParts);

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
    }
    // Check for /reports endpoint
    elseif ($isReportsEndpoint && $method === 'GET') {
        handleGetReports();
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

function handleGetReports() {
    // Require authentication
    requireRole(['admin', 'manager', 'staff']);
    
    $reportType = isset($_GET['type']) ? $_GET['type'] : 'movements';
    $startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null;
    $endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null;
    $movementType = isset($_GET['movementType']) ? $_GET['movementType'] : null;
    $productId = isset($_GET['productId']) ? (int)$_GET['productId'] : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : null;
    
    switch ($reportType) {
        case 'movements':
            // If page is provided, calculate offset
            if ($page !== null && $page > 0) {
                $offset = ($page - 1) * $limit;
            }
            handleGetMovementReport($startDate, $endDate, $movementType, $productId, $limit, $offset);
            break;
        case 'low_stock':
            handleGetLowStockReport();
            break;
        case 'value':
            handleGetStockValueReport();
            break;
        case 'summary':
            handleGetSummaryReport($startDate, $endDate);
            break;
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid report type']);
    }
}

function handleGetMovementReport($startDate, $endDate, $movementType, $productId, $limit, $offset = 0) {
    // Build WHERE clause for counting and fetching
    $whereClause = "WHERE 1=1";
    $params = [];
    
    if ($startDate) {
        $whereClause .= " AND sm.createdAt >= ?";
        $params[] = $startDate . ' 00:00:00';
    }
    
    if ($endDate) {
        $whereClause .= " AND sm.createdAt <= ?";
        $params[] = $endDate . ' 23:59:59';
    }
    
    if ($movementType) {
        $whereClause .= " AND sm.movementType = ?";
        $params[] = $movementType;
    }
    
    if ($productId) {
        $whereClause .= " AND sm.productId = ?";
        $params[] = $productId;
    }
    
    // Get total count
    $countSql = "SELECT COUNT(*) as total
                 FROM stock_movements sm
                 JOIN products p ON sm.productId = p.id
                 LEFT JOIN admin_users u ON sm.createdBy = u.id
                 $whereClause";
    
    $countResult = dbQueryOne($countSql, $params);
    $totalCount = (int)$countResult['total'];
    
    // Calculate totals from ALL matching movements (not just paginated results)
    $totalsSql = "SELECT sm.movementType, SUM(ABS(sm.quantity)) as total
                  FROM stock_movements sm
                  JOIN products p ON sm.productId = p.id
                  LEFT JOIN admin_users u ON sm.createdBy = u.id
                  $whereClause
                  GROUP BY sm.movementType";
    
    $totalsResult = dbQuery($totalsSql, $params);
    $totals = [
        'purchase' => 0,
        'sale' => 0,
        'adjustment' => 0,
        'return' => 0,
        'damaged' => 0,
        'transfer' => 0
    ];
    
    foreach ($totalsResult as $row) {
        $type = $row['movementType'];
        if (isset($totals[$type])) {
            $totals[$type] = (int)$row['total'];
        }
    }
    
    // Get paginated movements
    $sql = "SELECT sm.*, p.name as productName, p.price, u.username as createdByName
            FROM stock_movements sm
            JOIN products p ON sm.productId = p.id
            LEFT JOIN admin_users u ON sm.createdBy = u.id
            $whereClause
            ORDER BY sm.createdAt DESC
            LIMIT ? OFFSET ?";
    
    $queryParams = array_merge($params, [$limit, $offset]);
    $movements = dbQuery($sql, $queryParams);
    
    echo json_encode([
        'success' => true,
        'data' => $movements,
        'totals' => $totals,
        'count' => count($movements),
        'totalCount' => $totalCount,
        'limit' => $limit,
        'offset' => $offset
    ]);
}

function handleGetLowStockReport() {
    $products = dbQuery(
        "SELECT p.id, p.name, p.stockQuantity, p.lowStockThreshold, p.stockStatus, p.price,
                (p.lowStockThreshold * 2 - p.stockQuantity) as recommendedOrder
         FROM products p
         WHERE p.stockEnabled = TRUE 
         AND (p.stockStatus = 'low_stock' OR p.stockStatus = 'out_of_stock')
         ORDER BY p.stockQuantity ASC, p.name ASC"
    );
    
    $totalValue = 0;
    foreach ($products as &$product) {
        $product['stockQuantity'] = (int)$product['stockQuantity'];
        $product['lowStockThreshold'] = (int)$product['lowStockThreshold'];
        $product['recommendedOrder'] = max(0, (int)$product['recommendedOrder']);
        $product['currentValue'] = (float)$product['price'] * $product['stockQuantity'];
        $totalValue += $product['currentValue'];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $products,
        'count' => count($products),
        'totalValue' => $totalValue
    ]);
}

function handleGetStockValueReport() {
    $products = dbQuery(
        "SELECT p.id, p.name, p.stockQuantity, p.price, p.stockStatus,
                (p.stockQuantity * p.price) as totalValue
         FROM products p
         WHERE p.stockEnabled = TRUE
         ORDER BY (p.stockQuantity * p.price) DESC"
    );
    
    $totalInventoryValue = 0;
    $statusBreakdown = [
        'in_stock' => ['count' => 0, 'value' => 0],
        'low_stock' => ['count' => 0, 'value' => 0],
        'out_of_stock' => ['count' => 0, 'value' => 0],
        'on_backorder' => ['count' => 0, 'value' => 0]
    ];
    
    foreach ($products as &$product) {
        $product['stockQuantity'] = (int)$product['stockQuantity'];
        $product['totalValue'] = (float)$product['totalValue'];
        $totalInventoryValue += $product['totalValue'];
        
        $status = $product['stockStatus'] ?? 'in_stock';
        if (isset($statusBreakdown[$status])) {
            $statusBreakdown[$status]['count']++;
            $statusBreakdown[$status]['value'] += $product['totalValue'];
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $products,
        'totalInventoryValue' => $totalInventoryValue,
        'statusBreakdown' => $statusBreakdown,
        'count' => count($products)
    ]);
}

function handleGetSummaryReport($startDate, $endDate) {
    $dateFilter = '';
    $params = [];
    
    if ($startDate && $endDate) {
        $dateFilter = "WHERE sm.createdAt >= ? AND sm.createdAt <= ?";
        $params = [$startDate . ' 00:00:00', $endDate . ' 23:59:59'];
    }
    
    // Get movement summary by type
    $summarySql = "SELECT sm.movementType, 
                COUNT(*) as movementCount,
                SUM(ABS(sm.quantity)) as totalQuantity,
                SUM(CASE WHEN sm.quantity > 0 THEN ABS(sm.quantity) ELSE 0 END) as totalIn,
                SUM(CASE WHEN sm.quantity < 0 THEN ABS(sm.quantity) ELSE 0 END) as totalOut
         FROM stock_movements sm
         $dateFilter
         GROUP BY sm.movementType";
    
    $summary = $params ? dbQuery($summarySql, $params) : dbQuery($summarySql);
    
    // Get top products by movement
    $topProductsSql = "SELECT p.id, p.name, COUNT(sm.id) as movementCount,
                SUM(ABS(sm.quantity)) as totalMovement
         FROM stock_movements sm
         JOIN products p ON sm.productId = p.id
         $dateFilter
         GROUP BY p.id, p.name
         ORDER BY movementCount DESC
         LIMIT 10";
    
    $topProducts = $params ? dbQuery($topProductsSql, $params) : dbQuery($topProductsSql);
    
    echo json_encode([
        'success' => true,
        'summary' => $summary,
        'topProducts' => $topProducts
    ]);
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

