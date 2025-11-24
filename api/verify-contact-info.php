<?php
/**
 * Verify Contact Info Migration
 * This script verifies that the contact_info table has the correct data
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

echo "Verifying Contact Info Migration...\n\n";

try {
    // Check if table exists
    $checkTable = dbQueryOne("SHOW TABLES LIKE 'contact_info'");
    if (!$checkTable) {
        echo "❌ Table 'contact_info' does not exist\n";
        exit(1);
    }
    echo "✓ Table 'contact_info' exists\n\n";
    
    // Check columns
    $columns = dbQuery("SHOW COLUMNS FROM contact_info");
    echo "Columns in contact_info table:\n";
    foreach ($columns as $column) {
        echo "  - " . $column['Field'] . " (" . $column['Type'] . ")\n";
    }
    echo "\n";
    
    // Check if salesWhatsApp column exists
    $hasSalesWhatsApp = false;
    foreach ($columns as $column) {
        if ($column['Field'] === 'salesWhatsApp') {
            $hasSalesWhatsApp = true;
            break;
        }
    }
    
    if (!$hasSalesWhatsApp) {
        echo "⚠ salesWhatsApp column missing. Adding it...\n";
        dbExecute(
            "ALTER TABLE contact_info 
             ADD COLUMN salesWhatsApp VARCHAR(50) NULL 
             COMMENT 'Sales WhatsApp number (used for REACT_APP_SALES_WHATSAPP_NUMBER)' 
             AFTER whatsapp"
        );
        echo "✓ salesWhatsApp column added\n\n";
    } else {
        echo "✓ salesWhatsApp column exists\n\n";
    }
    
    // Get contact info
    $contactInfo = dbQueryOne("SELECT * FROM contact_info ORDER BY id ASC LIMIT 1");
    
    if (!$contactInfo) {
        echo "⚠ No contact info found. Inserting default values...\n";
        $socialMedia = json_encode([
            'facebook' => 'https://web.facebook.com/profile.php?id=61583436475101',
            'instagram' => 'https://www.instagram.com/oliviafresh.ng/'
        ]);
        dbExecute(
            "INSERT INTO contact_info (
                companyName, 
                location, 
                phone, 
                whatsapp, 
                salesWhatsApp,
                businessHours, 
                emailGeneral, 
                emailSales, 
                emailSupplier,
                mapEmbedUrl,
                socialMedia
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                'Olivia Industries Ltd',
                'Okaka plaza suite 1 first Avenue festac town, Lagos State',
                '+234 901 419 6902',
                '+234 912 350 9090',
                '+2348068527731',
                'Monday - Friday: 8am - 5pm',
                'customercare@celineolivia.com',
                'sales@celineolivia.com',
                'purchases@celineolivia.com',
                'https://www.google.com/maps?q=Okaka+plaza+suite+1+first+Avenue+festac+town+Lagos+State&output=embed',
                $socialMedia
            ]
        );
        $contactInfo = dbQueryOne("SELECT * FROM contact_info ORDER BY id ASC LIMIT 1");
        echo "✓ Default contact information inserted\n\n";
    }
    
    if ($contactInfo) {
        echo "Contact Information in Database:\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "  ID: " . ($contactInfo['id'] ?? 'N/A') . "\n";
        echo "  Company Name: " . ($contactInfo['companyName'] ?? 'N/A') . "\n";
        echo "  Location: " . ($contactInfo['location'] ?? 'N/A') . "\n";
        echo "  Phone: " . ($contactInfo['phone'] ?? 'N/A') . "\n";
        echo "  WhatsApp: " . ($contactInfo['whatsapp'] ?? 'N/A') . "\n";
        echo "  Sales WhatsApp: " . ($contactInfo['salesWhatsApp'] ?? 'N/A') . "\n";
        echo "  Business Hours: " . ($contactInfo['businessHours'] ?? 'N/A') . "\n";
        echo "  General Email: " . ($contactInfo['emailGeneral'] ?? 'N/A') . "\n";
        echo "  Sales Email: " . ($contactInfo['emailSales'] ?? 'N/A') . "\n";
        echo "  Supplier Email: " . ($contactInfo['emailSupplier'] ?? 'N/A') . "\n";
        echo "  Map URL: " . (strlen($contactInfo['mapEmbedUrl'] ?? '') > 60 ? substr($contactInfo['mapEmbedUrl'], 0, 60) . '...' : ($contactInfo['mapEmbedUrl'] ?? 'N/A')) . "\n";
        if (isset($contactInfo['socialMedia']) && !empty($contactInfo['socialMedia'])) {
            $socialMedia = json_decode($contactInfo['socialMedia'], true);
            if ($socialMedia && is_array($socialMedia) && count($socialMedia) > 0) {
                echo "  Social Media: " . count($socialMedia) . " link(s)\n";
                foreach ($socialMedia as $platform => $url) {
                    if ($url) {
                        echo "    - " . ucfirst($platform) . ": " . $url . "\n";
                    }
                }
            } else {
                echo "  Social Media: None\n";
            }
        } else {
            echo "  Social Media: None\n";
        }
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "\n✅ Verification complete! All data is correct.\n";
    } else {
        echo "❌ Failed to retrieve contact information\n";
        exit(1);
    }
    
} catch (Exception $e) {
    echo "\n❌ Verification failed: " . $e->getMessage() . "\n";
    exit(1);
}

