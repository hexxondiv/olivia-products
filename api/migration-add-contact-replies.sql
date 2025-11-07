-- Migration: Add contact_replies table
-- This table stores all replies sent to contact submissions
-- Run this SQL to add the contact_replies table to your database

USE olivia_products;

CREATE TABLE IF NOT EXISTS contact_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contactId INT NOT NULL,
    replyType ENUM('email', 'whatsapp') NOT NULL,
    message TEXT NOT NULL,
    sentTo VARCHAR(255) NOT NULL, -- email address or phone number
    sentBy INT NULL, -- admin user ID who sent the reply
    sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('sent', 'failed', 'pending') DEFAULT 'sent',
    errorMessage TEXT NULL,
    FOREIGN KEY (contactId) REFERENCES contact_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (sentBy) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_contactId (contactId),
    INDEX idx_replyType (replyType),
    INDEX idx_sentAt (sentAt),
    INDEX idx_sentBy (sentBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

