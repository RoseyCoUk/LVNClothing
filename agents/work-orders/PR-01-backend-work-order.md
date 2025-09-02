# Work Order: PR-01 Backend & Integrations

**Assigned To**: backend-reform-agent  
**Priority**: CRITICAL  
**Start Date**: 2025-08-31  
**Expected Completion**: 48 hours  

## Executive Summary

You are tasked with fixing critical backend issues that are causing duplicate orders and blocking fulfillment. The most critical issue is a race condition between `confirm-payment-intent` and `stripe-webhook2` that creates duplicate orders. This MUST be resolved first.

## Critical Context from Audit

1. **DUPLICATE ORDERS**: Both `confirm-payment-intent` (line 249) and `stripe-webhook2` (line 181) create orders independently
2. **NO IDEMPOTENCY**: External API calls lack idempotency keys, risking duplicate Stripe/Printful operations
3. **NO WEBHOOK SECURITY**: Stripe webhooks have signature verification code but it's not properly implemented
4. **MISSING VARIANT IDs**: Products lack printful_variant_id values, blocking fulfillment

## Task Priority Order

### Phase 1: Fix Race Condition (HIGHEST PRIORITY)

#### 1.1 Database Constraints
**File**: Create new migration `/Users/arnispiekus/Documents/Github/ReformUK/supabase/migrations/[timestamp]_fix_order_duplicates.sql`

```sql
-- Add unique constraint to prevent duplicate orders per payment intent
ALTER TABLE orders 
ADD CONSTRAINT unique_payment_intent 
UNIQUE (stripe_payment_intent_id);

-- Create webhook events audit table
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL, -- 'stripe' or 'printful'
  event_id text UNIQUE, -- Stripe event ID for deduplication
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  processed_at timestamptz,
  error text,
  created_at timestamptz DEFAULT now()
);

-- Create fulfillments tracking table
CREATE TABLE IF NOT EXISTS fulfillments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  printful_order_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  tracking_number text,
  tracking_url text,
  shipped_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_webhook_events_source ON webhook_events(source);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_fulfillments_order_id ON fulfillments(order_id);
CREATE INDEX idx_fulfillments_status ON fulfillments(status);
```

#### 1.2 Refactor confirm-payment-intent
**File**: `/Users/arnispiekus/Documents/Github/ReformUK/supabase/functions/confirm-payment-intent/index.ts`

Key changes:
1. Remove ALL order creation logic (lines 77-184)
2. Only verify payment status and return success/failure
3. Let webhook handle all order creation

```typescript
// REMOVE the createOrder function entirely
// REMOVE the submitPrintfulOrder function entirely

// In the main handler, replace lines 232-263 with:
if (paymentIntent.status === 'succeeded') {
  // Just return success - webhook will handle order creation
  const response: ConfirmPaymentResponse = {
    success: true,
    payment_status: paymentIntent.status,
    message: 'Payment confirmed successfully'
  };
  
  return new Response(JSON.stringify(response), {
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
```

#### 1.3 Enhance stripe-webhook2
**File**: `/Users/arnispiekus/Documents/Github/ReformUK/supabase/functions/stripe-webhook2/index.ts`

Key changes:
1. Implement proper webhook deduplication using event ID
2. Move from checkout.session.completed to payment_intent.succeeded
3. Add idempotency checks before order creation

