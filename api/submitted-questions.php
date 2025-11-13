<?php
/**
 * Submitted Questions CRUD API
 * Endpoints:
 * GET    /api/submitted-questions.php - List all submitted questions
 * GET    /api/submitted-questions.php?id=1 - Get single submitted question
 * PUT    /api/submitted-questions.php?id=1 - Answer/Update submitted question (requires auth)
 * DELETE /api/submitted-questions.php?id=1 - Delete submitted question (requires auth)
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
    error_log('Submitted Questions API error: ' . $e->getMessage());
}

ob_end_flush();

function handleGet() {
    // Require authentication
    // All roles can view submitted questions
    requireRole(['admin', 'sales', 'support']);
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    
    if ($id) {
        // Get single submitted question
        $question = dbQueryOne(
            "SELECT * FROM submitted_questions WHERE id = ?",
            [$id]
        );
        
        if (!$question) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Submitted question not found']);
            return;
        }
        
        echo json_encode(['success' => true, 'data' => $question]);
    } else {
        // Get all submitted questions
        $sql = "SELECT * FROM submitted_questions WHERE 1=1";
        $params = [];
        
        if ($status) {
            $sql .= " AND status = ?";
            $params[] = $status;
        }
        
        $sql .= " ORDER BY createdAt DESC";
        
        $questions = dbQuery($sql, $params);
        
        if ($questions === false) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to fetch questions']);
            return;
        }
        
        echo json_encode(['success' => true, 'data' => $questions, 'count' => count($questions)]);
    }
}

function handlePut() {
    // Require authentication - this also returns the user
    // Only admin and support can answer questions
    $user = requireRole(['admin', 'support']);
    
    global $data;
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Question ID required']);
        return;
    }
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Check if question exists
    $existing = dbQueryOne("SELECT * FROM submitted_questions WHERE id = ?", [$id]);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Submitted question not found']);
        return;
    }
    
    // Get current user ID
    $userId = $user ? $user['id'] : null;
    
    // Build update query
    $fields = [];
    $params = [];
    
    if (isset($data['answer'])) {
        $fields[] = "answer = ?";
        $params[] = $data['answer'];
    }
    
    if (isset($data['status'])) {
        $fields[] = "status = ?";
        $params[] = $data['status'];
    }
    
    if (isset($data['answer']) && isset($data['status']) && $data['status'] === 'answered') {
        $fields[] = "answeredBy = ?";
        $params[] = $userId;
        $fields[] = "answeredAt = NOW()";
    }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        return;
    }
    
    $params[] = $id;
    $sql = "UPDATE submitted_questions SET " . implode(', ', $fields) . " WHERE id = ?";
    
    $result = dbExecute($sql, $params);
    
    if ($result !== false) {
        // If convertToFAQ is true, create a new FAQ
        if (isset($data['convertToFAQ']) && $data['convertToFAQ'] === true && isset($data['answer'])) {
            $faqSql = "INSERT INTO faqs (question, answer, backgroundColor, displayOrder, isActive) 
                       VALUES (?, ?, ?, ?, ?)";
            $faqParams = [
                $existing['question'],
                $data['answer'],
                '#f5f7fa',
                0,
                1
            ];
            
            $faqId = dbExecute($faqSql, $faqParams);
            if ($faqId) {
                error_log("FAQ created from submitted question ID: $id");
            }
        }
        
        $question = dbQueryOne("SELECT * FROM submitted_questions WHERE id = ?", [$id]);
        
        echo json_encode(['success' => true, 'message' => 'Question updated', 'data' => $question]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update question']);
    }
}

function handleDelete() {
    // Require authentication
    requireRole(['admin']);
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Question ID required']);
        return;
    }
    
    // Check if question exists
    $question = dbQueryOne("SELECT id FROM submitted_questions WHERE id = ?", [$id]);
    if (!$question) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Submitted question not found']);
        return;
    }
    
    $result = dbExecute("DELETE FROM submitted_questions WHERE id = ?", [$id]);
    
    if ($result !== false) {
        echo json_encode(['success' => true, 'message' => 'Question deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete question']);
    }
}

