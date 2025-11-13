<?php
/**
 * Testimonials CRUD API
 * Endpoints:
 * GET    /api/testimonials.php - List all testimonials
 * GET    /api/testimonials.php?id=1 - Get single testimonial
 * POST   /api/testimonials.php - Create testimonial (requires auth)
 * PUT    /api/testimonials.php?id=1 - Update testimonial (requires auth)
 * DELETE /api/testimonials.php?id=1 - Delete testimonial (requires auth)
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
    error_log('Testimonials API error: ' . $e->getMessage());
}

ob_end_flush();

function handleGet() {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $activeOnly = isset($_GET['activeOnly']) ? filter_var($_GET['activeOnly'], FILTER_VALIDATE_BOOLEAN) : false;
    
    if ($id) {
        // Get single testimonial
        $testimonial = dbQueryOne(
            "SELECT * FROM testimonials WHERE id = ?",
            [$id]
        );
        
        if (!$testimonial) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Testimonial not found']);
            return;
        }
        
        // Convert types
        $testimonial['rating'] = (int)$testimonial['rating'];
        $testimonial['displayOrder'] = (int)$testimonial['displayOrder'];
        $testimonial['isActive'] = (bool)$testimonial['isActive'];
        
        echo json_encode(['success' => true, 'data' => $testimonial]);
    } else {
        // Get all testimonials
        $sql = "SELECT * FROM testimonials WHERE 1=1";
        $params = [];
        
        if ($activeOnly) {
            $sql .= " AND isActive = 1";
        }
        
        $sql .= " ORDER BY displayOrder ASC, createdAt DESC";
        
        $testimonials = dbQuery($sql, $params);
        
        // Convert types for each testimonial
        foreach ($testimonials as &$testimonial) {
            $testimonial['rating'] = (int)$testimonial['rating'];
            $testimonial['displayOrder'] = (int)$testimonial['displayOrder'];
            $testimonial['isActive'] = (bool)$testimonial['isActive'];
        }
        
        echo json_encode(['success' => true, 'data' => $testimonials, 'count' => count($testimonials)]);
    }
}

function handlePost() {
    // Require authentication
    // Only admin and support can manage testimonials
    requireRole(['admin', 'support']);
    
    global $data;
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Validate required fields
    $required = ['name', 'comment', 'rating'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            return;
        }
    }
    
    // Validate rating
    $rating = (int)$data['rating'];
    if ($rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Rating must be between 1 and 5']);
        return;
    }
    
    // Prepare data
    $sql = "INSERT INTO testimonials (name, comment, rating, backgroundColor, displayOrder, isActive) 
            VALUES (?, ?, ?, ?, ?, ?)";
    
    $params = [
        $data['name'] ?? '',
        $data['comment'] ?? '',
        $rating,
        $data['backgroundColor'] ?? '#f5f7fa',
        isset($data['displayOrder']) ? (int)$data['displayOrder'] : 0,
        isset($data['isActive']) ? (int)$data['isActive'] : 1
    ];
    
    $id = dbExecute($sql, $params);
    
    if ($id) {
        $testimonial = dbQueryOne("SELECT * FROM testimonials WHERE id = ?", [$id]);
        $testimonial['rating'] = (int)$testimonial['rating'];
        $testimonial['displayOrder'] = (int)$testimonial['displayOrder'];
        $testimonial['isActive'] = (bool)$testimonial['isActive'];
        
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Testimonial created', 'data' => $testimonial]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create testimonial']);
    }
}

function handlePut() {
    // Require authentication
    // Only admin and support can manage testimonials
    requireRole(['admin', 'support']);
    
    global $data;
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Testimonial ID required']);
        return;
    }
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Check if testimonial exists
    $existing = dbQueryOne("SELECT id FROM testimonials WHERE id = ?", [$id]);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Testimonial not found']);
        return;
    }
    
    // Validate rating if provided
    if (isset($data['rating'])) {
        $rating = (int)$data['rating'];
        if ($rating < 1 || $rating > 5) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Rating must be between 1 and 5']);
            return;
        }
    }
    
    // Build update query dynamically
    $fields = [];
    $params = [];
    
    $allowedFields = ['name', 'comment', 'rating', 'backgroundColor', 'displayOrder', 'isActive'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            if (in_array($field, ['rating', 'displayOrder'])) {
                $fields[] = "$field = ?";
                $params[] = (int)$data[$field];
            } elseif ($field === 'isActive') {
                $fields[] = "$field = ?";
                $params[] = (bool)$data[$field] ? 1 : 0;
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
    $sql = "UPDATE testimonials SET " . implode(', ', $fields) . " WHERE id = ?";
    
    $result = dbExecute($sql, $params);
    
    if ($result !== false) {
        $testimonial = dbQueryOne("SELECT * FROM testimonials WHERE id = ?", [$id]);
        $testimonial['rating'] = (int)$testimonial['rating'];
        $testimonial['displayOrder'] = (int)$testimonial['displayOrder'];
        $testimonial['isActive'] = (bool)$testimonial['isActive'];
        
        echo json_encode(['success' => true, 'message' => 'Testimonial updated', 'data' => $testimonial]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update testimonial']);
    }
}

function handleDelete() {
    // Require authentication
    requireRole(['admin']);
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Testimonial ID required']);
        return;
    }
    
    // Check if testimonial exists
    $testimonial = dbQueryOne("SELECT id FROM testimonials WHERE id = ?", [$id]);
    if (!$testimonial) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Testimonial not found']);
        return;
    }
    
    // Soft delete (set isActive = 0) or hard delete
    $hardDelete = isset($_GET['hard']) && $_GET['hard'] === 'true';
    
    if ($hardDelete) {
        $result = dbExecute("DELETE FROM testimonials WHERE id = ?", [$id]);
    } else {
        $result = dbExecute("UPDATE testimonials SET isActive = 0 WHERE id = ?", [$id]);
    }
    
    if ($result !== false) {
        echo json_encode(['success' => true, 'message' => 'Testimonial deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete testimonial']);
    }
}

