-- Migration: Add FAQs and Submitted Questions Tables
-- Run this SQL to add FAQ management functionality

-- USE statement removed - database is determined by DB_NAME in config.php
-- For localhost: olivia_products
-- For production: celicoyh_olivia

-- FAQs Table (for published FAQ items)
CREATE TABLE IF NOT EXISTS faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    backgroundColor VARCHAR(7) DEFAULT '#f5f7fa',
    displayOrder INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_isActive (isActive),
    INDEX idx_displayOrder (displayOrder),
    FULLTEXT idx_search (question, answer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Submitted Questions Table (for questions submitted by users)
CREATE TABLE IF NOT EXISTS submitted_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    phone VARCHAR(50),
    status ENUM('pending', 'answered', 'archived') DEFAULT 'pending',
    answer TEXT NULL,
    answeredBy INT NULL,
    answeredAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (answeredBy) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_createdAt (createdAt),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

