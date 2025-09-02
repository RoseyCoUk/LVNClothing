# PR-06: Frontend ProductCard Component Updates

## Assignment
**Agent**: FrontendAgent
**Priority**: URGENT
**Estimated Time**: 1-2 hours
**Assigned By**: DirectorCTO
**Date**: 2025-09-01
**Depends On**: PR-05 (Backend API fixes)

## Problem Statement
ProductCard components across the site are not respecting the custom thumbnail designation from the admin panel. They're using the basic `image_url` field instead of the prioritized image from the enhanced API.

## Business Impact
- Inconsistent product presentation across the site
- Custom branding not visible to customers
- Admin's thumbnail selections are ignored
- Poor user experience with missing/wrong images

## Technical Context
- Backend API will be fixed in PR-05 to prioritize thumbnails
- ProductCard at `/src/components/ui/ProductCard.tsx:63-77`
- Cart items propagate image URLs through context
- Multiple product display components affected

## Required Changes

### 1. Update ProductCard Component
Fix `/src/components/ui/ProductCard.tsx` (lines 63-77):

```tsx
// The API now returns the correct prioritized image in image_url
// No changes needed if API is returning correct URL
// But add fallback handling for robustness

{/* Product Image */}
<div className="bg-gray-100 aspect-square w-full flex items-center justify-center">
  {product.image_url ? (
    <img 
      src={product.image_url} 
      alt={product.name}
      loading="lazy" // Add lazy loading for performance
      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200" 
      onError={(e) => {
        // Better error handling
        const target = e.currentTarget;
        target.style.display = 'none';
        target.nextElementSibling?.classList.remove('hidden');
        
        // Log error for monitoring
        console.warn(`Failed to load image for ${product.name}:`, product.image_url);
      }}
    />
  ) : null}
  <div className={`w-full h-full flex items-center justify-center text-gray-400 ${product.image_url ? 'hidden' : ''}`}>
    <div className="text-center p-4">
      <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>{product.image_url ? 'Image Failed to Load' : 'No Image Available'}</span>
    </div>
  </div>
</div>
```

### 2. Update Cart Context Image Handling
Verify `/src/contexts/CartContext.tsx` uses the correct image:

```tsx
// When adding to cart, ensure we capture the thumbnail URL
const addToCart = (product: Product, variant: ProductVariant) => {
  const cartItem = {
    ...existingItem,
    // Ensure we use the product.image_url which now contains the prioritized thumbnail
    image_url: product.image_url || '/BackReformLogo.png',
    // Also store thumbnail flag if available for future use
    is_thumbnail_image: true, // If this came from a thumbnail
  };
  // ... rest of logic
};
```

### 3. Update Product Grid Component
Check `/src/components/ProductGrid.tsx` for consistent image display:

```tsx
// Ensure ProductGrid passes through the correct image URL
// The API should already be providing the right URL
// Just ensure we're not overriding it anywhere

products.map(product => (
  <ProductCard 
    key={product.id} 
    product={{
      ...product,
      // Don't override image_url here - use what API provides
      image_url: product.image_url
    }} 
  />
))
```

### 4. Add Image Loading States
Implement better UX for image loading:

```tsx
// Add loading skeleton while images load
const [imageLoading, setImageLoading] = useState(true);

<div className="relative">
  {imageLoading && (
    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
  )}
  <img
    src={product.image_url}
    onLoad={() => setImageLoading(false)}
    onError={(e) => {
      setImageLoading(false);
      // Error handling
    }}
  />
</div>
```

### 5. Update Shop Page Component
Ensure `/src/pages/ShopPage.tsx` (if exists) or `/src/components/ShopPage.tsx`:

```tsx
// Verify the shop page uses the enhanced product data
// Should automatically work if using getProducts() from API
// Add console logging for debugging during development

useEffect(() => {
  const fetchProducts = async () => {
    const products = await getProducts();
    console.log('Shop products with thumbnails:', products.map(p => ({
      name: p.name,
      image_url: p.image_url,
      has_thumbnail: p.image_url?.includes('thumbnail') // Debug check
    })));
    setProducts(products);
  };
  fetchProducts();
}, []);
```

## Acceptance Criteria
- [ ] Product cards display custom thumbnail images when set
- [ ] Images load with proper loading states
- [ ] Error handling shows user-friendly placeholder
- [ ] Cart items show correct thumbnail images
- [ ] Performance: Images lazy load on scroll
- [ ] Console logging for debugging (removable for production)
- [ ] Mobile responsive image display maintained

## Testing Requirements
1. Set custom thumbnail for a product in admin
2. Verify thumbnail appears on shop page grid
3. Verify thumbnail appears in cart when added
4. Test error handling with broken image URL
5. Test performance with 50+ products on page
6. Verify mobile display is correct

## Files to Modify
1. `/src/components/ui/ProductCard.tsx` - Enhanced image display
2. `/src/contexts/CartContext.tsx` - Verify image propagation
3. `/src/components/ProductGrid.tsx` - Ensure proper data flow
4. `/src/components/TopSellers.tsx` - Check featured products
5. Any other components displaying product images

## Performance Considerations
- Implement lazy loading for images
- Add loading skeletons for better perceived performance
- Consider image CDN optimization in future
- Monitor Core Web Vitals (LCP, CLS)

## Accessibility Requirements
- Proper alt text for all images
- Fallback content for screen readers
- Loading states announced to screen readers
- Keyboard navigation maintained

## Mobile Considerations
- Responsive image sizing
- Touch-friendly image interactions
- Optimized for mobile network speeds
- Proper aspect ratio maintenance

## Dependencies
- PR-05 must be completed first (Backend API fix)
- Coordinate with QAAgent for test data
- May need to clear browser cache during testing

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Component tests written
- [ ] Visual regression tests pass
- [ ] Mobile testing completed
- [ ] Performance metrics maintained
- [ ] Code reviewed and approved
- [ ] Works with both custom and Printful images

## Notes
- User wants complete control over product imagery
- This directly impacts conversion rates
- Consider future enhancement: Image zoom on hover
- May need to add image optimization pipeline later

## Edge Cases to Handle
1. Product with no images at all
2. Product with only Printful images (no custom)
3. Broken image URLs
4. Very large images (>5MB)
5. Slow network conditions
6. Mixed HTTP/HTTPS image sources

## Questions for Clarification
None - requirements are clear. Coordinate with BackendAgent on API changes.