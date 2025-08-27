# Printful Sync Implementation Summary

## Overview

I've implemented a comprehensive solution to replace your mock Printful IDs with real catalog variant IDs from your Printful store. This ensures that when you create orders, you're using the correct identifiers that Printful requires.

## What Was Implemented

### 1. Printful Sync Script (`scripts/printful-sync.ts`)

A Node.js script that:
- Fetches real product data from your Printful store via API
- Automatically categorizes products (tshirt, hoodie, cap, etc.)
- Generates updated variant files with real Printful catalog variant IDs
- Creates pricing data from Printful retail prices
- Handles pagination and API rate limiting
- Provides detailed logging and error handling

### 2. Updated Package.json

Added a new npm script:
```bash
npm run printful:sync
```

### 3. Environment Configuration

Updated `env-template.txt` to include Printful variables:
```bash
PRINTFUL_TOKEN=your_printful_private_token_here
PRINTFUL_STORE_ID=your_printful_store_id_here
```

### 4. Comprehensive Documentation

- **`scripts/README.md`** - Complete usage guide
- **`scripts/MIGRATION_GUIDE.md`** - Step-by-step migration instructions
- **`scripts/sample-updated-variants.ts`** - Example output structure
- **`scripts/setup-printful-sync.sh`** - Automated setup script

## Key Benefits

### ✅ Replace Mock IDs with Real IDs
- **Before**: `printful_variant_id: 5000` (mock)
- **After**: `catalogVariantId: 12345` (real Printful ID)

### ✅ Automatic Product Categorization
- Script automatically detects product types based on names and external IDs
- Generates separate files for each category (tshirt, hoodie, cap, etc.)

### ✅ Real-Time Pricing
- Fetches current retail prices from Printful
- Generates pricing data file for easy access

### ✅ Stable Keys
- Creates consistent identifiers for frontend use
- Prefers external_id/SKU when available, falls back to generated keys

### ✅ Helper Functions
- `findHoodieVariant(key)` - Find variant by stable key
- `findHoodieVariantByCatalogId(id)` - Find variant by catalog ID
- Easy migration from old structure

## How It Works

### 1. API Integration
```typescript
// Script connects to Printful API
const stores = await getJSON<Store[]>("https://api.printful.com/v2/stores");
const products = await getJSON<SyncProduct[]>(`https://api.printful.com/v2/stores/${STORE_ID}/sync-products`);
```

### 2. Product Processing
```typescript
// For each product, fetch variants
const variants = await getSyncProductVariants(product.id);
const category = detectCategory(product); // Auto-categorization

// Extract real Printful IDs
const entry = {
  key: variant.external_id || variant.sku || `${product.name}-${variant.name}`,
  catalogVariantId: variant.variant_id,  // Real catalog variant ID
  syncVariantId: variant.id,             // Your store's sync variant ID
  price: variant.retail_price,
  // ... other data
};
```

### 3. File Generation
```typescript
// Generates TypeScript files with proper types
export type HoodieVariant = {
  key: string;
  catalogVariantId: number;  // Use this in orders
  syncVariantId: number;
  price?: string;
  name: string;
  externalId?: string;
  sku?: string;
};
```

## Quick Start

### 1. Get Printful Credentials
```bash
# Get API token from Printful Dashboard
# Settings → API → Create Private Token

# Find your store ID
curl -H "Authorization: Bearer $PRINTFUL_TOKEN" https://api.printful.com/v2/stores
```

### 2. Set Environment Variables
```bash
# Copy template and add your credentials
cp env-template.txt .env.local

# Edit .env.local
PRINTFUL_TOKEN=your_actual_token_here
PRINTFUL_STORE_ID=your_actual_store_id_here
```

### 3. Run the Sync
```bash
# Using npm script (recommended)
npm run printful:sync

