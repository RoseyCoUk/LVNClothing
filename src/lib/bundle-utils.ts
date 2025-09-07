import { CartItem } from '../contexts/CartContext';
import { BUNDLES } from './bundle-pricing';

// Printful sync variant IDs for bundle items (from database)
const BUNDLE_VARIANT_IDS = {
  tshirt: 4938821288, // Default t-shirt variant ID (Black, Size M)
  hoodie: 4938800535, // Default hoodie variant ID (Black, Size L)  
  mug: 4938946337,    // Mug variant ID
  cap: 4938937571,    // Cap variant ID (Black)
  tote: 4937855201,   // Tote bag variant ID
  water: 4938941055,  // Water bottle variant ID
  mousepad: 4938942751 // Mouse pad variant ID
};

/**
 * Expands bundle items into individual products for shipping calculation
 * Bundles need to be expanded because Printful calculates shipping per item
 */
export function expandBundlesForShipping(cartItems: CartItem[]): Array<{
  printful_variant_id: number;
  quantity: number;
}> {
  const expandedItems: Array<{ printful_variant_id: number; quantity: number }> = [];

  for (const item of cartItems) {
    if (item.isBundle && item.bundleContents) {
      // This is a bundle, expand it into individual items
      for (const bundleItem of item.bundleContents) {
        // Get the appropriate variant ID based on the product type
        let variantId: number;
        
        // Check the item name to determine product type
        const itemNameLower = bundleItem.name.toLowerCase();
        
        if (itemNameLower.includes('t-shirt') || itemNameLower.includes('tshirt')) {
          variantId = bundleItem.printful_variant_id || BUNDLE_VARIANT_IDS.tshirt;
        } else if (itemNameLower.includes('hoodie')) {
          variantId = bundleItem.printful_variant_id || BUNDLE_VARIANT_IDS.hoodie;
        } else if (itemNameLower.includes('mug')) {
          variantId = bundleItem.printful_variant_id || BUNDLE_VARIANT_IDS.mug;
        } else if (itemNameLower.includes('cap')) {
          variantId = bundleItem.printful_variant_id || BUNDLE_VARIANT_IDS.cap;
        } else {
          // Fallback to the bundle item's variant ID or a default
          variantId = bundleItem.printful_variant_id || parseInt(bundleItem.id.toString());
        }

        expandedItems.push({
          printful_variant_id: variantId,
          quantity: bundleItem.quantity * item.quantity // Multiply by bundle quantity
        });
      }
    } else {
      // Regular item, just add it directly
      expandedItems.push({
        printful_variant_id: item.printful_variant_id || parseInt(item.id.toString()),
        quantity: item.quantity
      });
    }
  }

  return expandedItems;
}

/**
 * Gets bundle contents with proper variant IDs for a bundle key
 */
export function getBundleContentsWithVariantIds(bundleKey: string) {
  const bundle = BUNDLES[bundleKey as keyof typeof BUNDLES];
  if (!bundle) return [];

  const contents = [];
  
  for (const product of bundle.products) {
    let variantId: number;
    
    switch (product) {
      case 'tshirt':
        variantId = BUNDLE_VARIANT_IDS.tshirt;
        break;
      case 'hoodie':
        variantId = BUNDLE_VARIANT_IDS.hoodie;
        break;
      case 'mug':
        variantId = BUNDLE_VARIANT_IDS.mug;
        break;
      case 'cap':
        variantId = BUNDLE_VARIANT_IDS.cap;
        break;
      default:
        variantId = 0;
    }

    contents.push({
      product,
      printful_variant_id: variantId,
      quantity: 1
    });
  }

  return contents;
}