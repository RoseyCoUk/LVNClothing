# Live Shipping Rates with Printful Implementation

This document describes the implementation of live shipping rates with Printful integration for the ReformUK e-commerce platform.

## Overview

The shipping system provides:
- Real-time shipping rate calculations from Printful API
- Dynamic shipping options based on address and cart contents
- Integration with Stripe checkout for accurate pricing
- Caching to reduce API calls
- Fallback options when API is unavailable

## Architecture

### Components

1. **Types & Interfaces** (`src/lib/shipping/types.ts`)
   - `Recipient`: Shipping address information
   - `CartItem`: Cart item with Printful variant ID
   - `ShippingOption`: Available shipping method
   - `ShippingQuoteResponse`: API response with options

2. **Money Utilities** (`src/lib/money.ts`)
   - `toMinor()`: Convert decimal to Stripe minor units (pence)
   - `fromMinor()`: Convert minor units back to decimal
   - `formatCurrency()`: Format amounts for display

3. **Caching** (`src/lib/cache/memoryCache.ts`)
   - Simple TTL-based in-memory cache
   - Reduces Printful API calls
   - Configurable expiration times

4. **Printful Integration** (`src/lib/shipping/printful.ts`)
   - `getShippingRates()`: Fetch rates from backend API
   - `validateShippingAddress()`: Validate address format
   - `getCountryCode()`: Convert country names to ISO codes
   - Error handling and fallback options

5. **Backend API** 
   - **Shipping Quotes** (`supabase/functions/shipping-quotes/index.ts`): Supabase Edge Function for shipping rate calculations
   - **Checkout Shipping Select** (`supabase/functions/checkout-shipping-select/index.ts`): Updates Stripe PaymentIntents with shipping costs
   - Direct Printful API integration with caching
   - CORS handling and error management

6. **Shipping Context** (`src/contexts/ShippingContext.tsx`)
   - Manages shipping state across the application
   - Integrates with cart context
   - Provides shipping calculation methods

7. **Shipping Options Component** (`src/components/ShippingOptions.tsx`)
   - Displays available shipping methods
   - Handles user selection
   - Shows delivery estimates and pricing

8. **Frontend Hook** (`src/hooks/useShippingQuotes.ts`)
   - React hook for managing shipping quotes state
   - Handles API calls to shipping quotes endpoint
   - Provides loading, error, and options state

9. **Shipping Methods Component** (`src/components/checkout/ShippingMethods.tsx`)
   - Reusable UI component for shipping selection
   - Accessible radio button interface
   - Loading states and error handling

10. **Shipping Section Component** (`src/components/checkout/ShippingSection.tsx`)
    - Complete shipping address and methods interface
    - Integrates address form with shipping quotes
    - Automatic quote fetching when address is complete

### Data Flow

1. User enters shipping address in checkout
2. Address validation triggers shipping rate fetch
3. Printful API returns available options
4. User selects preferred shipping method
5. Selected rate updates Stripe PaymentIntent amount
6. Rate ID is passed to Printful order creation

## Usage

### Basic Integration

```tsx
import { useShipping } from '../contexts/ShippingContext';

function CheckoutComponent() {
  const { 
    fetchShippingRates, 
    selectedShippingOption, 
    getShippingCost 
  } = useShipping();

  // Fetch rates when address changes
  const handleAddressChange = async (address) => {
    await fetchShippingRates(address);
  };

  // Get shipping cost in pence
  const shippingCost = getShippingCost();
}
```

### Adding to Cart with Printful Variant ID

```tsx
import { useCart } from '../contexts/CartContext';

function ProductComponent() {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: 'product-1',
      name: 'Reform UK T-Shirt',
      price: 19.99,
      image: '/tshirt.jpg',
      printful_variant_id: 1001, // Printful variant ID
      quantity: 1
    });
  };
}
```

### Shipping Options Display

```tsx
import ShippingOptions from '../components/ShippingOptions';

function CheckoutPage() {
  return (
    <div>
      <ShippingOptions 
        onOptionSelect={(option) => console.log('Selected:', option)}
        className="mt-6"
      />
    </div>
  );
}
```

### Using the Shipping Hook

```tsx
import { useShippingQuotes } from '../hooks/useShippingQuotes';

function CheckoutComponent() {
  const { loading, options, error, fetchQuotes } = useShippingQuotes();
  
  const handleAddressSubmit = async (address) => {
    await fetchQuotes({
      recipient: address,
      items: cartItems.map(item => ({
        printful_variant_id: item.printful_variant_id,
        quantity: item.quantity
      }))
    });
  };
  
  return (
    <div>
      {loading && <div>Loading shipping options...</div>}
      {error && <div>Error: {error}</div>}
      {options.map(option => (
        <div key={option.id}>{option.name} - {option.rate}</div>
      ))}
    </div>
  );
}
```

