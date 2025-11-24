<?php
/**
 * Run Contact Info Migration
 * This script runs the migration to create the contact_info table with default values
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

echo "Starting Contact Info Migration...\n\n";

try {
    // Read the migration SQL file
    $migrationFile = __DIR__ . '/migration-add-contact-info.sql';
    
    if (!file_exists($migrationFile)) {
        throw new Exception("Migration file not found: $migrationFile");
    }
    
    $sql = file_get_contents($migrationFile);
    
    // Remove the USE statement as we'll use the database from config
    $sql = preg_replace('/^USE\s+\w+;?\s*/mi', '', $sql);
    
    // Split by semicolons but keep multi-line statements together
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt) && !preg_match('/^--/', $stmt);
        }
    );
    
    // Create table
    $createTableSql = "CREATE TABLE IF NOT EXISTS contact_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        companyName VARCHAR(255) NOT NULL DEFAULT 'Olivia Industries Ltd',
        location TEXT NOT NULL,
        phone VARCHAR(50),
        whatsapp VARCHAR(50),
        salesWhatsApp VARCHAR(50) COMMENT 'Sales WhatsApp number (used for REACT_APP_SALES_WHATSAPP_NUMBER)',
        businessHours VARCHAR(255),
        emailGeneral VARCHAR(255) COMMENT 'General enquiries email',
        emailSales VARCHAR(255) COMMENT 'Sales enquiries email',
        emailSupplier VARCHAR(255) COMMENT 'Supplier enquiries email',
        mapEmbedUrl TEXT COMMENT 'Google Maps embed URL or address for map',
        socialMedia JSON COMMENT 'Social media links (Facebook, Instagram, Twitter, etc.)',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_companyName (companyName)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $result = dbExecute($createTableSql);
    if ($result !== false) {
        echo "✓ Table 'contact_info' created or already exists\n";
    } else {
        // Check if table already exists
        $checkTable = dbQueryOne("SHOW TABLES LIKE 'contact_info'");
        if ($checkTable) {
            echo "✓ Table 'contact_info' already exists\n";
        } else {
            throw new Exception("Failed to create contact_info table");
        }
    }
    
    // Verify the table was created and has data
    $checkTable = dbQueryOne("SHOW TABLES LIKE 'contact_info'");
    if ($checkTable) {
        echo "\n✓ Table 'contact_info' exists\n";
        
        $count = dbQueryOne("SELECT COUNT(*) as count FROM contact_info");
        if ($count && $count['count'] > 0) {
            echo "✓ Contact info record found in database\n";
            
            // Display the inserted data
            $contactInfo = dbQueryOne("SELECT * FROM contact_info ORDER BY id ASC LIMIT 1");
            if ($contactInfo) {
                echo "\nContact Information:\n";
                echo "  Company: " . ($contactInfo['companyName'] ?? 'N/A') . "\n";
                echo "  Location: " . ($contactInfo['location'] ?? 'N/A') . "\n";
                echo "  Phone: " . ($contactInfo['phone'] ?? 'N/A') . "\n";
                echo "  WhatsApp: " . ($contactInfo['whatsapp'] ?? 'N/A') . "\n";
                echo "  Sales WhatsApp: " . ($contactInfo['salesWhatsApp'] ?? 'N/A') . "\n";
                echo "  Business Hours: " . ($contactInfo['businessHours'] ?? 'N/A') . "\n";
                echo "  General Email: " . ($contactInfo['emailGeneral'] ?? 'N/A') . "\n";
                echo "  Sales Email: " . ($contactInfo['emailSales'] ?? 'N/A') . "\n";
                echo "  Supplier Email: " . ($contactInfo['emailSupplier'] ?? 'N/A') . "\n";
            }
        } else {
            echo "⚠ No contact info records found. Inserting default values...\n";
            
            // Insert default values with social media links from static pages
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
            echo "✓ Default contact information inserted\n";
        }
    } else {
        throw new Exception("Table 'contact_info' was not created");
    }
    
    // Check if salesWhatsApp column exists, if not add it
    $checkColumn = dbQueryOne(
        "SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'contact_info' 
         AND COLUMN_NAME = 'salesWhatsApp'"
    );
    
    if (!$checkColumn || $checkColumn['count'] == 0) {
        echo "\n⚠ Adding salesWhatsApp column...\n";
        dbExecute(
            "ALTER TABLE contact_info 
             ADD COLUMN salesWhatsApp VARCHAR(50) NULL 
             COMMENT 'Sales WhatsApp number (used for REACT_APP_SALES_WHATSAPP_NUMBER)' 
             AFTER whatsapp"
        );
        
        // Update existing records
        dbExecute(
            "UPDATE contact_info 
             SET salesWhatsApp = '+2348068527731' 
             WHERE salesWhatsApp IS NULL OR salesWhatsApp = ''"
        );
        echo "✓ salesWhatsApp column added and updated\n";
    }
    
    echo "\n✅ Migration completed successfully!\n";
    
} catch (Exception $e) {
    echo "\n❌ Migration failed: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}

