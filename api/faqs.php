<?php
/**
 * FAQs CRUD API
 * Endpoints:
 * GET    /api/faqs.php - List all FAQs
 * GET    /api/faqs.php?id=1 - Get single FAQ
 * GET    /api/faqs.php?search=term - Search FAQs
 * POST   /api/faqs.php - Create FAQ (requires auth)
 * PUT    /api/faqs.php?id=1 - Update FAQ (requires auth)
 * DELETE /api/faqs.php?id=1 - Delete FAQ (requires auth)
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
    error_log('FAQs API error: ' . $e->getMessage());
}

ob_end_flush();

function handleGet() {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $activeOnly = isset($_GET['activeOnly']) ? filter_var($_GET['activeOnly'], FILTER_VALIDATE_BOOLEAN) : false;
    $search = isset($_GET['search']) ? trim($_GET['search']) : null;
    
    if ($id) {
        // Get single FAQ
        $faq = dbQueryOne(
            "SELECT * FROM faqs WHERE id = ?",
            [$id]
        );
        
        if (!$faq) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'FAQ not found']);
            return;
        }
        
        // Convert types
        $faq['displayOrder'] = (int)$faq['displayOrder'];
        $faq['isActive'] = (bool)$faq['isActive'];
        
        echo json_encode(['success' => true, 'data' => $faq]);
    } else {
        // Get all FAQs with optional search
        $sql = "SELECT * FROM faqs WHERE 1=1";
        $params = [];
        
        if ($activeOnly) {
            $sql .= " AND isActive = 1";
        }
        
        // Add search functionality
        if ($search && !empty($search)) {
            $sql .= " AND (MATCH(question, answer) AGAINST(? IN NATURAL LANGUAGE MODE) OR question LIKE ? OR answer LIKE ?)";
            $searchTerm = "%{$search}%";
            $params[] = $search;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        $sql .= " ORDER BY displayOrder ASC, createdAt DESC";
        
        $faqs = dbQuery($sql, $params);
        
        if ($faqs === false) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to fetch FAQs']);
            return;
        }
        
        // Convert types for each item
        foreach ($faqs as &$item) {
            $item['displayOrder'] = (int)$item['displayOrder'];
            $item['isActive'] = (bool)$item['isActive'];
        }
        
        echo json_encode(['success' => true, 'data' => $faqs, 'count' => count($faqs)]);
    }
}

function handlePost() {
    // Require authentication
    // Only admin and support can manage FAQs
    requireRole(['admin', 'support']);
    
    global $data;
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Validate required fields
    if (empty($data['question'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Question is required']);
        return;
    }
    
    if (empty($data['answer'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Answer is required']);
        return;
    }
    
    // Prepare data
    $sql = "INSERT INTO faqs (question, answer, backgroundColor, displayOrder, isActive) 
            VALUES (?, ?, ?, ?, ?)";
    
    $params = [
        $data['question'] ?? '',
        $data['answer'] ?? '',
        $data['backgroundColor'] ?? '#f5f7fa',
        isset($data['displayOrder']) ? (int)$data['displayOrder'] : 0,
        isset($data['isActive']) ? (int)$data['isActive'] : 1
    ];
    
    $id = dbExecute($sql, $params);
    
    if ($id) {
        $faq = dbQueryOne("SELECT * FROM faqs WHERE id = ?", [$id]);
        $faq['displayOrder'] = (int)$faq['displayOrder'];
        $faq['isActive'] = (bool)$faq['isActive'];
        
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'FAQ created', 'data' => $faq]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create FAQ']);
    }
}

function handlePut() {
    // Require authentication
    // Only admin and support can manage FAQs
    requireRole(['admin', 'support']);
    
    global $data;
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'FAQ ID required']);
        return;
    }
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Check if FAQ exists
    $existing = dbQueryOne("SELECT id FROM faqs WHERE id = ?", [$id]);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'FAQ not found']);
        return;
    }
    
    // Build update query dynamically
    $fields = [];
    $params = [];
    
    $allowedFields = ['question', 'answer', 'backgroundColor', 'displayOrder', 'isActive'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            if (in_array($field, ['displayOrder'])) {
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
    $sql = "UPDATE faqs SET " . implode(', ', $fields) . " WHERE id = ?";
    
    $result = dbExecute($sql, $params);
    
    if ($result !== false) {
        $faq = dbQueryOne("SELECT * FROM faqs WHERE id = ?", [$id]);
        $faq['displayOrder'] = (int)$faq['displayOrder'];
        $faq['isActive'] = (bool)$faq['isActive'];
        
        echo json_encode(['success' => true, 'message' => 'FAQ updated', 'data' => $faq]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update FAQ']);
    }
}

function handleDelete() {
    // Require authentication
    requireRole(['admin']);
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'FAQ ID required']);
        return;
    }
    
    // Check if FAQ exists
    $faq = dbQueryOne("SELECT id FROM faqs WHERE id = ?", [$id]);
    if (!$faq) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'FAQ not found']);
        return;
    }
    
    // Soft delete (set isActive = 0) or hard delete
    $hardDelete = isset($_GET['hard']) && $_GET['hard'] === 'true';
    
    if ($hardDelete) {
        $result = dbExecute("DELETE FROM faqs WHERE id = ?", [$id]);
    } else {
        $result = dbExecute("UPDATE faqs SET isActive = 0 WHERE id = ?", [$id]);
    }
    
    if ($result !== false) {
        echo json_encode(['success' => true, 'message' => 'FAQ deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete FAQ']);
    }
}

