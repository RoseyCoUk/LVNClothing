# Bundle Variant Selection Fix

## Problem Statement
Customers ordering bundles (Starter, Champion, Activist) were receiving incorrect product variants. When a customer selected specific colors and sizes (e.g., Navy Large Hoodie, Navy Large T-shirt, Navy Cap), Printful was receiving hardcoded default variants instead (Black Large Hoodie, Black Medium T-shirt, Black Cap).

## Root Cause Analysis

### Issue Location
The problem was in the webhook handler (`supabase/functions/stripe-webhook2/index.ts`) at lines 471-495.

### Specific Problem
The webhook was ignoring the `printful_variant_id` sent from the frontend and using hardcoded default variant IDs:
```typescript
// OLD CODE - PROBLEMATIC
const BUNDLE_VARIANT_IDS: Record<string, number> = {
  'tshirt': 4938821288,  // Always Black, Size M
  'hoodie': 4938800535,  // Always Black, Size L  
  'cap': 4938937571,     // Always Black
  // ... other products
};
const printfulVariantId = BUNDLE_VARIANT_IDS[productType]; // Ignores customer selection!
```

## Solution Implemented

### 1. Webhook Handler Fix
Modified the webhook to use the actual variant ID from the frontend:
```typescript
// NEW CODE - FIXED
if (item.printful_variant_id) {
  // Use the customer-selected variant ID sent from frontend
  console.log(`Using customer-selected variant ID: ${item.printful_variant_id}`);
  return {
    ...item,
    printful_variant_id: item.printful_variant_id
  };
}
// Only use hardcoded defaults as absolute last resort
```

### 2. Frontend Variant Lookup Fixes

#### ActivistBundlePage.tsx
- Fixed import: Changed from `useHoodieVariants` to `findHoodieVariant`
- Added design parameter to hoodie lookups (DARK/LIGHT based on color)
- Ensured correct catalog variant IDs are sent in cart items

#### ChampionBundlePage.tsx
- Applied same fixes as ActivistBundlePage
- Fixed hoodie variant lookups with design parameter

### 3. Data Flow Verification
The corrected flow is now:
1. **User Selection**: Customer selects Navy/Large/etc.
2. **Frontend Lookup**: `findHoodieVariant("DARK", "L", "Navy")` returns catalogVariantId: 5541
3. **Cart Storage**: Item includes `printful_variant_id: 5541`
4. **Payment Intent**: Passes variant data through metadata
5. **Webhook Processing**: Uses actual `printful_variant_id` from item
6. **Printful Order**: Receives correct variant ID (5541 for Navy Large Hoodie)

## Files Modified

### Backend
- `/supabase/functions/stripe-webhook2/index.ts` - Fixed variant mapping logic

### Frontend  
- `/src/components/products/ActivistBundlePage.tsx` - Fixed hoodie variant lookups
- `/src/components/products/ChampionBundlePage.tsx` - Fixed hoodie variant lookups

### Testing
- `/scripts/test-bundle-variant-mapping.ts` - Created test script to verify variant lookups

## Testing Results
```
✅ Navy Large Hoodie: catalogVariantId 5541 (was defaulting to 4938800535)
✅ Navy Cap: catalogVariantId 7857 (was defaulting to 4938937571)
✅ Correct variant IDs flow from frontend to backend
```

## Deployment Requirements
1. Deploy the webhook changes to production
2. Frontend changes will take effect immediately (client-side)
3. Test with a real order to verify Printful receives correct variants

## Impact
- Customers will now receive the exact colors and sizes they order
- No more mismatched orders
- Proper inventory tracking in Printful
- Improved customer satisfaction

## Monitoring
After deployment, monitor:
1. Webhook logs for "Using customer-selected variant ID" messages
2. Printful order details to verify correct variants
3. Customer feedback on order accuracy