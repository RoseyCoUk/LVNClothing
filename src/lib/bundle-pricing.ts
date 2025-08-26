import type { PrintfulProduct, PrintfulVariant } from '../types/printful';

// Bundle discount rates
export const DISCOUNTS = {
  starter: 0.10,    // 10% discount
  champion: 0.15,   // 15% discount
  activist: 0.20    // 20% discount
} as const;

// Bundle configurations with product IDs
export const BUNDLES = {
  starter: {
    name: 'Starter Bundle',
    products: [
      { productId: 1, name: 'T-Shirt' },      // T-Shirt
      { productId: 3, name: 'Cap' },          // Cap
      { productId: 4, name: 'Mug' }           // Mug
    ]
  },
  champion: {
    name: 'Champion Bundle',
    products: [
      { productId: 2, name: 'Hoodie' },       // Hoodie
      { productId: 5, name: 'Tote Bag' },    // Tote Bag
      { productId: 6, name: 'Water Bottle' }, // Water Bottle
      { productId: 7, name: 'Mouse Pad' }    // Mouse Pad
    ]
  },
  activist: {
    name: 'Activist Bundle',
    products: [
      { productId: 2, name: 'Hoodie' },       // Hoodie
      { productId: 1, name: 'T-Shirt' },     // T-Shirt
      { productId: 3, name: 'Cap' },         // Cap
      { productId: 5, name: 'Tote Bag' },    // Tote Bag
      { productId: 6, name: 'Water Bottle' }, // Water Bottle
      { productId: 4, name: 'Mug' },         // Mug
      { productId: 7, name: 'Mouse Pad' }    // Mouse Pad
    ]
  }
} as const;

export type BundleKey = keyof typeof BUNDLES;

// Bundle pricing result interface
export interface BundlePricing {
  price: number;
  originalPrice: number;
  savings: {
    absolute: number;
    percentage: number;
  };
  components: Array<{
    productId: number;
    name: string;
    price: number;
  }>;
}

// Helper function to round prices to .99
function roundTo99(price: number): number {
  return Math.floor(price) + 0.99;
}

// Get bundle pricing from live Printful prices
export async function getBundlePrice(
  bundleKey: BundleKey,
  getProductPrice: (productId: number) => Promise<number>
): Promise<BundlePricing> {
  const bundle = BUNDLES[bundleKey];
  
  try {
    // Get live prices for all products in the bundle with error handling
    const componentPrices = await Promise.allSettled(
      bundle.products.map(async (product) => {
        try {
          const price = await getProductPrice(product.productId);
          return {
            productId: product.productId,
            name: product.name,
            price
          };
        } catch (error) {
          console.warn(`Failed to get price for product ${product.productId}:`, error);
          // Return fallback price for this product
          const fallbackPrices: Record<number, number> = {
            1: 24.99,  // T-Shirt
            2: 39.99,  // Hoodie
            3: 19.99,  // Cap
            4: 9.99,   // Mug
            5: 24.99,  // Tote Bag
            6: 24.99,  // Water Bottle
            7: 14.99   // Mouse Pad
          };
          
          return {
            productId: product.productId,
            name: product.name,
            price: fallbackPrices[product.productId] || 0
          };
        }
      })
    );

    // Extract successful results and fallback prices
    const validComponentPrices = componentPrices.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // Use fallback price for failed products
        const product = bundle.products[index];
        const fallbackPrices: Record<number, number> = {
          1: 24.99,  // T-Shirt
          2: 39.99,  // Hoodie
          3: 19.99,  // Cap
          4: 9.99,   // Mug
          5: 24.99,  // Tote Bag
          6: 24.99,  // Water Bottle
          7: 14.99   // Mouse Pad
        };
        
        return {
          productId: product.productId,
          name: product.name,
          price: fallbackPrices[product.productId] || 0
        };
      }
    });

    // Calculate total original price
    const originalPrice = validComponentPrices.reduce((sum, component) => sum + component.price, 0);
    
    // Apply discount
    const discountRate = DISCOUNTS[bundleKey];
    const discountedPrice = originalPrice * (1 - discountRate);
    const finalPrice = roundTo99(discountedPrice);
    
    // Calculate savings
    const savings = {
      absolute: originalPrice - finalPrice,
      percentage: ((originalPrice - finalPrice) / originalPrice) * 100
    };

    return {
      price: finalPrice,
      originalPrice,
      savings,
      components: validComponentPrices
    };
  } catch (error) {
    console.error('Error calculating bundle pricing, using fallback:', error);
    // Return fallback pricing if everything fails
    return getBundlePriceFromMock(bundleKey);
  }
}

// Get bundle pricing from mock data (fallback when Printful API is unavailable)
export function getBundlePriceFromMock(bundleKey: BundleKey): BundlePricing {
  const bundle = BUNDLES[bundleKey];
  
  // Mock prices based on the updated pricing structure
  const mockPrices: Record<number, number> = {
    1: 24.99,  // T-Shirt
    2: 39.99,  // Hoodie
    3: 19.99,  // Cap
    4: 9.99,   // Mug
    5: 24.99,  // Tote Bag
    6: 24.99,  // Water Bottle
    7: 14.99   // Mouse Pad
  };

  // Calculate component prices
  const components = bundle.products.map(product => ({
    productId: product.productId,
    name: product.name,
    price: mockPrices[product.productId]
  }));

  // Calculate total original price
  const originalPrice = components.reduce((sum, component) => sum + component.price, 0);
  
  // Apply discount
  const discountRate = DISCOUNTS[bundleKey];
  const discountedPrice = originalPrice * (1 - discountRate);
  const finalPrice = roundTo99(discountedPrice);
  
  // Calculate savings
  const savings = {
    absolute: originalPrice - finalPrice,
    percentage: ((originalPrice - finalPrice) / originalPrice) * 100
  };

  return {
    price: finalPrice,
    originalPrice,
    savings,
    components
  };
}

// Get product price from Printful API or fallback to mock data
export async function getProductPrice(
  productId: number,
  printfulProducts: PrintfulProduct[]
): Promise<number> {
  try {
    // Try to find product in Printful data
    const product = printfulProducts.find(p => p.id === productId);
    if (product && product.variants.length > 0) {
      // Return the first variant's price (assuming all variants have the same base price)
      const price = parseFloat(product.variants[0].price);
      if (!isNaN(price) && price > 0) {
        return price;
      }
    }
  } catch (error) {
    console.warn(`Failed to get Printful price for product ${productId}:`, error);
  }

  // Fallback to mock prices
  const mockPrices: Record<number, number> = {
    1: 24.99,  // T-Shirt
    2: 39.99,  // Hoodie
    3: 19.99,  // Cap
    4: 9.99,   // Mug
    5: 24.99,  // Tote Bag
    6: 24.99,  // Water Bottle
    7: 14.99   // Mouse Pad
  };

  const fallbackPrice = mockPrices[productId];
  if (fallbackPrice) {
    console.log(`Using fallback price for product ${productId}: £${fallbackPrice}`);
    return fallbackPrice;
  }

  console.warn(`No fallback price available for product ${productId}`);
  return 0;
}
