<?php
/**
 * Seed Testimonials from JSON file
 * This script migrates existing testimonial data from testimonialData.json to the database
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

// Try multiple possible locations for the JSON file
// 1. In web root (production deployment)
// 2. In public directory (development)
// 3. In api directory (fallback)
$possiblePaths = [
    dirname(__DIR__) . '/testimonialData.json',  // Web root (production)
    __DIR__ . '/../public/testimonialData.json',  // Public directory (development)
    __DIR__ . '/testimonialData.json'             // API directory (fallback)
];

$jsonFile = null;
foreach ($possiblePaths as $path) {
    if (file_exists($path)) {
        $jsonFile = $path;
        break;
    }
}

if (!$jsonFile) {
    echo "Error: testimonialData.json not found. Tried:\n";
    foreach ($possiblePaths as $path) {
        echo "  - $path\n";
    }
    echo "\nPlease ensure testimonialData.json is uploaded to your web root (public_html/)\n";
    exit(1);
}

echo "Using testimonialData.json from: $jsonFile\n\n";

$jsonData = file_get_contents($jsonFile);
$testimonials = json_decode($jsonData, true);

if (!$testimonials || !is_array($testimonials)) {
    echo "Error: Invalid JSON data in testimonialData.json\n";
    exit(1);
}

echo "Found " . count($testimonials) . " testimonials to migrate\n\n";

$inserted = 0;
$skipped = 0;

foreach ($testimonials as $index => $testimonial) {
    // Check if testimonial already exists (by name and comment)
    $existing = dbQueryOne(
        "SELECT id FROM testimonials WHERE name = ? AND comment = ?",
        [$testimonial['name'], $testimonial['comment']]
    );
    
    if ($existing) {
        echo "Skipping: {$testimonial['name']} (already exists)\n";
        $skipped++;
        continue;
    }
    
    // Insert testimonial
    $sql = "INSERT INTO testimonials (name, comment, rating, backgroundColor, displayOrder, isActive) 
            VALUES (?, ?, ?, ?, ?, ?)";
    
    $params = [
        $testimonial['name'] ?? '',
        $testimonial['comment'] ?? '',
        isset($testimonial['rating']) ? (int)$testimonial['rating'] : 5,
        $testimonial['backgroundColor'] ?? '#f5f7fa',
        $index, // Use array index as display order
        1 // Active by default
    ];
    
    $id = dbExecute($sql, $params);
    
    if ($id) {
        echo "Inserted: {$testimonial['name']} (ID: $id)\n";
        $inserted++;
    } else {
        echo "Error: Failed to insert {$testimonial['name']}\n";
    }
}

echo "\nMigration complete!\n";
echo "Inserted: $inserted\n";
echo "Skipped: $skipped\n";

