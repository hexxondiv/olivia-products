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
require_once __DIR__ . '/mailgun-helper.php';

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
    $paid = isset($_GET['paid']) ? $_GET['paid'] : null;
    $search = isset($_GET['search']) ? trim($_GET['search']) : null;
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
        $order['isPaid'] = isset($order['isPaid']) ? (bool)$order['isPaid'] : false;
        
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
        
        if ($paid === 'paid' || $paid === 'true') {
            $sql .= " AND isPaid = TRUE";
        } elseif ($paid === 'pending') {
            $sql .= " AND (isPaid = FALSE OR isPaid IS NULL)";
        }
        
        if ($search) {
            $sql .= " AND orderId LIKE ?";
            $params[] = '%' . $search . '%';
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
        if ($paid === 'paid' || $paid === 'true') {
            $countSql .= " AND isPaid = TRUE";
        } elseif ($paid === 'pending') {
            $countSql .= " AND (isPaid = FALSE OR isPaid IS NULL)";
        }
        if ($search) {
            $countSql .= " AND orderId LIKE ?";
            $countParams[] = '%' . $search . '%';
        }
        $countResult = dbQueryOne($countSql, $countParams);
        $total = $countResult['total'] ?? 0;
        
        // Convert types
        foreach ($orders as &$order) {
            $order['totalAmount'] = (float)$order['totalAmount'];
            $order['salesEmailSent'] = (bool)$order['salesEmailSent'];
            $order['customerEmailSent'] = (bool)$order['customerEmailSent'];
            $order['isPaid'] = isset($order['isPaid']) ? (bool)$order['isPaid'] : false;
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
    
    // Get existing order to check old status
    $existingOrder = dbQueryOne("SELECT * FROM orders WHERE orderId = ?", [$orderId]);
    if (!$existingOrder) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        return;
    }
    
    $oldStatus = $existingOrder['status'];
    $oldIsPaid = isset($existingOrder['isPaid']) ? (bool)$existingOrder['isPaid'] : false;
    $statusChanged = false;
    $newStatus = null;
    $paymentStatusChanged = false;
    $newIsPaid = null;
    
    // Build update query
    $fields = [];
    $params = [];
    
    $allowedFields = ['status', 'isPaid', 'customerName', 'customerEmail', 'customerPhone', 
                      'customerAddress', 'customerCity', 'customerState', 'customerPostalCode', 
                      'customerNotes', 'totalAmount'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $value = $data[$field];
            
            // Convert boolean values to integers for MySQL
            if ($field === 'isPaid') {
                $value = ($value === true || $value === 'true' || $value === 1 || $value === '1') ? 1 : 0;
            }
            
            $fields[] = "$field = ?";
            $params[] = $value;
            
            // Track status change
            if ($field === 'status' && $value !== $oldStatus) {
                $statusChanged = true;
                $newStatus = $value;
            }
            
            // Track payment status change
            if ($field === 'isPaid') {
                $isPaidBool = ($value == 1);
                if ($isPaidBool !== $oldIsPaid) {
                    $paymentStatusChanged = true;
                    $newIsPaid = $isPaidBool;
                }
            }
        }
    }
    
    // Handle isPaid: set paidAt timestamp when isPaid is set to true
    $paidAtField = null;
    if (isset($data['isPaid'])) {
        // Convert boolean/string to proper boolean for comparison
        $isPaidValue = ($data['isPaid'] === true || $data['isPaid'] === 'true' || $data['isPaid'] === 1 || $data['isPaid'] === '1') ? 1 : 0;
        
        // Handle paidAt timestamp
        $currentIsPaid = isset($existingOrder['isPaid']) ? (bool)$existingOrder['isPaid'] : false;
        
        if ($isPaidValue == 1) {
            // Setting to paid - set paidAt if not already paid
            if (!$currentIsPaid) {
                $paidAtField = "paidAt = NOW()";
            }
        } else {
            // Setting to not paid - clear paidAt (use NULL directly in SQL, not as parameter)
            $paidAtField = "paidAt = NULL";
        }
    }
    
    if (empty($fields) && !$paidAtField) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        return;
    }
    
    // Build SQL with parameterized fields and direct SQL for NULL/NOW()
    $sqlFields = $fields;
    if ($paidAtField) {
        $sqlFields[] = $paidAtField;
    }
    
    $params[] = $orderId;
    $sql = "UPDATE orders SET " . implode(', ', $sqlFields) . " WHERE orderId = ?";
    
    // Log the SQL for debugging
    error_log("Updating order $orderId - Fields: " . implode(', ', $sqlFields));
    
    $result = dbExecute($sql, $params);
    
    if ($result !== false) {
        $order = dbQueryOne("SELECT * FROM orders WHERE orderId = ?", [$orderId]);
        $order['totalAmount'] = (float)$order['totalAmount'];
        
        // Helper function to format order data for emails
        $formatOrderDataForEmail = function($order) use ($orderId) {
            // Get order items for email
            $items = dbQuery(
                "SELECT * FROM order_items WHERE orderId = ? ORDER BY id",
                [$orderId]
            );
            
            // Format items for email template
            $emailItems = [];
            foreach ($items as $item) {
                $emailItems[] = [
                    'productName' => $item['productName'],
                    'productPrice' => (float)$item['productPrice'],
                    'quantity' => (int)$item['quantity'],
                    'firstImg' => $item['productImage'] ?? ''
                ];
            }
            
            // Format order data for email template
            return [
                'orderId' => $order['orderId'],
                'orderDate' => $order['createdAt'],
                'customer' => [
                    'fullName' => $order['customerName'],
                    'email' => $order['customerEmail'],
                    'phone' => $order['customerPhone'],
                    'address' => $order['customerAddress'],
                    'city' => $order['customerCity'],
                    'state' => $order['customerState'],
                    'postalCode' => $order['customerPostalCode'] ?? '',
                    'notes' => $order['customerNotes'] ?? ''
                ],
                'items' => $emailItems,
                'total' => (float)$order['totalAmount']
            ];
        };
        
        // Send status update email if status changed
        if ($statusChanged && $newStatus) {
            try {
                $orderData = $formatOrderDataForEmail($order);
                sendOrderStatusUpdateToCustomer($orderData, $newStatus, $oldStatus);
                error_log("Status update email sent successfully for order: $orderId");
            } catch (Exception $e) {
                // Log error but don't fail the update
                error_log("Failed to send status update email for order $orderId: " . $e->getMessage());
            }
        }
        
        // Send payment status update email if payment status changed
        if ($paymentStatusChanged && $newIsPaid !== null) {
            try {
                $orderData = $formatOrderDataForEmail($order);
                sendPaymentStatusUpdateToCustomer($orderData, $newIsPaid);
                error_log("Payment status update email sent successfully for order: $orderId (isPaid: " . ($newIsPaid ? 'true' : 'false') . ")");
            } catch (Exception $e) {
                // Log error but don't fail the update
                error_log("Failed to send payment status update email for order $orderId: " . $e->getMessage());
            }
        }
        
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

