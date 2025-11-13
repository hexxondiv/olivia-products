-- Migration: Add roles table and update admin_users to use it
-- This migration creates a roles table and updates admin_users to reference it

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('admin', 'Administrator with full access'),
('sales', 'Sales team member'),
('support', 'Customer support team member')
ON DUPLICATE KEY UPDATE name=name;

-- Add roleId column to admin_users (nullable initially for migration)
-- Note: Run this migration only once. If column exists, you'll get an error - that's OK, just continue.
ALTER TABLE admin_users 
ADD COLUMN roleId INT NULL AFTER role;

-- Add index
ALTER TABLE admin_users 
ADD INDEX idx_roleId (roleId);

-- Add foreign key constraint
-- Note: If constraint exists, you'll get an error - that's OK.
ALTER TABLE admin_users
ADD CONSTRAINT fk_admin_users_role 
FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE RESTRICT;

-- Migrate existing role data to roleId
-- Map old ENUM values to new role IDs
UPDATE admin_users au
INNER JOIN roles r ON 
    CASE au.role
        WHEN 'admin' THEN r.name = 'admin'
        WHEN 'manager' THEN r.name = 'admin'  -- Map manager to admin
        WHEN 'staff' THEN r.name = 'support'  -- Map staff to support
        ELSE r.name = 'support'
    END
SET au.roleId = r.id
WHERE au.roleId IS NULL;

-- Make roleId NOT NULL after migration
ALTER TABLE admin_users 
MODIFY COLUMN roleId INT NOT NULL;

-- Drop the old role ENUM column (optional - can be kept for backward compatibility)
-- ALTER TABLE admin_users DROP COLUMN role;

