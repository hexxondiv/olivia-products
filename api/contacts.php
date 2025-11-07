<?php
/**
 * Contact Submissions Management API
 * Endpoints:
 * GET    /api/contacts.php - List all contact submissions
 * GET    /api/contacts.php?id=1 - Get single submission
 * GET    /api/contacts.php?status=new - Filter by status
 * PUT    /api/contacts.php?id=1 - Update submission status (requires auth)
 * DELETE /api/contacts.php?id=1 - Delete submission (requires auth)
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
    error_log('Contacts API error: ' . $e->getMessage());
}

ob_end_flush();

function handleGet() {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    if ($id) {
        // Get single submission
        $contact = dbQueryOne(
            "SELECT * FROM contact_submissions WHERE id = ?",
            [$id]
        );
        
        if (!$contact) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Contact submission not found']);
            return;
        }
        
        $contact['contactEmailSent'] = (bool)$contact['contactEmailSent'];
        $contact['acknowledgementEmailSent'] = (bool)$contact['acknowledgementEmailSent'];
        
        echo json_encode(['success' => true, 'data' => $contact]);
    } else {
        // Get all submissions
        $sql = "SELECT * FROM contact_submissions WHERE 1=1";
        $params = [];
        
        if ($status) {
            $sql .= " AND status = ?";
            $params[] = $status;
        }
        
        $sql .= " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $contacts = dbQuery($sql, $params);
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM contact_submissions WHERE 1=1";
        $countParams = [];
        if ($status) {
            $countSql .= " AND status = ?";
            $countParams[] = $status;
        }
        $countResult = dbQueryOne($countSql, $countParams);
        $total = $countResult['total'] ?? 0;
        
        // Convert types
        foreach ($contacts as &$contact) {
            $contact['contactEmailSent'] = (bool)$contact['contactEmailSent'];
            $contact['acknowledgementEmailSent'] = (bool)$contact['acknowledgementEmailSent'];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $contacts,
            'count' => count($contacts),
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
        echo json_encode(['success' => false, 'message' => 'Contact ID required']);
        return;
    }
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Check if submission exists
    $existing = dbQueryOne("SELECT id FROM contact_submissions WHERE id = ?", [$id]);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Contact submission not found']);
        return;
    }
    
    // Build update query
    $fields = [];
    $params = [];
    
    $allowedFields = ['status', 'fullName', 'email', 'phone', 'address', 'message'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $params[] = $data[$field];
        }
    }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        return;
    }
    
    $params[] = $id;
    $sql = "UPDATE contact_submissions SET " . implode(', ', $fields) . " WHERE id = ?";
    
    $result = dbExecute($sql, $params);
    
    if ($result !== false) {
        $contact = dbQueryOne("SELECT * FROM contact_submissions WHERE id = ?", [$id]);
        $contact['contactEmailSent'] = (bool)$contact['contactEmailSent'];
        $contact['acknowledgementEmailSent'] = (bool)$contact['acknowledgementEmailSent'];
        
        echo json_encode(['success' => true, 'message' => 'Contact submission updated', 'data' => $contact]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update contact submission']);
    }
}

function handleDelete() {
    // Require authentication
    requireRole(['admin']);
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Contact ID required']);
        return;
    }
    
    // Check if submission exists
    $contact = dbQueryOne("SELECT id FROM contact_submissions WHERE id = ?", [$id]);
    if (!$contact) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Contact submission not found']);
        return;
    }
    
    $result = dbExecute("DELETE FROM contact_submissions WHERE id = ?", [$id]);
    
    if ($result !== false) {
        echo json_encode(['success' => true, 'message' => 'Contact submission deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete contact submission']);
    }
}

