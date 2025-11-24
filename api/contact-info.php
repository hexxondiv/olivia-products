<?php
/**
 * Contact Information CRUD API
 * Endpoints:
 * GET    /api/contact-info.php - Get contact information (public, returns first record)
 * GET    /api/contact-info.php?id=1 - Get specific contact info (requires auth)
 * POST   /api/contact-info.php - Create contact info (requires auth)
 * PUT    /api/contact-info.php?id=1 - Update contact info (requires auth)
 * DELETE /api/contact-info.php?id=1 - Delete contact info (requires auth)
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
    error_log('Contact Info API error: ' . $e->getMessage());
}

ob_end_flush();

function handleGet() {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if ($id) {
        // Get specific contact info (requires auth for admin access)
        // Public can access but typically we'll just return the first one
        $contactInfo = dbQueryOne(
            "SELECT * FROM contact_info WHERE id = ?",
            [$id]
        );
        
        if (!$contactInfo) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Contact info not found']);
            return;
        }
        
        // Decode JSON fields
        if (isset($contactInfo['socialMedia']) && is_string($contactInfo['socialMedia'])) {
            $contactInfo['socialMedia'] = json_decode($contactInfo['socialMedia'], true) ?? [];
        }
        
        echo json_encode(['success' => true, 'data' => $contactInfo]);
    } else {
        // Get first contact info (public access - for frontend display)
        $contactInfo = dbQueryOne("SELECT * FROM contact_info ORDER BY id ASC LIMIT 1");
        
        if (!$contactInfo) {
            // Return default structure if no contact info exists
            echo json_encode([
                'success' => true, 
                'data' => [
                    'companyName' => 'Olivia Industries Ltd',
                    'location' => '',
                    'phone' => '',
                    'whatsapp' => '',
                    'businessHours' => '',
                    'emailGeneral' => '',
                    'emailSales' => '',
                    'emailSupplier' => '',
                    'mapEmbedUrl' => '',
                    'salesWhatsApp' => '',
                    'socialMedia' => []
                ]
            ]);
            return;
        }
        
        // Decode JSON fields
        if (isset($contactInfo['socialMedia']) && is_string($contactInfo['socialMedia'])) {
            $contactInfo['socialMedia'] = json_decode($contactInfo['socialMedia'], true) ?? [];
        } else {
            $contactInfo['socialMedia'] = [];
        }
        
        // Ensure all fields are strings (convert null to empty string for consistency)
        $fieldsToNormalize = ['phone', 'whatsapp', 'salesWhatsApp', 'businessHours', 'emailGeneral', 'emailSales', 'emailSupplier', 'mapEmbedUrl'];
        foreach ($fieldsToNormalize as $field) {
            if (!isset($contactInfo[$field]) || $contactInfo[$field] === null) {
                $contactInfo[$field] = '';
            }
        }
        
        echo json_encode(['success' => true, 'data' => $contactInfo]);
    }
}

function handlePost() {
    // Require authentication
    // Only admin and support can manage contact info
    requireRole(['admin', 'support']);
    
    global $data;
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Validate required fields
    if (empty($data['companyName'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Company name is required']);
        return;
    }
    
    if (empty($data['location'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Location is required']);
        return;
    }
    
    // Prepare social media JSON
    $socialMedia = [];
    if (isset($data['socialMedia']) && is_array($data['socialMedia'])) {
        $socialMedia = $data['socialMedia'];
    }
    
    // Prepare data
    $sql = "INSERT INTO contact_info (companyName, location, phone, whatsapp, salesWhatsApp, businessHours, emailGeneral, emailSales, emailSupplier, mapEmbedUrl, socialMedia) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $params = [
        $data['companyName'] ?? '',
        $data['location'] ?? '',
        $data['phone'] ?? null,
        $data['whatsapp'] ?? null,
        $data['salesWhatsApp'] ?? null,
        $data['businessHours'] ?? null,
        $data['emailGeneral'] ?? null,
        $data['emailSales'] ?? null,
        $data['emailSupplier'] ?? null,
        $data['mapEmbedUrl'] ?? null,
        json_encode($socialMedia)
    ];
    
    $id = dbExecute($sql, $params);
    
    if ($id) {
        $contactInfo = dbQueryOne("SELECT * FROM contact_info WHERE id = ?", [$id]);
        if (isset($contactInfo['socialMedia']) && is_string($contactInfo['socialMedia'])) {
            $contactInfo['socialMedia'] = json_decode($contactInfo['socialMedia'], true) ?? [];
        }
        
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Contact info created', 'data' => $contactInfo]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create contact info']);
    }
}

function handlePut() {
    // Require authentication
    // Only admin and support can manage contact info
    requireRole(['admin', 'support']);
    
    global $data;
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Contact info ID required']);
        return;
    }
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    // Check if contact info exists
    $existing = dbQueryOne("SELECT id FROM contact_info WHERE id = ?", [$id]);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Contact info not found']);
        return;
    }
    
    // Build update query dynamically
    $fields = [];
    $params = [];
    
    $allowedFields = ['companyName', 'location', 'phone', 'whatsapp', 'salesWhatsApp', 'businessHours', 'emailGeneral', 'emailSales', 'emailSupplier', 'mapEmbedUrl', 'socialMedia'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            if ($field === 'socialMedia') {
                $fields[] = "$field = ?";
                $params[] = json_encode(is_array($data[$field]) ? $data[$field] : []);
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
    $sql = "UPDATE contact_info SET " . implode(', ', $fields) . " WHERE id = ?";
    
    $result = dbExecute($sql, $params);
    
    if ($result !== false) {
        $contactInfo = dbQueryOne("SELECT * FROM contact_info WHERE id = ?", [$id]);
        if (isset($contactInfo['socialMedia']) && is_string($contactInfo['socialMedia'])) {
            $contactInfo['socialMedia'] = json_decode($contactInfo['socialMedia'], true) ?? [];
        }
        
        echo json_encode(['success' => true, 'message' => 'Contact info updated', 'data' => $contactInfo]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update contact info']);
    }
}

function handleDelete() {
    // Require authentication
    requireRole(['admin']);
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Contact info ID required']);
        return;
    }
    
    // Check if contact info exists
    $contactInfo = dbQueryOne("SELECT id FROM contact_info WHERE id = ?", [$id]);
    if (!$contactInfo) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Contact info not found']);
        return;
    }
    
    $result = dbExecute("DELETE FROM contact_info WHERE id = ?", [$id]);
    
    if ($result !== false) {
        echo json_encode(['success' => true, 'message' => 'Contact info deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete contact info']);
    }
}

