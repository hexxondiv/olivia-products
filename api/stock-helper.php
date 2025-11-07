<?php
/**
 * Stock Management Helper Functions
 * Provides utility functions for stock tracking, validation, and management
 */

require_once __DIR__ . '/database.php';

/**
 * Calculate stock status based on quantity and settings
 * @param array $product Product data array
 * @return string|null Stock status or null if stock tracking disabled
 */
function calculateStockStatus($product) {
    if (!isset($product['stockEnabled']) || !$product['stockEnabled']) {
        return null; // Stock tracking disabled
    }
    
    $quantity = (int)($product['stockQuantity'] ?? 0);
    $threshold = (int)($product['lowStockThreshold'] ?? 10);
    $allowBackorders = isset($product['allowBackorders']) ? (bool)$product['allowBackorders'] : false;
    
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

/**
 * Check if product has sufficient stock for requested quantity
 * @param int $productId Product ID
 * @param int $requestedQuantity Quantity requested
 * @return array ['available' => bool, 'message' => string, 'availableQuantity' => int]
 */
function checkStockAvailability($productId, $requestedQuantity) {
    $product = dbQueryOne(
        "SELECT stockQuantity, stockEnabled, allowBackorders FROM products WHERE id = ?",
        [$productId]
    );
    
    if (!$product) {
        return [
            'available' => false,
            'message' => 'Product not found',
            'availableQuantity' => 0
        ];
    }
    
    // If stock tracking is disabled, always available
    if (!isset($product['stockEnabled']) || !$product['stockEnabled']) {
        return [
            'available' => true,
            'message' => 'Stock tracking disabled',
            'availableQuantity' => PHP_INT_MAX
        ];
    }
    
    $availableQuantity = (int)$product['stockQuantity'];
    $allowBackorders = isset($product['allowBackorders']) ? (bool)$product['allowBackorders'] : false;
    
    if ($availableQuantity >= $requestedQuantity) {
        return [
            'available' => true,
            'message' => 'Stock available',
            'availableQuantity' => $availableQuantity
        ];
    } elseif ($availableQuantity == 0 && $allowBackorders) {
        return [
            'available' => true,
            'message' => 'Available for backorder',
            'availableQuantity' => 0
        ];
    } else {
        return [
            'available' => false,
            'message' => $availableQuantity > 0 
                ? "Only {$availableQuantity} available" 
                : 'Out of stock',
            'availableQuantity' => $availableQuantity
        ];
    }
}

/**
 * Update product stock quantity and create movement record
 * @param int $productId Product ID
 * @param int $quantityChange Positive or negative quantity change
 * @param string $movementType Type of movement (purchase, sale, adjustment, etc.)
 * @param string|null $referenceType Type of reference (order, manual, etc.)
 * @param string|null $referenceId Reference ID (order ID, etc.)
 * @param string|null $notes Additional notes
 * @param int|null $userId User ID who made the change
 * @return array ['success' => bool, 'message' => string, 'newQuantity' => int]
 */
function updateProductStock($productId, $quantityChange, $movementType, $referenceType = null, $referenceId = null, $notes = null, $userId = null) {
    try {
        // Get current product stock
        $product = dbQueryOne(
            "SELECT stockQuantity, stockEnabled FROM products WHERE id = ? FOR UPDATE",
            [$productId]
        );
        
        if (!$product) {
            return [
                'success' => false,
                'message' => 'Product not found',
                'newQuantity' => 0
            ];
        }
        
        // If stock tracking is disabled, don't update
        if (!isset($product['stockEnabled']) || !$product['stockEnabled']) {
            return [
                'success' => false,
                'message' => 'Stock tracking is disabled for this product',
                'newQuantity' => (int)$product['stockQuantity']
            ];
        }
        
        $previousQuantity = (int)$product['stockQuantity'];
        $newQuantity = $previousQuantity + $quantityChange;
        
        // Update product stock
        dbExecute(
            "UPDATE products SET stockQuantity = ? WHERE id = ?",
            [$newQuantity, $productId]
        );
        
        // Create stock movement record
        dbExecute(
            "INSERT INTO stock_movements (productId, movementType, quantity, previousQuantity, newQuantity, referenceType, referenceId, notes, createdBy) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $productId,
                $movementType,
                $quantityChange,
                $previousQuantity,
                $newQuantity,
                $referenceType,
                $referenceId,
                $notes,
                $userId
            ]
        );
        
        // Update stock status
        $product['stockQuantity'] = $newQuantity;
        $stockStatus = calculateStockStatus($product);
        if ($stockStatus) {
            dbExecute(
                "UPDATE products SET stockStatus = ? WHERE id = ?",
                [$stockStatus, $productId]
            );
        }
        
        // Check for alerts
        checkAndCreateStockAlerts($productId, $newQuantity, $stockStatus);
        
        return [
            'success' => true,
            'message' => 'Stock updated successfully',
            'newQuantity' => $newQuantity
        ];
        
    } catch (Exception $e) {
        error_log("Stock update error: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Failed to update stock: ' . $e->getMessage(),
            'newQuantity' => 0
        ];
    }
}

