-- Home Slides Table
CREATE TABLE IF NOT EXISTS home_slides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mainPicture VARCHAR(1000) NOT NULL COMMENT 'Background image URL',
    text TEXT NOT NULL COMMENT 'Slide text content',
    targetImg VARCHAR(1000) NOT NULL COMMENT 'Overlay/target image URL',
    linkType ENUM('category', 'product', 'none') DEFAULT 'none' COMMENT 'Type of link',
    linkValue VARCHAR(500) NULL COMMENT 'Category name or product ID',
    displayOrder INT DEFAULT 0 COMMENT 'Display order (lower numbers first)',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_isActive (isActive),
    INDEX idx_displayOrder (displayOrder),
    INDEX idx_linkType (linkType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