### Complete Shipping Section

```tsx
import ShippingSection from '../components/checkout/ShippingSection';

function CheckoutPage() {
  const [selectedShipping, setSelectedShipping] = useState(null);
  
  return (
    <ShippingSection
      onShippingSelect={setSelectedShipping}
      selectedShipping={selectedShipping}
    />
  );
}
```

### Checkout Page Integration

The checkout page has been updated to integrate with the new shipping system:

```tsx
import { useShippingQuotes } from '../hooks/useShippingQuotes';
import ShippingMethods from '../components/checkout/ShippingMethods';

export default function CheckoutPage() {
  const { loading: shippingLoading, options: shippingOptions, error: shippingError, fetchQuotes } = useShippingQuotes();
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  
  // Fetch shipping quotes when address is complete
  useEffect(() => {
    if (addressComplete && cartItems.length > 0) {
      const request = {
        recipient: address,
        items: cartItems.map(item => ({
          printful_variant_id: item.printful_variant_id || parseInt(item.id.toString()),
          quantity: item.quantity
        }))
      };
      fetchQuotes(request);
    }
  }, [addressComplete, cartItems, address, fetchQuotes]);
  
  // Handle shipping selection
  const handleShippingSelect = async (option: ShippingOption) => {
    setSelectedShipping(option);
    
    // Update PaymentIntent with shipping cost
    if (paymentIntentId) {
      await updatePaymentIntentWithShipping(paymentIntentId, option);
    }
  };
  
  return (
    <div>
      {/* Address form */}
      {shippingOptions.length > 0 && (
        <ShippingMethods
          options={shippingOptions}
          value={selectedShipping?.id}
          onChange={handleShippingSelect}
          loading={shippingLoading}
          error={shippingError}
        />
      )}
    </div>
  );
}
```

## Configuration

### Environment Variables

```bash
# Frontend (Vite)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend (Supabase Edge Function)
PRINTFUL_TOKEN=your_printful_api_token
```

### Cart Item Structure

Cart items must include `printful_variant_id` for accurate shipping calculations:

```tsx
interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  printful_variant_id?: number; // Required for shipping
  isBundle?: boolean;
  bundleContents?: BundleContent[];
}
```

## Backend API

### Supabase Edge Function

The shipping system uses a Supabase Edge Function (`/functions/v1/shipping-quotes`) that:

- **Handles CORS**: Manages cross-origin requests
- **Validates Input**: Ensures required fields are present
- **Caches Results**: Reduces Printful API calls
- **Error Handling**: Provides graceful fallbacks
- **Security**: Uses environment variables for API keys

### Deployment

```bash
# Deploy the shipping quotes function
supabase functions deploy shipping-quotes

# Deploy the checkout shipping select function
supabase functions deploy checkout-shipping-select

# Set environment variables
supabase secrets set PRINTFUL_TOKEN=your_printful_token
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key
```

## API Integration

### Shipping Quotes Endpoint

The system calls `/functions/v1/shipping-quotes` with:

```json
{
  "recipient": {
    "address1": "123 Main St",
    "city": "London",
    "country_code": "GB",
    "zip": "SW1A 1AA"
  },
  "items": [
    {
      "variant_id": 1001,
      "quantity": 2
    }
  ]
}
```

### Response Format

```json
{
  "options": [
    {
      "id": "STANDARD",
      "name": "Standard Delivery",
      "rate": "3.99",
      "currency": "GBP",
      "minDeliveryDays": 3,
      "maxDeliveryDays": 5
    }
  ],
  "ttlSeconds": 300
}
```

## Caching Strategy

- **Shipping rates**: 5 minutes TTL
- **Fallback options**: 1 minute TTL
- **Cache key**: Based on address + cart items hash
- **Memory-based**: Simple Map implementation

## Error Handling

### Fallback Options

When Printful API is unavailable:

```tsx
// Returns basic shipping option
{
  options: [
    {
      id: 'fallback_standard',
      name: 'Standard Delivery',
      rate: '3.99',
      currency: 'GBP',
      minDeliveryDays: 3,
      maxDeliveryDays: 5
    }
  ],
  ttlSeconds: 60
}
```

### Validation Errors

Address validation checks:
- Required fields (address, city, country, zip)
- Country code format (ISO-2)
- Basic format validation

