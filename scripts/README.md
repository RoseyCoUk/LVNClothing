# Printful Variant ID Testing Scripts

This directory contains comprehensive testing scripts to validate Printful variant IDs and shipping quote accuracy.

## Overview

The system uses two types of variant IDs:
- **Catalog Variant IDs**: Short numeric IDs used by Printful's public API (e.g., 8923, 5530)
- **Sync Variant IDs**: Long numeric IDs used internally by Printful's sync API (e.g., 4938821282, 4938800533)

**Critical**: The shipping quotes API requires **catalog variant IDs**, not sync variant IDs. The edge function converts sync IDs to catalog IDs using an embedded mapping table.

## Testing Scripts

### 1. Comprehensive Variant Test
```bash
npm run test:variants:comprehensive
# OR
npx tsx scripts/comprehensive-variant-test.ts
```

**Purpose**: Validates all variant ID configurations across all product types.

**Tests**:
- ✅ Individual product variant structures (T-shirts, Hoodies, Caps, etc.)
- ✅ Catalog vs Sync variant ID consistency 
- ✅ Bundle configurations and product mappings
- ✅ Shipping quote API with different variant ID formats
- ✅ Edge cases and error handling

**Expected Results**: All 157 variants should be valid with no duplicates.

### 2. Shipping Quote Comparison Test
```bash
npm run test:shipping:comparison
# OR
npx tsx scripts/shipping-quote-comparison.ts
```

**Purpose**: Verifies that catalog and sync variant IDs produce identical shipping quotes.

**Tests**:
- 🔍 Individual products with both catalog and sync variant IDs
- 🔍 Mixed bundles with multiple product types
- 🔍 Side-by-side rate comparisons

**Expected Results**: Perfect matches (100% success rate). If mismatches occur, it indicates wrong variant IDs are being sent to Printful.

### 3. Printful Integration Validator
```bash
npm run test:printful:validate
# OR
npx tsx scripts/validate-printful-integration.ts
```

**Purpose**: Comprehensive integration testing with detailed analysis.

**Tests**:
- 📋 Variant ID mapping accuracy and statistics
- 🚚 Shipping quote consistency across different destinations
- 🎁 Bundle handling with multiple product combinations
- 🔧 Edge function conversion logic validation

**Expected Results**: All tests should pass with detailed reporting of any issues.

## Test Results Interpretation

### ✅ All Tests Pass
- Variant ID system is working correctly
- Customers should receive accurate shipping quotes
- No action needed

### ❌ Tests Fail

**Variant Structure Issues**:
- Fix variant files in `/src/hooks/*-variants.ts`
- Remove duplicate IDs
- Ensure all variants have valid catalog and sync IDs

**Shipping Quote Mismatches**:
- Update the `SYNC_TO_CATALOG_MAPPINGS` in `/supabase/functions/shipping-quotes/index.ts`
- Verify all mappings are current and correct
- Check Printful API credentials

**Bundle Configuration Issues**:
- Verify bundle product IDs match variant file product types
- Check bundle pricing logic in `/src/lib/bundle-pricing.ts`

## Product Type Mapping

| Product ID | Product Type | Variant Count |
|------------|-------------|---------------|
| 1 | T-Shirt | 100 |
| 2 | Hoodie | 45 |
| 3 | Cap | 8 |
| 4 | Mug | 1 |
| 5 | Tote Bag | 1 |
| 6 | Water Bottle | 1 |
| 7 | Mouse Pad | 1 |

## Bundle Configurations

### Starter Bundle
- T-Shirt (Product ID: 1)
- Cap (Product ID: 3) 
- Mug (Product ID: 4)

### Champion Bundle
- Hoodie (Product ID: 2)
- T-Shirt (Product ID: 1)
- Cap (Product ID: 3)
- Tote Bag (Product ID: 5)

### Activist Bundle
- Hoodie (Product ID: 2)
- T-Shirt (Product ID: 1) 
- Cap (Product ID: 3)
- Tote Bag (Product ID: 5)
- Water Bottle (Product ID: 6)
- Mug (Product ID: 4)
- Mouse Pad (Product ID: 7)

## Troubleshooting

### Issue: Wrong shipping quotes
1. Run the shipping comparison test to identify mismatches
2. Check if sync-to-catalog conversion is working
3. Verify Printful API credentials and store configuration
4. Update variant mappings if needed

### Issue: Variant not found errors
1. Run the comprehensive variant test to find invalid IDs
2. Re-sync with Printful using `npm run printful:sync`
3. Update the edge function mapping table

### Issue: Bundle pricing inconsistencies
1. Verify bundle configurations match product types
2. Check variant selection logic in frontend components
3. Test individual products vs bundle combinations

## Development Workflow

1. **After Printful sync**: Run comprehensive variant test
2. **Before deployment**: Run all three test scripts
3. **After variant changes**: Run shipping quote comparison
4. **During debugging**: Use the detailed validator for analysis

## Files Modified/Created

- `/scripts/comprehensive-variant-test.ts` - Main validation script
- `/scripts/shipping-quote-comparison.ts` - Quote comparison testing
- `/scripts/validate-printful-integration.ts` - Detailed integration testing
- `/package.json` - Added npm script entries
- `/scripts/README.md` - This documentation

## Edge Function Configuration

The shipping quotes edge function at `/supabase/functions/shipping-quotes/index.ts` contains:
- Embedded sync-to-catalog variant ID mappings
- Automatic conversion logic for different variant ID formats  
- Fallback shipping options when Printful API fails
- Comprehensive logging for debugging

Critical: Keep the `SYNC_TO_CATALOG_MAPPINGS` table updated when variant IDs change.