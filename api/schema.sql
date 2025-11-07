-- Olivia Products CMS Database Schema
-- Run this SQL to create the database and tables

CREATE DATABASE IF NOT EXISTS olivia_products CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE olivia_products;

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    heading VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    sufix VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 1) DEFAULT 0.0,
    color VARCHAR(50),
    detail TEXT,
    moreDetail TEXT,
    tagline VARCHAR(500),
    firstImg VARCHAR(500),
    hoverImg VARCHAR(500),
    additionalImgs JSON,
    category JSON,
    flavours JSON,
    bestSeller BOOLEAN DEFAULT FALSE,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bestSeller (bestSeller),
    INDEX idx_isActive (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orderId VARCHAR(50) UNIQUE NOT NULL,
    customerName VARCHAR(255) NOT NULL,
    customerEmail VARCHAR(255) NOT NULL,
    customerPhone VARCHAR(50) NOT NULL,
    customerAddress TEXT NOT NULL,
    customerCity VARCHAR(100) NOT NULL,
    customerState VARCHAR(100) NOT NULL,
    customerPostalCode VARCHAR(20),
    customerNotes TEXT,
    totalAmount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    submittedVia ENUM('email', 'whatsapp') DEFAULT 'email',
    salesEmailSent BOOLEAN DEFAULT FALSE,
    customerEmailSent BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_orderId (orderId),
    INDEX idx_status (status),
    INDEX idx_customerEmail (customerEmail),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orderId VARCHAR(50) NOT NULL,
    productId INT,
    productName VARCHAR(255) NOT NULL,
    productPrice DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    productImage VARCHAR(500),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderId) REFERENCES orders(orderId) ON DELETE CASCADE,
    INDEX idx_orderId (orderId),
    INDEX idx_productId (productId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact Form Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
    submittedVia ENUM('email', 'whatsapp') DEFAULT 'email',
    contactEmailSent BOOLEAN DEFAULT FALSE,
    acknowledgementEmailSent BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_createdAt (createdAt),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wholesale Form Submissions Table
CREATE TABLE IF NOT EXISTS wholesale_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    formType ENUM('wholesale', 'distribution', 'retail') NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    businessName VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    aboutBusiness TEXT NOT NULL,
    businessTypes JSON,
    status ENUM('new', 'reviewing', 'approved', 'rejected', 'archived') DEFAULT 'new',
    submittedVia ENUM('email', 'whatsapp') DEFAULT 'email',
    wholesaleEmailSent BOOLEAN DEFAULT FALSE,
    acknowledgementEmailSent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_formType (formType),
    INDEX idx_createdAt (createdAt),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Users Table (for CMS authentication)
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    fullName VARCHAR(255),
    role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
    isActive BOOLEAN DEFAULT TRUE,
    lastLogin TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create default admin user (password: admin123 - CHANGE THIS!)
-- Note: Use seed-admin.php to create/update admin user with proper password hash
-- This INSERT will create the user if it doesn't exist, but won't update password if user exists
-- Run: php api/seed-admin.php to ensure password hash is correct
INSERT INTO admin_users (username, email, passwordHash, fullName, role) 
VALUES ('admin', 'admin@oliviaproducts.com', '$2y$12$GnPmpJfz7JNR1bIuTGW/yudJ9VY5e0Uk0ypIJYCo8TpZ91EX/J/3W', 'Administrator', 'admin')
ON DUPLICATE KEY UPDATE username=username;

