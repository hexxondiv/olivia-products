<?php
/**
 * Submit Question API
 * Endpoint: POST /api/submit-question.php
 * Allows users to submit questions that can be answered and converted to FAQs
 */

ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

ob_clean();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_clean();
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    ob_end_flush();
    exit();
}

$input = file_get_contents('php://input');
$questionData = json_decode($input, true);

// Validate input
if (!$questionData) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    ob_end_flush();
    exit();
}

// Validate required field
if (empty($questionData['question']) || trim($questionData['question']) === '') {
    ob_clean();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Question is required']);
    ob_end_flush();
    exit();
}

try {
    // Save submitted question to database
    $sql = "INSERT INTO submitted_questions (question, email, name, phone, status) 
            VALUES (?, ?, ?, ?, 'pending')";
    
    $params = [
        trim($questionData['question']),
        !empty($questionData['email']) ? trim($questionData['email']) : null,
        !empty($questionData['name']) ? trim($questionData['name']) : null,
        !empty($questionData['phone']) ? trim($questionData['phone']) : null
    ];
    
    $questionId = dbExecute($sql, $params);
    
    if ($questionId) {
        error_log("Question submitted successfully with ID: $questionId");
        
        ob_clean();
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Question submitted successfully. We will get back to you soon!',
            'questionId' => $questionId
        ]);
    } else {
        error_log("Failed to save submitted question");
        
        ob_clean();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to submit question. Please try again.'
        ]);
    }
} catch (Exception $e) {
    error_log('Submit question error: ' . $e->getMessage());
    
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error submitting question: ' . $e->getMessage()
    ]);
}

ob_end_flush();

