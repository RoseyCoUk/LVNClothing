# Custom Image Testing Framework

## Overview

This comprehensive testing framework validates the complete custom image functionality in the Reform UK e-commerce system. The framework ensures that custom uploaded images take priority over Printful images, maintains data integrity, and provides a seamless user experience across all touchpoints.

## Test Suite Architecture

### 🧪 Test Categories

1. **Admin Image Upload Testing** (`custom-image-upload.spec.ts`)
   - Image upload validation and format checking
   - File size limit enforcement (50MiB)
   - Thumbnail designation and replacement workflows
   - Concurrent admin operations and conflict resolution
   - Security validation and malicious file prevention

2. **Frontend Thumbnail Display Testing** (`thumbnail-display.spec.ts`)
   - Custom thumbnails on shop page (PLP)
   - Product detail page image galleries (PDP)
   - Cart display with custom thumbnails
   - Checkout process image consistency
   - Mobile responsive image display

3. **Printful Sync Protection Testing** (`printful-sync-protection.spec.ts`)
   - Custom thumbnails preserved during Printful sync
   - New Printful images added without overriding custom ones
   - Feature flag controls for Printful image usage
   - Source tracking accuracy ('custom' vs 'printful')
   - Bulk sync operations and data consistency

4. **Image Validation & Storage Testing** (`image-validation-storage.spec.ts`)
   - File format validation (PNG, JPG, JPEG, GIF)
   - File size limits and boundary testing
   - Storage bucket organization and permissions
   - Upload performance across different image sizes
   - Security validation and cleanup processes

5. **E2E Purchase Flow Testing** (`custom-image-e2e-flow.spec.ts`)
   - Complete purchase journey with custom images
   - Image consistency from PLP → PDP → Cart → Checkout
   - Color variant image switching
   - Admin order management with custom images
   - Performance impact assessment

6. **Performance & Edge Case Testing** (`edge-cases-performance.spec.ts`)
   - Products with no images (fallback behavior)
   - Broken image URL handling
   - Large image handling and memory usage
   - Network conditions testing (offline, slow 3G)
   - Mobile device and browser compatibility

### 🔧 Supporting Tools

- **Data Validation Script** (`validate-custom-image-data.ts`)
  - Database integrity checking
  - Image URL accessibility testing
  - Performance metrics collection
  - Health scoring and recommendations

- **Test Runner** (`custom-image-test-runner.ts`)
  - Orchestrated test execution
  - Dependency management
  - Comprehensive reporting
  - CI/CD integration support

## Prerequisites

Before running the tests, ensure the following are available:

1. **Development Environment**
   ```bash
   npm run dev  # Frontend server at localhost:5173
   supabase start  # Local Supabase at localhost:54321
   ```

2. **Test Dependencies**
   ```bash
   npm install @playwright/test
   playwright install  # Browser binaries
   ```

3. **Environment Variables**
   ```bash
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Admin Account**
   - Email: `admin@reformuk.com`
   - Password: `admin123`

## Running Tests

### Quick Commands

```bash
# Full test suite (comprehensive)
npm run test:custom-images

# Critical tests only (faster)
npm run test:custom-images:critical

# Quick smoke tests
npm run test:custom-images:quick

# Data validation only
npm run validate:custom-images
```

### Manual Execution

```bash
# Run specific test suite
npx playwright test custom-image-upload.spec.ts

# Run with UI mode
npx playwright test --ui

# Run with debugging
npx playwright test --debug custom-image-upload.spec.ts

# Generate HTML report
npx playwright test --reporter=html
```

### Test Runner Options

```bash
# Full comprehensive testing
tsx tests/playwright/custom-image-test-runner.ts full

# Critical and high priority tests only
tsx tests/playwright/custom-image-test-runner.ts critical

