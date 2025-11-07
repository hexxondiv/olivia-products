<?php
/**
 * Orders Management API
 * Endpoints:
 * GET    /api/orders.php - List all orders
 * GET    /api/orders.php?id=ORD-xxx - Get single order
 * GET    /api/orders.php?status=pending - Filter by status
 * PUT    /api/orders.php?id=ORD-xxx - Update order status (requires auth)
 * DELETE /api/orders.php?id=ORD-xxx - Delete order (requires auth)
 */

ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS');
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
    error_log('Orders API error: ' . $e->getMessage());
}

ob_end_flush();

function handleGet() {
    $orderId = isset($_GET['id']) ? $_GET['id'] : null;
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    if ($orderId) {
        // Get single order with items
        $order = dbQueryOne(
            "SELECT * FROM orders WHERE orderId = ?",
            [$orderId]
        );
        
        if (!$order) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Order not found']);
            return;
        }
        
        // Get order items
        $items = dbQuery(
            "SELECT * FROM order_items WHERE orderId = ? ORDER BY id",
            [$orderId]
        );
        
        // Convert types
        $order['totalAmount'] = (float)$order['totalAmount'];
        $order['salesEmailSent'] = (bool)$order['salesEmailSent'];
        $order['customerEmailSent'] = (bool)$order['customerEmailSent'];
        
        $order['items'] = $items;
        foreach ($order['items'] as &$item) {
            $item['productPrice'] = (float)$item['productPrice'];
            $item['quantity'] = (int)$item['quantity'];
        }
        
        echo json_encode(['success' => true, 'data' => $order]);
    } else {
        // Get all orders
        $sql = "SELECT * FROM orders WHERE 1=1";
        $params = [];
        
        if ($status) {
            $sql .= " AND status = ?";
            $params[] = $status;
        }
        
        $sql .= " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $orders = dbQuery($sql, $params);
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM orders WHERE 1=1";
        $countParams = [];
        if ($status) {
            $countSql .= " AND status = ?";
            $countParams[] = $status;
        }
        $countResult = dbQueryOne($countSql, $countParams);
        $total = $countResult['total'] ?? 0;
        
        // Convert types
        foreach ($orders as &$order) {
            $order['totalAmount'] = (float)$order['totalAmount'];
            $order['salesEmailSent'] = (bool)$order['salesEmailSent'];
            $order['customerEmailSent'] = (bool)$order['customerEmailSent'];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $orders,
            'count' => count($orders),
            'total' => (int)$total,
            'limit' => $limit,
            'offset' => $offset
        ]);
    }
}

function handlePut() {
    // Require authentication
    requireRole(['admin', 'manager']);
    
    global $data;
    $orderId = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$orderId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Order ID required']);
        return;
    }
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Check if order exists
    $existing = dbQueryOne("SELECT orderId FROM orders WHERE orderId = ?", [$orderId]);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        return;
    }
    
    // Build update query
    $fields = [];
    $params = [];
    
    $allowedFields = ['status', 'customerName', 'customerEmail', 'customerPhone', 
                      'customerAddress', 'customerCity', 'customerState', 'customerPostalCode', 
                      'customerNotes', 'totalAmount'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $params[] = $data[$field];
        }
    }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        return;
    }
    
    $params[] = $orderId;
    $sql = "UPDATE orders SET " . implode(', ', $fields) . " WHERE orderId = ?";
    
    $result = dbExecute($sql, $params);
    
    if ($result !== false) {
        $order = dbQueryOne("SELECT * FROM orders WHERE orderId = ?", [$orderId]);
        $order['totalAmount'] = (float)$order['totalAmount'];
        
        echo json_encode(['success' => true, 'message' => 'Order updated', 'data' => $order]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update order']);
    }
}

function handleDelete() {
    // Require authentication
    requireRole(['admin']);
    
    $orderId = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$orderId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Order ID required']);
        return;
    }
    
    // Check if order exists
    $order = dbQueryOne("SELECT orderId FROM orders WHERE orderId = ?", [$orderId]);
    if (!$order) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        return;
    }
    
    // Delete order (cascade will delete order_items)
    $result = dbExecute("DELETE FROM orders WHERE orderId = ?", [$orderId]);
    
    if ($result !== false) {
        echo json_encode(['success' => true, 'message' => 'Order deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete order']);
    }
}

