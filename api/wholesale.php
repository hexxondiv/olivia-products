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
require_once __DIR__ . '/mailgun-helper.php';

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
    error_log('Wholesale API error: ' . $e->getMessage());
}

ob_end_flush();

function handlePost() {
    global $data;
    
    // Check if this is a CAC verification request
    if (isset($data['action']) && $data['action'] === 'verifyCAC') {
        handleCACVerification($data);
        return;
    }
    
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function handleCACVerification($data) {
    $searchTerm = isset($data['searchTerm']) ? trim($data['searchTerm']) : null;
    $searchType = isset($data['searchType']) ? $data['searchType'] : 'ALL';
    
    error_log("CAC Verification Request - searchTerm: " . ($searchTerm ?: 'NULL') . ", searchType: " . $searchType);
    error_log("CAC Verification Request Data: " . json_encode($data));
    
    if (!$searchTerm || empty($searchTerm)) {
        error_log("CAC Verification Error: Search term is missing or empty");
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Search term is required']);
        return;
    }
    
    try {
        // Match the exact URL format from the working frontend version
        $url = "https://icrp.cac.gov.ng/name_similarity_app/api/public_search/search/new?SearchType=" . urlencode($searchType) . "&searchTerm=" . urlencode($searchTerm);
        
        error_log("CAC Verification URL: " . $url);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        // Match the exact body format: SearchType (capital S) and searchTerm (lowercase s)
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'SearchType' => $searchType,
            'searchTerm' => $searchTerm
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($curlError) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'CAC API request failed: ' . $curlError
            ]);
            return;
        }
        
        // Handle empty response
        if (empty($response)) {
            error_log("CAC API returned empty response");
            http_response_code(200);
            echo json_encode([
                'success' => false,
                'notVerified' => true,
                'error' => 'CAC registration number could not be verified',
                'message' => 'No data returned from CAC registry'
            ]);
            return;
        }
        
        if ($httpCode !== 200) {
            error_log("CAC API returned HTTP {$httpCode}");
            http_response_code(200);
            echo json_encode([
                'success' => false,
                'notVerified' => true,
                'error' => 'CAC registration number could not be verified',
                'message' => 'CAC API returned HTTP ' . $httpCode
            ]);
            return;
        }
        
        $result = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("CAC API JSON decode error: " . json_last_error_msg());
            http_response_code(200);
            echo json_encode([
                'success' => false,
                'notVerified' => true,
                'error' => 'CAC registration number could not be verified',
                'message' => 'Invalid response from CAC registry'
            ]);
            return;
        }
        
        // Match the exact response handling from the working frontend version
        if (isset($result['success']) && $result['success']) {
            // Check if data is empty array or null
            $data = $result['data'] ?? null;
            if (is_array($data) && count($data) === 0) {
                // Success but empty data array means not found
                echo json_encode([
                    'success' => false,
                    'notVerified' => true,
                    'error' => 'CAC registration number not found',
                    'message' => $result['message'] ?? 'No matching records found in CAC registry'
                ]);
            } else if ($data === null || $data === '') {
                // Null or empty string data means not found
                echo json_encode([
                    'success' => false,
                    'notVerified' => true,
                    'error' => 'CAC registration number not found',
                    'message' => $result['message'] ?? 'No matching records found in CAC registry'
                ]);
            } else {
                // Valid data found
                echo json_encode([
                    'success' => true,
                    'message' => $result['message'] ?? 'Search successful',
                    'data' => $data
                ]);
            }
        } else {
            // Check if result has data but success is false (might still be a valid response)
            if (isset($result['data'])) {
                if (is_array($result['data']) && count($result['data']) === 0) {
                    // Empty data array means not found
                    echo json_encode([
                        'success' => false,
                        'notVerified' => true,
                        'error' => 'CAC registration number not found',
                        'message' => $result['message'] ?? 'No matching records found in CAC registry'
                    ]);
                } else if ($result['data'] === null || $result['data'] === '') {
                    // Null or empty string data means not found
                    echo json_encode([
                        'success' => false,
                        'notVerified' => true,
                        'error' => 'CAC registration number not found',
                        'message' => $result['message'] ?? 'No matching records found in CAC registry'
                    ]);
                } else {
                    // Has data but success is false - might be an error
                    echo json_encode([
                        'success' => false,
                        'notVerified' => true,
                        'error' => 'CAC registration number could not be verified',
                        'message' => $result['message'] ?? 'Search failed'
                    ]);
                }
            } else {
                // No data field at all
                echo json_encode([
                    'success' => false,
                    'notVerified' => true,
                    'error' => 'CAC registration number could not be verified',
                    'message' => $result['message'] ?? 'Search failed'
                ]);
            }
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Server error: ' . $e->getMessage()
        ]);
        error_log('CAC verification error: ' . $e->getMessage());
    }
}

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
    
    // Check if submission exists and get current status
    $existing = dbQueryOne("SELECT * FROM wholesale_submissions WHERE id = ?", [$id]);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Wholesale submission not found']);
        return;
    }
    
    $oldStatus = $existing['status'] ?? null;
    $statusChanged = false;
    $newStatus = null;
    
    // Check if status is being changed
    if (isset($data['status']) && $data['status'] !== $oldStatus) {
        $statusChanged = true;
        $newStatus = $data['status'];
    }
    
    // Build update query
    $fields = [];
    $params = [];
    
    $allowedFields = ['status', 'formType', 'firstName', 'lastName', 'email', 'phone', 
                      'businessName', 'website', 'businessPhysicalAddress', 'city', 'state', 'country', 'aboutBusiness', 
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
        
        // Send status update email if status changed
        $emailSent = false;
        $emailError = null;
        if ($statusChanged && $newStatus) {
            try {
                $emailSent = sendWholesaleStatusUpdateToCustomer($wholesale, $newStatus, $oldStatus);
                error_log("Status update email sent successfully to: " . $wholesale['email']);
            } catch (Exception $e) {
                $emailError = $e->getMessage();
                error_log("Failed to send status update email to " . $wholesale['email'] . ": " . $emailError);
                // Continue even if email fails
            }
        }
        
        $response = [
            'success' => true, 
            'message' => 'Wholesale submission updated', 
            'data' => $wholesale
        ];
        
        if ($statusChanged) {
            if ($emailSent) {
                $response['emailSent'] = true;
                $response['message'] .= '. Status update email sent to applicant.';
            } else {
                $response['emailSent'] = false;
                $response['emailError'] = $emailError;
                $response['message'] .= '. Note: Status update email failed to send.';
            }
        }
        
        echo json_encode($response);
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

