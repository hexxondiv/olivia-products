# Product Stock Management Scheme

## Overview
This document outlines the comprehensive plan for implementing stock/inventory management for the Olivia Products e-commerce system. The system will track product quantities, manage stock levels, prevent overselling, and provide inventory management tools in the CMS.

---

## 1. Database Schema Changes

### 1.1 Products Table Modifications
Add stock-related fields to the existing `products` table:

```sql
ALTER TABLE products ADD COLUMN stockQuantity INT DEFAULT 0;
ALTER TABLE products ADD COLUMN stockEnabled BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN lowStockThreshold INT DEFAULT 10;
ALTER TABLE products ADD COLUMN allowBackorders BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN stockStatus ENUM('in_stock', 'low_stock', 'out_of_stock', 'on_backorder') DEFAULT 'in_stock';
```

**Field Descriptions:**
- `stockQuantity`: Current available stock quantity (INT, default 0)
- `stockEnabled`: Whether stock tracking is enabled for this product (BOOLEAN, default FALSE)
  - When FALSE: Product behaves as "unlimited stock" (current behavior)
  - When TRUE: Stock tracking is active
- `lowStockThreshold`: Quantity at which product is considered "low stock" (INT, default 10)
- `allowBackorders`: Whether to allow orders when stock is 0 (BOOLEAN, default FALSE)
- `stockStatus`: Calculated status based on quantity and thresholds (ENUM)
  - `in_stock`: Quantity > lowStockThreshold
  - `low_stock`: 0 < quantity <= lowStockThreshold
  - `out_of_stock`: Quantity = 0 AND allowBackorders = FALSE
  - `on_backorder`: Quantity = 0 AND allowBackorders = TRUE

### 1.2 Stock Movements Table (New)
Track all stock changes for audit trail and reporting:

```sql
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
```

**Movement Types:**
- `purchase`: Stock added from supplier
- `sale`: Stock reduced from order
- `adjustment`: Manual correction/adjustment
- `return`: Stock returned from customer
- `damaged`: Stock removed due to damage
- `transfer`: Stock moved between locations (future use)

### 1.3 Stock Alerts Table (New)
Track low stock and out of stock alerts:

