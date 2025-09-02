# Dynamic Stripe Payment Intent System

## Overview

The new dynamic payment intent system replaces the previous fixed Stripe product-based checkout with a flexible payment system that:

- ✅ **Creates payment intents dynamically** with real-time pricing
- ✅ **Integrates with Printful shipping API** for accurate shipping costs  
- ✅ **Uses our variant database** for current product prices
- ✅ **Supports all product variants** without pre-creating Stripe products
- ✅ **Handles currency conversion** and international shipping
- ✅ **Provides better error handling** and user experience

## Architecture

### Backend Functions

#### 1. `create-payment-intent` Function
**Path:** `supabase/functions/create-payment-intent/index.ts`

**Purpose:** Creates Stripe payment intents with dynamic pricing and shipping

**Input:**
```typescript
{
  items: CartItem[];           // Cart items with printful_variant_id
  shipping_address: ShippingAddress;
  customer_email: string;
  currency?: string;           // Defaults to 'gbp'
  guest_checkout?: boolean;
}
```

**Output:**
```typescript
{
  client_secret: string;       // Stripe client secret for frontend
  amount: number;             // Total amount in pence
  currency: string;
  shipping_cost: number;      // Calculated shipping cost
  subtotal: number;           // Product subtotal
  total: number;              // Final total
  payment_intent_id: string;  // Stripe payment intent ID
}
```

**Process:**
1. Validates cart items and gets real-time prices from database
2. Calls Printful shipping API for accurate shipping costs
3. Calculates total amount (products + shipping)
4. Creates Stripe payment intent with metadata
5. Returns client secret for frontend payment

#### 2. `confirm-payment-intent` Function
**Path:** `supabase/functions/confirm-payment-intent/index.ts`

**Purpose:** Confirms successful payments and creates orders

**Input:**
```typescript
{
  payment_intent_id: string;   // Stripe payment intent ID
}
```

**Output:**
```typescript
{
  success: boolean;
  order_id?: string;           // Database order ID
  order_number?: string;       // Human-readable order number
  payment_status: string;      // Stripe payment status
  message: string;
}
```

**Process:**
1. Retrieves payment intent from Stripe
2. Verifies payment was successful
3. Creates order in database with all details
4. Submits order to Printful for fulfillment
5. Returns order confirmation

### Frontend Components

#### 1. `DynamicCheckoutForm` Component
**Path:** `src/components/checkout/DynamicCheckoutForm.tsx`

**Purpose:** Handles the payment form using Stripe Elements

**Features:**
- Uses `PaymentElement` for secure payment input
- Shows real-time order summary with dynamic pricing
- Handles payment confirmation and 3D Secure
- Provides detailed status messages
- Integrates with Stripe's latest payment methods

#### 2. `StripeCheckoutWrapper` Component  
**Path:** `src/components/checkout/StripeCheckoutWrapper.tsx`

**Purpose:** Provides Stripe Elements context and configuration

**Features:**
- Loads Stripe with publishable key
- Configures Stripe appearance and locale
- Handles Stripe configuration errors
- Wraps checkout form with proper context

#### 3. `DynamicCheckoutPage` Component
**Path:** `src/components/checkout/DynamicCheckoutPage.tsx`

**Purpose:** Complete checkout flow with shipping and payment

**Features:**
- Two-step checkout (shipping → payment)
- Real-time shipping rate calculation
- Cart validation and price enrichment
- Order success confirmation
- Guest checkout support

### Frontend Library

#### `payment-intents.ts`
**Path:** `src/lib/payment-intents.ts`

**Purpose:** Client-side utilities for payment intents

**Key Functions:**
- `createPaymentIntent()` - Create payment intent
- `confirmPaymentIntent()` - Confirm payment and create order  
- `getShippingRates()` - Get Printful shipping costs
- `validateAndEnrichCart()` - Update cart with real-time pricing
- Helper functions for formatting and validation

## Key Advantages

### 1. **Dynamic Pricing**
```typescript
// OLD: Fixed prices in Stripe products
price_id: 'price_1234567890'

// NEW: Real-time pricing from database
price: await getProductPrice(printful_variant_id)
```

### 2. **Accurate Shipping**  
```typescript
// OLD: Fixed shipping rates
shipping_rate_id: 'shr_1234567890'

// NEW: Real-time Printful shipping
shippingCost = await getShippingCost(items, address)
```

