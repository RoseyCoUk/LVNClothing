# BackReform E-Commerce - Agent Coordination Channel

## Project Status
**Current Phase**: Phase 1 - Live Fulfillment Path  
**Target Completion**: 48-72 hours  
**Director**: DirectorCTO  
**Last Updated**: 2025-08-31

---

## 🚨 Critical Issues (From Audit)
1. **CRITICAL**: Duplicate order creation race condition (confirm-payment vs webhook)
2. **HIGH**: Missing Printful variant IDs (blocks fulfillment)
3. **HIGH**: No webhook security/verification
4. **MEDIUM**: Cart UUID issues causing checkout failures
5. **LOW**: Image management lacks color-variant support

---

## PR-01: Backend & Integrations
**Agent**: backend-reform-agent  
**Status**: Not Started  
**Target**: Day 1-2

### Tasks
- [ ] Fix order creation race condition in `confirm-payment-intent`
  - [ ] Add idempotency check using stripe_payment_intent_id
  - [ ] Remove duplicate order creation from stripe-webhook2
  - [ ] Add unique constraint on orders.stripe_payment_intent_id
  
- [ ] Implement proper webhook handling
  - [ ] Create webhook_events table for audit trail
  - [ ] Add Stripe signature verification
  - [ ] Implement Printful webhook endpoint
  - [ ] Add retry mechanism with exponential backoff
  
- [ ] Fix payment intent flow
  - [ ] Add idempotency keys to all Stripe calls
  - [ ] Store intent metadata before creation
  - [ ] Move fulfillment to webhook handler only
  
- [ ] Database schema updates
  ```sql
  -- Add constraints
  ALTER TABLE orders ADD CONSTRAINT unique_payment_intent 
    UNIQUE (stripe_payment_intent_id);
  
  -- Create webhook_events table
  CREATE TABLE webhook_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source text NOT NULL,
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    processed boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
  );
  
  -- Create fulfillments table  
  CREATE TABLE fulfillments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id),
    printful_order_id text UNIQUE,
    status text NOT NULL,
    tracking_number text,
    created_at timestamptz DEFAULT now()
  );
  ```

### Acceptance Criteria
- [ ] No duplicate orders on concurrent webhook/confirm calls
- [ ] All webhooks logged to webhook_events table
- [ ] Printful orders created with retry logic
- [ ] Idempotency keys prevent duplicate Stripe/Printful calls

### Review
- [ ] Code complete
- [ ] Tests passing
- [ ] **Reviewed by DirectorCTO**: ___________

---

## PR-02: Frontend PDP/PLP & Admin
**Agent**: frontend-pdp-plp-refactor  
**Status**: Not Started  
**Target**: Day 2-3

### Tasks
- [ ] Fix variant selection and cart validation
  - [ ] Update DynamicProductPage to use printful_variant_id
  - [ ] Add validation for UUID vs numeric variant IDs
  - [ ] Improve error messages for invalid cart items
  - [ ] Clear legacy UUID items from localStorage
  
- [ ] Fix product image management
  - [ ] Remove hardcoded image paths
  - [ ] Implement color-to-image mapping
  - [ ] Update product_images table with color column
  - [ ] Fix image gallery to load from database
  
- [ ] Admin product editor consolidation
  - [ ] Fix "Sync with Printful" button (line 886)
  - [ ] Remove duplicate BundleManagement modals
  - [ ] Fix missing VariantManagement component
  - [ ] Wire "Direct Import" to correct endpoint
  
- [ ] Admin dashboard fixes
  - [ ] Ensure test orders hidden by default
  - [ ] Fix product sync to use printful_product_id
  - [ ] Remove non-functional buttons
  - [ ] Add loading states for async operations

### Acceptance Criteria
- [ ] Cart items always have valid printful_variant_id
- [ ] Product images change with color selection
- [ ] Admin can sync products with Printful
- [ ] No duplicate modals or broken buttons

### Review
- [ ] Code complete
- [ ] Tests passing
- [ ] **Reviewed by DirectorCTO**: ___________

---

## PR-03: QA & Data Population
**Agent**: qa-printful-integration  
**Status**: Not Started  
**Target**: Day 2-3

### Tasks
- [ ] Populate Printful IDs
  - [ ] Create `scripts/populate-product-variants.ts`
  - [ ] Map all products to Printful catalog
  - [ ] Update product_variants with printful_variant_id
  - [ ] Verify all variants have valid IDs
  
- [ ] Data cleanup
  - [ ] Remove test orders (£0.00, test emails)
  - [ ] Clear invalid cart items from localStorage
  - [ ] Consolidate customer tables
  - [ ] Remove orphaned records
  
- [ ] E2E test implementation
  - [ ] Checkout flow with real Printful variant
  - [ ] Webhook simulation test
  - [ ] Admin product sync test
  - [ ] Order fulfillment test
  
- [ ] Monitoring setup
  - [ ] Implement sync status backend
  - [ ] Add health check endpoints
  - [ ] Create analytics data aggregation
  - [ ] Setup error alerting

### Test Data
```javascript
// Valid Printful variant IDs for testing
const TEST_VARIANTS = {
  tshirt_black_m: "14276",  // Unisex Staple T-Shirt, Black, M
  hoodie_navy_l: "10570",   // Unisex Heavy Blend Hoodie, Navy, L
  cap_red: "12456",         // Structured Twill Cap, Red
  mug_white: "19634"        // Ceramic Mug 11oz, White
};
```

### Acceptance Criteria
- [ ] All products have valid Printful IDs
- [ ] No test orders visible in admin by default
- [ ] E2E tests pass for complete checkout flow
- [ ] Monitoring shows real-time sync status

### Review
- [ ] Code complete
- [ ] Tests passing
- [ ] **Reviewed by DirectorCTO**: ___________

---

## Communication Protocol

### Daily Standup (via channel.md updates)
- Each agent updates their task checkboxes
- Report blockers under agent section
- DirectorCTO reviews and provides guidance

### PR Submission
1. Agent marks all tasks complete
2. Adds PR link/branch name
3. Requests DirectorCTO review
4. DirectorCTO gates and provides feedback

### Escalation Path
1. Try to resolve within agent scope
2. Document blocker in channel.md
3. DirectorCTO coordinates cross-agent solutions
4. Critical issues trigger immediate sync

---

## Blockers & Dependencies

### Current Blockers
- None yet

### Dependencies
- PR-02 depends on PR-03 for Printful IDs
- PR-01 must complete before production deploy
- All PRs need environment variables configured

---

## Resources

### Documentation
- [Printful API Docs](https://developers.printful.com/docs)
- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

### Test Accounts
- Stripe Test Mode: Active
- Printful Test Store: ID 16651763
- Supabase Local: http://localhost:54321

### Key Files
- Payment flow: `/supabase/functions/create-payment-intent/`
- Order creation: `/supabase/functions/confirm-payment-intent/`
- Product page: `/src/components/products/DynamicProductPage.tsx`
- Admin products: `/src/admin/components/AdminProductsPage.tsx`

---

## Notes
- Keep this file updated with progress
- Use ✅ for completed items
- Use 🚧 for in-progress items
- Use ❌ for blocked items