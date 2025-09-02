# PR-07: QA Custom Image Workflow Testing

## Assignment
**Agent**: QAAgent
**Priority**: HIGH
**Estimated Time**: 2-3 hours
**Assigned By**: DirectorCTO
**Date**: 2025-09-01
**Depends On**: PR-05 (Backend) and PR-06 (Frontend)

## Problem Statement
Need comprehensive testing of the custom image thumbnail system to ensure user-uploaded images display correctly across all touchpoints and that Printful images don't override custom branding.

## Business Impact
- Quality assurance for brand control feature
- Ensures customer sees correct product imagery
- Validates admin workflow effectiveness
- Prevents regression in image display logic

## Testing Scope

### 1. Admin Image Upload Testing
Test the complete admin workflow:

```typescript
// Test script: test-admin-image-upload.ts
describe('Admin Image Upload', () => {
  test('Upload custom image', async () => {
    // 1. Login as admin
    // 2. Navigate to product editor
    // 3. Upload custom image file
    // 4. Set image as thumbnail
    // 5. Save product
    // 6. Verify database has is_thumbnail = true
  });

  test('Replace existing thumbnail', async () => {
    // 1. Product with existing thumbnail
    // 2. Upload new image
    // 3. Set new image as thumbnail
    // 4. Verify old thumbnail is_thumbnail = false
    // 5. Verify new thumbnail is_thumbnail = true
  });

  test('Multiple images with one thumbnail', async () => {
    // 1. Upload 5 images
    // 2. Set image 3 as thumbnail
    // 3. Verify only one is_thumbnail = true
    // 4. Change thumbnail to image 5
    // 5. Verify thumbnail changed correctly
  });
});
```

### 2. Frontend Display Testing
Verify thumbnails appear correctly:

```typescript
// Test script: test-thumbnail-display.ts
describe('Thumbnail Display', () => {
  test('Shop page shows custom thumbnails', async () => {
    // 1. Set custom thumbnail for product
    // 2. Navigate to shop page
    // 3. Verify ProductCard shows custom image
    // 4. Verify image URL matches database
  });

  test('Product detail page thumbnail', async () => {
    // 1. Product with custom thumbnail
    // 2. Navigate to PDP
    // 3. Verify main image is thumbnail
    // 4. Verify gallery includes all images
  });

  test('Cart shows custom thumbnail', async () => {
    // 1. Add product with custom thumbnail to cart
    // 2. Open cart
    // 3. Verify cart item shows thumbnail
    // 4. Proceed to checkout
    // 5. Verify checkout shows thumbnail
  });
});
```

### 3. Printful Sync Testing
Ensure Printful doesn't override custom images:

```typescript
// Test script: test-printful-sync-protection.ts
describe('Printful Sync Protection', () => {
  test('Sync preserves custom thumbnails', async () => {
    // 1. Set custom thumbnail
    // 2. Record image URL and is_thumbnail
    // 3. Run Printful sync
    // 4. Verify custom thumbnail unchanged
    // 5. Verify is_thumbnail still true
  });

  test('Sync adds images without overriding', async () => {
    // 1. Product with custom images
    // 2. Run Printful sync
    // 3. Verify new Printful images added
    // 4. Verify source = 'printful' for new images
    // 5. Verify custom images still primary
  });

  test('Feature flag controls Printful images', async () => {
    // 1. Set use_printful_images = false
    // 2. Verify only custom images show
    // 3. Set use_printful_images = true
    // 4. Verify Printful images available as fallback
  });
});
```

### 4. Edge Case Testing
Handle unusual scenarios:

