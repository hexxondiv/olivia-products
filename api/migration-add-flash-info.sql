-- Migration: Add Flash Info Table
-- This table stores flash information that can display images, videos, GIFs, or formatted text

CREATE TABLE IF NOT EXISTS flash_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    contentType ENUM('image', 'video', 'gif', 'text') NOT NULL DEFAULT 'text',
    contentUrl VARCHAR(1000) NULL, -- URL for image, video, or gif
    contentText TEXT NULL, -- HTML formatted text content
    displayOrder INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_isActive (isActive),
    INDEX idx_displayOrder (displayOrder),
    INDEX idx_contentType (contentType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