```typescript
// Add at the beginning of handler function (after line 53):
// Check if we've already processed this webhook
const { data: existingEvent } = await supabase
  .from('webhook_events')
  .select('id')
  .eq('event_id', event.id)
  .single();

if (existingEvent) {
  console.log(`Webhook ${event.id} already processed, skipping`);
  return new Response(JSON.stringify({ received: true }), { status: 200 });
}

// Log the webhook event
await supabase.from('webhook_events').insert({
  source: 'stripe',
  event_id: event.id,
  event_type: event.type,
  payload: event
});

// Change the switch case to handle payment_intent.succeeded instead:
case 'payment_intent.succeeded':
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  
  // Check if order already exists (idempotency)
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id, readable_order_id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();
    
  if (existingOrder) {
    console.log(`Order already exists for payment intent ${paymentIntent.id}`);
    return new Response(JSON.stringify({ 
      success: true, 
      order_id: existingOrder.id 
    }), { status: 200 });
  }
  
  // Create the order using metadata from payment intent
  const orderData = {
    stripe_payment_intent_id: paymentIntent.id,
    customer_email: paymentIntent.metadata.customer_email,
    user_id: paymentIntent.metadata.user_id || null,
    readable_order_id: generateReadableOrderId(),
    status: 'paid',
    total_amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency.toUpperCase(),
    items: JSON.parse(paymentIntent.metadata.items || '[]'),
    shipping_address: JSON.parse(paymentIntent.metadata.shipping_address || '{}'),
    shipping_cost: parseFloat(paymentIntent.metadata.shipping_cost || '0'),
    subtotal: parseFloat(paymentIntent.metadata.subtotal || '0'),
    guest_checkout: paymentIntent.metadata.guest_checkout === 'true',
    created_at: new Date().toISOString()
  };
  
  // Insert order
  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
    .select('id, readable_order_id')
    .single();
    
  if (orderError) {
    // Mark webhook as failed
    await supabase
      .from('webhook_events')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString(),
        error: orderError.message 
      })
      .eq('event_id', event.id);
      
    throw orderError;
  }
  
  // Queue Printful fulfillment (non-blocking)
  try {
    await createPrintfulFulfillment(newOrder.id, orderData);
  } catch (error) {
    console.error('Printful fulfillment failed:', error);
    // Don't fail the webhook - order is created
  }
  
  // Mark webhook as processed
  await supabase
    .from('webhook_events')
    .update({ 
      processed: true, 
      processed_at: new Date().toISOString() 
    })
    .eq('event_id', event.id);
```

### Phase 2: Implement Idempotency

#### 2.1 Create idempotency helper
**File**: Create `/Users/arnispiekus/Documents/Github/ReformUK/supabase/functions/_shared/idempotency.ts`

```typescript
import { createClient } from 'npm:@supabase/supabase-js';

export function generateIdempotencyKey(prefix: string, ...parts: string[]): string {
  return `${prefix}_${parts.join('_')}`;
}

export async function checkIdempotency(
  supabase: any,
  key: string,
  tableName: string = 'idempotency_keys'
): Promise<boolean> {
  const { data } = await supabase
    .from(tableName)
    .select('id')
    .eq('key', key)
    .single();
    
  return !!data;
}

export async function recordIdempotency(
  supabase: any,
  key: string,
  result: any,
  tableName: string = 'idempotency_keys'
): Promise<void> {
  await supabase
    .from(tableName)
    .insert({
      key,
      result,
      created_at: new Date().toISOString()
    });
}
```

#### 2.2 Update create-payment-intent
**File**: `/Users/arnispiekus/Documents/Github/ReformUK/supabase/functions/create-payment-intent/index.ts`

Add idempotency key generation:
```typescript
import { generateIdempotencyKey } from '../_shared/idempotency.ts';

// When creating payment intent (around line where Stripe intent is created):
const idempotencyKey = generateIdempotencyKey(
  'pi',
  customer_email,
  Date.now().toString()
);

const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(totalAmount * 100),
  currency: 'gbp',
  metadata: {
    customer_email,
    user_id: user_id || '',
    items: JSON.stringify(items),
    shipping_address: JSON.stringify(shipping),
    shipping_cost: shippingCost.toString(),
    subtotal: subtotal.toString(),
    guest_checkout: (!user_id).toString()
  }
}, {
  idempotencyKey // Add this to prevent duplicate payment intents
});
```

### Phase 3: Printful Integration Fixes

#### 3.1 Create Printful fulfillment function
**File**: Create `/Users/arnispiekus/Documents/Github/ReformUK/supabase/functions/_shared/printful-fulfillment.ts`