### 3. **No Stripe Product Management**
```typescript
// OLD: Must pre-create products in Stripe
// - 157 products × multiple variants = hundreds of Stripe products
// - Manual price updates required

// NEW: Zero Stripe products needed
// - All pricing handled dynamically
// - Automatic price updates from database
```

### 4. **Better Error Handling**
- Real-time validation of cart items
- Graceful fallbacks for pricing errors
- Detailed error messages for users
- Automatic retry logic for API calls

## Integration Points

### Database Schema
The system uses existing tables:
- `product_variants` - for real-time pricing
- `orders` - for order storage
- User authentication via Supabase Auth

### Printful Integration
- Uses `shipping-quotes` function for shipping costs
- Submits orders to Printful for fulfillment
- Maps `printful_variant_id` correctly

### Stripe Integration  
- Uses Payment Intents API (not Checkout Sessions)
- Supports all payment methods (cards, digital wallets)
- Handles 3D Secure authentication
- Stores payment metadata for order tracking

## Environment Variables Required

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...           # Backend
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... # Frontend

# Printful Configuration  
PRINTFUL_TOKEN=your_printful_token      # For shipping & fulfillment

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Migration Guide

### From Old Checkout to New Dynamic System

#### 1. Replace Checkout Components
```typescript
// OLD
import { createCheckoutSession } from '../lib/stripe';
import CheckoutPage from '../components/checkout/CheckoutPage';

// NEW  
import DynamicCheckoutPage from '../components/checkout/DynamicCheckoutPage';
```

#### 2. Update Cart Item Structure
```typescript
// Ensure cart items have:
interface CartItem {
  printful_variant_id: string;  // Required for Printful integration
  price: number;                // Will be updated with real-time pricing
  // ... other fields
}
```

#### 3. Deploy New Functions
```bash
# Deploy the new Supabase functions
supabase functions deploy create-payment-intent
supabase functions deploy confirm-payment-intent
```

## Testing

### Test Payment Flow
1. Add items to cart
2. Go to checkout
3. Fill shipping information  
4. See real-time shipping costs
5. Complete payment with test card: `4242 4242 4242 4242`
6. Verify order creation and Printful submission

### Test Error Scenarios
- Invalid shipping address
- Failed payment (card declined)
- Network errors during checkout
- Missing environment variables

## Performance Optimizations

### 1. **Price Caching**
Real-time prices are fetched but can be cached:
```typescript
// Cache prices for 5 minutes
const cachedPrice = await getCachedPrice(variant_id, 300);
```

### 2. **Shipping Rate Caching** 
Shipping rates are cached by `shipping-quotes` function:
```typescript
// Cached by address + items hash
const cacheKey = `pf:rates:${addressHash}:${itemsHash}`;
```

### 3. **Batch API Calls**
Multiple prices fetched in single database query:
```typescript
const prices = await supabase
  .from('product_variants')
  .select('printful_variant_id, price')
  .in('printful_variant_id', variantIds);
```

## Monitoring & Logging

### Payment Intent Creation
- Logs pricing calculations
- Tracks Printful API response times  
- Monitors error rates by error type

### Order Processing
- Logs successful order creation
- Tracks Printful submission status
- Monitors payment confirmation times

### Frontend Errors
- Client-side error reporting
- Payment failure analytics
- Checkout abandonment tracking

## Security Features

### Payment Security
- No sensitive data stored locally
- Stripe handles all payment processing
- PCI compliance through Stripe

### Data Protection  
- User data encrypted in transit
- Minimal payment data storage
- GDPR-compliant data handling

### API Security
- CORS properly configured
- Authentication required for user orders
- Rate limiting on payment endpoints

## Production Deployment

### 1. Environment Setup
```bash
# Set production Stripe keys
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Set production Printful token
PRINTFUL_TOKEN=live_printful_token
```

### 2. Function Deployment
```bash
supabase functions deploy create-payment-intent --project-ref your-project
supabase functions deploy confirm-payment-intent --project-ref your-project
```

### 3. Frontend Build
```bash
npm run build
# Deploy to your hosting platform
```

## Conclusion

The new dynamic payment intent system provides:
- ✅ **Real-time pricing** from your database
- ✅ **Accurate shipping costs** from Printful  
- ✅ **Simplified product management** (no Stripe products needed)
- ✅ **Better user experience** with modern payment methods
- ✅ **Robust error handling** and recovery
- ✅ **Production-ready** architecture

This system scales with your product catalog and automatically adapts to price changes without manual Stripe product updates.