<?php
/**
 * Seed FAQs
 * Migrates the original hardcoded FAQ data from FAQPage.js to the database
 * 
 * Usage: php seed-faqs.php
 * Or via web: /api/seed-faqs.php?run=1
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

// Only allow running from command line or with explicit parameter
$isWebRequest = isset($_SERVER['REQUEST_METHOD']);
$runFromWeb = isset($_GET['run']) && $_GET['run'] === '1';

if ($isWebRequest && !$runFromWeb) {
    http_response_code(403);
    die("Access denied. Add ?run=1 to execute.");
}

// Original FAQ data from FAQPage.js (before migration)
$faqsData = [
    [
        'question' => 'How can I track my order?',
        'answer' => 'You will receive a tracking number via email once your order ships.',
        'backgroundColor' => '#F2E7FF',
        'displayOrder' => 1,
        'isActive' => true
    ],
    [
        'question' => 'What is your return policy?',
        'answer' => 'Our return policy lasts 30 days with a full refund.',
        'backgroundColor' => '#DEEAFF',
        'displayOrder' => 2,
        'isActive' => true
    ],
    [
        'question' => 'Do you offer international shipping?',
        'answer' => 'Yes, we ship to over 50 countries worldwide.',
        'backgroundColor' => '#FFF2DF',
        'displayOrder' => 3,
        'isActive' => true
    ]
];

function seedFAQs($faqsData) {
    $pdo = getDBConnection();
    if (!$pdo) {
        return ['success' => false, 'message' => 'Database connection failed'];
    }
    
    try {
        $inserted = 0;
        $skipped = 0;
        $errors = [];
        
        dbBeginTransaction();
        
        foreach ($faqsData as $faq) {
            // Check if FAQ already exists (by question text)
            $existing = dbQueryOne(
                "SELECT id FROM faqs WHERE question = ?",
                [$faq['question']]
            );
            
            if ($existing) {
                $skipped++;
                echo "Skipped (already exists): {$faq['question']}\n";
                continue;
            }
            
            // Insert FAQ
            $sql = "INSERT INTO faqs (question, answer, backgroundColor, displayOrder, isActive) 
                    VALUES (?, ?, ?, ?, ?)";
            
            $params = [
                $faq['question'],
                $faq['answer'],
                $faq['backgroundColor'] ?? '#f5f7fa',
                $faq['displayOrder'] ?? 0,
                isset($faq['isActive']) ? (int)$faq['isActive'] : 1
            ];
            
            $id = dbExecute($sql, $params);
            
            if ($id) {
                $inserted++;
                echo "Inserted: {$faq['question']}\n";
            } else {
                $errors[] = "Failed to insert: {$faq['question']}";
                echo "Error: Failed to insert {$faq['question']}\n";
            }
        }
        
        dbCommit();
        
        return [
            'success' => true,
            'message' => "Seeding completed: $inserted inserted, $skipped skipped",
            'inserted' => $inserted,
            'skipped' => $skipped,
            'errors' => $errors
        ];
    } catch (Exception $e) {
        dbRollback();
        return [
            'success' => false,
            'message' => 'Seeding failed: ' . $e->getMessage(),
            'errors' => $errors
        ];
    }
}

// Run seeding
echo "Starting FAQ seeding...\n\n";
$result = seedFAQs($faqsData);

echo "\n";
if ($result['success']) {
    echo "✓ " . $result['message'] . "\n";
    if (!empty($result['errors'])) {
        echo "\nErrors:\n";
        foreach ($result['errors'] as $error) {
            echo "  - $error\n";
        }
    }
} else {
    echo "✗ " . $result['message'] . "\n";
    if (!empty($result['errors'])) {
        echo "\nErrors:\n";
        foreach ($result['errors'] as $error) {
            echo "  - $error\n";
        }
    }
    exit(1);
}

if ($isWebRequest) {
    header('Content-Type: application/json');
    echo json_encode($result);
}

