# PR-05: Backend Image Selection API Fix

## Assignment
**Agent**: BackendAgent
**Priority**: URGENT
**Estimated Time**: 2-3 hours
**Assigned By**: DirectorCTO
**Date**: 2025-09-01

## Problem Statement
The user's custom uploaded images designated as thumbnails in the admin panel are not displaying on frontend product cards. The API's image selection logic ignores the `is_thumbnail` field, causing custom branding to be overridden or ignored.

## Business Impact
- User cannot control product presentation
- Custom branding is compromised
- Direct impact on conversion rates
- Admin image upload work is ineffective

## Technical Context
- Admin upload system is fully functional (`EnhancedImageManagement.tsx`)
- Database has proper `is_thumbnail` field with constraints
- API ignores thumbnail designation (`src/lib/api.ts:60-87`)
- ProductCard components inherit broken logic

## Architectural Decision
**Hybrid Image Management with User Priority**:
1. Custom images with `is_thumbnail = true` ALWAYS take priority
2. Printful images only used as fallback when no custom images exist
3. No automatic sync override of custom images
4. Optional feature flag for Printful image usage per product

## Required Changes

### 1. Database Migration
Create migration to add feature flag:
```sql
-- Add feature flag for Printful image usage
ALTER TABLE products 
ADD COLUMN use_printful_images BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN products.use_printful_images IS 'When true, allows Printful images as fallback if no custom images exist';
```

### 2. Fix API Image Selection Logic
Update `/src/lib/api.ts` getImageUrl function (lines 60-87):

```typescript
const getImageUrl = () => {
  const images = product.product_images || [];
  
  if (images.length === 0) {
    return product.image_url || '/BackReformLogo.png';
  }
  
  // PRIORITY 1: Custom thumbnail (is_thumbnail = true)
  const thumbnail = images.find((img: any) => img.is_thumbnail === true);
  if (thumbnail) return thumbnail.image_url;
  
  // PRIORITY 2: Primary image (is_primary = true) 
  const primaryImage = images.find((img: any) => img.is_primary === true);
  if (primaryImage) return primaryImage.image_url;
  
  // PRIORITY 3: First general product image
  const generalImage = images.find((img: any) => 
    img.variant_type === 'product' || img.variant_type === null
  );
  if (generalImage) return generalImage.image_url;
  
  // PRIORITY 4: First image by order
  const orderedImages = images
    .filter((img: any) => img.image_url)
    .sort((a: any, b: any) => (a.image_order || 0) - (b.image_order || 0));
  if (orderedImages.length > 0) return orderedImages[0].image_url;
  
  // FINAL FALLBACK
  return product.image_url || '/BackReformLogo.png';
};
```

### 3. Update Printful Sync Function
Modify `/supabase/functions/printful-sync/index.ts` to respect custom images:

```typescript
// Before inserting Printful image, check for existing custom images
const { data: existingImages } = await supabase
  .from('product_images')
  .select('id, is_thumbnail')
  .eq('product_id', insertedProduct.id)
  .eq('is_thumbnail', true);

// Only insert Printful image if no custom thumbnail exists
if (!existingImages || existingImages.length === 0) {
  // Insert Printful image but never set is_thumbnail = true
  await supabase
    .from('product_images')
    .insert({
      product_id: insertedProduct.id,
      image_url: publicUrl,
      alt_text: `${syncProduct.name} Printful image`,
      is_primary: false, // Never override custom primary
      is_thumbnail: false, // Never set as thumbnail
      source: 'printful' // Track source for future reference
    });
}
```

### 4. Add Source Tracking
Create migration to track image source:
```sql
-- Add source tracking to product_images
ALTER TABLE product_images 
ADD COLUMN source TEXT DEFAULT 'custom';

-- Update existing Printful images
UPDATE product_images 
SET source = 'printful' 
WHERE image_url LIKE '%printful%' OR image_url LIKE '%printfulcdn%';
```

## Acceptance Criteria
- [ ] Custom thumbnails (`is_thumbnail = true`) display on ALL product cards
- [ ] Printful sync does NOT override custom images
- [ ] API prioritizes custom thumbnails over all other images
- [ ] Feature flag allows per-product control of Printful images
- [ ] Source tracking implemented for all images
- [ ] No breaking changes for products without custom images
- [ ] Performance remains optimal (< 100ms query time)

## Testing Requirements
1. Upload custom image and set as thumbnail
2. Verify thumbnail displays on product card
3. Run Printful sync and confirm custom image remains
4. Test products with no custom images still work
5. Verify feature flag toggle works correctly
6. Check performance with 100+ images per product

## Files to Modify
1. `/src/lib/api.ts` - Fix getImageUrl priority logic
2. `/supabase/functions/printful-sync/index.ts` - Respect custom images
3. New migration file for feature flag and source tracking
4. Update `.env.example` if new config needed

## Performance Considerations
- Ensure image queries remain indexed
- Consider caching thumbnail URLs in products table
- Monitor query performance with large image sets

## Security Notes
- Validate all image URLs before storage
- Ensure proper CORS headers for image serving
- Maintain RLS policies on product_images table

## Dependencies
- Database migration must be applied first
- Coordinate with FrontendAgent for component updates
- QAAgent needs test data for validation

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing
- [ ] Integration tests for image selection logic
- [ ] Migration tested on local and staging
- [ ] Performance benchmarks met
- [ ] Code reviewed and approved
- [ ] Documentation updated

## Notes
- User explicitly does NOT want Printful images taking priority
- This is blocking their ability to control brand presentation
- Consider future enhancement: bulk image upload in admin

## Questions for Clarification
None - requirements are clear. Proceed with implementation.