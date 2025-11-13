<?php
/**
 * Product Reviews API
 * Endpoints:
 * GET    /api/reviews.php?productId=1 - Get reviews for a product
 * GET    /api/reviews.php?orderId=ORD-xxx - Get reviews for an order
 * POST   /api/reviews.php - Submit a new review (requires order ID validation)
 * PUT    /api/reviews.php?id=1 - Update review (requires auth)
 * DELETE /api/reviews.php?id=1 - Delete review (requires auth)
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
    error_log('Reviews API error: ' . $e->getMessage());
}

ob_end_flush();

function handleGet() {
    $productId = isset($_GET['productId']) ? (int)$_GET['productId'] : null;
    $orderId = isset($_GET['orderId']) ? $_GET['orderId'] : null;
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $approvedOnly = isset($_GET['approvedOnly']) ? filter_var($_GET['approvedOnly'], FILTER_VALIDATE_BOOLEAN) : true;
    
    if ($id) {
        // Get single review
        $review = dbQueryOne(
            "SELECT * FROM product_reviews WHERE id = ?",
            [$id]
        );
        
        if (!$review) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Review not found']);
            return;
        }
        
        // Convert types
        $review['productId'] = (int)$review['productId'];
        $review['rating'] = (int)$review['rating'];
        $review['isApproved'] = (bool)$review['isApproved'];
        
        echo json_encode(['success' => true, 'data' => $review]);
    } elseif ($productId) {
        // Get reviews for a product
        $sql = "SELECT * FROM product_reviews WHERE productId = ?";
        $params = [$productId];
        
        if ($approvedOnly) {
            $sql .= " AND isApproved = 1";
        }
        
        $sql .= " ORDER BY createdAt DESC";
        
        $reviews = dbQuery($sql, $params);
        
        // Convert types and calculate average rating
        $totalRating = 0;
        $ratingCount = 0;
        foreach ($reviews as &$review) {
            $review['productId'] = (int)$review['productId'];
            $review['rating'] = (int)$review['rating'];
            $review['isApproved'] = (bool)$review['isApproved'];
            $totalRating += $review['rating'];
            $ratingCount++;
        }
        
        $averageRating = $ratingCount > 0 ? round($totalRating / $ratingCount, 1) : 0;
        
        echo json_encode([
            'success' => true,
            'data' => $reviews,
            'count' => count($reviews),
            'averageRating' => $averageRating
        ]);
    } elseif ($orderId) {
        // Get reviews for an order
        $reviews = dbQuery(
            "SELECT * FROM product_reviews WHERE orderId = ? ORDER BY createdAt DESC",
            [$orderId]
        );
        
        // Convert types
        foreach ($reviews as &$review) {
            $review['productId'] = (int)$review['productId'];
            $review['rating'] = (int)$review['rating'];
            $review['isApproved'] = (bool)$review['isApproved'];
        }
        
        echo json_encode(['success' => true, 'data' => $reviews, 'count' => count($reviews)]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'productId, orderId, or id parameter required']);
    }
}

function handlePost() {
    global $data;
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Validate required fields
    $required = ['productId', 'orderId', 'rating'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            return;
        }
    }
    
    $productId = (int)$data['productId'];
    $orderId = trim($data['orderId']);
    $rating = (int)$data['rating'];
    $reviewText = isset($data['reviewText']) ? trim($data['reviewText']) : null;
    
    // Validate rating range
    if ($rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Rating must be between 1 and 5']);
        return;
    }
    
    // Validate that product exists
    $product = dbQueryOne("SELECT id FROM products WHERE id = ?", [$productId]);
    if (!$product) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Product not found']);
        return;
    }
    
    // Validate that order exists and get customer info from order
    $order = dbQueryOne("SELECT * FROM orders WHERE orderId = ?", [$orderId]);
    if (!$order) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        return;
    }
    
    // Get customer name and email from the order
    $customerName = trim($order['customerName']);
    $customerEmail = trim($order['customerEmail']);
    
    // Verify that the order contains the product
    $orderItem = dbQueryOne(
        "SELECT * FROM order_items WHERE orderId = ? AND productId = ?",
        [$orderId, $productId]
    );
    
    if (!$orderItem) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'The order does not contain this product. Only customers who purchased this product can review it.'
        ]);
        return;
    }
    
    // Check if review already exists for this order and product
    $existingReview = dbQueryOne(
        "SELECT id FROM product_reviews WHERE orderId = ? AND productId = ?",
        [$orderId, $productId]
    );
    
    if ($existingReview) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'You have already submitted a review for this product from this order'
        ]);
        return;
    }
    
    // Insert review
    $sql = "INSERT INTO product_reviews (productId, orderId, customerName, customerEmail, rating, reviewText, isApproved) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $isApproved = isset($data['isApproved']) ? (bool)$data['isApproved'] : true;
    
    $result = dbExecute($sql, [
        $productId,
        $orderId,
        $customerName,
        $customerEmail,
        $rating,
        $reviewText,
        $isApproved ? 1 : 0
    ]);
    
    if ($result !== false) {
        // Get the created review
        $review = dbQueryOne("SELECT * FROM product_reviews WHERE id = ?", [$result]);
        $review['productId'] = (int)$review['productId'];
        $review['rating'] = (int)$review['rating'];
        $review['isApproved'] = (bool)$review['isApproved'];
        
        // Update product average rating
        updateProductRating($productId);
        
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Review submitted successfully', 'data' => $review]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to submit review']);
    }
}

function handlePut() {
    // Require authentication
    requireRole(['admin', 'manager']);
    
    global $data;
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Review ID required']);
        return;
    }
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Check if review exists
    $existing = dbQueryOne("SELECT * FROM product_reviews WHERE id = ?", [$id]);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Review not found']);
        return;
    }
    
    // Build update query
    $fields = [];
    $params = [];
    
    $allowedFields = ['rating', 'reviewText', 'isApproved', 'customerName'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            if ($field === 'rating') {
                $rating = (int)$data[$field];
                if ($rating < 1 || $rating > 5) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Rating must be between 1 and 5']);
                    return;
                }
                $fields[] = "$field = ?";
                $params[] = $rating;
            } elseif ($field === 'isApproved') {
                $fields[] = "$field = ?";
                $params[] = ($data[$field] === true || $data[$field] === 'true' || $data[$field] === 1) ? 1 : 0;
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
    $sql = "UPDATE product_reviews SET " . implode(', ', $fields) . " WHERE id = ?";
    
    $result = dbExecute($sql, $params);
    
    if ($result !== false) {
        $review = dbQueryOne("SELECT * FROM product_reviews WHERE id = ?", [$id]);
        $review['productId'] = (int)$review['productId'];
        $review['rating'] = (int)$review['rating'];
        $review['isApproved'] = (bool)$review['isApproved'];
        
        // Update product average rating if rating changed
        if (isset($data['rating']) || isset($data['isApproved'])) {
            updateProductRating($existing['productId']);
        }
        
        echo json_encode(['success' => true, 'message' => 'Review updated', 'data' => $review]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update review']);
    }
}

function handleDelete() {
    // Require authentication
    requireRole(['admin']);
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Review ID required']);
        return;
    }
    
    // Get review before deletion to update product rating
    $review = dbQueryOne("SELECT productId FROM product_reviews WHERE id = ?", [$id]);
    if (!$review) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Review not found']);
        return;
    }
    
    $productId = $review['productId'];
    
    // Delete review
    $result = dbExecute("DELETE FROM product_reviews WHERE id = ?", [$id]);
    
    if ($result !== false) {
        // Update product average rating
        updateProductRating($productId);
        
        echo json_encode(['success' => true, 'message' => 'Review deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete review']);
    }
}

/**
 * Update product average rating based on approved reviews
 */
function updateProductRating($productId) {
    // Get average rating from approved reviews
    $result = dbQueryOne(
        "SELECT AVG(rating) as avgRating, COUNT(*) as count 
         FROM product_reviews 
         WHERE productId = ? AND isApproved = 1",
        [$productId]
    );
    
    $avgRating = $result['avgRating'] ? round((float)$result['avgRating'], 1) : 0.0;
    
    // Update product rating
    dbExecute(
        "UPDATE products SET rating = ? WHERE id = ?",
        [$avgRating, $productId]
    );
}

