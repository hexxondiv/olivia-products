-- Migration: Add Product Reviews Table
-- This table stores product ratings and reviews from users with validated order IDs

CREATE TABLE IF NOT EXISTS product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
    orderId VARCHAR(50) NOT NULL,
    customerName VARCHAR(255) NOT NULL,
    customerEmail VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    reviewText TEXT,
    isApproved BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (orderId) REFERENCES orders(orderId) ON DELETE CASCADE,
    INDEX idx_productId (productId),
    INDEX idx_orderId (orderId),
    INDEX idx_isApproved (isApproved),
    INDEX idx_createdAt (createdAt),
    -- Prevent duplicate reviews from same order for same product
    UNIQUE KEY unique_order_product (orderId, productId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

