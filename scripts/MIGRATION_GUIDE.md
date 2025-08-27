# Migration Guide: From Mock IDs to Real Printful IDs

This guide helps you transition from your current variant structure with mock Printful IDs to the new structure with real Printful catalog variant IDs.

## Current Structure (Mock IDs)

Your current variant files look like this:

```typescript
// src/hooks/hoodie-variants.ts (current)
export const hoodieVariants = [
  { 
    id: 201, 
    name: "Black Hoodie - S", 
    color: "Black", 
    size: "S", 
    price: "39.99", 
    in_stock: true, 
    printful_variant_id: 5000,  // ❌ Mock ID
    color_code: "#0b0b0b" 
  },
  // ... more variants
];

// Helper functions
export const getHoodieVariant = (color: string, size: string) => {
  return hoodieVariants.find(variant => variant.color === color && variant.size === size);
};
```

## New Structure (Real Printful IDs)

After running the sync script, your files will look like this:

```typescript
// src/hooks/hoodie-variants.ts (new)
export type HoodieVariant = {
  key: string;                    // Stable identifier
  catalogVariantId: number;       // Real Printful catalog variant ID
  syncVariantId: number;          // Your store's sync variant ID
  price?: string;                 // Price from Printful
  name: string;                   // Variant name
  externalId?: string;            // External ID if set
  sku?: string;                   // SKU if set
};

export const HoodieVariants: HoodieVariant[] = [
  {
    key: "black-hoodie-s",
    catalogVariantId: 12345,      // ✅ Real Printful ID
    syncVariantId: 67890,
    price: "39.99",
    name: "Black Hoodie - S",
    externalId: "hoodie-black-s",
    sku: "HOODIE-BLK-S",
  },
  // ... more variants
];

// Helper functions
export function findHoodieVariant(key: string): HoodieVariant | undefined;
export function findHoodieVariantByCatalogId(catalogVariantId: number): HoodieVariant | undefined;
```

## Step-by-Step Migration

### Phase 1: Prepare Your Environment

1. **Get Printful API Access**:
   ```bash
   # Get your API token from Printful Dashboard
   # Settings → API → Create Private Token
   
   # Find your store ID
   curl -H "Authorization: Bearer $PRINTFUL_TOKEN" https://api.printful.com/v2/stores
   ```

2. **Set Environment Variables**:
   ```bash
   # Add to .env.local
   PRINTFUL_TOKEN=your_private_token_here
   PRINTFUL_STORE_ID=your_store_id_here
   ```

3. **Run the Sync Script**:
   ```bash
   npm run printful:sync
   ```

### Phase 2: Update Your Frontend Code

#### Update Import Statements

```typescript
// OLD
import { hoodieVariants, getHoodieVariant } from '@/hooks/hoodie-variants';

// NEW
import { HoodieVariants, findHoodieVariant } from '@/hooks/hoodie-variants';
```

#### Update Variant Lookups

```typescript
// OLD WAY
const variant = getHoodieVariant("Black", "S");
if (variant) {
  const lineItem = {
    variant_id: variant.printful_variant_id, // ❌ Mock ID
    quantity: 1,
  };
}

// NEW WAY
const variant = findHoodieVariant("black-hoodie-s");
if (variant) {
  const lineItem = {
    variant_id: variant.catalogVariantId, // ✅ Real Printful ID
    quantity: 1,
  };
}
```

#### Update Color/Size Selection Logic

```typescript
// OLD WAY
const colors = [...new Set(hoodieVariants.map(v => v.color))];
const sizes = [...new Set(hoodieVariants.map(v => v.size))];

// NEW WAY
const colors = [...new Set(HoodieVariants.map(v => v.name.split(' - ')[1]))];
const sizes = [...new Set(HoodieVariants.map(v => v.name.split(' - ')[2]))];

// Or better: create stable keys
const variantKeys = HoodieVariants.map(v => v.key);
// variantKeys = ["black-hoodie-s", "black-hoodie-m", "navy-hoodie-s", ...]
```

### Phase 3: Update Product Pages

#### Example: HoodiePage.tsx

```typescript
// OLD
import { hoodieVariants, getHoodieVariant } from '@/hooks/hoodie-variants';

const HoodiePage = () => {
  const [selectedColor, setSelectedColor] = useState("Black");
  const [selectedSize, setSelectedSize] = useState("S");
  
  const variant = getHoodieVariant(selectedColor, selectedSize);
  
  const handleAddToCart = () => {
    if (variant) {
      addToCart({
        variant_id: variant.printful_variant_id, // ❌ Mock ID
        quantity: 1,
      });
    }
  };
  
  // ... rest of component
};

// NEW
import { HoodieVariants, findHoodieVariant } from '@/hooks/hoodie-variants';

const HoodiePage = () => {
  const [selectedVariantKey, setSelectedVariantKey] = useState("black-hoodie-s");
  
  const variant = findHoodieVariant(selectedVariantKey);
  
  const handleAddToCart = () => {
    if (variant) {
      addToCart({
        variant_id: variant.catalogVariantId, // ✅ Real Printful ID
        quantity: 1,
      });
    }
  };
  
  // ... rest of component
};
```

### Phase 4: Update Cart and Checkout

#### Cart Context Updates

