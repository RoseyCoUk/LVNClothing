# Printful Integration Guide

## Overview

This guide documents the comprehensive Printful integration system implemented for the Reform UK e-commerce platform. The system provides real-time product data, variant management, bundle calculations, and sticker add-ons through a modern React architecture.

## 🏗️ Architecture

### Core Components

```
src/
├── hooks/                    # Custom React hooks
│   ├── usePrintfulProducts.ts    # Product data fetching
│   ├── useVariantSelection.ts    # Variant state management
│   ├── useBundleCalculation.ts   # Bundle pricing logic
│   └── useStickerAddons.ts       # Sticker add-on management
├── components/              # React components
│   ├── products/               # Product pages
│   │   ├── TShirtPage.tsx         # Consolidated t-shirt page
│   │   ├── HoodiePage.tsx         # Consolidated hoodie page
│   │   └── StarterBundlePage.tsx  # Bundle with real data
│   └── StickerAddonSelector.tsx   # Reusable sticker component
├── types/                   # TypeScript definitions
│   └── printful.d.ts            # Printful data types
└── lib/                     # Utility libraries
    ├── printful/                # Printful API client
    └── supabase/                # Backend integration
```

### Data Flow

```
Printful API → Supabase Edge Functions → React Hooks → Components → Cart → Stripe
```

## 🔧 Implementation Details

### 1. Type Definitions

#### PrintfulProduct Interface
```typescript
interface PrintfulProduct {
  id: number;
  name: string;
  description?: string;
  category: 'tshirt' | 'hoodie' | 'cap' | 'tote' | 'water-bottle' | 'mug' | 'mouse-pad';
  variants: PrintfulVariant[];
  isUnisex?: boolean;
  hasDarkLightVariants?: boolean;
  image?: string;
  brand?: string;
  model?: string;
  currency?: string;
  is_discontinued?: boolean;
  avg_fulfillment_time?: number;
  origin_country?: string | null;
}
```

#### PrintfulVariant Interface
```typescript
interface PrintfulVariant {
  id: number;
  name: string;
  color: 'dark' | 'light' | string;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL' | '4XL';
  price: string;
  in_stock: boolean;
  printful_variant_id: number;
  color_code?: string;
  image?: string;
}
```

#### BundleProduct Interface
```typescript
interface BundleProduct {
  id: string;
  name: string;
  description: string;
  products: BundleItem[];
  totalPrice: number;
  savings: number;
  image?: string;
}
```

#### StickerAddon Interface
```typescript
interface StickerAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  printful_variant_id: number;
  availableFor: Array<'tshirt' | 'hoodie' | 'cap' | 'tote' | 'water-bottle' | 'mug' | 'mouse-pad'>;
}
```

### 2. Custom Hooks

#### usePrintfulProducts
Fetches product data from Printful via Supabase Edge Functions.

```typescript
const { product, loading, error } = usePrintfulProduct(productId);
const { products, loading, error } = usePrintfulProducts();
```

**Features:**
- Automatic caching and revalidation
- Error handling with fallbacks
- Loading states for better UX
- Type-safe product data

#### useVariantSelection
Manages variant selection state with smart defaults.

```typescript
const {
  selectedVariant,
  availableColors,
  availableSizes,
  setColor,
  setSize,
  isAvailable,
  getCurrentPrice
} = useVariantSelection(product);
```

**Features:**
- Automatic color/size filtering
- Dark/light variant detection
- Stock availability checking
- Price calculation
- Smart default selection

#### useBundleCalculation
Handles bundle pricing and item management.

```typescript
const {
  calculation,
  addItem,
  removeItem,
  updateItemQuantity,
  clearBundle
} = useBundleCalculation(bundleItems, setBundleItems);
```

**Features:**
- Dynamic pricing calculations
- Savings percentage computation
- Individual vs. bundle pricing
- Item quantity management