/**
 * Check and create stock alerts if needed
 * @param int $productId Product ID
 * @param int $quantity Current quantity
 * @param string $stockStatus Current stock status
 */
function checkAndCreateStockAlerts($productId, $quantity, $stockStatus) {
    $product = dbQueryOne(
        "SELECT lowStockThreshold, allowBackorders FROM products WHERE id = ?",
        [$productId]
    );
    
    if (!$product) return;
    
    $threshold = (int)($product['lowStockThreshold'] ?? 10);
    $allowBackorders = isset($product['allowBackorders']) ? (bool)$product['allowBackorders'] : false;
    
    // Check for low stock alert
    if ($quantity > 0 && $quantity <= $threshold) {
        // Check if active low_stock alert exists
        $existingAlert = dbQueryOne(
            "SELECT id FROM stock_alerts WHERE productId = ? AND alertType = 'low_stock' AND isResolved = FALSE",
            [$productId]
        );
        
        if (!$existingAlert) {
            createStockAlert($productId, 'low_stock');
        }
    }
    
    // Check for out of stock alert
    if ($quantity == 0 && !$allowBackorders) {
        $existingAlert = dbQueryOne(
            "SELECT id FROM stock_alerts WHERE productId = ? AND alertType = 'out_of_stock' AND isResolved = FALSE",
            [$productId]
        );
        
        if (!$existingAlert) {
            createStockAlert($productId, 'out_of_stock');
        }
    }
    
    // Resolve alerts if stock is restored
    if ($quantity > $threshold) {
        // Resolve low stock alerts
        dbExecute(
            "UPDATE stock_alerts SET isResolved = TRUE, resolvedAt = NOW() 
             WHERE productId = ? AND alertType = 'low_stock' AND isResolved = FALSE",
            [$productId]
        );
    }
    
    if ($quantity > 0) {
        // Resolve out of stock alerts
        dbExecute(
            "UPDATE stock_alerts SET isResolved = TRUE, resolvedAt = NOW() 
             WHERE productId = ? AND alertType = 'out_of_stock' AND isResolved = FALSE",
            [$productId]
        );
    }
}

/**
 * Create a stock alert
 * @param int $productId Product ID
 * @param string $alertType Type of alert (low_stock, out_of_stock, backorder)
 * @param string|null $notes Additional notes
 * @return int|false Alert ID or false on failure
 */
function createStockAlert($productId, $alertType, $notes = null) {
    try {
        return dbExecute(
            "INSERT INTO stock_alerts (productId, alertType, notes) VALUES (?, ?, ?)",
            [$productId, $alertType, $notes]
        );
    } catch (Exception $e) {
        error_log("Failed to create stock alert: " . $e->getMessage());
        return false;
    }
}

/**
 * Resolve a stock alert
 * @param int $alertId Alert ID
 * @param int|null $userId User ID who resolved it
 * @param string|null $notes Resolution notes
 * @return bool Success
 */
function resolveStockAlert($alertId, $userId = null, $notes = null) {
    try {
        $result = dbExecute(
            "UPDATE stock_alerts SET isResolved = TRUE, resolvedAt = NOW(), resolvedBy = ?, notes = ? WHERE id = ?",
            [$userId, $notes, $alertId]
        );
        return $result !== false;
    } catch (Exception $e) {
        error_log("Failed to resolve stock alert: " . $e->getMessage());
        return false;
    }
}

/**
 * Get stock movement history for a product
 * @param int $productId Product ID
 * @param int $limit Number of records to return
 * @return array Stock movements
 */
function getStockHistory($productId, $limit = 50) {
    return dbQuery(
        "SELECT sm.*, u.username as createdByName 
         FROM stock_movements sm
         LEFT JOIN admin_users u ON sm.createdBy = u.id
         WHERE sm.productId = ?
         ORDER BY sm.createdAt DESC
         LIMIT ?",
        [$productId, $limit]
    );
}

/**
 * Get active stock alerts
 * @param string|null $alertType Filter by alert type
 * @param int $limit Number of records to return
 * @return array Stock alerts
 */
function getActiveStockAlerts($alertType = null, $limit = 100) {
    $sql = "SELECT sa.*, p.name as productName, p.stockQuantity, u.username as resolvedByName
            FROM stock_alerts sa
            JOIN products p ON sa.productId = p.id
            LEFT JOIN admin_users u ON sa.resolvedBy = u.id
            WHERE sa.isResolved = FALSE";
    
    $params = [];
    
    if ($alertType) {
        $sql .= " AND sa.alertType = ?";
        $params[] = $alertType;
    }
    
    $sql .= " ORDER BY sa.createdAt DESC LIMIT ?";
    $params[] = $limit;
    
    return dbQuery($sql, $params);
}

