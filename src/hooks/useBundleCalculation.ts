import { useMemo } from 'react';
import type { BundleProduct, BundleItem, PrintfulProduct, PrintfulVariant } from '../types/printful';

export interface BundleCalculation {
  totalPrice: number;
  individualPrice: number;
  savings: number;
  savingsPercentage: number;
  items: BundleItem[];
}

export interface UseBundleCalculationReturn {
  calculation: BundleCalculation | null;
  addItem: (product: PrintfulProduct, variant: PrintfulVariant, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateItemQuantity: (productId: number, quantity: number) => void;
  clearBundle: () => void;
  getItemCount: () => number;
}

export const useBundleCalculation = (
  bundleProducts: BundleItem[],
  setBundleProducts: (items: BundleItem[] | ((prev: BundleItem[]) => BundleItem[])) => void
): UseBundleCalculationReturn => {
  
  const calculation = useMemo((): BundleCalculation | null => {
    if (bundleProducts.length === 0) return null;

    const totalPrice = bundleProducts.reduce((sum, item) => {
      return sum + (parseFloat(item.variant.price) * (item.quantity || 1));
    }, 0);

    // Calculate individual pricing (what customers would pay if they bought each item separately)
    const individualPrice = bundleProducts.reduce((sum, item) => {
      // Apply individual item markup (e.g., 20% markup for individual items)
      const markup = 1.2;
      return sum + (parseFloat(item.variant.price) * markup * (item.quantity || 1));
    }, 0);

    const savings = individualPrice - totalPrice;
    const savingsPercentage = individualPrice > 0 ? (savings / individualPrice) * 100 : 0;

    return {
      totalPrice,
      individualPrice,
      savings,
      savingsPercentage,
      items: bundleProducts,
    };
  }, [bundleProducts]);

  const addItem = (product: PrintfulProduct, variant: PrintfulVariant, quantity: number = 1) => {
    setBundleProducts((prev: BundleItem[]) => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Update existing item with new variant and quantity
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, variant, quantity: (item.quantity || 1) + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prev, { product, variant, quantity }];
      }
    });
  };

  const removeItem = (productId: number) => {
    setBundleProducts((prev: BundleItem[]) => prev.filter(item => item.product.id !== productId));
  };

  const updateItemQuantity = (productId: number, quantity: number) => {
    setBundleProducts((prev: BundleItem[]) => prev.map(item =>
      item.product.id === productId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    ));
  };

  const clearBundle = () => {
    setBundleProducts([]);
  };

  const getItemCount = () => {
    return bundleProducts.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  return {
    calculation,
    addItem,
    removeItem,
    updateItemQuantity,
    clearBundle,
    getItemCount,
  };
};

// Helper function to create a bundle from predefined bundle configurations
export const createBundleFromConfig = (
  bundleId: string,
  bundleName: string,
  bundleDescription: string,
  items: Array<{ product: PrintfulProduct; variant: PrintfulVariant }>
): BundleProduct => {
  const totalPrice = items.reduce((sum, item) => {
    return sum + parseFloat(item.variant.price);
  }, 0);

  const individualPrice = items.reduce((sum, item) => {
    const markup = 1.2; // 20% markup for individual items
    return sum + (parseFloat(item.variant.price) * markup);
  }, 0);

  const savings = individualPrice - totalPrice;

  return {
    id: bundleId,
    name: bundleName,
    description: bundleDescription,
    products: items,
    totalPrice,
    savings,
    image: items[0]?.variant.image || items[0]?.product.image,
  };
};

// Predefined bundle configurations
export const BUNDLE_CONFIGS = {
  starter: {
    id: 'starter-bundle',
    name: 'Starter Bundle',
    description: 'Perfect for newcomers to the Reform movement. Includes essential items to show your support.',
    items: [
      { productId: 1, variantId: 1 }, // T-shirt
      { productId: 3, variantId: 1 }, // Cap
      { productId: 4, variantId: 1 }, // Mug
    ],
  },
  champion: {
    id: 'champion-bundle',
    name: 'Champion Bundle',
    description: 'For dedicated supporters who want to make a statement. Premium quality items with maximum impact.',
    items: [
      { productId: 2, variantId: 1 }, // Hoodie
      { productId: 5, variantId: 1 }, // Tote bag
      { productId: 6, variantId: 1 }, // Water bottle
      { productId: 7, variantId: 1 }, // Mouse pad
    ],
  },
  activist: {
    id: 'activist-bundle',
    name: 'Activist Bundle',
    description: 'Complete activist kit for those ready to lead the movement. Everything you need to spread the word.',
    items: [
      { productId: 2, variantId: 1 }, // Hoodie
      { productId: 1, variantId: 1 }, // T-shirt
      { productId: 3, variantId: 1 }, // Cap
      { productId: 5, variantId: 1 }, // Tote bag
      { productId: 6, variantId: 1 }, // Water bottle
      { productId: 4, variantId: 1 }, // Mug
      { productId: 7, variantId: 1 }, // Mouse pad
    ],
  },
};
