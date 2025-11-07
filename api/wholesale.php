<?php
/**
 * Wholesale Submissions Management API
 * Endpoints:
 * GET    /api/wholesale.php - List all wholesale submissions
 * GET    /api/wholesale.php?id=1 - Get single submission
 * GET    /api/wholesale.php?status=new - Filter by status
 * GET    /api/wholesale.php?formType=wholesale - Filter by form type
 * PUT    /api/wholesale.php?id=1 - Update submission (requires auth)
 * DELETE /api/wholesale.php?id=1 - Delete submission (requires auth)
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
    error_log('Wholesale API error: ' . $e->getMessage());
}

ob_end_flush();

function handleGet() {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    $formType = isset($_GET['formType']) ? $_GET['formType'] : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    if ($id) {
        // Get single submission
        $wholesale = dbQueryOne(
            "SELECT * FROM wholesale_submissions WHERE id = ?",
            [$id]
        );
        
        if (!$wholesale) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Wholesale submission not found']);
            return;
        }
        
        // Decode JSON fields
        $wholesale['businessTypes'] = json_decode($wholesale['businessTypes'] ?? '[]', true);
        $wholesale['wholesaleEmailSent'] = (bool)$wholesale['wholesaleEmailSent'];
        $wholesale['acknowledgementEmailSent'] = (bool)$wholesale['acknowledgementEmailSent'];
        
        echo json_encode(['success' => true, 'data' => $wholesale]);
    } else {
        // Get all submissions
        $sql = "SELECT * FROM wholesale_submissions WHERE 1=1";
        $params = [];
        
        if ($status) {
            $sql .= " AND status = ?";
            $params[] = $status;
        }
        
        if ($formType) {
            $sql .= " AND formType = ?";
            $params[] = $formType;
        }
        
        $sql .= " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $submissions = dbQuery($sql, $params);
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM wholesale_submissions WHERE 1=1";
        $countParams = [];
        if ($status) {
            $countSql .= " AND status = ?";
            $countParams[] = $status;
        }
        if ($formType) {
            $countSql .= " AND formType = ?";
            $countParams[] = $formType;
        }
        $countResult = dbQueryOne($countSql, $countParams);
        $total = $countResult['total'] ?? 0;
        
        // Decode JSON fields and convert types
        foreach ($submissions as &$submission) {
            $submission['businessTypes'] = json_decode($submission['businessTypes'] ?? '[]', true);
            $submission['wholesaleEmailSent'] = (bool)$submission['wholesaleEmailSent'];
            $submission['acknowledgementEmailSent'] = (bool)$submission['acknowledgementEmailSent'];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $submissions,
            'count' => count($submissions),
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
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Wholesale ID required']);
        return;
    }
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Check if submission exists
    $existing = dbQueryOne("SELECT id FROM wholesale_submissions WHERE id = ?", [$id]);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Wholesale submission not found']);
        return;
    }
    
    // Build update query
    $fields = [];
    $params = [];
    
    $allowedFields = ['status', 'formType', 'firstName', 'lastName', 'email', 'phone', 
                      'businessName', 'website', 'city', 'state', 'country', 'aboutBusiness', 
                      'businessTypes', 'notes'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            if ($field === 'businessTypes') {
                $fields[] = "$field = ?";
                $params[] = json_encode($data[$field]);
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
    $sql = "UPDATE wholesale_submissions SET " . implode(', ', $fields) . " WHERE id = ?";
    
    $result = dbExecute($sql, $params);
    
    if ($result !== false) {
        $wholesale = dbQueryOne("SELECT * FROM wholesale_submissions WHERE id = ?", [$id]);
        $wholesale['businessTypes'] = json_decode($wholesale['businessTypes'] ?? '[]', true);
        $wholesale['wholesaleEmailSent'] = (bool)$wholesale['wholesaleEmailSent'];
        $wholesale['acknowledgementEmailSent'] = (bool)$wholesale['acknowledgementEmailSent'];
        
        echo json_encode(['success' => true, 'message' => 'Wholesale submission updated', 'data' => $wholesale]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update wholesale submission']);
    }
}

function handleDelete() {
    // Require authentication
    requireRole(['admin']);
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Wholesale ID required']);
        return;
    }
    
    // Check if submission exists
    $wholesale = dbQueryOne("SELECT id FROM wholesale_submissions WHERE id = ?", [$id]);
    if (!$wholesale) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Wholesale submission not found']);
        return;
    }
    
    $result = dbExecute("DELETE FROM wholesale_submissions WHERE id = ?", [$id]);
    
    if ($result !== false) {
        echo json_encode(['success' => true, 'message' => 'Wholesale submission deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete wholesale submission']);
    }
}

