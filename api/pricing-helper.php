<?php
/**
 * Pricing Helper Functions
 * Functions to determine pricing tiers and format pricing information
 */

/**
 * Determine which pricing tier was used based on product data, quantity, and price
 * 
 * @param array $product Product data with tiered pricing fields
 * @param int $quantity Quantity ordered
 * @param float $pricePerUnit Price per unit that was charged
 * @return array Array with tier name, tier display name, and pricing details
 */
function determinePricingTier($product, $quantity, $pricePerUnit) {
    // Default to legacy pricing
    $tier = 'legacy';
    $tierDisplay = 'Standard';
    $tierDetails = [
        'tier' => $tier,
        'tierDisplay' => $tierDisplay,
        'minQty' => null,
        'pricePerUnit' => $pricePerUnit,
        'quantity' => $quantity,
        'total' => $pricePerUnit * $quantity
    ];
    
    // Check if product has tiered pricing
    if (empty($product)) {
        return $tierDetails;
    }
    
    // Use a more precise tolerance for price comparison
    $priceTolerance = 0.01; // 1 kobo tolerance
    
    // Determine which tier SHOULD apply based on quantity (highest priority first)
    // This matches the logic used in the frontend calculatePriceForQuantity function
    $expectedTier = null;
    $expectedPrice = null;
    $expectedMinQty = null;
    
    // Check distributor tier first (highest priority)
    if (isset($product['distributorPrice']) && $product['distributorPrice'] !== null &&
        isset($product['distributorMinQty']) && $product['distributorMinQty'] !== null &&
        $quantity >= (int)$product['distributorMinQty']) {
        $expectedTier = 'distributor';
        $expectedPrice = (float)$product['distributorPrice'];
        $expectedMinQty = (int)$product['distributorMinQty'];
    }
    // Check wholesale tier (second priority)
    elseif (isset($product['wholesalePrice']) && $product['wholesalePrice'] !== null &&
            isset($product['wholesaleMinQty']) && $product['wholesaleMinQty'] !== null &&
            $quantity >= (int)$product['wholesaleMinQty']) {
        $expectedTier = 'wholesale';
        $expectedPrice = (float)$product['wholesalePrice'];
        $expectedMinQty = (int)$product['wholesaleMinQty'];
    }
    // Check retail tier (third priority)
    elseif (isset($product['retailPrice']) && $product['retailPrice'] !== null) {
        $retailMinQty = isset($product['retailMinQty']) ? (int)$product['retailMinQty'] : 1;
        if ($quantity >= $retailMinQty) {
            $expectedTier = 'retail';
            $expectedPrice = (float)$product['retailPrice'];
            $expectedMinQty = $retailMinQty;
        }
    }
    
    // If we determined an expected tier, use it (prioritize quantity-based tier determination)
    // This ensures we show the correct tier based on quantity, even if price was charged incorrectly
    if ($expectedTier !== null && $expectedPrice !== null) {
        // Check if the charged price matches the expected tier price
        if (abs($pricePerUnit - $expectedPrice) < $priceTolerance) {
            // Price matches expected tier - use it
            $tierDisplayMap = [
                'distributor' => 'Distributor',
                'wholesale' => 'Wholesale',
                'retail' => 'Retail'
            ];
            
            $tier = $expectedTier;
            $tierDisplay = $tierDisplayMap[$expectedTier] ?? ucfirst($expectedTier);
            $tierDetails = [
                'tier' => $tier,
                'tierDisplay' => $tierDisplay,
                'minQty' => $expectedMinQty,
                'pricePerUnit' => $expectedPrice,
                'quantity' => $quantity,
                'total' => $expectedPrice * $quantity
            ];
            return $tierDetails;
        } else {
            // Price doesn't match expected tier, but quantity qualifies for higher tier
            // Show the tier that SHOULD apply based on quantity
            // Use the expected price for display (what should have been charged)
            $tierDisplayMap = [
                'distributor' => 'Distributor',
                'wholesale' => 'Wholesale',
                'retail' => 'Retail'
            ];
            
            $tier = $expectedTier;
            $tierDisplay = $tierDisplayMap[$expectedTier] ?? ucfirst($expectedTier);
            $tierDetails = [
                'tier' => $tier,
                'tierDisplay' => $tierDisplay,
                'minQty' => $expectedMinQty,
                'pricePerUnit' => $expectedPrice, // Use expected price for display
                'quantity' => $quantity,
                'total' => $expectedPrice * $quantity // Use expected total for display
            ];
            return $tierDetails;
        }
    }
    
    // Price doesn't match expected tier - try to find which tier it actually matches
    // This handles edge cases where price might not match expected tier due to manual adjustments
    
    // Check distributor tier
    if (isset($product['distributorPrice']) && $product['distributorPrice'] !== null &&
        isset($product['distributorMinQty']) && $product['distributorMinQty'] !== null &&
        $quantity >= (int)$product['distributorMinQty'] &&
        abs($pricePerUnit - (float)$product['distributorPrice']) < $priceTolerance) {
        $tier = 'distributor';
        $tierDisplay = 'Distributor';
        $tierDetails = [
            'tier' => $tier,
            'tierDisplay' => $tierDisplay,
            'minQty' => (int)$product['distributorMinQty'],
            'pricePerUnit' => (float)$product['distributorPrice'],
            'quantity' => $quantity,
            'total' => (float)$product['distributorPrice'] * $quantity
        ];
        return $tierDetails;
    }
    
    // Check wholesale tier
    if (isset($product['wholesalePrice']) && $product['wholesalePrice'] !== null &&
        isset($product['wholesaleMinQty']) && $product['wholesaleMinQty'] !== null &&
        $quantity >= (int)$product['wholesaleMinQty'] &&
        abs($pricePerUnit - (float)$product['wholesalePrice']) < $priceTolerance) {
        $tier = 'wholesale';
        $tierDisplay = 'Wholesale';
        $tierDetails = [
            'tier' => $tier,
            'tierDisplay' => $tierDisplay,
            'minQty' => (int)$product['wholesaleMinQty'],
            'pricePerUnit' => (float)$product['wholesalePrice'],
            'quantity' => $quantity,
            'total' => (float)$product['wholesalePrice'] * $quantity
        ];
        return $tierDetails;
    }
    
    // Check retail tier (only if quantity doesn't qualify for higher tiers OR price specifically matches retail)
    $retailMinQty = isset($product['retailMinQty']) ? (int)$product['retailMinQty'] : 1;
    if (isset($product['retailPrice']) && $product['retailPrice'] !== null &&
        $quantity >= $retailMinQty &&
        abs($pricePerUnit - (float)$product['retailPrice']) < $priceTolerance) {
        // Only use retail if quantity doesn't qualify for wholesale/distributor
        // OR if retail price is different from wholesale/distributor prices
        $useRetail = true;
        
        // Don't use retail if quantity qualifies for wholesale and prices match
        if (isset($product['wholesalePrice']) && $product['wholesalePrice'] !== null &&
            isset($product['wholesaleMinQty']) && $product['wholesaleMinQty'] !== null &&
            $quantity >= (int)$product['wholesaleMinQty'] &&
            abs((float)$product['retailPrice'] - (float)$product['wholesalePrice']) < $priceTolerance) {
            $useRetail = false; // Same price as wholesale, so it's wholesale
        }
        
        // Don't use retail if quantity qualifies for distributor and prices match
        if (isset($product['distributorPrice']) && $product['distributorPrice'] !== null &&
            isset($product['distributorMinQty']) && $product['distributorMinQty'] !== null &&
            $quantity >= (int)$product['distributorMinQty'] &&
            abs((float)$product['retailPrice'] - (float)$product['distributorPrice']) < $priceTolerance) {
            $useRetail = false; // Same price as distributor, so it's distributor
        }
        
        if ($useRetail) {
            $tier = 'retail';
            $tierDisplay = 'Retail';
            $tierDetails = [
                'tier' => $tier,
                'tierDisplay' => $tierDisplay,
                'minQty' => $retailMinQty,
                'pricePerUnit' => (float)$product['retailPrice'],
                'quantity' => $quantity,
                'total' => (float)$product['retailPrice'] * $quantity
            ];
            return $tierDetails;
        }
    }
    
    // If no match, return legacy pricing
    return $tierDetails;
}

/**
 * Format pricing tier information for display
 * 
 * @param array $tierInfo Tier information from determinePricingTier
 * @return string Formatted string with tier information
 */
function formatPricingTierInfo($tierInfo) {
    $tier = $tierInfo['tierDisplay'];
    $minQty = $tierInfo['minQty'];
    
    if ($minQty !== null) {
        return "$tier (Min Qty: $minQty)";
    }
    
    return $tier;
}

