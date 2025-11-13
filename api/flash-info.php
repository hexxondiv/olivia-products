<?php
/**
 * Flash Info CRUD API
 * Endpoints:
 * GET    /api/flash-info.php - List all flash info items
 * GET    /api/flash-info.php?id=1 - Get single flash info item
 * POST   /api/flash-info.php - Create flash info item (requires auth)
 * PUT    /api/flash-info.php?id=1 - Update flash info item (requires auth)
 * DELETE /api/flash-info.php?id=1 - Delete flash info item (requires auth)
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
    error_log('Flash Info API error: ' . $e->getMessage());
}

ob_end_flush();

function handleGet() {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $activeOnly = isset($_GET['activeOnly']) ? filter_var($_GET['activeOnly'], FILTER_VALIDATE_BOOLEAN) : false;
    
    if ($id) {
        // Get single flash info item
        $flashInfo = dbQueryOne(
            "SELECT * FROM flash_info WHERE id = ?",
            [$id]
        );
        
        if (!$flashInfo) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Flash info not found']);
            return;
        }
        
        // Convert types
        $flashInfo['displayOrder'] = (int)$flashInfo['displayOrder'];
        $flashInfo['isActive'] = (bool)$flashInfo['isActive'];
        $flashInfo['delayMs'] = isset($flashInfo['delayMs']) ? (int)$flashInfo['delayMs'] : 3000;
        $flashInfo['storageExpiryMinutes'] = isset($flashInfo['storageExpiryMinutes']) ? (int)$flashInfo['storageExpiryMinutes'] : (isset($flashInfo['storageExpiryHours']) ? (int)$flashInfo['storageExpiryHours'] * 60 : 1440);
        
        echo json_encode(['success' => true, 'data' => $flashInfo]);
    } else {
        // Get all flash info items
        $sql = "SELECT * FROM flash_info WHERE 1=1";
        $params = [];
        
        if ($activeOnly) {
            $sql .= " AND isActive = 1";
        }
        
        $sql .= " ORDER BY displayOrder ASC, createdAt DESC";
        
        $flashInfoItems = dbQuery($sql, $params);
        
        // Convert types for each item
        foreach ($flashInfoItems as &$item) {
            $item['displayOrder'] = (int)$item['displayOrder'];
            $item['isActive'] = (bool)$item['isActive'];
            $item['delayMs'] = isset($item['delayMs']) ? (int)$item['delayMs'] : 3000;
            $item['storageExpiryMinutes'] = isset($item['storageExpiryMinutes']) ? (int)$item['storageExpiryMinutes'] : (isset($item['storageExpiryHours']) ? (int)$item['storageExpiryHours'] * 60 : 1440);
        }
        
        echo json_encode(['success' => true, 'data' => $flashInfoItems, 'count' => count($flashInfoItems)]);
    }
}

function handlePost() {
    // Require authentication
    // Only admin and support can manage flash info
    requireRole(['admin', 'support']);
    
    global $data;
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Validate required fields
    if (empty($data['title'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Title is required']);
        return;
    }
    
    if (empty($data['contentType'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Content type is required']);
        return;
    }
    
    // Validate content type
    $allowedTypes = ['image', 'video', 'gif', 'text'];
    if (!in_array($data['contentType'], $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid content type. Must be: image, video, gif, or text']);
        return;
    }
    
    // Validate content based on type
    if (in_array($data['contentType'], ['image', 'video', 'gif'])) {
        if (empty($data['contentUrl'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Content URL is required for ' . $data['contentType']]);
            return;
        }
    } else if ($data['contentType'] === 'text') {
        if (empty($data['contentText'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Content text is required for text type']);
            return;
        }
    }
    
    // Prepare data
    $sql = "INSERT INTO flash_info (title, contentType, contentUrl, contentText, displayOrder, isActive, delayMs, storageExpiryMinutes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $params = [
        $data['title'] ?? '',
        $data['contentType'] ?? 'text',
        $data['contentUrl'] ?? null,
        $data['contentText'] ?? null,
        isset($data['displayOrder']) ? (int)$data['displayOrder'] : 0,
        isset($data['isActive']) ? (int)$data['isActive'] : 1,
        isset($data['delayMs']) ? (int)$data['delayMs'] : 3000,
        isset($data['storageExpiryMinutes']) ? (int)$data['storageExpiryMinutes'] : (isset($data['storageExpiryHours']) ? (int)$data['storageExpiryHours'] * 60 : 1440)
    ];
    
    $id = dbExecute($sql, $params);
    
    if ($id) {
        $flashInfo = dbQueryOne("SELECT * FROM flash_info WHERE id = ?", [$id]);
        $flashInfo['displayOrder'] = (int)$flashInfo['displayOrder'];
        $flashInfo['isActive'] = (bool)$flashInfo['isActive'];
        $flashInfo['delayMs'] = isset($flashInfo['delayMs']) ? (int)$flashInfo['delayMs'] : 3000;
        $flashInfo['storageExpiryMinutes'] = isset($flashInfo['storageExpiryMinutes']) ? (int)$flashInfo['storageExpiryMinutes'] : (isset($flashInfo['storageExpiryHours']) ? (int)$flashInfo['storageExpiryHours'] * 60 : 1440);
        
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Flash info created', 'data' => $flashInfo]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create flash info']);
    }
}

function handlePut() {
    // Require authentication
    // Only admin and support can manage flash info
    requireRole(['admin', 'support']);
    
    global $data;
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Flash info ID required']);
        return;
    }
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Check if flash info exists
    $existing = dbQueryOne("SELECT id FROM flash_info WHERE id = ?", [$id]);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Flash info not found']);
        return;
    }
    
    // Validate content type if provided
    if (isset($data['contentType'])) {
        $allowedTypes = ['image', 'video', 'gif', 'text'];
        if (!in_array($data['contentType'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid content type. Must be: image, video, gif, or text']);
            return;
        }
    }
    
    // Build update query dynamically
    $fields = [];
    $params = [];
    
    $allowedFields = ['title', 'contentType', 'contentUrl', 'contentText', 'displayOrder', 'isActive', 'delayMs', 'storageExpiryMinutes', 'storageExpiryHours'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            // Handle legacy storageExpiryHours by converting to minutes
            if ($field === 'storageExpiryHours') {
                $fields[] = "storageExpiryMinutes = ?";
                $params[] = (int)$data[$field] * 60;
            } elseif (in_array($field, ['displayOrder', 'delayMs', 'storageExpiryMinutes'])) {
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
    $sql = "UPDATE flash_info SET " . implode(', ', $fields) . " WHERE id = ?";
    
    $result = dbExecute($sql, $params);
    
    if ($result !== false) {
        $flashInfo = dbQueryOne("SELECT * FROM flash_info WHERE id = ?", [$id]);
        $flashInfo['displayOrder'] = (int)$flashInfo['displayOrder'];
        $flashInfo['isActive'] = (bool)$flashInfo['isActive'];
        $flashInfo['delayMs'] = isset($flashInfo['delayMs']) ? (int)$flashInfo['delayMs'] : 3000;
        $flashInfo['storageExpiryMinutes'] = isset($flashInfo['storageExpiryMinutes']) ? (int)$flashInfo['storageExpiryMinutes'] : (isset($flashInfo['storageExpiryHours']) ? (int)$flashInfo['storageExpiryHours'] * 60 : 1440);
        
        echo json_encode(['success' => true, 'message' => 'Flash info updated', 'data' => $flashInfo]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update flash info']);
    }
}

function handleDelete() {
    // Require authentication
    requireRole(['admin']);
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Flash info ID required']);
        return;
    }
    
    // Check if flash info exists
    $flashInfo = dbQueryOne("SELECT id FROM flash_info WHERE id = ?", [$id]);
    if (!$flashInfo) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Flash info not found']);
        return;
    }
    
    // Soft delete (set isActive = 0) or hard delete
    $hardDelete = isset($_GET['hard']) && $_GET['hard'] === 'true';
    
    if ($hardDelete) {
        $result = dbExecute("DELETE FROM flash_info WHERE id = ?", [$id]);
    } else {
        $result = dbExecute("UPDATE flash_info SET isActive = 0 WHERE id = ?", [$id]);
    }
    
    if ($result !== false) {
        echo json_encode(['success' => true, 'message' => 'Flash info deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete flash info']);
    }
}