```typescript
// OLD
interface CartItem {
  id: number;
  printful_variant_id: number; // ❌ Mock ID
  quantity: number;
}

// NEW
interface CartItem {
  id: number;
  catalogVariantId: number; // ✅ Real Printful ID
  quantity: number;
}
```

#### Checkout Integration

```typescript
// OLD
const createOrder = async (cartItems: CartItem[]) => {
  const lineItems = cartItems.map(item => ({
    variant_id: item.printful_variant_id, // ❌ Mock ID
    quantity: item.quantity,
  }));
  
  // ... rest of order creation
};

// NEW
const createOrder = async (cartItems: CartItem[]) => {
  const lineItems = cartItems.map(item => ({
    variant_id: item.catalogVariantId, // ✅ Real Printful ID
    quantity: item.quantity,
  }));
  
  // ... rest of order creation
};
```

## Migration Strategies

### Strategy 1: Gradual Migration (Recommended)

1. **Keep both structures temporarily**:
   ```typescript
   // Keep old structure for backward compatibility
   export const hoodieVariants = [...];
   
   // Add new structure
   export const HoodieVariants: HoodieVariant[] = [...];
   
   // Migration helper
   export function migrateVariant(oldVariant: any): HoodieVariant | null {
     // Implementation to convert old to new
   }
   ```

2. **Update components one by one**:
   - Start with simple components (product displays)
   - Move to complex components (cart, checkout)
   - Remove old structure when all components are updated

### Strategy 2: Big Bang Migration

1. **Run sync script**
2. **Update all components at once**
3. **Test thoroughly**
4. **Deploy**

⚠️ **Risk**: Higher chance of breaking changes

### Strategy 3: Feature Flag Migration

```typescript
const USE_NEW_VARIANTS = process.env.VITE_USE_NEW_VARIANTS === 'true';

const getVariant = (color: string, size: string) => {
  if (USE_NEW_VARIANTS) {
    return findHoodieVariant(`${color.toLowerCase()}-hoodie-${size.toLowerCase()}`);
  } else {
    return getHoodieVariant(color, size);
  }
};
```

## Testing Your Migration

### 1. Unit Tests

```typescript
// Test new variant structure
describe('HoodieVariants', () => {
  it('should have real Printful catalog variant IDs', () => {
    HoodieVariants.forEach(variant => {
      expect(variant.catalogVariantId).toBeGreaterThan(1000);
      expect(variant.catalogVariantId).not.toBe(5000); // Old mock ID
    });
  });
  
  it('should have stable keys', () => {
    const keys = HoodieVariants.map(v => v.key);
    const uniqueKeys = new Set(keys);
    expect(keys.length).toBe(uniqueKeys.size);
  });
});
```

### 2. Integration Tests

```typescript
// Test order creation with real IDs
it('should create order with real Printful variant IDs', async () => {
  const variant = findHoodieVariant('black-hoodie-s');
  const order = await createOrder([{
    catalogVariantId: variant!.catalogVariantId,
    quantity: 1,
  }]);
  
  expect(order.status).toBe('success');
});
```

### 3. Manual Testing

1. **Product Selection**: Test color/size selection on product pages
2. **Add to Cart**: Verify items add to cart correctly
3. **Checkout Flow**: Complete a test order
4. **Order Creation**: Verify orders appear in Printful dashboard

## Rollback Plan

If issues arise during migration:

1. **Revert to previous commit**:
   ```bash
   git revert HEAD
   git push
   ```

2. **Restore old variant files**:
   ```bash
   git checkout HEAD~1 -- src/hooks/*-variants.ts
   ```

3. **Update environment variables**:
   ```bash
   # Remove Printful variables temporarily
   unset PRINTFUL_TOKEN
   unset PRINTFUL_STORE_ID
   ```

## Post-Migration Tasks

### 1. Clean Up

- Remove old variant files
- Remove migration helper functions
- Update documentation

### 2. Monitor

- Watch for order creation errors
- Monitor Printful dashboard for successful orders
- Check error logs for variant ID issues

### 3. Optimize

- Set `external_id` or `SKU` in Printful for stable keys
- Implement CI checks to prevent drift
- Set up automated syncs

## Common Issues and Solutions

### Issue: "Unknown variant" errors

**Cause**: Still using mock IDs instead of real catalog variant IDs

**Solution**: Ensure you're using `variant.catalogVariantId` not `variant.printful_variant_id`

### Issue: Variant not found

**Cause**: Key mismatch between frontend and generated variants

**Solution**: Check the generated variant keys and update your frontend logic

### Issue: Price mismatches

**Cause**: Local prices don't match Printful retail prices

**Solution**: Use prices from the generated pricing data or fetch dynamically

### Issue: Missing variants

**Cause**: Products not synced in Printful or sync script failed

**Solution**: Re-run sync script and check Printful dashboard

## Support

If you encounter issues during migration:

1. Check the sync script output for errors
2. Verify your Printful API token and store ID
3. Compare generated variant files with Printful dashboard
4. Check the migration guide examples
5. Review the generated sample files

## Next Steps

After successful migration:

1. **Set stable keys** in Printful (external_id/SKU)
2. **Implement CI checks** to prevent drift
3. **Set up automated syncs** for production
4. **Monitor order success rates**
5. **Optimize variant lookup performance**