#### useStickerAddons
Manages sticker add-on selection and pricing.

```typescript
const {
  selectedStickers,
  addSticker,
  removeSticker,
  updateStickerQuantity,
  getTotalStickerPrice
} = useStickerAddons();
```

**Features:**
- Sticker quantity management
- Total price calculation
- Category-based filtering
- Cart integration

### 3. Component Architecture

#### Product Pages
- **TShirtPage**: Consolidated t-shirt page with all variants
- **HoodiePage**: Consolidated hoodie page with all variants
- **Bundle Pages**: Real product data integration

#### StickerAddonSelector
Reusable component for adding stickers to products.

```typescript
<StickerAddonSelector
  availableStickers={availableStickers}
  selectedStickers={selectedStickers}
  onStickerChange={handleStickerChange}
  className="pt-6 border-t"
/>
```

## 🎯 Key Features

### 1. Variant Management
- **Color Selection**: Dark/light variant detection
- **Size Selection**: Unisex sizing support
- **Stock Checking**: Real-time availability
- **Price Updates**: Dynamic pricing based on selection

### 2. Bundle System
- **Dynamic Pricing**: Real-time bundle calculations
- **Savings Display**: Individual vs. bundle pricing
- **Item Management**: Add/remove bundle items
- **Sticker Integration**: Add-ons to bundles

### 3. Sticker Add-ons
- **Category Filtering**: Product-specific stickers
- **Quantity Selection**: Multiple sticker quantities
- **Price Integration**: Added to cart and checkout
- **Visual Selection**: Image-based selection

### 4. Cart Integration
- **Printful Variant IDs**: Correct variant tracking
- **Bundle Support**: Bundle items in cart
- **Sticker Add-ons**: Stickers as separate cart items
- **Checkout Ready**: Stripe-compatible format

## 🚀 Usage Examples

### Basic Product Page
```typescript
import { usePrintfulProduct } from '../hooks/usePrintfulProducts';
import { useVariantSelection } from '../hooks/useVariantSelection';

const ProductPage = () => {
  const { product, loading } = usePrintfulProduct(1);
  const variantSelection = useVariantSelection(product);
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      <h1>{product.name}</h1>
      <VariantSelector {...variantSelection} />
      <AddToCartButton variant={variantSelection.selectedVariant} />
    </div>
  );
};
```

### Bundle with Stickers
```typescript
import { useBundleCalculation } from '../hooks/useBundleCalculation';
import { useStickerAddons } from '../hooks/useStickerAddons';

const BundlePage = () => {
  const bundle = useBundleCalculation();
  const stickers = useStickerAddons();
  
  const handleAddToCart = () => {
    // Add bundle items
    bundle.items.forEach(item => addToCart(item));
    
    // Add stickers
    stickers.selectedStickers.forEach(sticker => addToCart(sticker));
  };
  
  return (
    <div>
      <BundleItems items={bundle.items} />
      <StickerAddonSelector {...stickers} />
      <AddToCartButton onClick={handleAddToCart} />
    </div>
  );
};
```

## 🔄 Data Flow

### 1. Product Loading
```
Component Mount → usePrintfulProduct → Supabase Function → Printful API → State Update → Re-render
```

### 2. Variant Selection
```
User Selection → useVariantSelection → State Update → Price Recalculation → UI Update
```

### 3. Cart Addition
```
Add to Cart → Cart Context → Printful Variant ID → Stripe Checkout → Order Processing
```

### 4. Bundle Calculation
```
Bundle Items Change → useBundleCalculation → Price Calculation → Savings Update → UI Update
```

## 🧪 Testing

### Test Suite
Comprehensive test coverage in `src/test-printful-integration.ts`:

- **Type Definitions**: Interface validation
- **Variant Logic**: Color/size sorting and filtering
- **Bundle Calculations**: Pricing and savings
- **Sticker Logic**: Add-on management
- **Cart Integration**: Item creation and formatting
- **Error Handling**: Graceful fallbacks
- **Performance**: Large dataset handling

