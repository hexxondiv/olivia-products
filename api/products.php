<?php
/**
 * Products CRUD API
 * Endpoints:
 * GET    /api/products.php - List all products
 * GET    /api/products.php?id=1 - Get single product
 * POST   /api/products.php - Create product (requires auth)
 * PUT    /api/products.php?id=1 - Update product (requires auth)
 * DELETE /api/products.php?id=1 - Delete product (requires auth)
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
require_once __DIR__ . '/stock-helper.php';

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
    error_log('Products API error: ' . $e->getMessage());
}

ob_end_flush();

function handleGet() {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    $activeOnly = isset($_GET['activeOnly']) ? filter_var($_GET['activeOnly'], FILTER_VALIDATE_BOOLEAN) : false;
    $stockStatus = isset($_GET['stockStatus']) ? $_GET['stockStatus'] : null;
    $includeStockHistory = isset($_GET['includeStockHistory']) ? filter_var($_GET['includeStockHistory'], FILTER_VALIDATE_BOOLEAN) : false;
    
    if ($id) {
        // Get single product
        $product = dbQueryOne(
            "SELECT * FROM products WHERE id = ?",
            [$id]
        );
        
        if (!$product) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Product not found']);
            return;
        }
        
        // Decode JSON fields
        $product['additionalImgs'] = json_decode($product['additionalImgs'] ?? '[]', true);
        $product['category'] = json_decode($product['category'] ?? '[]', true);
        $product['flavours'] = json_decode($product['flavours'] ?? '[]', true);
        $product['bestSeller'] = (bool)$product['bestSeller'];
        $product['isActive'] = (bool)$product['isActive'];
        $product['price'] = (float)$product['price'];
        $product['rating'] = (float)$product['rating'];
        // Handle tiered pricing fields
        $product['retailPrice'] = isset($product['retailPrice']) ? (float)$product['retailPrice'] : null;
        $product['retailMinQty'] = isset($product['retailMinQty']) ? (int)$product['retailMinQty'] : 1;
        $product['wholesalePrice'] = isset($product['wholesalePrice']) ? (float)$product['wholesalePrice'] : null;
        $product['wholesaleMinQty'] = isset($product['wholesaleMinQty']) ? (int)$product['wholesaleMinQty'] : null;
        $product['distributorPrice'] = isset($product['distributorPrice']) ? (float)$product['distributorPrice'] : null;
        $product['distributorMinQty'] = isset($product['distributorMinQty']) ? (int)$product['distributorMinQty'] : null;
        // Handle stock fields
        $product['stockQuantity'] = isset($product['stockQuantity']) ? (int)$product['stockQuantity'] : 0;
        $product['stockEnabled'] = isset($product['stockEnabled']) ? (bool)$product['stockEnabled'] : false;
        $product['lowStockThreshold'] = isset($product['lowStockThreshold']) ? (int)$product['lowStockThreshold'] : 10;
        $product['allowBackorders'] = isset($product['allowBackorders']) ? (bool)$product['allowBackorders'] : false;
        $product['stockStatus'] = isset($product['stockStatus']) ? $product['stockStatus'] : calculateStockStatus($product);
        
        // Include stock history if requested
        if ($includeStockHistory) {
            $product['stockHistory'] = getStockHistory($id, 50);
        }
        
        echo json_encode(['success' => true, 'data' => $product]);
    } else {
        // Get all products
        $sql = "SELECT * FROM products WHERE 1=1";
        $params = [];
        
        if ($activeOnly) {
            $sql .= " AND isActive = 1";
        }
        
        if ($category) {
            $sql .= " AND JSON_CONTAINS(category, ?)";
            $params[] = json_encode($category);
        }
        
        if ($stockStatus) {
            $sql .= " AND stockStatus = ?";
            $params[] = $stockStatus;
        }
        
        $sql .= " ORDER BY createdAt DESC";
        
        $products = dbQuery($sql, $params);
        
        // Decode JSON fields for each product
        foreach ($products as &$product) {
            $product['additionalImgs'] = json_decode($product['additionalImgs'] ?? '[]', true);
            $product['category'] = json_decode($product['category'] ?? '[]', true);
            $product['flavours'] = json_decode($product['flavours'] ?? '[]', true);
            $product['bestSeller'] = (bool)$product['bestSeller'];
            $product['isActive'] = (bool)$product['isActive'];
            $product['price'] = (float)$product['price'];
            $product['rating'] = (float)$product['rating'];
            // Handle tiered pricing fields
            $product['retailPrice'] = isset($product['retailPrice']) ? (float)$product['retailPrice'] : null;
            $product['retailMinQty'] = isset($product['retailMinQty']) ? (int)$product['retailMinQty'] : 1;
            $product['wholesalePrice'] = isset($product['wholesalePrice']) ? (float)$product['wholesalePrice'] : null;
            $product['wholesaleMinQty'] = isset($product['wholesaleMinQty']) ? (int)$product['wholesaleMinQty'] : null;
            $product['distributorPrice'] = isset($product['distributorPrice']) ? (float)$product['distributorPrice'] : null;
            $product['distributorMinQty'] = isset($product['distributorMinQty']) ? (int)$product['distributorMinQty'] : null;
            // Handle stock fields
            $product['stockQuantity'] = isset($product['stockQuantity']) ? (int)$product['stockQuantity'] : 0;
            $product['stockEnabled'] = isset($product['stockEnabled']) ? (bool)$product['stockEnabled'] : false;
            $product['lowStockThreshold'] = isset($product['lowStockThreshold']) ? (int)$product['lowStockThreshold'] : 10;
            $product['allowBackorders'] = isset($product['allowBackorders']) ? (bool)$product['allowBackorders'] : false;
            $product['stockStatus'] = isset($product['stockStatus']) ? $product['stockStatus'] : calculateStockStatus($product);
        }
        
        echo json_encode(['success' => true, 'data' => $products, 'count' => count($products)]);
    }
}

function handlePost() {
    // Require authentication
    requireRole(['admin', 'manager']);
    
    global $data;
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Validate required fields
    $required = ['heading', 'name', 'price'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            return;
        }
    }
    
    // Prepare data
    $sql = "INSERT INTO products (heading, name, sufix, price, rating, color, detail, moreDetail, tagline, 
            firstImg, hoverImg, additionalImgs, category, flavours, bestSeller, isActive,
            retailPrice, retailMinQty, wholesalePrice, wholesaleMinQty, distributorPrice, distributorMinQty,
            stockQuantity, stockEnabled, lowStockThreshold, allowBackorders, stockStatus) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    // Calculate stock status if stock is enabled
    $stockEnabled = isset($data['stockEnabled']) ? (bool)$data['stockEnabled'] : false;
    $stockQuantity = isset($data['stockQuantity']) ? (int)$data['stockQuantity'] : 0;
    $lowStockThreshold = isset($data['lowStockThreshold']) ? (int)$data['lowStockThreshold'] : 10;
    $allowBackorders = isset($data['allowBackorders']) ? (bool)$data['allowBackorders'] : false;
    
    $tempProduct = [
        'stockEnabled' => $stockEnabled,
        'stockQuantity' => $stockQuantity,
        'lowStockThreshold' => $lowStockThreshold,
        'allowBackorders' => $allowBackorders
    ];
    $stockStatus = calculateStockStatus($tempProduct) ?? 'in_stock';
    
    $params = [
        $data['heading'] ?? '',
        $data['name'] ?? '',
        $data['sufix'] ?? null,
        $data['price'] ?? 0,
        $data['rating'] ?? 0.0,
        $data['color'] ?? null,
        $data['detail'] ?? null,
        $data['moreDetail'] ?? null,
        $data['tagline'] ?? null,
        $data['firstImg'] ?? null,
        $data['hoverImg'] ?? null,
        json_encode($data['additionalImgs'] ?? []),
        json_encode($data['category'] ?? []),
        json_encode($data['flavours'] ?? []),
        isset($data['bestSeller']) ? (int)$data['bestSeller'] : 0,
        isset($data['isActive']) ? (int)$data['isActive'] : 1,
        isset($data['retailPrice']) ? (float)$data['retailPrice'] : null,
        isset($data['retailMinQty']) ? (int)$data['retailMinQty'] : 1,
        isset($data['wholesalePrice']) ? (float)$data['wholesalePrice'] : null,
        isset($data['wholesaleMinQty']) ? (int)$data['wholesaleMinQty'] : null,
        isset($data['distributorPrice']) ? (float)$data['distributorPrice'] : null,
        isset($data['distributorMinQty']) ? (int)$data['distributorMinQty'] : null,
        $stockQuantity,
        $stockEnabled ? 1 : 0,
        $lowStockThreshold,
        $allowBackorders ? 1 : 0,
        $stockStatus
    ];
    
    $id = dbExecute($sql, $params);
    
    if ($id) {
        $product = dbQueryOne("SELECT * FROM products WHERE id = ?", [$id]);
        $product['additionalImgs'] = json_decode($product['additionalImgs'] ?? '[]', true);
        $product['category'] = json_decode($product['category'] ?? '[]', true);
        $product['flavours'] = json_decode($product['flavours'] ?? '[]', true);
        
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Product created', 'data' => $product]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create product']);
    }
}

function handlePut() {
    // Require authentication
    requireRole(['admin', 'manager']);
    
    global $data;
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Product ID required']);
        return;
    }
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Check if product exists
    $existing = dbQueryOne("SELECT id FROM products WHERE id = ?", [$id]);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Product not found']);
        return;
    }
    
    // Build update query dynamically
    $fields = [];
    $params = [];
    
    $allowedFields = ['heading', 'name', 'sufix', 'price', 'rating', 'color', 'detail', 'moreDetail', 
                      'tagline', 'firstImg', 'hoverImg', 'additionalImgs', 'category', 'flavours', 
                      'bestSeller', 'isActive', 'retailPrice', 'retailMinQty', 'wholesalePrice', 
                      'wholesaleMinQty', 'distributorPrice', 'distributorMinQty', 'stockQuantity', 
                      'stockEnabled', 'lowStockThreshold', 'allowBackorders'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            if (in_array($field, ['additionalImgs', 'category', 'flavours'])) {
                $fields[] = "$field = ?";
                $params[] = json_encode($data[$field]);
            } elseif (in_array($field, ['bestSeller', 'isActive', 'retailMinQty', 'wholesaleMinQty', 'distributorMinQty', 'stockQuantity', 'lowStockThreshold'])) {
                $fields[] = "$field = ?";
                $params[] = (int)$data[$field];
            } elseif (in_array($field, ['stockEnabled', 'allowBackorders'])) {
                $fields[] = "$field = ?";
                $params[] = (bool)$data[$field] ? 1 : 0;
            } elseif (in_array($field, ['price', 'rating', 'retailPrice', 'wholesalePrice', 'distributorPrice'])) {
                $fields[] = "$field = ?";
                $params[] = (float)$data[$field];
            } else {
                $fields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
    }
    
    // Auto-calculate stockStatus if stock-related fields are updated
    $stockFieldsUpdated = isset($data['stockQuantity']) || isset($data['stockEnabled']) || 
                         isset($data['lowStockThreshold']) || isset($data['allowBackorders']);
    
    if ($stockFieldsUpdated) {
        // Get current product to calculate status
        $currentProduct = dbQueryOne("SELECT stockQuantity, stockEnabled, lowStockThreshold, allowBackorders FROM products WHERE id = ?", [$id]);
        if ($currentProduct) {
            // Merge with updates
            if (isset($data['stockQuantity'])) $currentProduct['stockQuantity'] = (int)$data['stockQuantity'];
            if (isset($data['stockEnabled'])) $currentProduct['stockEnabled'] = (bool)$data['stockEnabled'];
            if (isset($data['lowStockThreshold'])) $currentProduct['lowStockThreshold'] = (int)$data['lowStockThreshold'];
            if (isset($data['allowBackorders'])) $currentProduct['allowBackorders'] = (bool)$data['allowBackorders'];
            
            $stockStatus = calculateStockStatus($currentProduct);
            if ($stockStatus) {
                $fields[] = "stockStatus = ?";
                $params[] = $stockStatus;
            }
        }
    }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        return;
    }
    
    $params[] = $id;
    $sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?";
    
    $result = dbExecute($sql, $params);
    
    if ($result !== false) {
        $product = dbQueryOne("SELECT * FROM products WHERE id = ?", [$id]);
        $product['additionalImgs'] = json_decode($product['additionalImgs'] ?? '[]', true);
        $product['category'] = json_decode($product['category'] ?? '[]', true);
        $product['flavours'] = json_decode($product['flavours'] ?? '[]', true);
        
        echo json_encode(['success' => true, 'message' => 'Product updated', 'data' => $product]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update product']);
    }
}

function handleDelete() {
    // Require authentication
    requireRole(['admin']);
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Product ID required']);
        return;
    }
    
    // Check if product exists
    $product = dbQueryOne("SELECT id FROM products WHERE id = ?", [$id]);
    if (!$product) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Product not found']);
        return;
    }
    
    // Soft delete (set isActive = 0) or hard delete
    $hardDelete = isset($_GET['hard']) && $_GET['hard'] === 'true';
    
    if ($hardDelete) {
        $result = dbExecute("DELETE FROM products WHERE id = ?", [$id]);
    } else {
        $result = dbExecute("UPDATE products SET isActive = 0 WHERE id = ?", [$id]);
    }
    
    if ($result !== false) {
        echo json_encode(['success' => true, 'message' => 'Product deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete product']);
    }
}

