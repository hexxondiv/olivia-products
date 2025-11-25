<?php
/**
 * Home Slides CRUD API
 * Endpoints:
 * GET    /api/home-slides.php - List all home slides
 * GET    /api/home-slides.php?id=1 - Get single home slide
 * POST   /api/home-slides.php - Create home slide (requires auth)
 * PUT    /api/home-slides.php?id=1 - Update home slide (requires auth)
 * DELETE /api/home-slides.php?id=1 - Delete home slide (requires auth)
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
    error_log('Home Slides API error: ' . $e->getMessage());
}

ob_end_flush();

function handleGet() {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $activeOnly = isset($_GET['activeOnly']) ? filter_var($_GET['activeOnly'], FILTER_VALIDATE_BOOLEAN) : false;
    
    if ($id) {
        // Get single home slide
        $slide = dbQueryOne(
            "SELECT * FROM home_slides WHERE id = ?",
            [$id]
        );
        
        if (!$slide) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Home slide not found']);
            return;
        }
        
        // Convert types
        $slide['displayOrder'] = (int)$slide['displayOrder'];
        $slide['isActive'] = (bool)$slide['isActive'];
        
        echo json_encode(['success' => true, 'data' => $slide]);
    } else {
        // Get all home slides
        $sql = "SELECT * FROM home_slides WHERE 1=1";
        $params = [];
        
        if ($activeOnly) {
            $sql .= " AND isActive = 1";
        }
        
        $sql .= " ORDER BY displayOrder ASC, createdAt DESC";
        
        $slides = dbQuery($sql, $params);
        
        // Convert types for each slide
        foreach ($slides as &$slide) {
            $slide['displayOrder'] = (int)$slide['displayOrder'];
            $slide['isActive'] = (bool)$slide['isActive'];
        }
        
        echo json_encode(['success' => true, 'data' => $slides, 'count' => count($slides)]);
    }
}

function handlePost() {
    // Require authentication - only admin and sales can create slides
    requireRole(['admin', 'sales']);
    
    global $data;
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Validate required fields
    $required = ['mainPicture', 'text', 'targetImg'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            return;
        }
    }
    
    // Validate linkType
    $linkType = $data['linkType'] ?? 'none';
    if (!in_array($linkType, ['category', 'product', 'none'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid linkType. Must be: category, product, or none']);
        return;
    }
    
    // Validate linkValue if linkType is not 'none'
    if ($linkType !== 'none' && empty($data['linkValue'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'linkValue is required when linkType is not "none"']);
        return;
    }
    
    // Prepare data
    $sql = "INSERT INTO home_slides (mainPicture, text, targetImg, linkType, linkValue, displayOrder, isActive) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $params = [
        $data['mainPicture'] ?? '',
        $data['text'] ?? '',
        $data['targetImg'] ?? '',
        $linkType,
        $data['linkValue'] ?? null,
        isset($data['displayOrder']) ? (int)$data['displayOrder'] : 0,
        isset($data['isActive']) ? (int)$data['isActive'] : 1
    ];
    
    $id = dbExecute($sql, $params);
    
    if ($id) {
        $slide = dbQueryOne("SELECT * FROM home_slides WHERE id = ?", [$id]);
        $slide['displayOrder'] = (int)$slide['displayOrder'];
        $slide['isActive'] = (bool)$slide['isActive'];
        
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Home slide created', 'data' => $slide]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create home slide']);
    }
}

function handlePut() {
    // Require authentication - only admin and sales can update slides
    requireRole(['admin', 'sales']);
    
    global $data;
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Home slide ID required']);
        return;
    }
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Check if slide exists
    $existing = dbQueryOne("SELECT id FROM home_slides WHERE id = ?", [$id]);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Home slide not found']);
        return;
    }
    
    // Validate linkType if provided
    if (isset($data['linkType'])) {
        if (!in_array($data['linkType'], ['category', 'product', 'none'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid linkType. Must be: category, product, or none']);
            return;
        }
        
        // Validate linkValue if linkType is not 'none'
        if ($data['linkType'] !== 'none' && empty($data['linkValue'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'linkValue is required when linkType is not "none"']);
            return;
        }
    }
    
    // Build update query dynamically
    $fields = [];
    $params = [];
    
    $allowedFields = ['mainPicture', 'text', 'targetImg', 'linkType', 'linkValue', 'displayOrder', 'isActive'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            if (in_array($field, ['displayOrder'])) {
                $fields[] = "$field = ?";
                $params[] = (int)$data[$field];
            } elseif ($field === 'isActive') {
                $fields[] = "$field = ?";
                $params[] = (bool)$data[$field] ? 1 : 0;
            } elseif ($field === 'linkValue' && ($data['linkType'] ?? 'none') === 'none') {
                // Set linkValue to null if linkType is none
                $fields[] = "$field = ?";
                $params[] = null;
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
    $sql = "UPDATE home_slides SET " . implode(', ', $fields) . " WHERE id = ?";
    
    $result = dbExecute($sql, $params);
    
    if ($result !== false) {
        $slide = dbQueryOne("SELECT * FROM home_slides WHERE id = ?", [$id]);
        $slide['displayOrder'] = (int)$slide['displayOrder'];
        $slide['isActive'] = (bool)$slide['isActive'];
        
        echo json_encode(['success' => true, 'message' => 'Home slide updated', 'data' => $slide]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update home slide']);
    }
}

function handleDelete() {
    // Require authentication
    requireRole(['admin']);
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Home slide ID required']);
        return;
    }
    
    // Check if slide exists
    $slide = dbQueryOne("SELECT id FROM home_slides WHERE id = ?", [$id]);
    if (!$slide) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Home slide not found']);
        return;
    }
    
    // Soft delete (set isActive = 0) or hard delete
    $hardDelete = isset($_GET['hard']) && $_GET['hard'] === 'true';
    
    if ($hardDelete) {
        $result = dbExecute("DELETE FROM home_slides WHERE id = ?", [$id]);
    } else {
        $result = dbExecute("UPDATE home_slides SET isActive = 0 WHERE id = ?", [$id]);
    }
    
    if ($result !== false) {
        echo json_encode(['success' => true, 'message' => 'Home slide deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete home slide']);
    }
}