```sql
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

---

## 2. Backend API Changes

### 2.1 Products API (`api/products.php`)

#### New Endpoints/Functionality:

**GET `/api/products.php?stockStatus=low_stock`**
- Filter products by stock status
- Return products with low stock or out of stock

**PUT `/api/products.php?id=X` - Stock Update**
- Allow updating stockQuantity, stockEnabled, lowStockThreshold, allowBackorders
- Automatically calculate and update stockStatus
- Create stock_movement record for manual adjustments

**POST `/api/products.php/stock/adjust`**
- Dedicated endpoint for stock adjustments
- Requires: productId, quantity (positive or negative), notes, referenceType, referenceId
- Creates stock_movement record
- Updates product stockQuantity

**GET `/api/products.php?id=X&includeStockHistory=true`**
- Include stock movement history in product response

### 2.2 Stock Management API (`api/stock.php` - New File)

**Endpoints:**
- `GET /api/stock.php?productId=X` - Get stock info and history
- `GET /api/stock.php?status=low_stock` - Get all low stock products
- `POST /api/stock.php/adjust` - Adjust stock (with movement record)
- `GET /api/stock.php/alerts` - Get active stock alerts
- `PUT /api/stock.php/alerts/:id/resolve` - Resolve stock alert

### 2.3 Orders API (`api/orders.php`) - Modifications

**Order Submission (`api/submit-order.php`):**
1. **Stock Validation Phase:**
   - Before creating order, validate stock for each item
   - Check if product has stockEnabled = TRUE
   - Verify stockQuantity >= requested quantity (or allowBackorders)
   - Return error if stock insufficient

2. **Stock Deduction Phase:**
   - After order is successfully created, deduct stock
   - Create stock_movement records for each item
   - Update product stockQuantity
   - Update stockStatus if needed
   - Create stock_alerts if threshold crossed

**Order Cancellation:**
- Restore stock when order is cancelled
- Create stock_movement record with type 'return'

### 2.4 Stock Helper Functions (`api/stock-helper.php` - New File)

Functions to be created:
- `updateProductStock($productId, $quantityChange, $movementType, $referenceType, $referenceId, $notes, $userId)`
- `calculateStockStatus($product)`
- `checkStockAvailability($productId, $requestedQuantity)`
- `createStockAlert($productId, $alertType)`
- `resolveStockAlert($alertId, $userId, $notes)`
- `getStockHistory($productId, $limit = 50)`

---

## 3. Frontend Changes

### 3.1 CMS Products Page (`src/Pages/CMS/CMSProducts.tsx`)

#### UI Additions:

1. **Stock Management Section in Product Form:**
   - Toggle: "Enable Stock Tracking"
   - Input: "Current Stock Quantity"
   - Input: "Low Stock Threshold"
   - Toggle: "Allow Backorders"
   - Display: "Stock Status" (read-only, calculated)
   - Button: "View Stock History"

2. **Products Table Enhancements:**
   - Add "Stock" column showing:
     - Quantity (if stockEnabled)
     - Status badge (In Stock / Low Stock / Out of Stock / On Backorder)
   - Color coding:
     - Green: In Stock
     - Yellow: Low Stock
     - Red: Out of Stock
     - Orange: On Backorder

3. **Stock Quick Actions:**
   - Quick adjust stock button in table row
   - Bulk stock update feature
   - Stock alerts indicator in header

4. **Stock History Modal:**
   - Show all stock movements for a product
   - Filter by movement type
   - Show reference (order ID, manual adjustment, etc.)

### 3.2 New CMS Stock Management Page (`src/Pages/CMS/CMSStock.tsx`)

Dedicated page for stock management:
- Dashboard view with:
  - Total products with stock enabled
  - Low stock count
  - Out of stock count
  - Recent stock movements
- Low stock alerts list
- Bulk stock adjustment tool
- Stock reports/analytics

### 3.3 Product Display Pages

#### View Product Page (`src/Pages/ViewProductPage/ViewProductPage.tsx`):
- Show stock status to customers:
  - "In Stock" badge (if stockEnabled and stockQuantity > 0)
  - "Low Stock - Only X left!" (if low stock)
  - "Out of Stock" (if out of stock)
  - "Available for Backorder" (if allowBackorders)
- Disable "Add to Cart" if out of stock and no backorders
- Show quantity selector max based on available stock

#### Product Listing Pages:
- Filter out out-of-stock products (optional, configurable)
- Show stock badges on product cards

### 3.4 Checkout Page (`src/Pages/CheckoutPage/CheckoutPage.tsx`)

#### Stock Validation:
- Before allowing checkout, validate stock for all cart items
- Show warnings if stock is low
- Prevent checkout if items are out of stock (unless backorder allowed)
- Update cart quantities if requested quantity exceeds available stock
- Show stock status for each item in order summary

### 3.5 Cart Context (`src/CartContext.tsx`)

#### Enhancements:
- Check stock availability when adding items
- Prevent adding more than available stock
- Show stock warnings in cart
- Auto-adjust quantities if stock changes

---

## 4. Stock Status Calculation Logic

### 4.1 Status Determination

```php
function calculateStockStatus($product) {
    if (!$product['stockEnabled']) {
        return null; // Stock tracking disabled
    }
    
    $quantity = (int)$product['stockQuantity'];
    $threshold = (int)$product['lowStockThreshold'];
    $allowBackorders = (bool)$product['allowBackorders'];
    
    if ($quantity > $threshold) {
        return 'in_stock';
    } elseif ($quantity > 0 && $quantity <= $threshold) {
        return 'low_stock';
    } elseif ($quantity == 0 && $allowBackorders) {
        return 'on_backorder';
    } else {
        return 'out_of_stock';
    }
}
```

### 4.2 Automatic Status Updates

- Update `stockStatus` field whenever:
  - Stock quantity changes
  - `lowStockThreshold` changes
  - `allowBackorders` changes
  - `stockEnabled` is toggled

---

## 5. Stock Movement Workflow

### 5.1 Order Placement Flow

```
1. Customer adds items to cart
2. Customer proceeds to checkout
3. Frontend validates stock (optional, for UX)
4. Order submitted to backend
5. Backend validates stock for all items
   - If insufficient: Return error, prevent order creation
   - If sufficient: Continue
6. Create order record
7. For each order item:
   - Deduct stockQuantity
   - Create stock_movement (type: 'sale')
   - Update stockStatus
   - Check if alert needed (low/out of stock)
