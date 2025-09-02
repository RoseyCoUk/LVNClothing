# PR-02: Frontend PDP/PLP & Admin - Work Order

**Assigned To**: frontend-pdp-plp-refactor  
**Assigned By**: DirectorCTO  
**Date**: 2025-08-31  
**Priority**: CRITICAL  
**Deadline**: 24 hours  

## Executive Summary

The backend infrastructure is now production-ready with PR-01 completed. However, the frontend is sending invalid data that will break the entire fulfillment flow. Your mission is to fix the frontend to work with the robust backend that's now in place.

## Critical Context from PR-01

The backend now enforces strict constraints:
1. **Unique constraint on `stripe_payment_intent_id`** - Prevents duplicate orders at database level
2. **Only `stripe-webhook2` creates orders** - Single source of truth, no other function can create orders
3. **All cart items must have valid `printful_variant_id`** - Numeric IDs from Printful catalog, NOT UUIDs

## Your Mission-Critical Tasks

### 1. Fix Variant Selection (HIGHEST PRIORITY)

**Problem**: Frontend is sending UUID variant IDs instead of Printful numeric IDs. This WILL break fulfillment.

**Required Actions**:
- Open `/src/components/products/DynamicProductPage.tsx`
- Locate the `handleAddToCart` function
- Ensure it uses `printful_variant_id` (numeric) not `id` (UUID)
- Add validation to reject any non-numeric variant IDs
- Clear any legacy UUID items from localStorage cart

**Validation Test**:
```javascript
// Every cart item must pass this test:
const isValidVariant = (item) => {
  return item.printful_variant_id && 
         !isNaN(parseInt(item.printful_variant_id)) &&
         parseInt(item.printful_variant_id) > 0;
};
```

### 2. Fix Product Image Management

**Problem**: Images are hardcoded and don't change with color selection.

**Required Actions**:
- Remove all hardcoded image paths from product pages
- Implement database-driven image loading
- Add color-to-image mapping logic
- Update product gallery to respond to color selection
- Ensure images are loaded from `product_images` table

**Key Files**:
- `/src/components/products/TShirtPage.tsx`
- `/src/components/products/HoodiePage.tsx`
- `/src/components/products/CapPage.tsx`
- All other product pages

### 3. Fix Admin Product Editor

**Problem**: Multiple broken features in admin panel.

**Required Actions**:
1. **Fix "Sync with Printful" button** (line 886 in AdminProductsPage.tsx)
   - Currently calls non-existent function
   - Should trigger `/supabase/functions/printful-sync`
   
2. **Remove duplicate modals**:
   - Find and consolidate BundleManagement components
   - There are currently 2 versions causing conflicts
   
3. **Fix missing VariantManagement**:
   - Component is imported but not defined
   - Either create it or remove the import
   
4. **Wire "Direct Import" correctly**:
   - Should call proper Printful import endpoint
   - Add proper error handling and loading states

### 4. Admin Dashboard Cleanup

**Required Actions**:
- Ensure test orders (£0.00, test emails) are hidden by default
- Add toggle to show/hide test orders when needed
- Fix product sync to use `printful_product_id` not UUID
- Remove or disable non-functional buttons
- Add loading spinners for all async operations

## Technical Requirements

### Cart Validation
Every add-to-cart action MUST include:
```typescript
interface CartItem {
  printful_variant_id: string; // NUMERIC string like "14276"
  product_id: string;          // UUID from database
  quantity: number;
  price: number;
  // ... other fields
}
```

### Error Handling
Display clear error messages:
- "Invalid product variant. Please refresh and try again."
- "This product is currently unavailable."
- "Failed to sync with Printful. Please check your API key." 

## Test Framework
- E2E: Playwright (@playwright/test)
- Unit/Integration: Vitest

### Testing Requirements
Before marking any task complete:
1. Add item to cart and verify `printful_variant_id` is numeric
2. Complete checkout flow to payment
3. Verify order appears in admin panel
4. Test "Sync with Printful" button works
5. Verify images change with color selection

## Files You Must Modify

### Primary Targets:
1. `/src/components/products/DynamicProductPage.tsx` - Fix variant selection
2. `/src/admin/components/AdminProductsPage.tsx` - Fix sync button and modals
3. `/src/components/ui/ProductCard.tsx` - Fix image display
4. `/src/hooks/usePrintfulProducts.ts` - Ensure proper ID handling

### Secondary Targets:
- All individual product pages (TShirtPage, HoodiePage, etc.)
- `/src/contexts/CartContext.tsx` - Add validation
- `/src/components/checkout/DynamicCheckoutPage.tsx` - Validate cart before payment

## Definition of Done

Your PR will be approved when:
1. ✅ All cart items have valid numeric `printful_variant_id`
2. ✅ No UUID variant IDs can be added to cart
3. ✅ Product images change dynamically with color selection
4. ✅ Admin "Sync with Printful" button works
5. ✅ No duplicate modals in admin panel
6. ✅ Test orders hidden by default in admin
7. ✅ Full checkout flow works end-to-end
8. ✅ No console errors or warnings

## Important Warnings

### DO NOT:
- ❌ Modify ANY order creation logic in edge functions
- ❌ Change the database schema
- ❌ Alter webhook handling code
- ❌ Touch `stripe-webhook2` or `confirm-payment-intent` functions

### ALWAYS:
- ✅ Update `/agents/channel.md` with your progress
- ✅ Test the full checkout flow after each change
- ✅ Validate all variant IDs are numeric
- ✅ Clear browser localStorage during testing

## Support & Escalation

If you encounter blockers:
1. Document the specific issue in channel.md
2. Include error messages and line numbers
3. Tag DirectorCTO for guidance
4. Continue with other tasks while awaiting response

## Success Metrics

Your work will directly enable:
- Production-ready checkout flow
- Successful Printful fulfillment
- Accurate order tracking
- Professional admin experience

This is critical path work. The entire platform depends on these fixes to go live.

**Remember**: The backend is solid. Your job is to make the frontend worthy of it.

---

**DirectorCTO Authorization**: Full authority to modify all frontend code within scope. Backend edge functions are off-limits.

**Begin immediately. Report progress every 2 hours in channel.md.**