### Running Tests
```bash
npm run test:printful
```

## 🚨 Error Handling

### Fallback Strategies
1. **Product Data**: Default values for missing data
2. **API Failures**: Graceful degradation with cached data
3. **Variant Selection**: Smart defaults for unavailable options
4. **Network Issues**: Retry logic with exponential backoff

### User Experience
- Loading states for all async operations
- Clear error messages with recovery options
- Fallback images for missing product photos
- Default pricing for unavailable variants

## 📱 Responsive Design

### Mobile-First Approach
- Touch-friendly variant selectors
- Swipeable image galleries
- Optimized bundle displays
- Accessible sticker selection

### Breakpoint Support
- **Mobile**: Single-column layout
- **Tablet**: Two-column grid
- **Desktop**: Full-featured interface

## 🔒 Security Considerations

### API Security
- Supabase Edge Functions for API calls
- Environment variable protection
- Rate limiting on Printful requests
- Secure variant ID handling

### Data Validation
- TypeScript interfaces for all data
- Runtime validation of API responses
- Sanitization of user inputs
- Secure cart item creation

## 🚀 Performance Optimization

### Caching Strategy
- In-memory caching for product data
- Stale-while-revalidate pattern
- Optimistic updates for user actions
- Lazy loading of product images

### Bundle Optimization
- Tree-shaking of unused components
- Memoized calculations for expensive operations
- Efficient re-rendering with React.memo
- Optimized variant filtering algorithms

## 🔮 Future Enhancements

### Planned Features
1. **Inventory Management**: Real-time stock updates
2. **Product Recommendations**: AI-powered suggestions
3. **Advanced Filtering**: Multi-criteria product search
4. **Wishlist Integration**: Save favorite combinations
5. **Social Sharing**: Product sharing capabilities

### Technical Improvements
1. **Service Worker**: Offline product browsing
2. **GraphQL**: More efficient data fetching
3. **WebSocket**: Real-time inventory updates
4. **PWA**: Progressive web app features

## 🐛 Troubleshooting

### Common Issues

#### Product Not Loading
```typescript
// Check Supabase function configuration
// Verify Printful API credentials
// Check network connectivity
```

#### Variant Selection Errors
```typescript
// Ensure product has variants
// Check variant data structure
// Verify color/size combinations
```

#### Bundle Calculation Issues
```typescript
// Validate bundle item structure
// Check pricing data format
// Verify quantity calculations
```

#### Sticker Integration Problems
```typescript
// Check sticker availability
// Verify category filtering
// Check cart item creation
```

### Debug Mode
Enable debug logging:
```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Product Data:', product);
  console.log('Variant Selection:', selection);
  console.log('Bundle Calculation:', calculation);
}
```

## 📚 Resources

### Documentation
- [Printful API Documentation](https://www.printful.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [React Hooks Guide](https://react.dev/reference/react/hooks)

### Code Examples
- [Product Page Implementation](./src/components/products/TShirtPage.tsx)
- [Bundle Page Example](./src/components/products/StarterBundlePage.tsx)
- [Hook Usage Examples](./src/hooks/)

### Testing
- [Test Suite](./src/test-printful-integration.ts)
- [Test Utilities](./src/test-printful-integration.ts#testUtils)

## 🤝 Contributing

### Development Guidelines
1. **Type Safety**: Use TypeScript interfaces
2. **Testing**: Write tests for new features
3. **Documentation**: Update this guide
4. **Performance**: Monitor bundle size and performance
5. **Accessibility**: Ensure WCAG compliance

### Code Review Checklist
- [ ] TypeScript interfaces defined
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Performance impact assessed

---

This integration provides a robust foundation for managing Printful products with a modern, user-friendly interface. The modular architecture makes it easy to extend and maintain as requirements evolve.