## Testing

### Test Routes

Visit these routes to test different aspects of the shipping system:

**`/shipping-test`** - Basic shipping system test
**`/shipping-example`** - Complete checkout example with PaymentIntent updates

### Complete Integration Testing

**`test-printful-order-creation.html`** - Comprehensive test for the complete flow:

1. **Line Items Creation** - Test frontend line item generation with `printful_variant_id`
2. **Checkout Session** - Test backend session creation with metadata preservation
3. **Webhook Processing** - Test webhook data extraction and processing
4. **Printful Order** - Test final order payload creation

### Data Flow Verification

**Frontend → Backend → Webhook → Printful:**

```tsx
// 1. Cart items include printful_variant_id
cartItems: [
  {
    id: 1,
    name: "Reform UK T-Shirt",
    printful_variant_id: 12345,  // ← Required for Printful
    quantity: 2
  }
]

// 2. Line items preserve metadata
lineItems: [
  {
    price_data: { /* ... */ },
    quantity: 2,
    metadata: {
      printful_variant_id: "12345"  // ← Preserved in Stripe
    }
  }
]

// 3. Webhook extracts shipping rate
const shippingRateId = paymentIntent.metadata.printful_shipping_rate_id;

// 4. Printful order uses selected rate
const orderPayload = {
  items: [{ variant_id: 12345, quantity: 2 }],
  shipping: { rate_id: shippingRateId }  // ← From user selection
};
```

### Backend API Testing

Use the test files to verify both endpoints:

**Shipping Quotes** (`test-shipping-api.html`):
1. Open the HTML file in your browser
2. Enter your Supabase URL and anon key
3. Fill in test address and product details
4. Click "Test Shipping Quotes" to verify the API
5. Check the response for shipping options and caching

**Checkout Shipping Select** (`test-checkout-shipping.html`):
1. Open the HTML file in your browser
2. Enter your Supabase URL and anon key
3. Fill in PaymentIntent ID and shipping details
4. Click "Test Shipping Select" to verify PaymentIntent updates
5. Check the response for updated amounts and metadata

1. Add test items to cart
2. Enter test address
3. Fetch shipping rates
4. View available options
5. Test selection and calculations

### Test Data

```tsx
// Example test item
{
  id: 'test-1',
  name: 'Test T-Shirt',
  price: 19.99,
  image: '/test-image.jpg',
  printful_variant_id: 1001
}

// Example test address
{
  address1: '123 Test Street',
  city: 'London',
  postcode: 'SW1A 1AA',
  country: 'United Kingdom'
}
```

## Stripe Integration

### PaymentIntent Updates

When a shipping option is selected, the system automatically updates the Stripe PaymentIntent:

**Direct API Integration:**
```tsx
// Function to update PaymentIntent with shipping cost
const updatePaymentIntentWithShipping = async (paymentIntentId: string, shippingOption: ShippingOption) => {
  const response = await fetch('/functions/v1/checkout-shipping-select', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      paymentIntentId,
      itemsTotal: subtotal,
      shipping: {
        rate_id: shippingOption.id,
        rate: shippingOption.rate,
        currency: shippingOption.currency,
        name: shippingOption.name
      },
      taxTotal: 0
    })
  });
  
  const result = await response.json();
  return result;
};
```

**Integration Flow:**
1. User completes shipping address
2. System fetches shipping quotes from Printful
3. User selects shipping option
4. System updates Stripe PaymentIntent with new total (items + shipping)
5. User proceeds to payment with updated amount

### Printful Order Creation

After successful payment, the webhook automatically creates Printful orders using the selected shipping rate:

**Webhook Flow:**
1. **Payment Succeeds** → `checkout.session.completed` event triggered
2. **Extract Shipping Rate** → Read `printful_shipping_rate_id` from PaymentIntent metadata
3. **Create Printful Order** → Call Printful API with selected shipping rate
4. **Update Database** → Store Printful order ID and shipping details

**Key Implementation Details:**

