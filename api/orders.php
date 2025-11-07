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
require_once __DIR__ . '/pricing-helper.php';
require_once __DIR__ . '/stock-helper.php';

// Helper function to get current user ID from token (without requiring auth)
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
            
            // Determine pricing tier if productId exists
            if (!empty($item['productId'])) {
                $product = dbQueryOne(
                    "SELECT * FROM products WHERE id = ?",
                    [$item['productId']]
                );
                
                if ($product) {
                    // Decode JSON fields
                    $product['additionalImgs'] = json_decode($product['additionalImgs'] ?? '[]', true);
                    $product['category'] = json_decode($product['category'] ?? '[]', true);
                    $product['flavours'] = json_decode($product['flavours'] ?? '[]', true);
                    $product['retailPrice'] = isset($product['retailPrice']) ? (float)$product['retailPrice'] : null;
                    $product['retailMinQty'] = isset($product['retailMinQty']) ? (int)$product['retailMinQty'] : 1;
                    $product['wholesalePrice'] = isset($product['wholesalePrice']) ? (float)$product['wholesalePrice'] : null;
                    $product['wholesaleMinQty'] = isset($product['wholesaleMinQty']) ? (int)$product['wholesaleMinQty'] : null;
                    $product['distributorPrice'] = isset($product['distributorPrice']) ? (float)$product['distributorPrice'] : null;
                    $product['distributorMinQty'] = isset($product['distributorMinQty']) ? (int)$product['distributorMinQty'] : null;
                    
                    // Determine pricing tier
                    $tierInfo = determinePricingTier($product, $item['quantity'], $item['productPrice']);
                    $item['pricingTier'] = $tierInfo['tier'];
                    $item['pricingTierDisplay'] = $tierInfo['tierDisplay'];
                    $item['pricingTierMinQty'] = $tierInfo['minQty'];
                    // Update productPrice to match the tier-corrected price for display
                    $item['productPrice'] = $tierInfo['pricePerUnit'];
                }
            }
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
    $orderCancelled = false;
    
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
                // Check if order is being cancelled
                if ($value === 'cancelled' && $oldStatus !== 'cancelled') {
                    $orderCancelled = true;
                }
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
        
        // Restore stock if order is being cancelled
        if ($orderCancelled) {
            try {
                // Get all order items
                $orderItems = dbQuery(
                    "SELECT productId, quantity FROM order_items WHERE orderId = ?",
                    [$orderId]
                );
                
                foreach ($orderItems as $item) {
                    if (!empty($item['productId'])) {
                        $quantity = (int)$item['quantity'];
                        $stockResult = updateProductStock(
                            $item['productId'],
                            $quantity, // Positive to restore stock
                            'return',
                            'order',
                            $orderId,
                            "Stock restored from cancelled order $orderId",
                            getCurrentUserId()
                        );
                        
                        if ($stockResult['success']) {
                            error_log("Stock restored for product {$item['productId']}: {$quantity} units (Order: $orderId)");
                        } else {
                            error_log("Warning: Failed to restore stock for product {$item['productId']}: {$stockResult['message']}");
                        }
                    }
                }
            } catch (Exception $e) {
                // Log error but don't fail the order update
                error_log("Error restoring stock for cancelled order $orderId: " . $e->getMessage());
            }
        }
        
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
                $emailItem = [
                    'productName' => $item['productName'],
                    'productPrice' => (float)$item['productPrice'],
                    'quantity' => (int)$item['quantity'],
                    'firstImg' => $item['productImage'] ?? ''
                ];
                
                // Add pricing tier information if available
                if (!empty($item['productId'])) {
                    $product = dbQueryOne(
                        "SELECT * FROM products WHERE id = ?",
                        [$item['productId']]
                    );
                    
                    if ($product) {
                        // Decode JSON fields
                        $product['retailPrice'] = isset($product['retailPrice']) ? (float)$product['retailPrice'] : null;
                        $product['retailMinQty'] = isset($product['retailMinQty']) ? (int)$product['retailMinQty'] : 1;
                        $product['wholesalePrice'] = isset($product['wholesalePrice']) ? (float)$product['wholesalePrice'] : null;
                        $product['wholesaleMinQty'] = isset($product['wholesaleMinQty']) ? (int)$product['wholesaleMinQty'] : null;
                        $product['distributorPrice'] = isset($product['distributorPrice']) ? (float)$product['distributorPrice'] : null;
                        $product['distributorMinQty'] = isset($product['distributorMinQty']) ? (int)$product['distributorMinQty'] : null;
                        
                        $tierInfo = determinePricingTier($product, $emailItem['quantity'], $emailItem['productPrice']);
                        $emailItem['pricingTier'] = $tierInfo['tier'];
                        $emailItem['pricingTierDisplay'] = $tierInfo['tierDisplay'];
                        $emailItem['pricingTierMinQty'] = $tierInfo['minQty'];
                        // Update productPrice to match the tier-corrected price for display
                        $emailItem['productPrice'] = $tierInfo['pricePerUnit'];
                    }
                }
                
                $emailItems[] = $emailItem;
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
    $order = dbQueryOne("SELECT orderId, status FROM orders WHERE orderId = ?", [$orderId]);
    if (!$order) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        return;
    }
    
    // Restore stock before deleting order (if order wasn't already cancelled)
    if ($order['status'] !== 'cancelled') {
        try {
            // Get all order items
            $orderItems = dbQuery(
                "SELECT productId, quantity FROM order_items WHERE orderId = ?",
                [$orderId]
            );
            
            foreach ($orderItems as $item) {
                if (!empty($item['productId'])) {
                    $quantity = (int)$item['quantity'];
                    $stockResult = updateProductStock(
                        $item['productId'],
                        $quantity, // Positive to restore stock
                        'return',
                        'order',
                        $orderId,
                        "Stock restored from deleted order $orderId",
                        getCurrentUserId()
                    );
                    
                    if ($stockResult['success']) {
                        error_log("Stock restored for product {$item['productId']}: {$quantity} units (Deleted Order: $orderId)");
                    } else {
                        error_log("Warning: Failed to restore stock for product {$item['productId']}: {$stockResult['message']}");
                    }
                }
            }
        } catch (Exception $e) {
            // Log error but continue with deletion
            error_log("Error restoring stock for deleted order $orderId: " . $e->getMessage());
        }
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

