# Stock Management Implementation Checklist

## Quick Reference for Development

---

## Phase 1: Database & Backend Core

### Database Schema
- [ ] Add stock fields to products table
  - [ ] `stockQuantity INT DEFAULT 0`
  - [ ] `stockEnabled BOOLEAN DEFAULT FALSE`
  - [ ] `lowStockThreshold INT DEFAULT 10`
  - [ ] `allowBackorders BOOLEAN DEFAULT FALSE`
  - [ ] `stockStatus ENUM(...) DEFAULT 'in_stock'`
- [ ] Create `stock_movements` table
- [ ] Create `stock_alerts` table
- [ ] Add indexes for performance
- [ ] Create migration script

### Backend API - Stock Helper
- [ ] Create `api/stock-helper.php`
  - [ ] `updateProductStock()` function
  - [ ] `calculateStockStatus()` function
  - [ ] `checkStockAvailability()` function
  - [ ] `createStockAlert()` function
  - [ ] `resolveStockAlert()` function
  - [ ] `getStockHistory()` function

### Backend API - Products
- [ ] Update `api/products.php`
  - [ ] Add stock fields to GET response
  - [ ] Add stock fields to POST/PUT handlers
  - [ ] Auto-calculate stockStatus on update
  - [ ] Add stock filter to GET (stockStatus parameter)

### Backend API - Orders
- [ ] Update `api/submit-order.php`
  - [ ] Add stock validation before order creation
  - [ ] Add stock deduction after order creation
  - [ ] Create stock_movement records
  - [ ] Handle stock errors gracefully

### Backend API - Stock Management (New)
- [ ] Create `api/stock.php`
  - [ ] GET endpoint for stock info
  - [ ] POST endpoint for stock adjustment
  - [ ] GET endpoint for stock alerts
  - [ ] PUT endpoint to resolve alerts

---

## Phase 2: Frontend CMS

### CMS Products Page
- [ ] Update `CMSProducts.tsx` interface
  - [ ] Add stock fields to Product interface
- [ ] Add stock section to product form modal
  - [ ] Stock enabled toggle
  - [ ] Stock quantity input
  - [ ] Low stock threshold input
  - [ ] Allow backorders toggle
  - [ ] Stock status display (read-only)
- [ ] Update products table
  - [ ] Add stock column
  - [ ] Add stock status badges
  - [ ] Color coding for status
- [ ] Add stock quick actions
  - [ ] Quick adjust button
  - [ ] View history button
- [ ] Create stock history modal component

### CMS Stock Management Page (New)
- [ ] Create `CMSStock.tsx`
  - [ ] Stock dashboard
  - [ ] Low stock alerts list
  - [ ] Bulk stock adjustment
  - [ ] Stock reports

### CMS Layout Updates
- [ ] Add stock alerts indicator to header
- [ ] Add link to stock management page

---

## Phase 3: Customer-Facing Frontend

### Product Display
- [ ] Update `ViewProductPage.tsx`
  - [ ] Show stock status badge
  - [ ] Disable add to cart if out of stock
  - [ ] Limit quantity selector to available stock
  - [ ] Show "Only X left" message for low stock

### Product Listings
- [ ] Update product cards/components
  - [ ] Add stock status badges
  - [ ] Option to filter/hide out of stock

### Cart & Checkout
- [ ] Update `CartContext.tsx`
  - [ ] Check stock when adding items
  - [ ] Prevent exceeding available stock
  - [ ] Show stock warnings
- [ ] Update `CheckoutPage.tsx`
  - [ ] Validate stock before checkout
  - [ ] Show stock status for each item
  - [ ] Handle stock conflicts
  - [ ] Update quantities if stock insufficient

---

## Phase 4: Testing & Validation

### Unit Tests
- [ ] Stock calculation functions
- [ ] Stock validation logic
- [ ] Stock movement creation

### Integration Tests
- [ ] Order creation with stock deduction
- [ ] Stock validation in checkout
- [ ] Concurrent order handling
- [ ] Stock restoration on cancellation

### Manual Testing
- [ ] CMS stock management workflow
- [ ] Customer purchase flow
- [ ] Stock alerts creation/resolution
- [ ] Edge cases (negative stock, etc.)

---

## Phase 5: Documentation & Deployment

### Documentation
- [ ] Update API documentation
- [ ] Create CMS user guide
- [ ] Document migration process
- [ ] Update README files

### Deployment
- [ ] Create database migration script
- [ ] Test migration on staging
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Monitor for issues

---

## Quick Implementation Order

1. **Database** → Create tables and fields
2. **Backend Helpers** → Core stock functions
3. **Backend APIs** → Integrate stock into existing APIs
4. **CMS UI** → Stock management interface
5. **Customer UI** → Stock display and validation
6. **Testing** → Comprehensive testing
7. **Documentation** → User and developer docs
8. **Deployment** → Rollout to production

---

## Key Files to Modify/Create

### Backend
- `api/schema.sql` - Add stock tables
- `api/products.php` - Add stock fields
- `api/submit-order.php` - Add stock validation
- `api/orders.php` - Add stock restoration on cancel
- `api/stock-helper.php` - **NEW** - Stock utility functions
- `api/stock.php` - **NEW** - Stock management API

### Frontend
- `src/Pages/CMS/CMSProducts.tsx` - Add stock UI
- `src/Pages/CMS/CMSStock.tsx` - **NEW** - Stock management page
- `src/Pages/ViewProductPage/ViewProductPage.tsx` - Show stock status
- `src/Pages/CheckoutPage/CheckoutPage.tsx` - Stock validation
- `src/CartContext.tsx` - Stock checks in cart
- `src/ProductsContext.tsx` - Add stock to Product type

---

## Migration Checklist

- [ ] Backup database
- [ ] Run migration script
- [ ] Verify all products have stockEnabled = FALSE (default)
- [ ] Test existing functionality still works
- [ ] Enable stock tracking for test products
- [ ] Verify stock tracking works correctly
- [ ] Gradually enable for more products

---

## Notes

- Default behavior: All existing products have `stockEnabled = FALSE`, maintaining current unlimited stock behavior
- Stock tracking is opt-in per product
- Backward compatible with existing orders
- No breaking changes to existing APIs (only additions)

