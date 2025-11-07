import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getApiUrl } from "./Utils/apiConfig";

interface CartItem {
  id: number;
  productName: string;
  productPrice: number;
  firstImg: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isOffCanvasOpen: boolean;
  setIsOffCanvasOpen: (open: boolean) => void;
  openCart: () => void;          // NEW
  closeCart: () => void;         // NEW
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  incrementQuantity: (id: number) => Promise<void>;
  decrementQuantity: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "olivia-products-cart";

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      // Validate that it's an array
      if (Array.isArray(parsedCart)) {
        return parsedCart;
      }
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }
  return [];
};

// Save cart to localStorage
const saveCartToStorage = (cart: CartItem[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => loadCartFromStorage());
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  // NEW: explicit functions to open/close cart
  const openCart = () => setIsOffCanvasOpen(true);
  const closeCart = () => setIsOffCanvasOpen(false);

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const checkStockAvailability = async (productId: number, requestedQuantity: number): Promise<{ available: boolean; message: string; availableQuantity: number }> => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/products.php?id=${productId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const product = data.data;
        // If stock tracking is disabled, always available
        if (!product.stockEnabled) {
          return { available: true, message: 'Stock tracking disabled', availableQuantity: Infinity };
        }
        
        const availableQty = product.stockQuantity ?? 0;
        const allowBackorders = product.allowBackorders ?? false;
        
        if (availableQty >= requestedQuantity) {
          return { available: true, message: 'Stock available', availableQuantity: availableQty };
        } else if (availableQty === 0 && allowBackorders) {
          return { available: true, message: 'Available for backorder', availableQuantity: 0 };
        } else {
          return {
            available: false,
            message: availableQty > 0 ? `Only ${availableQty} available` : 'Out of stock',
            availableQuantity: availableQty
          };
        }
      }
    } catch (error) {
      console.error('Error checking stock:', error);
      // On error, allow the operation (fail open)
      return { available: true, message: 'Unable to verify stock', availableQuantity: Infinity };
    }
    
    return { available: true, message: 'Product not found', availableQuantity: Infinity };
  };

  const addToCart = async (item: CartItem) => {
    const requestedQty = item.quantity || 1;
    
    // Check stock availability
    const stockCheck = await checkStockAvailability(item.id, requestedQty);
    
    if (!stockCheck.available) {
      // Show alert to user
      alert(`Cannot add to cart: ${stockCheck.message}`);
      return;
    }
    
    // Limit quantity to available stock if needed
    const finalQuantity = stockCheck.availableQuantity < Infinity 
      ? Math.min(requestedQty, stockCheck.availableQuantity)
      : requestedQty;
    
    const itemExists = cart.some((cartItem) => cartItem.id === item.id);
    if (!itemExists) {
      setCart((prev) => [...prev, { ...item, quantity: finalQuantity }]);
      openCart(); // opens cart when item added
    } else {
      // Update quantity if item already exists
      updateQuantity(item.id, finalQuantity);
    }
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const incrementQuantity = async (id: number) => {
    const cartItem = cart.find((item) => item.id === id);
    if (!cartItem) return;
    
    const newQuantity = cartItem.quantity + 1;
    
    // Check stock availability
    const stockCheck = await checkStockAvailability(id, newQuantity);
    
    if (!stockCheck.available) {
      alert(`Cannot increase quantity: ${stockCheck.message}`);
      return;
    }
    
    // Limit to available stock
    const finalQuantity = stockCheck.availableQuantity < Infinity
      ? Math.min(newQuantity, stockCheck.availableQuantity)
      : newQuantity;
    
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: finalQuantity } : item
      )
    );
  };

  const decrementQuantity = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isOffCanvasOpen,
        setIsOffCanvasOpen,
        openCart,         // NEW
        closeCart,        // NEW
        addToCart,
        removeFromCart,
        clearCart,
        incrementQuantity,
        decrementQuantity,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
