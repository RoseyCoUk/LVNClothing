import { pf } from './client';

export interface PrintfulProduct {
  id: number;
  name: string;
  variants: PrintfulVariant[];
}

export interface PrintfulVariant {
  id: number;
  title: string;
  price: string;
  currency: string;
  retail_price: string;
  retail_currency: string;
}

export interface PricingInfo {
  productId: number;
  variantId: number;
  price: number;
  currency: string;
  retailPrice: number;
  retailCurrency: string;
}

/**
 * Get product pricing information from Printful
 * @param productId Printful product ID
 * @returns Promise<PricingInfo[]>
 */
export async function getProductPricing(productId: number): Promise<PricingInfo[]> {
  // For development/testing, always use fallback pricing to avoid Printful API issues
  console.log(`Using fallback pricing for product ${productId} (Printful API disabled for development)`);
  
  // Return fallback pricing for the product
  const fallbackPricing: Record<number, PricingInfo[]> = {
    1: [ // T-Shirt
      { productId: 1, variantId: 4016, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' },
      { productId: 1, variantId: 4017, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' },
      { productId: 1, variantId: 4018, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' },
      { productId: 1, variantId: 4019, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' },
      { productId: 1, variantId: 4020, price: 26.99, currency: 'GBP', retailPrice: 26.99, retailCurrency: 'GBP' }
    ],
    2: [ // Hoodie
      { productId: 2, variantId: 5000, price: 39.99, currency: 'GBP', retailPrice: 39.99, retailCurrency: 'GBP' },
      { productId: 2, variantId: 5001, price: 39.99, currency: 'GBP', retailPrice: 39.99, retailCurrency: 'GBP' },
      { productId: 2, variantId: 5002, price: 39.99, currency: 'GBP', retailPrice: 39.99, retailCurrency: 'GBP' },
      { productId: 2, variantId: 5003, price: 39.99, currency: 'GBP', retailPrice: 39.99, retailCurrency: 'GBP' },
      { productId: 2, variantId: 5004, price: 41.99, currency: 'GBP', retailPrice: 41.99, retailCurrency: 'GBP' }
    ],
    3: [ // Cap
      { productId: 3, variantId: 6000, price: 19.99, currency: 'GBP', retailPrice: 19.99, retailCurrency: 'GBP' },
      { productId: 3, variantId: 6001, price: 19.99, currency: 'GBP', retailPrice: 19.99, retailCurrency: 'GBP' },
      { productId: 3, variantId: 6002, price: 19.99, currency: 'GBP', retailPrice: 19.99, retailCurrency: 'GBP' },
      { productId: 3, variantId: 6003, price: 19.99, currency: 'GBP', retailPrice: 19.99, retailCurrency: 'GBP' },
      { productId: 3, variantId: 6004, price: 19.99, currency: 'GBP', retailPrice: 19.99, retailCurrency: 'GBP' },
      { productId: 3, variantId: 6005, price: 19.99, currency: 'GBP', retailPrice: 19.99, retailCurrency: 'GBP' }
    ],
    4: [ // Mug
      { productId: 4, variantId: 7000, price: 9.99, currency: 'GBP', retailPrice: 9.99, retailCurrency: 'GBP' }
    ],
    5: [ // Tote Bag
      { productId: 5, variantId: 8000, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' }
    ],
    6: [ // Water Bottle
      { productId: 6, variantId: 9000, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' }
    ],
    7: [ // Mouse Pad
      { productId: 7, variantId: 10000, price: 14.99, currency: 'GBP', retailPrice: 14.99, retailCurrency: 'GBP' }
    ]
  };
  
  return fallbackPricing[productId] || [];
  
  // Original Printful API code (commented out for development):
  /*
  try {
    const response = await pf.GET('/products/{id}', {
      params: { path: { id: productId } },
      headers: (pf as any).h()
    });

    if (!response.data || !response.data.result) {
      throw new Error('Failed to fetch product pricing from Printful');
    }

    const product = response.data.result;
    const variants = product.variants || [];

    return variants.map(variant => ({
      productId: product.id,
      variantId: variant.id,
      price: parseFloat(variant.price),
      currency: variant.currency,
      retailPrice: parseFloat(variant.retail_price),
      retailCurrency: variant.retail_currency
    }));
  } catch (error) {
    console.error('Error fetching product pricing:', error);
    throw new Error('Failed to fetch product pricing');
  }
  */
}

/**
 * Get variant pricing by variant ID
 * @param variantId Printful variant ID
 * @returns Promise<PricingInfo | null> Returns null if pricing cannot be fetched
 */
export async function getVariantPricing(variantId: number): Promise<PricingInfo | null> {
  // For development/testing, always use fallback pricing to avoid Printful API issues
  // This eliminates 404 errors and rate limiting problems
  console.log(`Using fallback pricing for variant ${variantId} (Printful API disabled for development)`);
  return getFallbackPricing(variantId);
  
  // Original Printful API code (commented out for development):
  /*
  try {
    const response = await pf.GET('/products/variants/{id}', {
      params: { path: { id: variantId } },
      headers: (pf as any).h()
    });

    if (!response.data || !response.data.result) {
      console.warn(`No pricing data returned for variant ${variantId}`);
      return getFallbackPricing(variantId);
    }

    const variant = response.data.result;
    
    // Handle different response structures
    if (variant && typeof variant === 'object') {
      return {
        productId: variant.product_id || 0,
        variantId: variant.id || variantId,
        price: parseFloat(variant.price || '0'),
        currency: variant.currency || 'GBP',
        retailPrice: parseFloat(variant.retail_price || variant.price || '0'),
        retailCurrency: variant.retail_currency || variant.currency || 'GBP'
      };
    }
    
    return getFallbackPricing(variantId);
  } catch (error: any) {
    console.error(`Error fetching variant pricing for ${variantId}:`, error);
    
    // Check if it's an authentication error
    if (error.status === 401 || error.status === 403) {
      console.warn('Authentication failed for Printful API - check VITE_SUPABASE_ANON_KEY and PRINTFUL_TOKEN');
    } else if (error.status === 404) {
      console.warn(`Variant ${variantId} not found in Printful API - using fallback pricing`);
      // Return fallback pricing instead of null for 404 errors
      return getFallbackPricing(variantId);
    } else if (error.status === 429) {
      console.warn('Printful API rate limited - using fallback pricing');
      return getFallbackPricing(variantId);
    } else if (error.status >= 500) {
      console.warn('Printful API server error - using fallback pricing');
      return getFallbackPricing(variantId);
    }
    
    // For other errors, try fallback pricing
    console.warn(`Using fallback pricing for variant ${variantId} due to error:`, error.status);
    return getFallbackPricing(variantId);
  }
  */
}

/**
 * Get catalog pricing for multiple products
 * @param productIds Array of Printful product IDs
 * @returns Promise<Map<number, PricingInfo[]>>
 */
export async function getCatalogPricing(productIds: number[]): Promise<Map<number, PricingInfo[]>> {
  const pricingMap = new Map<number, PricingInfo[]>();
  
  try {
    // Fetch pricing for each product in parallel
    const pricingPromises = productIds.map(async (productId) => {
      try {
        const pricing = await getProductPricing(productId);
        return { productId, pricing };
      } catch (error) {
        console.error(`Failed to fetch pricing for product ${productId}:`, error);
        return { productId, pricing: [] };
      }
    });

    const results = await Promise.all(pricingPromises);
    
    results.forEach(({ productId, pricing }) => {
      pricingMap.set(productId, pricing);
    });

    return pricingMap;
  } catch (error) {
    console.error('Error fetching catalog pricing:', error);
    throw new Error('Failed to fetch catalog pricing');
  }
}

/**
 * Convert price to minor units (e.g., pounds to pence)
 * @param price Price in major units
 * @param currency Currency code
 * @returns Price in minor units
 */
export function toMinor(price: number, currency: string = 'GBP'): number {
  // For GBP, convert pounds to pence
  if (currency === 'GBP') {
    return Math.round(price * 100);
  }
  
  // For USD, convert dollars to cents
  if (currency === 'USD') {
    return Math.round(price * 100);
  }
  
  // For EUR, convert euros to cents
  if (currency === 'EUR') {
    return Math.round(price * 100);
  }
  
  // Default: assume 100 minor units per major unit
  return Math.round(price * 100);
}

/**
 * Convert price from minor units to major units (e.g., pence to pounds)
 * @param price Price in minor units
 * @param currency Currency code
 * @returns Price in major units
 */
export function toMajor(price: number, currency: string = 'GBP'): number {
  // For GBP, convert pence to pounds
  if (currency === 'GBP') {
    return price / 100;
  }
  
  // For USD, convert cents to dollars
  if (currency === 'USD') {
    return price / 100;
  }
  
  // For EUR, convert cents to euros
  if (currency === 'EUR') {
    return price / 100;
  }
  
  // Default: assume 100 minor units per major unit
  return price / 100;
}

/**
 * Get fallback pricing data for when Printful API is unavailable
 * @param variantId Printful variant ID
 * @returns PricingInfo | null Fallback pricing data
 */
function getFallbackPricing(variantId: number): PricingInfo | null {
  // Fallback pricing for common products when Printful API is unavailable
  const fallbackPricing: Record<number, PricingInfo> = {
    // T-Shirt variants (4016-4115 range)
    4016: { productId: 1, variantId: 4016, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' },
    4017: { productId: 1, variantId: 4017, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' },
    4018: { productId: 1, variantId: 4018, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' },
    4019: { productId: 1, variantId: 4019, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' },
    4020: { productId: 1, variantId: 4020, price: 26.99, currency: 'GBP', retailPrice: 26.99, retailCurrency: 'GBP' },
    4021: { productId: 1, variantId: 4021, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' },
    4022: { productId: 1, variantId: 4022, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' },
    4023: { productId: 1, variantId: 4023, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' },
    4024: { productId: 1, variantId: 4024, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' },
    4025: { productId: 1, variantId: 4025, price: 26.99, currency: 'GBP', retailPrice: 26.99, retailCurrency: 'GBP' },
    
    // Hoodie variants (5000-5099 range)
    5000: { productId: 2, variantId: 5000, price: 39.99, currency: 'GBP', retailPrice: 39.99, retailCurrency: 'GBP' },
    5001: { productId: 2, variantId: 5001, price: 39.99, currency: 'GBP', retailPrice: 39.99, retailCurrency: 'GBP' },
    5002: { productId: 2, variantId: 5002, price: 39.99, currency: 'GBP', retailPrice: 39.99, retailCurrency: 'GBP' },
    5003: { productId: 2, variantId: 5003, price: 39.99, currency: 'GBP', retailPrice: 39.99, retailCurrency: 'GBP' },
    5004: { productId: 2, variantId: 5004, price: 41.99, currency: 'GBP', retailPrice: 41.99, retailCurrency: 'GBP' },
    
    // Cap variants (6000-6005 range) - including the problematic 6004
    6000: { productId: 3, variantId: 6000, price: 19.99, currency: 'GBP', retailPrice: 19.99, retailCurrency: 'GBP' },
    6001: { productId: 3, variantId: 6001, price: 19.99, currency: 'GBP', retailPrice: 19.99, retailCurrency: 'GBP' },
    6002: { productId: 3, variantId: 6002, price: 19.99, currency: 'GBP', retailPrice: 19.99, retailCurrency: 'GBP' },
    6003: { productId: 3, variantId: 6003, price: 19.99, currency: 'GBP', retailPrice: 19.99, retailCurrency: 'GBP' },
    6004: { productId: 3, variantId: 6004, price: 19.99, currency: 'GBP', retailPrice: 19.99, retailCurrency: 'GBP' }, // Black Cap
    6005: { productId: 3, variantId: 6005, price: 19.99, currency: 'GBP', retailPrice: 19.99, retailCurrency: 'GBP' },
    
    // Mug variants (7000-7099 range)
    7000: { productId: 4, variantId: 7000, price: 9.99, currency: 'GBP', retailPrice: 9.99, retailCurrency: 'GBP' },
    
    // Tote Bag variants (8000-8099 range)
    8000: { productId: 5, variantId: 8000, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' },
    
    // Water Bottle variants (9000-9099 range)
    9000: { productId: 6, variantId: 9000, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' },
    
    // Mouse Pad variants (10000-10099 range)
    10000: { productId: 7, variantId: 10000, price: 14.99, currency: 'GBP', retailPrice: 14.99, retailCurrency: 'GBP' }
  };
  
  const fallback = fallbackPricing[variantId];
  if (fallback) {
    console.log(`Using fallback pricing for variant ${variantId}: £${fallback.price}`);
    return fallback;
  }
  
  // If no specific fallback found, try to determine product type and use default pricing
  if (variantId >= 4000 && variantId < 5000) {
    // T-shirt range
    return { productId: 1, variantId, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' };
  } else if (variantId >= 5000 && variantId < 6000) {
    // Hoodie range
    return { productId: 2, variantId, price: 39.99, currency: 'GBP', retailPrice: 39.99, retailCurrency: 'GBP' };
  } else if (variantId >= 6000 && variantId < 7000) {
    // Cap range
    return { productId: 3, variantId, price: 19.99, currency: 'GBP', retailPrice: 19.99, retailCurrency: 'GBP' };
  } else if (variantId >= 7000 && variantId < 8000) {
    // Mug range
    return { productId: 4, variantId, price: 9.99, currency: 'GBP', retailPrice: 9.99, retailCurrency: 'GBP' };
  } else if (variantId >= 8000 && variantId < 9000) {
    // Tote bag range
    return { productId: 5, variantId, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' };
  } else if (variantId >= 9000 && variantId < 10000) {
    // Water bottle range
    return { productId: 6, variantId, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' };
  } else if (variantId >= 10000 && variantId < 10100) {
    // Mouse pad range
    return { productId: 7, variantId, price: 14.99, currency: 'GBP', retailPrice: 14.99, retailCurrency: 'GBP' };
  }
  
  console.warn(`No fallback pricing available for variant ${variantId}`);
  return null;
}
