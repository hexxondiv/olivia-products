import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getApiUrl } from './Utils/apiConfig';

export interface Product {
  id: number;
  name: string;
  heading: string;
  sufix?: string;
  price: number;
  rating: number;
  color?: string;
  detail?: string;
  moreDetail?: string;
  tagline?: string;
  firstImg: string;
  hoverImg?: string;
  additionalImgs?: string[];
  category: string[];
  flavours?: Array<{ id: number; name: string }>;
  bestSeller: boolean;
  isActive: boolean;
  // Tiered pricing fields
  retailPrice?: number | null;
  retailMinQty?: number;
  wholesalePrice?: number | null;
  wholesaleMinQty?: number | null;
  distributorPrice?: number | null;
  distributorMinQty?: number | null;
}

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getProductById: (id: number) => Product | undefined;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

interface ProductsProviderProps {
  children: ReactNode;
  activeOnly?: boolean; // Only fetch active products for public pages
}

export const ProductsProvider: React.FC<ProductsProviderProps> = ({ 
  children, 
  activeOnly = true 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = getApiUrl();
      const url = activeOnly 
        ? `${apiUrl}/products.php?activeOnly=true`
        : `${apiUrl}/products.php`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setProducts(data.data);
      } else {
        throw new Error(data.message || 'Failed to load products');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      console.error('Error fetching products:', err);
      // Set empty array on error to prevent crashes
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOnly]);

  const getProductById = (id: number): Product | undefined => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        refetch: fetchProducts,
        getProductById,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

