<?php
/**
 * Dynamic Sitemap Generator for Olivia Products
 * 
 * This script generates a sitemap.xml file dynamically based on:
 * - Static pages (defined in routes)
 * - Products from the database
 * 
 * Usage: Access via browser or cron job
 * Example: https://celineolivia.com/api/generate-sitemap.php
 */

header('Content-Type: application/xml; charset=utf-8');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

$db = getDB();

// Base URL
$baseUrl = 'https://celineolivia.com';
$currentDate = date('Y-m-d');

// Start XML output
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
echo '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' . "\n";
echo '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9' . "\n";
echo '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' . "\n";

// Function to output a URL entry
function outputUrl($loc, $lastmod, $changefreq = 'weekly', $priority = '0.8') {
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($loc, ENT_XML1, 'UTF-8') . "</loc>\n";
    echo "    <lastmod>" . htmlspecialchars($lastmod, ENT_XML1, 'UTF-8') . "</lastmod>\n";
    echo "    <changefreq>" . htmlspecialchars($changefreq, ENT_XML1, 'UTF-8') . "</changefreq>\n";
    echo "    <priority>" . htmlspecialchars($priority, ENT_XML1, 'UTF-8') . "</priority>\n";
    echo "  </url>\n";
}

// Static Pages
$staticPages = [
    ['/', '1.0', 'weekly'],
    ['/collections', '0.9', 'weekly'],
    ['/about-us', '0.8', 'monthly'],
    ['/contact-us', '0.8', 'monthly'],
    ['/our-mission', '0.7', 'monthly'],
    ['/wholesale-page', '0.8', 'monthly'],
    ['/faqs', '0.7', 'monthly'],
    ['/careers', '0.6', 'monthly'],
];

foreach ($staticPages as $page) {
    outputUrl($baseUrl . $page[0], $currentDate, $page[2], $page[1]);
}

// Product Pages
try {
    $stmt = $db->prepare("
        SELECT id, updated_at 
        FROM products 
        WHERE active = 1 
        ORDER BY id ASC
    ");
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($products as $product) {
        $lastmod = $product['updated_at'] 
            ? date('Y-m-d', strtotime($product['updated_at'])) 
            : $currentDate;
        outputUrl(
            $baseUrl . '/product/' . $product['id'],
            $lastmod,
            'weekly',
            '0.8'
        );
    }
} catch (PDOException $e) {
    // Log error but continue with static pages
    error_log("Sitemap generation error: " . $e->getMessage());
}

// Category Collections (if you have categories)
try {
    $stmt = $db->prepare("
        SELECT DISTINCT category 
        FROM products 
        WHERE active = 1 AND category IS NOT NULL AND category != ''
        ORDER BY category ASC
    ");
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($categories as $category) {
        if (!empty($category)) {
            $categoryEncoded = urlencode($category);
            outputUrl(
                $baseUrl . '/collections?category=' . $categoryEncoded,
                $currentDate,
                'weekly',
                '0.7'
            );
        }
    }
} catch (PDOException $e) {
    // Log error but continue
    error_log("Sitemap category generation error: " . $e->getMessage());
}

// Close XML
echo '</urlset>';

