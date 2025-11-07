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
            firstImg, hoverImg, additionalImgs, category, flavours, bestSeller, isActive) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
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
        isset($data['isActive']) ? (int)$data['isActive'] : 1
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
                      'bestSeller', 'isActive'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            if (in_array($field, ['additionalImgs', 'category', 'flavours'])) {
                $fields[] = "$field = ?";
                $params[] = json_encode($data[$field]);
            } elseif (in_array($field, ['bestSeller', 'isActive'])) {
                $fields[] = "$field = ?";
                $params[] = (int)$data[$field];
            } else {
                $fields[] = "$field = ?";
                $params[] = $data[$field];
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

