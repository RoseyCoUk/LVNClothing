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
  try {
    const response = await pf.GET('/products/{id}', {
      params: { path: { id: productId } },
      headers: pf.h()
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
}

/**
 * Get variant pricing by variant ID
 * @param variantId Printful variant ID
 * @returns Promise<PricingInfo | null> Returns null if pricing cannot be fetched
 */
export async function getVariantPricing(variantId: number): Promise<PricingInfo | null> {
  try {
    const response = await pf.GET('/products/variants/{id}', {
      params: { path: { id: variantId } },
      headers: pf.h()
    });

    if (!response.data || !response.data.result) {
      console.warn(`No pricing data returned for variant ${variantId}`);
      return null;
    }

    const variant = response.data.result;
    
    return {
      productId: variant.product_id,
      variantId: variant.id,
      price: parseFloat(variant.price),
      currency: variant.currency,
      retailPrice: parseFloat(variant.retail_price),
      retailCurrency: variant.retail_currency
    };
  } catch (error) {
    console.error(`Error fetching variant pricing for ${variantId}:`, error);
    
    // Check if it's an authentication error
    if (error.status === 401 || error.status === 403) {
      console.warn('Authentication failed for Printful API - check VITE_SUPABASE_ANON_KEY and PRINTFUL_TOKEN');
    } else if (error.status === 404) {
      console.warn(`Variant ${variantId} not found in Printful API`);
    } else if (error.status >= 500) {
      console.warn('Printful API server error - service may be temporarily unavailable');
    }
    
    // Return null instead of throwing to allow graceful degradation
    return null;
  }
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
    // T-Shirt variants
    201: { productId: 1, variantId: 201, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' },
    202: { productId: 1, variantId: 202, price: 24.99, currency: 'GBP', retailPrice: 24.99, retailCurrency: 'GBP' },
    // Hoodie variants
    301: { productId: 2, variantId: 301, price: 39.99, currency: 'GBP', retailPrice: 39.99, retailCurrency: 'GBP' },
    302: { productId: 2, variantId: 302, price: 39.99, currency: 'GBP', retailPrice: 39.99, retailCurrency: 'GBP' },
    // Cap variants
    401: { productId: 3, variantId: 401, price: 19.99, currency: 'GBP', retailPrice: 19.99, retailCurrency: 'GBP' },
    402: { productId: 3, variantId: 402, price: 19.99, currency: 'GBP', retailPrice: 19.99, retailCurrency: 'GBP' },
  };
  
  return fallbackPricing[variantId] || null;
}
