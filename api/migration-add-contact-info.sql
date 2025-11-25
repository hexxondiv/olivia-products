-- Migration: Add Contact Information Table
-- This migration adds a table for managing company contact information in the CMS

USE olivia_products;

-- Contact Information Table (for managing company contact details)
CREATE TABLE IF NOT EXISTS contact_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    companyName VARCHAR(255) NOT NULL DEFAULT 'Olivia Industries Ltd',
    location TEXT NOT NULL,
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    salesWhatsApp VARCHAR(50) COMMENT 'Sales WhatsApp number (used for SALES WHATSAPP MESSAGES)',
    businessHours VARCHAR(255),
    emailGeneral VARCHAR(255) COMMENT 'General enquiries email',
    emailSales VARCHAR(255) COMMENT 'Sales enquiries email',
    emailSupplier VARCHAR(255) COMMENT 'Supplier enquiries email',
    mapEmbedUrl TEXT COMMENT 'Google Maps embed URL or address for map',
    socialMedia JSON COMMENT 'Social media links (Facebook, Instagram, Twitter, etc.)',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_companyName (companyName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default contact information
INSERT INTO contact_info (
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
) VALUES (
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
    '{"facebook":"https://web.facebook.com/profile.php?id=61583436475101","instagram":"https://www.instagram.com/oliviafresh.ng/"}'
) ON DUPLICATE KEY UPDATE companyName=companyName;