# Or directly
tsx scripts/printful-sync.ts
```

### 4. Use Automated Setup (Alternative)
```bash
# Run the setup script
./scripts/setup-printful-sync.sh
```

## Generated Files

After running the sync, you'll have:

```
src/hooks/
├── tshirt-variants.ts      # T-shirt variants with real IDs
├── hoodie-variants.ts      # Hoodie variants with real IDs
├── cap-variants.ts         # Cap variants with real IDs
├── mug-variants.ts         # Mug variants with real IDs
├── totebag-variants.ts     # Tote bag variants with real IDs
├── waterbottle-variants.ts # Water bottle variants with real IDs
└── mousepad-variants.ts    # Mouse pad variants with real IDs

src/lib/printful/
└── pricing-data.ts         # Pricing data for all variants
```

## Migration Strategy

### Phase 1: Run Sync Script
```bash
npm run printful:sync
```

### Phase 2: Update Frontend Code
```typescript
// OLD
import { hoodieVariants, getHoodieVariant } from '@/hooks/hoodie-variants';
const variant = getHoodieVariant("Black", "S");
const lineItem = { variant_id: variant.printful_variant_id, quantity: 1 };

// NEW
import { HoodieVariants, findHoodieVariant } from '@/hooks/hoodie-variants';
const variant = findHoodieVariant("black-hoodie-s");
const lineItem = { variant_id: variant.catalogVariantId, quantity: 1 };
```

### Phase 3: Test and Deploy
- Test product selection and cart functionality
- Verify orders appear in Printful dashboard
- Monitor for any "unknown variant" errors

## Best Practices

### 1. Set Stable Keys in Printful
```typescript
// In Printful Dashboard or via API
external_id: "black-hoodie-s"
sku: "HOODIE-BLK-S"
```

### 2. Regular Syncs
```bash
# Run after adding new products or changing configurations
npm run printful:sync
```

### 3. CI Integration
Consider adding a CI check that runs the sync script and fails if there are new variants that aren't committed.

### 4. Version Control
- Commit the generated variant files
- Don't edit them manually (they'll be overwritten on next sync)
- Review changes before committing

## Troubleshooting

### Common Issues

1. **Missing Token**: Ensure `PRINTFUL_TOKEN` is set in `.env.local`
2. **Invalid Store ID**: Verify your store ID with the stores API endpoint
3. **API Rate Limits**: Script includes delays to respect API limits
4. **Network Issues**: Check internet connection and firewall settings

### Debug Mode

The script provides detailed logging. Check console output for specific error messages.

### Manual Verification

Verify data by checking your Printful Dashboard:
- Stores → Your Store → Products
- Each product shows sync product and variant IDs
- Compare with generated files

## Security Notes

- Never commit your `PRINTFUL_TOKEN` to version control
- Use environment variables for sensitive data
- Consider using a dedicated API token with minimal required permissions
- Rotate tokens regularly for production environments

## Next Steps

1. **Set up your environment** with Printful credentials
2. **Run the sync script** to generate real variant data
3. **Update your frontend code** to use the new structure
4. **Test thoroughly** with real Printful catalog variant IDs
5. **Set stable keys** in Printful for consistent frontend mapping
6. **Consider CI integration** to prevent data drift

## Support

If you encounter issues:

1. Check the console output for error messages
2. Verify your Printful API token and store ID
3. Ensure you have the required API permissions
4. Check the migration guide and documentation
5. Review the generated sample files

## Files Created

- `scripts/printful-sync.ts` - Main sync script
- `scripts/README.md` - Complete usage guide
- `scripts/MIGRATION_GUIDE.md` - Migration instructions
- `scripts/sample-updated-variants.ts` - Example output
- `scripts/setup-printful-sync.sh` - Setup automation
- `PRINTFUL_SYNC_IMPLEMENTATION_SUMMARY.md` - This summary

The implementation follows your preferences for efficiency and provides a robust, automated solution for keeping your Printful integration current with real catalog variant IDs.
