# Stock Management Database Schema

## Entity Relationship Diagram (Text Format)

```
┌─────────────────────────────────────────────────────────────┐
│                        products                               │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ heading                                                      │
│ name                                                         │
│ price                                                        │
│ ... (existing fields) ...                                    │
│                                                              │
│ stockQuantity (NEW)              INT DEFAULT 0              │
│ stockEnabled (NEW)               BOOLEAN DEFAULT FALSE       │
│ lowStockThreshold (NEW)          INT DEFAULT 10             │
│ allowBackorders (NEW)            BOOLEAN DEFAULT FALSE      │
│ stockStatus (NEW)                ENUM(...) DEFAULT 'in_stock'│
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 1:N
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    stock_movements                          │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ productId (FK) → products.id                                │
│ movementType                 ENUM(...)                        │
│ quantity                     INT                            │
│ previousQuantity             INT                            │
│ newQuantity                   INT                            │
│ referenceType                 ENUM(...) NULL                  │
│ referenceId                  VARCHAR(100) NULL                │
│ notes                        TEXT                            │
│ createdBy (FK) → admin_users.id NULL                        │
│ createdAt                    TIMESTAMP                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 1:N
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      stock_alerts                            │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ productId (FK) → products.id                                │
│ alertType                    ENUM(...)                       │
│ isResolved                   BOOLEAN DEFAULT FALSE           │
│ resolvedAt                   TIMESTAMP NULL                  │
│ resolvedBy (FK) → admin_users.id NULL                       │
│ notes                        TEXT                            │
│ createdAt                    TIMESTAMP                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         orders                                │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ orderId (UNIQUE)                                             │
│ ... (existing fields) ...                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 1:N
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      order_items                              │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ orderId (FK) → orders.orderId                                │
│ productId (FK) → products.id                                 │
│ productName                                                  │
│ productPrice                                                 │
│ quantity                                                     │
│ productImage                                                 │
└─────────────────────────────────────────────────────────────┘
```

## Relationships

1. **products** → **stock_movements** (1:N)
   - One product can have many stock movements
   - CASCADE DELETE: If product deleted, movements deleted

2. **products** → **stock_alerts** (1:N)
   - One product can have many stock alerts
   - CASCADE DELETE: If product deleted, alerts deleted

3. **admin_users** → **stock_movements** (1:N)
   - One admin can create many stock movements
   - SET NULL: If admin deleted, createdBy set to NULL

4. **admin_users** → **stock_alerts** (1:N)
   - One admin can resolve many stock alerts
   - SET NULL: If admin deleted, resolvedBy set to NULL

5. **orders** → **order_items** (1:N)
   - Existing relationship
   - Stock deduction happens when order is created

## Field Details

### products.stockQuantity
- Type: INT
- Default: 0
- Description: Current available stock quantity
- Constraints: Can be negative if backorders allowed

### products.stockEnabled
- Type: BOOLEAN
- Default: FALSE
- Description: Whether stock tracking is active for this product
- Behavior: When FALSE, product behaves as unlimited stock

### products.lowStockThreshold
- Type: INT
- Default: 10
- Description: Quantity at which product is considered "low stock"
- Usage: Used to calculate stockStatus and trigger alerts

### products.allowBackorders
- Type: BOOLEAN
- Default: FALSE
- Description: Whether to allow orders when stock is 0
- Impact: Affects stockStatus calculation and checkout behavior

### products.stockStatus
- Type: ENUM('in_stock', 'low_stock', 'out_of_stock', 'on_backorder')
- Default: 'in_stock'
- Description: Calculated status based on quantity and settings
- Calculation: See STOCK_MANAGEMENT_PLAN.md section 4.1

### stock_movements.movementType
- Type: ENUM('purchase', 'sale', 'adjustment', 'return', 'damaged', 'transfer')
- Description: Type of stock movement
- Values:
  - `purchase`: Stock added from supplier
  - `sale`: Stock reduced from order
  - `adjustment`: Manual correction
  - `return`: Stock returned from customer
  - `damaged`: Stock removed due to damage
  - `transfer`: Stock moved between locations (future)

### stock_movements.referenceType
- Type: ENUM('order', 'manual', 'purchase_order', 'return', 'other')
- Nullable: YES
- Description: Type of reference for this movement
- Usage: Links movement to source (e.g., order ID)

