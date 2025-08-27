import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getVariantPricing } from '../lib/printful/pricing';

export interface BundleContent {
  name: string;
  variant: string;
  image: string;
}

export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  printful_variant_id?: number | string; // Printful variant ID for shipping calculations
  isBundle?: boolean;
  bundleContents?: BundleContent[];
  originalPrice?: number; // Store original price for comparison
  currency?: string; // Store currency information
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  addToCartAndGetUpdated: (product: Omit<CartItem, 'quantity'>) => CartItem[];
  removeFromCart: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  refreshPricing: () => Promise<void>; // New function to refresh pricing
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('reformuk-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        console.log('Cart loaded from localStorage:', parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Clear corrupted localStorage data
      localStorage.removeItem('reformuk-cart');
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('reformuk-cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  // Debug cart state changes
  useEffect(() => {
    console.log('Cart state updated:', cartItems)
  }, [cartItems])

  // Initialize cart context
  useEffect(() => {
    console.log('CartProvider initialized')
  }, [])

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    try {
      console.log('Adding to cart:', product)
      
      // Validate product data
      if (!product.id || !product.name || typeof product.price !== 'number' || product.price <= 0) {
        console.error('Invalid product data:', product)
        return
      }
      
      setCartItems(prev => {
        const existingItem = prev.find(item => item.id === product.id)
        if (existingItem) {
          console.log('Product already in cart, updating quantity')
          return prev.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        }
        console.log('Adding new product to cart')
        return [...prev, { ...product, quantity: 1 }]
      })
    } catch (error) {
      console.error('Error adding to cart:', error)
      // Don't throw - allow cart to continue functioning
    }
  }

  const addToCartAndGetUpdated = (product: Omit<CartItem, 'quantity'>) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    let updatedItems: CartItem[];
    
    if (existingItem) {
      updatedItems = cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedItems = [...cartItems, { ...product, quantity: 1 }];
    }
    
    setCartItems(updatedItems);
    return updatedItems;
  };

  const removeFromCart = (productId: number | string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number | string, quantity: number) => {
    // Validate quantity
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    // Update immediately for responsive UI
    setCartItems(prev => {
      const item = prev.find(item => item.id === productId);
      if (!item) return prev; // Item not found, no change needed
      
      return prev.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const refreshPricing = async () => {
    // Don't block cart operations - run pricing refresh in background
    if (cartItems.length === 0) return;
    
    try {
      // Process pricing updates in parallel to avoid blocking
      const pricingPromises = cartItems
        .filter(item => item.printful_variant_id)
        .map(async (item) => {
          try {
            // Convert string variant ID to number for pricing function compatibility
            const variantId = typeof item.printful_variant_id === 'string' 
              ? parseInt(item.printful_variant_id, 10) || 0 
              : item.printful_variant_id;
            
            if (variantId) {
              const pricing = await getVariantPricing(variantId);
              if (pricing) {
                return { itemId: item.id, pricing };
              }
            }
          } catch (error) {
            console.warn(`Failed to refresh pricing for variant ${item.printful_variant_id}:`, error);
          }
          return null;
        });

      // Wait for all pricing updates to complete
      const results = await Promise.allSettled(pricingPromises);
      
      // Apply successful pricing updates
      const successfulUpdates = results
        .filter((result): result is PromiseFulfilledResult<{ itemId: string | number; pricing: any }> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value!);

      if (successfulUpdates.length > 0) {
        setCartItems(prev =>
          prev.map(cartItem => {
            const update = successfulUpdates.find(u => u.itemId === cartItem.id);
            if (update) {
              return {
                ...cartItem,
                price: update.pricing.price,
                originalPrice: update.pricing.price,
                currency: update.pricing.currency
              };
            }
            return cartItem;
          })
        );
      }
    } catch (error) {
      console.error('Error refreshing cart pricing:', error);
      // Don't throw - allow cart to continue functioning with existing prices
    }
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    addToCartAndGetUpdated,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isCartOpen,
    setIsCartOpen,
    refreshPricing
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};