8. Return success
```

### 5.2 Manual Stock Adjustment Flow

```
1. Admin opens product in CMS
2. Admin adjusts stock quantity
3. System calculates difference
4. Create stock_movement (type: 'adjustment')
5. Update product stockQuantity
6. Update stockStatus
7. Check if alert needed
```

### 5.3 Stock Purchase/Receiving Flow

```
1. Admin receives stock from supplier
2. Admin adds stock via CMS
3. Create stock_movement (type: 'purchase')
4. Update product stockQuantity
5. Update stockStatus
6. Resolve any out_of_stock alerts if stock restored
```

---

## 6. Stock Alerts System

### 6.1 Alert Creation Triggers

- **Low Stock Alert:**
  - Created when stockQuantity <= lowStockThreshold
  - Only if no active low_stock alert exists

- **Out of Stock Alert:**
  - Created when stockQuantity = 0 AND allowBackorders = FALSE
  - Only if no active out_of_stock alert exists

- **Backorder Alert:**
  - Created when order placed for out-of-stock item with backorders enabled
  - Optional: Track backorder quantities

### 6.2 Alert Resolution

- Alerts auto-resolve when:
  - Stock is added and crosses threshold
  - Product stockEnabled is disabled
- Manual resolution:
  - Admin can mark alert as resolved
  - Add notes explaining resolution

### 6.3 Alert Notifications

- Display in CMS dashboard
- Optional: Email notifications to admins
- Optional: Dashboard widget showing active alerts

---

## 7. Migration Strategy

### 7.1 Database Migration

1. **Phase 1: Add Stock Fields**
   ```sql
   -- Run migration script
   -- Set all existing products: stockEnabled = FALSE (maintain current behavior)
   -- Set stockQuantity = 0 for all
   ```

2. **Phase 2: Enable Stock Tracking (Gradual)**
   - Admin enables stock tracking per product
   - Set initial stock quantities
   - System starts tracking from that point

3. **Phase 3: Historical Data (Optional)**
   - Analyze past orders to estimate current stock
   - Manual adjustment may be needed

### 7.2 Code Deployment

1. Deploy database changes
2. Deploy backend API changes
3. Deploy frontend CMS changes
4. Deploy frontend customer-facing changes
5. Test thoroughly in staging

---

## 8. Testing Checklist

### 8.1 Backend Tests
- [ ] Stock validation prevents overselling
- [ ] Stock deduction on order creation
- [ ] Stock restoration on order cancellation
- [ ] Stock movement records created correctly
- [ ] Stock status calculation accurate
- [ ] Stock alerts created/resolved correctly
- [ ] Backorder handling works correctly

### 8.2 Frontend Tests
- [ ] CMS stock management UI functional
- [ ] Stock status displays correctly
- [ ] Stock validation in checkout
- [ ] Cart respects stock limits
- [ ] Product pages show stock status
- [ ] Stock history displays correctly

### 8.3 Integration Tests
- [ ] End-to-end order flow with stock
- [ ] Stock alerts workflow
- [ ] Multiple concurrent orders
- [ ] Edge cases (negative stock, etc.)

---

## 9. Configuration Options

### 9.1 System-Wide Settings

- Default low stock threshold
- Default allow backorders setting
- Stock validation strictness (warn vs. block)
- Auto-hide out of stock products
- Email notifications for stock alerts

### 9.2 Per-Product Settings

- Enable/disable stock tracking
- Stock quantity
- Low stock threshold
- Allow backorders

---

## 10. Future Enhancements

### 10.1 Advanced Features (Phase 2)
- Multi-location inventory
- Stock reservations (hold stock for X minutes during checkout)
- Automated reorder points
- Supplier integration
- Stock forecasting
- Batch/lot tracking
- Expiry date tracking

### 10.2 Reporting & Analytics
- Stock turnover reports
- Low stock reports
- Stock value reports
- Movement history reports
- Alert frequency reports

---

## 11. Implementation Priority

### Phase 1 (Core Functionality)
1. Database schema changes
2. Basic stock fields in products table
3. Stock validation in order submission
4. Stock deduction on order creation
5. Basic CMS stock management UI
6. Stock status display on product pages

### Phase 2 (Enhanced Features)
1. Stock movements table and tracking
2. Stock alerts system
3. Stock history view
4. Low stock notifications
5. Backorder handling

### Phase 3 (Advanced Features)
1. Stock management dashboard
2. Bulk stock operations
3. Stock reports
4. Email notifications
5. Advanced analytics

---

## 12. Risk Considerations

### 12.1 Data Integrity
- Use database transactions for stock updates
- Implement row-level locking for concurrent orders
- Validate stock before and after updates

### 12.2 Performance
- Index stock-related columns
- Cache stock status for frequently accessed products
- Optimize stock validation queries

### 12.3 User Experience
- Clear messaging when stock is low/out
- Graceful handling of stock conflicts
- Real-time stock updates (optional: WebSocket)

### 12.4 Backward Compatibility
- Default stockEnabled = FALSE maintains current behavior
- Existing products continue to work without stock tracking
- Gradual migration path for enabling stock

---

## 13. API Endpoints Summary

### Products API Extensions
- `GET /api/products.php?stockStatus=low_stock`
- `PUT /api/products.php?id=X` (with stock fields)

### New Stock API
- `GET /api/stock.php?productId=X`
- `GET /api/stock.php?status=low_stock`
- `POST /api/stock.php/adjust`
- `GET /api/stock.php/alerts`
- `PUT /api/stock.php/alerts/:id/resolve`

### Orders API (Modified)
- `POST /api/submit-order.php` (with stock validation)
- `PUT /api/orders.php?id=X&action=cancel` (with stock restoration)

---

## 14. Documentation Requirements

- API documentation for new endpoints
- CMS user guide for stock management
- Developer guide for stock system
- Migration guide for existing products

---

## Conclusion

This stock management scheme provides a comprehensive, scalable solution for inventory tracking while maintaining backward compatibility with existing products. The phased implementation approach allows for gradual rollout and testing.

**Next Steps:**
1. Review and approve this plan
2. Create detailed technical specifications
3. Begin Phase 1 implementation
4. Set up testing environment
5. Plan migration strategy for existing products

