import { Product } from '../ProductsContext';

/**
 * Calculate the price for a product based on the quantity ordered.
 * Returns the highest tier price that the quantity qualifies for.
 * 
 * Priority order (highest to lowest):
 * 1. Distributor price (if quantity >= distributorMinQty)
 * 2. Wholesale price (if quantity >= wholesaleMinQty)
 * 3. Retail price (if quantity >= retailMinQty, default to 1)
 * 4. Fallback to legacy price field
 * 
 * @param product - The product object
 * @param quantity - The quantity being ordered
 * @returns The price per unit for the given quantity
 */
export function calculatePriceForQuantity(product: Product, quantity: number): number {
  // Ensure quantity is at least 1
  if (quantity < 1) {
    quantity = 1;
  }

  // Check distributor tier first (highest priority)
  if (
    product.distributorPrice != null &&
    product.distributorMinQty != null &&
    quantity >= product.distributorMinQty
  ) {
    return product.distributorPrice;
  }

  // Check wholesale tier
  if (
    product.wholesalePrice != null &&
    product.wholesaleMinQty != null &&
    quantity >= product.wholesaleMinQty
  ) {
    return product.wholesalePrice;
  }

  // Check retail tier
  const retailMinQty = product.retailMinQty ?? 1;
  if (product.retailPrice != null && quantity >= retailMinQty) {
    return product.retailPrice;
  }

  // Fallback to legacy price field for backward compatibility
  return product.price;
}

/**
 * Get the pricing tier name for a given quantity
 * @param product - The product object
 * @param quantity - The quantity being ordered
 * @returns The tier name: 'distributor', 'wholesale', 'retail', or 'legacy'
 */
export function getPricingTier(product: Product, quantity: number): 'distributor' | 'wholesale' | 'retail' | 'legacy' {
  if (quantity < 1) {
    quantity = 1;
  }

  if (
    product.distributorPrice != null &&
    product.distributorMinQty != null &&
    quantity >= product.distributorMinQty
  ) {
    return 'distributor';
  }

  if (
    product.wholesalePrice != null &&
    product.wholesaleMinQty != null &&
    quantity >= product.wholesaleMinQty
  ) {
    return 'wholesale';
  }

  const retailMinQty = product.retailMinQty ?? 1;
  if (product.retailPrice != null && quantity >= retailMinQty) {
    return 'retail';
  }

  return 'legacy';
}

/**
 * Get the price for a product based on the selected purchase type.
 * Returns the price for the specified tier, or falls back to legacy price.
 * 
 * @param product - The product object
 * @param purchaseType - The purchase type: 'distribution', 'wholesale', or 'retail'
 * @returns The price per unit for the given purchase type
 */
export function getPriceByPurchaseType(product: Product, purchaseType: 'distribution' | 'wholesale' | 'retail' | null | undefined): number {
  if (!purchaseType) {
    // If no purchase type selected, return retail price or legacy price
    return product.retailPrice ?? product.price;
  }

  switch (purchaseType) {
    case 'distribution':
      return product.distributorPrice ?? product.price;
    case 'wholesale':
      return product.wholesalePrice ?? product.price;
    case 'retail':
      return product.retailPrice ?? product.price;
    default:
      return product.price;
  }
}

