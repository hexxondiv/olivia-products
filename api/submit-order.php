<?php
// Start output buffering to prevent any accidental output
ob_start();

// Disable error display and enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Set headers first to ensure JSON response
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Clear any output that might have been sent
ob_clean();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_clean();
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    ob_end_flush();
    exit();
}

// Load environment variables with error handling
try {
    if (!file_exists(__DIR__ . '/config.php')) {
        throw new Exception('Configuration file not found');
    }
    require_once __DIR__ . '/config.php';
    
    if (!file_exists(__DIR__ . '/mailgun-helper.php')) {
        throw new Exception('Mailgun helper file not found');
    }
    require_once __DIR__ . '/mailgun-helper.php';
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server configuration error: ' . $e->getMessage()
    ]);
    error_log('Configuration error: ' . $e->getMessage());
    ob_end_flush();
    exit();
}

// Get JSON input
$input = file_get_contents('php://input');
$orderData = json_decode($input, true);

// Validate input
if (!$orderData) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    ob_end_flush();
    exit();
}

// Validate required fields
$requiredFields = ['customer', 'items', 'total', 'orderDate'];
foreach ($requiredFields as $field) {
    if (!isset($orderData[$field])) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        ob_end_flush();
        exit();
    }
}

// Validate customer fields
$customerRequired = ['fullName', 'email', 'phone', 'address', 'city', 'state'];
foreach ($customerRequired as $field) {
    if (empty($orderData['customer'][$field])) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing required customer field: $field"]);
        ob_end_flush();
        exit();
    }
}

// Validate items
if (!is_array($orderData['items']) || empty($orderData['items'])) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Order must contain at least one item']);
    ob_end_flush();
    exit();
}

try {
    // Generate order ID
    $orderId = 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -8));
    
    // Prepare order data with order ID
    $orderData['orderId'] = $orderId;
    
    // Initialize email results
    $salesEmailResult = false;
    $salesEmailError = null;
    $customerEmailResult = false;
    $customerEmailError = null;
    
    // Send email to sales team
    try {
        $salesEmailResult = sendOrderEmailToSales($orderData);
        error_log("Sales email sent successfully to: " . SALES_EMAIL);
    } catch (Exception $e) {
        $salesEmailError = $e->getMessage();
        error_log("Failed to send sales email: " . $salesEmailError);
        // Continue processing even if sales email fails
    }
    
    // Send acknowledgement email to customer
    try {
        $customerEmail = $orderData['customer']['email'];
        $customerEmailResult = sendOrderConfirmationToCustomer($orderData);
        error_log("Customer email sent successfully to: " . $customerEmail);
    } catch (Exception $e) {
        $customerEmailError = $e->getMessage();
        error_log("Failed to send customer email to " . $customerEmail . ": " . $customerEmailError);
        // Continue processing even if customer email fails
    }
    
    // Log the order (optional - you can save to database here)
    // saveOrderToDatabase($orderData);
    
    // Prepare response message
    $message = 'Order submitted successfully';
    $warnings = [];
    
    if (!$salesEmailResult) {
        $warnings[] = 'Sales notification email failed to send';
    }
    if (!$customerEmailResult) {
        $warnings[] = 'Customer confirmation email failed to send';
    }
    
    if (!empty($warnings)) {
        $message .= '. Note: ' . implode(', ', $warnings);
    }
    
    // Return success response (order is saved even if emails fail)
    ob_clean();
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'orderId' => $orderId,
        'salesEmailSent' => $salesEmailResult,
        'salesEmailError' => $salesEmailError,
        'customerEmailSent' => $customerEmailResult,
        'customerEmailError' => $customerEmailError,
        'warnings' => $warnings
    ]);
    
} catch (Exception $e) {
    // Clear any output
    ob_clean();
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error processing order: ' . $e->getMessage()
    ]);
    error_log('Order submission error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
}

// End output buffering
ob_end_flush();