### stock_movements.referenceId
- Type: VARCHAR(100)
- Nullable: YES
- Description: ID of the reference (e.g., order ID)
- Usage: Links to specific order, purchase order, etc.

### stock_alerts.alertType
- Type: ENUM('low_stock', 'out_of_stock', 'backorder')
- Description: Type of stock alert
- Values:
  - `low_stock`: Stock below threshold
  - `out_of_stock`: Stock at 0, no backorders
  - `backorder`: Order placed for out-of-stock item

## Indexes

### products table
- `idx_stockStatus` on `stockStatus` (for filtering)
- `idx_stockEnabled` on `stockEnabled` (for filtering)
- `idx_stockQuantity` on `stockQuantity` (for sorting/filtering)

### stock_movements table
- `idx_productId` on `productId` (for product history)
- `idx_movementType` on `movementType` (for filtering)
- `idx_createdAt` on `createdAt` (for sorting)
- `idx_reference` on `(referenceType, referenceId)` (for linking)

### stock_alerts table
- `idx_productId` on `productId` (for product alerts)
- `idx_alertType` on `alertType` (for filtering)
- `idx_isResolved` on `isResolved` (for active alerts)
- `idx_createdAt` on `createdAt` (for sorting)

## Sample Queries

### Get low stock products
```sql
SELECT * FROM products 
WHERE stockEnabled = TRUE 
  AND stockStatus = 'low_stock'
ORDER BY stockQuantity ASC;
```

### Get stock history for a product
```sql
SELECT * FROM stock_movements 
WHERE productId = ? 
ORDER BY createdAt DESC 
LIMIT 50;
```

### Get active stock alerts
```sql
SELECT sa.*, p.name, p.stockQuantity 
FROM stock_alerts sa
JOIN products p ON sa.productId = p.id
WHERE sa.isResolved = FALSE
ORDER BY sa.createdAt DESC;
```

### Get stock movements for an order
```sql
SELECT sm.*, p.name 
FROM stock_movements sm
JOIN products p ON sm.productId = p.id
WHERE sm.referenceType = 'order' 
  AND sm.referenceId = ?
ORDER BY sm.createdAt DESC;
```

## Migration SQL

```sql
-- Add stock fields to products table
ALTER TABLE products 
ADD COLUMN stockQuantity INT DEFAULT 0 AFTER distributorMinQty,
ADD COLUMN stockEnabled BOOLEAN DEFAULT FALSE AFTER stockQuantity,
ADD COLUMN lowStockThreshold INT DEFAULT 10 AFTER stockEnabled,
ADD COLUMN allowBackorders BOOLEAN DEFAULT FALSE AFTER lowStockThreshold,
ADD COLUMN stockStatus ENUM('in_stock', 'low_stock', 'out_of_stock', 'on_backorder') 
    DEFAULT 'in_stock' AFTER allowBackorders;

-- Add indexes
ALTER TABLE products 
ADD INDEX idx_stockStatus (stockStatus),
ADD INDEX idx_stockEnabled (stockEnabled),
ADD INDEX idx_stockQuantity (stockQuantity);

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
    movementType ENUM('purchase', 'sale', 'adjustment', 'return', 'damaged', 'transfer') NOT NULL,
    quantity INT NOT NULL,
    previousQuantity INT NOT NULL,
    newQuantity INT NOT NULL,
    referenceType ENUM('order', 'manual', 'purchase_order', 'return', 'other') NULL,
    referenceId VARCHAR(100) NULL,
    notes TEXT,
    createdBy INT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_productId (productId),
    INDEX idx_movementType (movementType),
    INDEX idx_createdAt (createdAt),
    INDEX idx_reference (referenceType, referenceId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create stock_alerts table
CREATE TABLE IF NOT EXISTS stock_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
    alertType ENUM('low_stock', 'out_of_stock', 'backorder') NOT NULL,
    isResolved BOOLEAN DEFAULT FALSE,
    resolvedAt TIMESTAMP NULL,
    resolvedBy INT NULL,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (resolvedBy) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_productId (productId),
    INDEX idx_alertType (alertType),
    INDEX idx_isResolved (isResolved),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