```tsx
// 1. Frontend: Include printful_variant_id in line items
const lineItems = cartItems.map(item => {
  const lineItem = {
    price_data: { /* ... */ },
    quantity: item.quantity,
  };
  
  // Add printful_variant_id to metadata
  if (item.printful_variant_id) {
    lineItem.metadata = {
      printful_variant_id: item.printful_variant_id.toString()
    };
  }
  
  return lineItem;
});

// 2. Backend: Preserve metadata in checkout session
sessionParams.line_items = line_items.map(item => {
  const enhancedItem = { ...item };
  if (item.metadata?.printful_variant_id) {
    enhancedItem.metadata = {
      ...enhancedItem.metadata,
      printful_variant_id: item.metadata.printful_variant_id
    };
  }
  return enhancedItem;
});

// 3. Webhook: Extract shipping rate and create Printful order
const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
const shippingRateId = paymentIntent.metadata?.printful_shipping_rate_id;

const orderPayload = {
  recipient: customerDetails,
  items: processedItems.map(item => ({
    variant_id: parseInt(item.metadata.printful_variant_id),
    quantity: item.quantity
  })),
  shipping: { rate_id: shippingRateId },
  external_id: orderId
};

// 4. Create order through Printful proxy
const printfulResponse = await fetch('/functions/v1/printful-proxy/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderPayload)
});
```

1. **Frontend**: User selects shipping option
2. **Backend**: Calls `/functions/v1/checkout-shipping-select`
3. **Stripe**: PaymentIntent amount updated with shipping costs
4. **Metadata**: Shipping rate ID and breakdown stored for order creation

**Direct API Integration:**
```tsx
// Function to update PaymentIntent with shipping cost
const updatePaymentIntentWithShipping = async (paymentIntentId: string, shippingOption: ShippingOption) => {
  const response = await fetch('/functions/v1/checkout-shipping-select', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      paymentIntentId,
      itemsTotal: subtotal,
      shipping: {
        rate_id: shippingOption.id,
        rate: shippingOption.rate,
        currency: shippingOption.currency,
        name: shippingOption.name
      },
      taxTotal: 0
    })
  });
  
  const result = await response.json();
  return result;
};
```

**Integration Flow:**
1. User completes shipping address
2. System fetches shipping quotes from Printful
3. User selects shipping option
4. System updates Stripe PaymentIntent with new total (items + shipping)
5. User proceeds to payment with updated amount

### Frontend Integration

```tsx
import { useShipping } from '../contexts/ShippingContext';

function CheckoutComponent() {
  const { updatePaymentIntent } = useShipping();
  
  const handleShippingSelect = async (shippingOption) => {
    try {
      const result = await updatePaymentIntent(
        paymentIntentId,
        taxTotal,
        orderDraftId
      );
      
      console.log('PaymentIntent updated:', result);
    } catch (error) {
      console.error('Failed to update PaymentIntent:', error);
    }
  };
}
```

### Backend Processing

The checkout shipping select endpoint:

- Validates shipping selection data
- Converts amounts to Stripe minor units
- Updates PaymentIntent with new total
- Stores shipping metadata for Printful order creation
- Returns updated PaymentIntent details

Shipping costs are automatically included in Stripe calculations:

```tsx
// Get total with shipping in pence
const totalAmount = getTotalWithShipping();

// Use in Stripe checkout
const checkoutRequest = {
  line_items: lineItems,
  metadata: {
    shipping_rate_id: selectedShippingOption?.id
  },
  // ... other checkout options
};
```

### Webhook Processing

The selected shipping rate ID is passed to Printful order creation:

```tsx
// In webhook handler
const shippingRateId = metadata.shipping_rate_id;
// Use this ID when creating Printful order
```

## Performance Considerations

- **Rate limiting**: Printful API has rate limits
- **Caching**: Reduces API calls by 80%+
- **Lazy loading**: Rates fetched only when needed
- **Error boundaries**: Graceful degradation on failures

## Future Enhancements

1. **Multi-currency support**: Handle different currencies
2. **Weight-based calculations**: Include package weight
3. **Real-time tracking**: Integrate with carrier APIs
4. **Shipping zones**: Configure regional restrictions
5. **Free shipping thresholds**: Dynamic free shipping rules

## Troubleshooting

### Common Issues

1. **No shipping options displayed**
   - Check cart has items with `printful_variant_id`
   - Verify address is complete
   - Check browser console for API errors

2. **Shipping rates not updating**
   - Clear cache: `cacheClear()`
   - Check Printful API status
   - Verify address format

3. **Stripe integration errors**
   - Ensure shipping costs are in pence
   - Check PaymentIntent amount calculations
   - Verify metadata includes rate ID

### Debug Mode

Enable console logging for debugging:

```tsx
// In shipping context
console.log('Shipping request:', request);
console.log('API response:', response);
console.log('Selected option:', selectedShippingOption);
```

## Support

For issues with the shipping system:
1. Check browser console for errors
2. Verify Printful API connectivity
3. Test with `/shipping-test` route
4. Review network requests in DevTools