# Quick smoke test
tsx tests/playwright/custom-image-test-runner.ts quick
```

## Test Scenarios Covered

### ✅ Admin Upload Scenarios

- **Valid Image Formats**: PNG, JPG, JPEG, GIF acceptance
- **Invalid Format Rejection**: TXT, PDF, SVG, WebP rejection
- **File Size Limits**: 50MiB boundary testing
- **Thumbnail Management**: Setting, changing, and replacing thumbnails
- **Concurrent Operations**: Multiple admins editing same product
- **Security**: Malicious file detection and prevention

### ✅ Frontend Display Scenarios

- **Shop Page**: Custom thumbnails displayed on product cards
- **Product Detail**: Custom images in galleries and main display
- **Cart Integration**: Custom thumbnails shown in cart items
- **Checkout Process**: Image consistency through payment flow
- **Mobile Responsive**: Proper display on mobile devices
- **Image Priority**: Custom thumbnails prioritized over Printful images

### ✅ Sync Protection Scenarios

- **Preservation**: Custom thumbnails maintained during Printful sync
- **Non-Override**: Printful sync adds images without replacing custom ones
- **Source Tracking**: Accurate 'custom' vs 'printful' tagging
- **Feature Flags**: Control over Printful image usage per product
- **Conflict Resolution**: Handling simultaneous sync and custom operations

### ✅ Performance Scenarios

- **Load Testing**: Page performance with multiple custom images
- **Network Conditions**: Behavior on slow/fast connections
- **Memory Usage**: Performance with large numbers of images
- **Browser Compatibility**: Cross-browser testing (Chrome, Firefox, Safari)
- **Mobile Performance**: Responsive design and touch interactions

### ✅ Edge Case Scenarios

- **No Images**: Fallback behavior for products without images
- **Broken URLs**: Graceful handling of inaccessible images
- **Large Files**: Performance with high-resolution images
- **Network Failures**: Offline behavior and error recovery
- **Data Corruption**: Recovery from inconsistent database states

## Expected Results

### Success Criteria

1. **All Tests Pass**: No critical failures in test execution
2. **Performance Benchmarks**: 
   - Shop page load < 10 seconds
   - Image upload < 30 seconds
   - Average image load < 3 seconds
3. **Data Integrity**: 
   - One thumbnail per product maximum
   - All images have valid URLs
   - Source tracking accuracy 100%
4. **User Experience**: 
   - Custom images display consistently
   - Fallback behavior works gracefully
   - Mobile compatibility maintained

### Test Output

The test runner provides comprehensive reporting:

```
🧪 CUSTOM IMAGE TEST EXECUTION SUMMARY
================================================================================
📅 Completed: 2025-09-01T10:30:00.000Z
⏱️  Total Duration: 45 minutes
📊 Overall Status: SUCCESS

📈 TEST STATISTICS
✅ Passed: 127
❌ Failed: 0
⏭️  Skipped: 3
📋 Total: 130

🎭 SUITE RESULTS
✅ Data Validation (15s) - P:1 F:0 S:0
✅ Admin Image Upload (180s) - P:15 F:0 S:0
✅ Frontend Thumbnail Display (120s) - P:12 F:0 S:0
✅ Printful Sync Protection (150s) - P:18 F:0 S:0
✅ Image Validation & Storage (300s) - P:25 F:0 S:0
✅ E2E Purchase Flow (450s) - P:35 F:0 S:0
✅ Performance & Edge Cases (600s) - P:21 F:0 S:3

🎯 FINAL ASSESSMENT
🟢 SUCCESS: All custom image tests passed! System ready for production.
```

## Troubleshooting

### Common Issues

1. **Development Server Not Running**
   ```
   ❌ Development server not running. Please run: npm run dev
   ```
   **Solution**: Start the frontend development server

2. **Supabase Not Accessible**
   ```
   ❌ Supabase not accessible. Please run: supabase start
   ```
   **Solution**: Start local Supabase instance

3. **Admin Login Fails**
   ```
   ❌ Admin authentication failed
   ```
   **Solution**: Verify admin account exists or create one via admin setup

4. **Test Files Missing**
   ```
   ❌ Required test file missing: custom-image-upload.spec.ts
   ```
   **Solution**: Ensure all test files are present in tests/playwright/

### Debug Mode

Run individual tests in debug mode for detailed analysis:

```bash
npx playwright test --debug custom-image-upload.spec.ts
```

This opens the Playwright Inspector for step-by-step debugging.

### Screenshot Analysis

Failed tests automatically generate screenshots in `test-results/`:

```
test-results/
├── custom-image-upload/
│   ├── test-failed-1.png
│   └── test-failed-2.png
├── thumbnail-display/
│   └── mobile-responsive-error.png
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Custom Image Tests
on: [push, pull_request]

jobs:
  test-custom-images:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install
      
      - name: Start services
        run: |
          supabase start &
          npm run dev &
          sleep 30
      
      - name: Run custom image tests
        run: npm run test:custom-images:critical
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

### Exit Codes

- `0`: All tests passed
- `1`: Some tests failed but system partially functional
- `2`: Critical failures, do not deploy

## Maintenance

### Regular Health Checks

Run data validation regularly to ensure system health:

```bash
# Weekly validation
npm run validate:custom-images

# Quick smoke test after deployments
npm run test:custom-images:quick
```

### Updating Tests

When adding new image functionality:

1. Add test scenarios to appropriate spec file
2. Update test runner dependencies if needed
3. Verify test coverage remains comprehensive
4. Update this documentation

### Performance Monitoring

Monitor key metrics established by tests:

- **Image Load Times**: Should remain < 3 seconds average
- **Storage Usage**: Monitor growth and cleanup efficiency  
- **Error Rates**: Track failed image uploads and display errors
- **Sync Conflicts**: Monitor Printful sync override attempts

## Support

For issues with the testing framework:

1. Check prerequisites are met
2. Review troubleshooting section
3. Run individual tests in debug mode
4. Examine generated screenshots and reports
5. Check the comprehensive logs in test results

The testing framework is designed to be self-documenting with detailed console output and comprehensive reporting to help diagnose any issues quickly.