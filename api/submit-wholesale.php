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
    
    if (!file_exists(__DIR__ . '/database.php')) {
        throw new Exception('Database helper file not found');
    }
    require_once __DIR__ . '/database.php';
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
$wholesaleData = json_decode($input, true);

// Validate input
if (!$wholesaleData) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    ob_end_flush();
    exit();
}

// Validate required fields
$requiredFields = ['formType', 'firstName', 'email', 'phone', 'businessName', 'businessPhysicalAddress', 'city', 'state', 'country', 'aboutBusiness'];
foreach ($requiredFields as $field) {
    if (empty($wholesaleData[$field])) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        ob_end_flush();
        exit();
    }
}

// Validate formType (must be one of: wholesale, distribution, retail)
$validFormTypes = ['wholesale', 'distribution', 'retail'];
if (!in_array(strtolower($wholesaleData['formType']), $validFormTypes)) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid form type. Must be: wholesale, distribution, or retail']);
    ob_end_flush();
    exit();
}

// Validate email if provided
if (!filter_var($wholesaleData['email'], FILTER_VALIDATE_EMAIL)) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    ob_end_flush();
    exit();
}

try {
    // Prepare wholesale data with timestamp
    $wholesaleData['submittedAt'] = date('Y-m-d H:i:s');
    
    // Initialize email results
    $wholesaleEmailResult = false;
    $wholesaleEmailError = null;
    $acknowledgementEmailResult = false;
    $acknowledgementEmailError = null;
    
    // Send email to contact email
    try {
        $wholesaleEmailResult = sendWholesaleEmailToTeam($wholesaleData);
        error_log("Wholesale email sent successfully to: " . CONTACT_EMAIL);
    } catch (Exception $e) {
        $wholesaleEmailError = $e->getMessage();
        error_log("Failed to send wholesale email: " . $wholesaleEmailError);
        // Continue processing even if email fails
    }
    
    // Send acknowledgement email to customer
    try {
        $acknowledgementEmailResult = sendWholesaleAcknowledgementToCustomer($wholesaleData);
        error_log("Acknowledgement email sent successfully to: " . $wholesaleData['email']);
    } catch (Exception $e) {
        $acknowledgementEmailError = $e->getMessage();
        error_log("Failed to send acknowledgement email to " . $wholesaleData['email'] . ": " . $acknowledgementEmailError);
        // Continue processing even if acknowledgement email fails
    }
    
    // Prepare response message
    $message = 'Wholesale form submitted successfully';
    $warnings = [];
    
    if (!$wholesaleEmailResult) {
        $warnings[] = 'Wholesale notification email failed to send';
    }
    if (!$acknowledgementEmailResult) {
        $warnings[] = 'Acknowledgement email failed to send';
    }
    
    if (!empty($warnings)) {
        $message .= '. Note: ' . implode(', ', $warnings);
    }
    
    // Save wholesale submission to database
    $wholesaleId = false;
    $databaseError = null;
    try {
        // Get database connection directly to get better error messages
        $pdo = getDBConnection();
        
        if (!$pdo) {
            $databaseError = "Database connection failed. Check database configuration.";
            error_log("Database connection failed in submit-wholesale.php");
        } else {
            $wholesaleSql = "INSERT INTO wholesale_submissions (formType, firstName, lastName, email, phone, 
                            businessName, website, companyLogo, cacRegistrationNumber, businessPhysicalAddress, city, state, country, aboutBusiness, businessTypes, 
                            status, submittedVia, wholesaleEmailSent, acknowledgementEmailSent) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?)";
            
            $wholesaleParams = [
                strtolower($wholesaleData['formType']),
                $wholesaleData['firstName'],
                $wholesaleData['lastName'] ?? null,
                $wholesaleData['email'],
                $wholesaleData['phone'],
                $wholesaleData['businessName'],
                $wholesaleData['website'] ?? null,
                $wholesaleData['companyLogo'] ?? null,
                $wholesaleData['cacRegistrationNumber'] ?? null,
                $wholesaleData['businessPhysicalAddress'],
                $wholesaleData['city'],
                $wholesaleData['state'],
                $wholesaleData['country'],
                $wholesaleData['aboutBusiness'],
                json_encode($wholesaleData['businessTypes'] ?? []),
                $wholesaleData['submittedVia'] ?? 'email',
                $wholesaleEmailResult ? 1 : 0,
                $acknowledgementEmailResult ? 1 : 0
            ];
            
            try {
                $stmt = $pdo->prepare($wholesaleSql);
                $stmt->execute($wholesaleParams);
                $wholesaleId = $pdo->lastInsertId();
                error_log("Wholesale submission saved to database with ID: $wholesaleId");
            } catch (PDOException $e) {
                $databaseError = $e->getMessage();
                error_log("PDO Error saving wholesale submission: " . $databaseError);
                error_log("SQL: " . $wholesaleSql);
                error_log("Params: " . json_encode($wholesaleParams));
                error_log("Error Code: " . $e->getCode());
            }
        }
    } catch (Exception $e) {
        $databaseError = $e->getMessage();
        error_log("Exception saving wholesale submission to database: " . $databaseError);
        error_log("Stack trace: " . $e->getTraceAsString());
    }
    
    // If database save failed, return error
    if ($wholesaleId === false) {
        ob_clean();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to save wholesale submission to database. ' . ($databaseError ?: 'Unknown database error'),
            'wholesaleEmailSent' => $wholesaleEmailResult,
            'acknowledgementEmailSent' => $acknowledgementEmailResult
        ]);
        ob_end_flush();
        exit();
    }
    
    // Return success response
    ob_clean();
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'wholesaleEmailSent' => $wholesaleEmailResult,
        'wholesaleEmailError' => $wholesaleEmailError,
        'acknowledgementEmailSent' => $acknowledgementEmailResult,
        'acknowledgementEmailError' => $acknowledgementEmailError,
        'warnings' => $warnings
    ]);
    
} catch (Exception $e) {
    // Clear any output
    ob_clean();
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error processing wholesale form: ' . $e->getMessage()
    ]);
    error_log('Wholesale form submission error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
}

// End output buffering
ob_end_flush();

