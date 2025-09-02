// Fallback variant data for payment processing when database is not populated
// This should be temporary until the database is properly synced

interface VariantFallback {
  catalogVariantId: number;
  price: number;
  productType: 'tshirt' | 'hoodie' | 'cap' | 'mug' | 'bag' | 'bottle' | 'mousepad';
}

// T-Shirt variants (from tshirt-variants-merged-fixed.ts)
const TSHIRT_FALLBACKS: VariantFallback[] = [
  // DARK T-shirts - Black, Navy, Red, Purple, Brown (S-2XL)
  // Fixed: Use consistent pricing as defined in tshirt-variants-merged-fixed.ts
  ...Array.from({ length: 60 }, (_, i) => {
    const baseId = 10000 + i;
    // All variants are £24.99 as per actual variant data
    const price = 24.99;
    
    return {
      catalogVariantId: baseId,
      price,
      productType: 'tshirt' as const
    };
  }),
  
  // LIGHT T-shirts - White, Light Blue, Pink, Yellow (S-2XL) 
  // Fixed: Use consistent pricing as defined in tshirt-variants-merged-fixed.ts
  ...Array.from({ length: 40 }, (_, i) => {
    const baseId = 20000 + i;
    // All variants are £24.99 as per actual variant data
    const price = 24.99; 
    
    return {
      catalogVariantId: baseId,
      price,
      productType: 'tshirt' as const
    };
  })
];

// Hoodie variants (from hoodie-variants-merged-fixed.ts)  
const HOODIE_FALLBACKS: VariantFallback[] = [
  // DARK Hoodies - Real Printful IDs
  { catalogVariantId: 5530, price: 39.99, productType: 'hoodie' }, // Black S
  { catalogVariantId: 5531, price: 39.99, productType: 'hoodie' }, // Black M
  { catalogVariantId: 5532, price: 39.99, productType: 'hoodie' }, // Black L
  { catalogVariantId: 5533, price: 39.99, productType: 'hoodie' }, // Black XL
  { catalogVariantId: 5534, price: 44.99, productType: 'hoodie' }, // Black 2XL
  
  { catalogVariantId: 5540, price: 39.99, productType: 'hoodie' }, // Navy S
  { catalogVariantId: 5541, price: 39.99, productType: 'hoodie' }, // Navy M
  { catalogVariantId: 5542, price: 39.99, productType: 'hoodie' }, // Navy L
  { catalogVariantId: 5543, price: 39.99, productType: 'hoodie' }, // Navy XL
  { catalogVariantId: 5544, price: 44.99, productType: 'hoodie' }, // Navy 2XL
  
  // LIGHT Hoodies - Real Printful IDs
  { catalogVariantId: 5610, price: 39.99, productType: 'hoodie' }, // White S
  { catalogVariantId: 5611, price: 39.99, productType: 'hoodie' }, // White M  
  { catalogVariantId: 5612, price: 39.99, productType: 'hoodie' }, // White L
  { catalogVariantId: 5613, price: 39.99, productType: 'hoodie' }, // White XL
  { catalogVariantId: 5614, price: 44.99, productType: 'hoodie' }, // White 2XL
  
  // Add more hoodie variants as needed...
  ...Array.from({ length: 30 }, (_, i) => ({
    catalogVariantId: 5700 + i, // Estimated IDs for other colors
    price: i % 5 === 4 ? 44.99 : 39.99, // 2XL more expensive
    productType: 'hoodie' as const
  }))
];

// Other product fallbacks
const OTHER_FALLBACKS: VariantFallback[] = [
  // Caps
  ...Array.from({ length: 10 }, (_, i) => ({
    catalogVariantId: 6000 + i,
    price: 19.99,
    productType: 'cap' as const
  })),
  
  // Mugs
  ...Array.from({ length: 5 }, (_, i) => ({
    catalogVariantId: 7000 + i,
    price: 14.99,
    productType: 'mug' as const
  })),
  
  // Tote bags
  ...Array.from({ length: 10 }, (_, i) => ({
    catalogVariantId: 8000 + i,
    price: 12.99,
    productType: 'bag' as const
  })),
  
  // Water bottles
  ...Array.from({ length: 5 }, (_, i) => ({
    catalogVariantId: 9000 + i,
    price: 16.99,
    productType: 'bottle' as const
  })),
  
  // Mouse pads
  ...Array.from({ length: 5 }, (_, i) => ({
    catalogVariantId: 9500 + i,
    price: 11.99,
    productType: 'mousepad' as const
  }))
];

// Combine all fallbacks into a lookup map
const VARIANT_FALLBACK_MAP = new Map<number, VariantFallback>();

[...TSHIRT_FALLBACKS, ...HOODIE_FALLBACKS, ...OTHER_FALLBACKS].forEach(variant => {
  VARIANT_FALLBACK_MAP.set(variant.catalogVariantId, variant);
});

/**
 * Get fallback price for a Printful variant ID
 * @param printfulVariantId - The Printful catalog variant ID
 * @returns Price in GBP or null if not found
 */
export function getFallbackPrice(printfulVariantId: string | number): number | null {
  const variantId = typeof printfulVariantId === 'string' 
    ? parseInt(printfulVariantId, 10) 
    : printfulVariantId;
    
  if (isNaN(variantId)) return null;
  
  const fallback = VARIANT_FALLBACK_MAP.get(variantId);
  return fallback?.price || null;
}

/**
 * Get product type for a Printful variant ID
 * @param printfulVariantId - The Printful catalog variant ID  
 * @returns Product type or null if not found
 */
export function getProductType(printfulVariantId: string | number): string | null {
  const variantId = typeof printfulVariantId === 'string' 
    ? parseInt(printfulVariantId, 10) 
    : printfulVariantId;
    
  if (isNaN(variantId)) return null;
  
  const fallback = VARIANT_FALLBACK_MAP.get(variantId);
  return fallback?.productType || null;
}

/**
 * Check if a variant ID is supported
 * @param printfulVariantId - The Printful catalog variant ID
 * @returns true if the variant is supported
 */
export function isVariantSupported(printfulVariantId: string | number): boolean {
  const variantId = typeof printfulVariantId === 'string' 
    ? parseInt(printfulVariantId, 10) 
    : printfulVariantId;
    
  if (isNaN(variantId)) return false;
  
  return VARIANT_FALLBACK_MAP.has(variantId);
}