```typescript
export async function createPrintfulFulfillment(
  orderId: string,
  orderData: any
): Promise<void> {
  const printfulToken = Deno.env.get('PRINTFUL_TOKEN');
  if (!printfulToken) {
    console.warn('PRINTFUL_TOKEN not configured');
    return;
  }
  
  // Extract items with variant IDs
  const printfulItems = orderData.items
    .filter(item => item.printful_variant_id)
    .map(item => ({
      sync_variant_id: parseInt(item.printful_variant_id),
      quantity: item.quantity,
      retail_price: item.price?.toString() || '0'
    }));
    
  if (printfulItems.length === 0) {
    console.error('No items with printful_variant_id found');
    return;
  }
  
  const printfulOrder = {
    external_id: orderId,
    recipient: {
      name: orderData.shipping_address.name,
      address1: orderData.shipping_address.address1,
      city: orderData.shipping_address.city,
      state_code: orderData.shipping_address.state_code,
      country_code: orderData.shipping_address.country_code || 'GB',
      zip: orderData.shipping_address.zip,
      email: orderData.customer_email
    },
    items: printfulItems,
    retail_costs: {
      currency: 'GBP',
      subtotal: orderData.subtotal.toString(),
      shipping: orderData.shipping_cost.toString(),
      total: orderData.total_amount.toString()
    }
  };
  
  // Use idempotency key for Printful
  const idempotencyKey = `printful_order_${orderId}`;
  
  const response = await fetch('https://api.printful.com/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${printfulToken}`,
      'Content-Type': 'application/json',
      'X-PF-Store-Id': Deno.env.get('PRINTFUL_STORE_ID') || '',
      'Idempotency-Key': idempotencyKey
    },
    body: JSON.stringify(printfulOrder)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Printful API error: ${response.status} - ${error}`);
  }
  
  const result = await response.json();
  
  // Record fulfillment in database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  await supabase.from('fulfillments').insert({
    order_id: orderId,
    printful_order_id: result.result?.id,
    status: 'submitted'
  });
}
```

### Phase 4: Testing Requirements

#### 4.1 Create test script
**File**: Create `/Users/arnispiekus/Documents/Github/ReformUK/tests/backend/test-order-idempotency.ts`

```typescript
// Test that verifies:
// 1. Concurrent webhook and confirm-payment calls don't create duplicates
// 2. Webhook deduplication works
// 3. Idempotency keys prevent duplicate Stripe/Printful calls
```

## Acceptance Criteria

1. **No Duplicate Orders**
   - Database constraint prevents duplicate stripe_payment_intent_id
   - Concurrent calls to confirm-payment and webhook create only one order
   - Test with 10 concurrent requests proves no duplicates

2. **Webhook Security**
   - All webhooks logged to webhook_events table
   - Duplicate webhook events are ignored
   - Failed webhooks record error details

3. **Idempotency**
   - All Stripe PaymentIntent creations use idempotency keys
   - All Printful order creations use idempotency keys
   - Retry attempts don't create duplicates

4. **Order Flow**
   - confirm-payment-intent ONLY verifies payment status
   - stripe-webhook2 ONLY creates orders
   - Printful fulfillment is queued asynchronously

## Files to Modify (In Order)

1. `/Users/arnispiekus/Documents/Github/ReformUK/supabase/migrations/[new]_fix_order_duplicates.sql`
2. `/Users/arnispiekus/Documents/Github/ReformUK/supabase/functions/_shared/idempotency.ts` (new)
3. `/Users/arnispiekus/Documents/Github/ReformUK/supabase/functions/_shared/printful-fulfillment.ts` (new)
4. `/Users/arnispiekus/Documents/Github/ReformUK/supabase/functions/confirm-payment-intent/index.ts`
5. `/Users/arnispiekus/Documents/Github/ReformUK/supabase/functions/stripe-webhook2/index.ts`
6. `/Users/arnispiekus/Documents/Github/ReformUK/supabase/functions/create-payment-intent/index.ts`
7. `/Users/arnispiekus/Documents/Github/ReformUK/tests/backend/test-order-idempotency.ts` (new)

## Testing Process

1. Run database migration locally
2. Test single payment flow end-to-end
3. Test concurrent webhook/confirm calls (use test script)
4. Test webhook replay (send same event twice)
5. Test with missing printful_variant_id
6. Test with network failure during Printful call

## Environment Variables Required

Ensure these are set in `.env.local`:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PRINTFUL_TOKEN=...
PRINTFUL_STORE_ID=16651763
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=...
```

## Definition of Done

- [ ] Database migration applied successfully
- [ ] No duplicate orders created in concurrent scenario
- [ ] All webhooks logged and deduplicated
- [ ] Idempotency keys prevent duplicate external calls
- [ ] Test script passes all scenarios
- [ ] Code committed with clear commit message
- [ ] PR created with full description

## Important Notes

1. **DO NOT** start work on frontend (PR-02) until this is complete and approved
2. **DO NOT** modify the orders table structure beyond adding constraints
3. **DO NOT** change the API contract for confirm-payment-intent (frontend depends on it)
4. **TEST LOCALLY** before committing - use `supabase db reset` to test migrations

## Support

If blocked, update `/Users/arnispiekus/Documents/Github/ReformUK/agents/channel.md` with:
- Specific blocker description
- What you've tried
- What you need from DirectorCTO

Remember: The goal is a STABLE, IDEMPOTENT payment flow that NEVER creates duplicate orders.