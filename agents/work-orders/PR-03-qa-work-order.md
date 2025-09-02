# PR-03: QA & Data Population Work Order

## Mission Critical
You are the final gatekeeper before production deployment. PR-01 and PR-02 have established a bulletproof foundation - your mission is to ensure every piece of data is production-ready and the entire system passes comprehensive E2E testing.

## Context from Previous PRs
- **PR-01**: Backend now prevents duplicate orders via unique constraints and webhook-only order creation
- **PR-02**: Frontend only accepts numeric printful_variant_id, images load from database

## Priority 1: Printful Variant Population Script

### Create `/scripts/populate-product-variants.ts`

This script MUST:
1. Connect to Supabase database
2. Query all products from `products` table
3. For each product, query its variants from `product_variants` table
4. Map each variant to correct Printful catalog ID based on:
   - Product type (t-shirt, hoodie, cap, etc.)
   - Color
   - Size
5. UPDATE each variant with numeric `printful_variant_id`
6. Log all updates for audit trail
7. Verify no variants remain without valid IDs

### Printful Catalog Reference
Use these verified Printful variant IDs as reference:
```typescript
// T-Shirts - Unisex Staple T-Shirt (Bella + Canvas 3001)
const TSHIRT_VARIANTS = {
  black_s: "14275",
  black_m: "14276",
  black_l: "14277",
  black_xl: "14278",
  white_s: "14279",
  white_m: "14280",
  // ... map all colors/sizes
};

// Hoodies - Unisex Heavy Blend Hoodie (Gildan 18500)
const HOODIE_VARIANTS = {
  navy_s: "10568",
  navy_m: "10569",
  navy_l: "10570",
  navy_xl: "10571",
  // ... map all colors/sizes
};

// Continue for all product types...
```

### Script Requirements
- Must be idempotent (safe to run multiple times)
- Must validate IDs are numeric before updating
- Must report count of updated variants
- Must list any variants that couldn't be mapped
- Must NOT update variants that already have valid IDs

## Priority 2: Data Cleanup

### Test Order Removal
1. Query orders table for test orders:
   ```sql
   SELECT * FROM orders WHERE 
     email LIKE '%test%' OR 
     email LIKE '%example%' OR
     total_amount = 0 OR
     LENGTH(email) = 1 OR
     email IN ('test@test.com', 'a@a.com', 'john@doe.com');
   ```
2. Archive test orders to `test_orders_archive` table (create if needed)
3. DELETE from main orders table
4. Document count of removed orders

### Invalid Cart Cleanup
1. Create browser script to clear localStorage of UUID variants
2. Document for support team how to help affected customers

### Orphaned Records
1. Remove order_items without valid orders
2. Remove fulfillments without valid orders
3. Remove customer records without orders

## Priority 3: E2E Test Implementation

### Create `/tests/e2e/complete-checkout-flow.spec.ts`

Test MUST cover:
1. **Product Selection**
   - Navigate to product page
   - Select color (verify image changes)
   - Select size
   - Add to cart with valid printful_variant_id

2. **Cart Validation**
   - Verify cart contains correct variant
   - Verify printful_variant_id is numeric
   - Test quantity changes

3. **Shipping Calculation**
   - Enter valid US address
   - Verify shipping quotes return from Printful
   - Select shipping method

4. **Payment Flow**
   - Use Stripe test card: 4242 4242 4242 4242
   - Complete payment
   - Verify success redirect

5. **Webhook Processing** (simulate)
   - Send test webhook with payment_intent.succeeded
   - Verify order created in database
   - Verify no duplicate orders on retry
   - Verify webhook_events table has entry

6. **Admin Verification**
   - Login to admin
   - Verify order appears in orders list
   - Verify order NOT marked as test
   - Verify analytics include order

### Test Data Requirements
```typescript
const TEST_CUSTOMER = {
  email: "real.customer@backreform.com",
  name: "Production Test User",
  address: {
    line1: "123 Main St",
    city: "New York",
    state: "NY",
    postal_code: "10001",
    country: "US"
  }
};

const TEST_PRODUCTS = [
  {
    name: "Reform UK T-Shirt",
    variant: "14276", // Black, Medium
    quantity: 1
  }
];
```

## Priority 4: Analytics & Monitoring

### Analytics Data Aggregation
1. Create view for production orders only:
   ```sql
   CREATE VIEW production_orders AS
   SELECT * FROM orders
   WHERE email NOT LIKE '%test%'
     AND total_amount > 0
     AND LENGTH(email) > 1;
   ```

2. Create materialized view for daily stats:
   ```sql
   CREATE MATERIALIZED VIEW daily_order_stats AS
   SELECT 
     DATE(created_at) as order_date,
     COUNT(*) as order_count,
     SUM(total_amount) as revenue,
     AVG(total_amount) as avg_order_value
   FROM production_orders
   GROUP BY DATE(created_at);
   ```

### Health Check Endpoints
Create `/supabase/functions/health-check/index.ts`:
- Check database connection
- Verify Stripe API key valid
- Verify Printful API key valid
- Return status JSON

## Acceptance Criteria

### MUST Complete ALL:
1. ✅ All product_variants have numeric printful_variant_id
2. ✅ Zero test orders remain in production orders table
3. ✅ E2E test passes complete checkout flow
4. ✅ Admin dashboard shows only real orders
5. ✅ No UUID variants can enter cart
6. ✅ Webhook replay doesn't create duplicates
7. ✅ Analytics accurately reflect business metrics

### Definition of Done
- Script output shows 100% variant population
- Database query confirms no null printful_variant_id
- E2E test video shows complete flow working
- Admin screenshot shows clean production data
- Update channel.md with completion status

## Critical Warnings

1. **DO NOT** update variants that already have valid IDs
2. **DO NOT** delete orders without archiving first
3. **DO NOT** use test mode Printful IDs in production data
4. **DO NOT** mark PR complete if ANY test fails

## Support Resources
- Printful API Docs: https://developers.printful.com/docs
- Printful Catalog: Use API endpoint `/store/products` to get IDs
- Supabase CLI: Use for local testing before production updates
- Previous variant mapping in: `/src/hooks/*-variants-merged.ts`

## Timeline
- Hour 1-4: Create and test population script
- Hour 5-6: Run data cleanup
- Hour 7-10: Implement E2E tests
- Hour 11-12: Final validation and documentation

## Reporting Requirements
Update `/agents/channel.md` every 2 hours with:
- Variants populated count
- Test orders removed count
- E2E test status
- Any blockers encountered

Remember: You are the last line of defense. After your work, this goes LIVE to real customers. Every variant must be correct, every test must pass, every piece of data must be production-ready.

Good luck, qa-printful-integration. The entire platform's success depends on your thoroughness.