```typescript
// Test script: test-image-edge-cases.ts
describe('Image Edge Cases', () => {
  test('Product with no images', async () => {
    // 1. Create product without images
    // 2. Verify default logo shows
    // 3. Add image and set as thumbnail
    // 4. Verify thumbnail now shows
  });

  test('Broken image URL handling', async () => {
    // 1. Set thumbnail with invalid URL
    // 2. Verify fallback displays
    // 3. Verify console warning logged
    // 4. Verify no JS errors thrown
  });

  test('Large image handling', async () => {
    // 1. Upload 10MB image
    // 2. Verify upload succeeds or fails gracefully
    // 3. If succeeds, verify display performance
    // 4. Check lazy loading works
  });

  test('Concurrent thumbnail updates', async () => {
    // 1. Two admins edit same product
    // 2. Both set different thumbnails
    // 3. Verify last write wins
    // 4. Verify data consistency
  });
});
```

### 5. Performance Testing
Ensure system performs well:

```typescript
// Test script: test-image-performance.ts
describe('Image Performance', () => {
  test('Page load with 50 products', async () => {
    // 1. Create 50 products with custom thumbnails
    // 2. Load shop page
    // 3. Measure time to first image
    // 4. Verify < 2 second load time
    // 5. Verify lazy loading works
  });

  test('Image query performance', async () => {
    // 1. Product with 20 images
    // 2. Query for thumbnail
    // 3. Verify query < 100ms
    // 4. Verify correct image returned
  });
});
```

### 6. Data Validation Script
Create comprehensive validation:

```typescript
// Script: validate-image-data.ts
async function validateImageData() {
  // 1. Check all products have valid image URLs
  const productsWithoutImages = await supabase
    .from('products')
    .select('id, name')
    .is('image_url', null);

  // 2. Check thumbnail uniqueness per product
  const duplicateThumbnails = await supabase.rpc(
    'check_duplicate_thumbnails'
  );

  // 3. Verify image sources are tagged
  const untaggedImages = await supabase
    .from('product_images')
    .select('id')
    .is('source', null);

  // 4. Check for orphaned images
  const orphanedImages = await supabase
    .from('product_images')
    .select('id')
    .is('product_id', null);

  return {
    productsWithoutImages,
    duplicateThumbnails,
    untaggedImages,
    orphanedImages
  };
}
```

## Test Data Requirements
1. At least 10 products with custom images
2. Mix of products with/without Printful images
3. Various image formats (JPG, PNG, WebP)
4. Different image sizes (small to large)
5. Products with 1-20 images each

## Acceptance Criteria
- [ ] All test suites pass
- [ ] No regression in existing functionality
- [ ] Custom thumbnails display correctly everywhere
- [ ] Printful sync doesn't override custom images
- [ ] Performance benchmarks met
- [ ] Edge cases handled gracefully
- [ ] Data validation passes

## Testing Tools
- Playwright for E2E tests
- Jest for unit tests
- Lighthouse for performance
- Manual testing checklist
- Database query validation

## Bug Report Template
```markdown
## Bug: [Title]
**Severity**: Critical/High/Medium/Low
**Component**: Admin/Frontend/API/Database
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: 
**Actual**: 
**Screenshot/Video**: 
**Browser/Device**: 
```

## Regression Test Checklist
- [ ] Existing product display unaffected
- [ ] Cart functionality works
- [ ] Checkout process completes
- [ ] Admin can still manage products
- [ ] Printful sync still functions
- [ ] Mobile display correct
- [ ] Performance unchanged

## Definition of Done
- [ ] All test suites implemented
- [ ] Tests run automatically in CI
- [ ] Test documentation complete
- [ ] Bug reports filed for issues
- [ ] Performance baseline established
- [ ] Test data scripts created
- [ ] Manual test checklist verified

## Notes
- Focus on user's requirement: custom images take priority
- Document any discovered limitations
- Create test data that mirrors production
- Consider automated visual regression tests

## Deliverables
1. Test suite files (Playwright/Jest)
2. Test data generation scripts
3. Validation scripts
4. Bug reports (if any)
5. Performance report
6. Test coverage report
7. Manual testing video/screenshots

## Priority Test Scenarios
1. **Critical**: Custom thumbnail displays on product card
2. **Critical**: Printful sync doesn't override
3. **High**: Cart shows correct image
4. **High**: Admin can set thumbnail
5. **Medium**: Performance with many images
6. **Low**: Edge cases handled