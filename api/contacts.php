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
        
        // Get replies for this contact
        $replies = dbQuery(
            "SELECT cr.*, au.username, au.fullName 
             FROM contact_replies cr 
             LEFT JOIN admin_users au ON cr.sentBy = au.id 
             WHERE cr.contactId = ? 
             ORDER BY cr.sentAt DESC",
            [$id]
        );
        
        // Format replies
        foreach ($replies as &$reply) {
            $reply['sentBy'] = $reply['fullName'] ?? $reply['username'] ?? 'System';
            $reply['status'] = $reply['status'];
        }
        
        $contact['replies'] = $replies;
        
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
    // All roles can reply to contacts
    requireRole(['admin', 'sales', 'support']);
    
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

function handlePost() {
    // Require authentication and get user
    $user = requireRole(['admin', 'manager']);
    
    global $data;
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        return;
    }
    
    $contactId = isset($data['contactId']) ? (int)$data['contactId'] : null;
    $replyType = isset($data['replyType']) ? $data['replyType'] : null;
    $message = isset($data['message']) ? trim($data['message']) : null;
    
    // Validate required fields
    if (!$contactId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Contact ID required']);
        return;
    }
    
    if (!$replyType || !in_array($replyType, ['email', 'whatsapp'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Reply type must be "email" or "whatsapp"']);
        return;
    }
    
    if (!$message || empty($message)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Reply message is required']);
        return;
    }
    
    // Get contact submission
    $contact = dbQueryOne("SELECT * FROM contact_submissions WHERE id = ?", [$contactId]);
    if (!$contact) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Contact submission not found']);
        return;
    }
    
    // Get current user info
    $sentBy = $user['id'];
    $adminName = $user['fullName'] ?? $user['username'] ?? 'Olivia Products Team';
    
    $sentTo = '';
    $status = 'sent';
    $errorMessage = null;
    
    try {
        if ($replyType === 'email') {
            // Validate email exists
            if (empty($contact['email'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Contact does not have an email address']);
                return;
            }
            
            $sentTo = $contact['email'];
            
            // Send email reply
            require_once __DIR__ . '/mailgun-helper.php';
            require_once __DIR__ . '/email-templates.php';
            
            $subject = 'Response to Your Inquiry - Olivia Products';
            $htmlBody = getContactReplyEmailTemplate($contact, $message, $adminName);
            $textBody = getContactReplyEmailTextTemplate($contact, $message, $adminName);
            
            sendMailgunEmail($sentTo, $subject, $htmlBody, $textBody);
            
        } else if ($replyType === 'whatsapp') {
            // For WhatsApp, we'll generate a URL that opens WhatsApp
            // The actual sending will be done by the frontend
            $phone = $contact['phone'];
            $sentTo = $phone;
            
            // Format phone number for WhatsApp
            $cleanedPhone = preg_replace('/[^0-9+]/', '', $phone);
            if (!str_starts_with($cleanedPhone, '+')) {
                // Remove leading 0 if present
                if (str_starts_with($cleanedPhone, '0')) {
                    $cleanedPhone = substr($cleanedPhone, 1);
                }
                // Add +234 if not already international
                if (!str_starts_with($cleanedPhone, '234')) {
                    $cleanedPhone = '+234' . $cleanedPhone;
                } else {
                    $cleanedPhone = '+' . $cleanedPhone;
                }
            }
            
            // Format WhatsApp message with original message included
            $whatsappMessage = "*RESPONSE TO YOUR INQUIRY*\n";
            $whatsappMessage .= "━━━━━━━━━━━━━━━━━━━━\n\n";
            $whatsappMessage .= "Hello " . $contact['fullName'] . ",\n\n";
            $whatsappMessage .= "Thank you for contacting Olivia Products. Here's our response:\n\n";
            $whatsappMessage .= "*OUR RESPONSE*\n";
            $whatsappMessage .= "─────────────\n";
            $whatsappMessage .= $message . "\n\n";
            $whatsappMessage .= "━━━━━━━━━━━━━━━━━━━━\n\n";
            $whatsappMessage .= "*YOUR ORIGINAL MESSAGE*\n";
            $whatsappMessage .= "─────────────────────\n";
            $whatsappMessage .= "_" . $contact['message'] . "_\n\n";
            $whatsappMessage .= "━━━━━━━━━━━━━━━━━━━━\n\n";
            $whatsappMessage .= "If you have any further questions, please don't hesitate to reach out:\n";
            $whatsappMessage .= "📧 Email: " . MAILGUN_REPLY_TO . "\n";
            $whatsappMessage .= "📞 Phone: +234 901 419 6902\n";
            $whatsappMessage .= "💬 WhatsApp: +234 912 350 9090\n\n";
            $whatsappMessage .= "Best regards,\n";
            $whatsappMessage .= "*" . $adminName . "*\n";
            $whatsappMessage .= "Olivia Products Team";
            
            // Create WhatsApp URL (frontend will open this)
            $encodedMessage = urlencode($whatsappMessage);
            $whatsappUrl = "https://wa.me/" . preg_replace('/[^0-9]/', '', $cleanedPhone) . "?text=" . $encodedMessage;
            
            // Store the WhatsApp URL in the reply record
            // Note: The frontend will actually open this URL
        }
        
        // Record reply in database
        $replySql = "INSERT INTO contact_replies (contactId, replyType, message, sentTo, sentBy, status, errorMessage) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)";
        $replyParams = [$contactId, $replyType, $message, $sentTo, $sentBy, $status, $errorMessage];
        
        $replyId = dbExecute($replySql, $replyParams);
        
        if ($replyId === false) {
            throw new Exception('Failed to save reply record');
        }
        
        // Update contact status to 'replied' if not already
        if ($contact['status'] !== 'replied') {
            dbExecute("UPDATE contact_submissions SET status = 'replied' WHERE id = ?", [$contactId]);
        }
        
        // Get the saved reply
        $savedReply = dbQueryOne("SELECT * FROM contact_replies WHERE id = ?", [$replyId]);
        
        // Prepare response
        $response = [
            'success' => true,
            'message' => $replyType === 'email' ? 'Reply sent successfully via email' : 'WhatsApp reply prepared',
            'data' => $savedReply
        ];
        
        // Add WhatsApp URL if applicable
        if ($replyType === 'whatsapp' && isset($whatsappUrl)) {
            $response['whatsappUrl'] = $whatsappUrl;
        }
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        // Record failed reply
        $replySql = "INSERT INTO contact_replies (contactId, replyType, message, sentTo, sentBy, status, errorMessage) 
                     VALUES (?, ?, ?, ?, ?, 'failed', ?)";
        $replyParams = [$contactId, $replyType, $message, $sentTo, $sentBy, $e->getMessage()];
        dbExecute($replySql, $replyParams);
        
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to send reply: ' . $e->getMessage()
        ]);
        error_log('Contact reply error: ' . $e->getMessage());
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

