# Playwright Frontend Testing Suite

This directory contains a comprehensive Playwright testing suite for the Reform UK frontend application. The tests cover all major pages, components, and user interactions to ensure quality and identify any errors.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Playwright browsers installed

### Installation
```bash
# Install Playwright browsers
npm run test:install

# Or install manually
npx playwright install
```

### Running Tests

#### Run All Tests
```bash
# Run all Playwright tests
npm run test:playwright

# Run with UI mode (interactive)
npm run test:playwright:ui

# Run in headed mode (see browser)
npm run test:playwright:headed

# Run with debug mode
npm run test:playwright:debug
```

#### Run Specific Test Suites
```bash
# Run specific test file
npx playwright test pages/home-page.spec.ts

# Run tests matching pattern
npx playwright test --grep "Home Page"
```

#### Generate Reports
```bash
# Show HTML report
npm run test:playwright:report

# Run tests and generate report
npm run test:playwright -- --reporter=html
```

## 📁 Test Structure

```
tests/playwright/
├── README.md                           # This file
├── playwright.config.ts                # Playwright configuration
├── global-setup.ts                     # Global test setup
├── global-teardown.ts                  # Global test cleanup
├── utils/
│   └── test-helpers.ts                # Utility functions and error handling
├── pages/                              # Page-specific test files
│   ├── home-page.spec.ts              # Home page tests
│   ├── shop-page.spec.ts              # Shop page tests
│   ├── auth-pages.spec.ts             # Authentication pages tests
│   ├── product-pages.spec.ts          # Product detail pages tests
│   ├── checkout-pages.spec.ts         # Checkout and order pages tests
│   ├── support-pages.spec.ts          # Support and legal pages tests
│   └── admin-pages.spec.ts            # Admin pages tests
├── test-runner.ts                      # Comprehensive test runner
└── run-all-tests.ts                   # Main test execution script
```

## 🧪 Test Coverage

### Home Page (`/`)
- ✅ Page loading and rendering
- ✅ Navigation functionality
- ✅ Hero section interactions
- ✅ Top sellers display
- ✅ Product bundles
- ✅ Email signup functionality
- ✅ Accessibility compliance
- ✅ Performance metrics
- ✅ Error handling

### Shop Page (`/shop`)
- ✅ Page loading and rendering
- ✅ Product grid display
- ✅ Filtering and sorting
- ✅ Search functionality
- ✅ Product card interactions
- ✅ Navigation to product pages
- ✅ Pagination (if available)
- ✅ Accessibility compliance
- ✅ Performance metrics
- ✅ Error handling

### Authentication Pages
- ✅ Login page (`/login`)
- ✅ Signup page (`/signup`)
- ✅ Account page (`/account`)
- ✅ Form validation
- ✅ Navigation between pages
- ✅ Redirect behavior
- ✅ Accessibility compliance
- ✅ Performance metrics
- ✅ Error handling

### Product Detail Pages
- ✅ T-shirt page (`/product/reform-uk-tshirt`)
- ✅ Hoodie page (`/product/reform-uk-hoodie`)
- ✅ Cap page (`/product/reform-uk-cap`)
- ✅ Tote bag page (`/product/reform-uk-tote-bag`)
- ✅ Water bottle page (`/product/reform-uk-water-bottle`)
- ✅ Mug page (`/product/reform-uk-mug`)
- ✅ Mouse pad page (`/product/reform-uk-mouse-pad`)
- ✅ Bundle pages (Starter, Champion, Activist)
- ✅ Variant selection
- ✅ Add to cart functionality
- ✅ Image gallery
- ✅ Quantity selection
- ✅ Accessibility compliance
- ✅ Performance metrics
- ✅ Error handling

### Checkout and Order Pages
- ✅ Checkout page (`/checkout`)
- ✅ Success page (`/success`)
- ✅ Orders page (`/orders`)
- ✅ Track order page (`/track-order`)
- ✅ Test payment flow (`/test-payment`)
- ✅ Form validation
- ✅ Navigation
- ✅ Accessibility compliance
- ✅ Performance metrics
- ✅ Error handling

### Support and Legal Pages
- ✅ About page (`/about`)
- ✅ Contact page (`/contact`)
- ✅ FAQ page (`/faq`)
- ✅ Privacy policy (`/privacy-policy`)
- ✅ Cookie policy (`/cookie-policy`)
- ✅ Terms of service (`/terms-of-service`)
- ✅ Returns and exchanges (`/returns-exchanges`)
- ✅ Shipping info (`/shipping-info`)
- ✅ Size guide (`/size-guide`)
- ✅ Accessibility page (`/accessibility`)
- ✅ Form functionality
- ✅ Navigation
- ✅ Accessibility compliance
- ✅ Performance metrics
- ✅ Error handling

### Admin Pages
- ✅ Admin login (`/admin/login`)
- ✅ Admin dashboard (`/admin/dashboard`)
- ✅ Admin orders (`/admin/orders`)
- ✅ Admin products (`/admin/products`)
- ✅ Admin analytics (`/admin/analytics`)
- ✅ Admin customers (`/admin/customers`)
- ✅ Admin settings (`/admin/settings`)
- ✅ Authentication flow
- ✅ URL protection
- ✅ Security headers
- ✅ Accessibility compliance
- ✅ Performance metrics
- ✅ Error handling

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)
- **Test Directory**: `./tests/playwright`
- **Base URL**: `http://localhost:5173`
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Screenshots**: On failure
- **Videos**: Retain on failure
- **Traces**: On first retry
- **Web Server**: Auto-starts dev server

### Test Helpers (`utils/test-helpers.ts`)
- **Error Collection**: Comprehensive error tracking
- **Screenshot Capture**: Automatic error screenshots
- **Accessibility Testing**: Basic accessibility checks
- **Performance Testing**: Page load metrics
- **Console Error Monitoring**: JavaScript error detection
- **Network Error Monitoring**: HTTP error detection

## 📊 Error Reporting

### Error Types Tracked
1. **Page Load Failures**: Pages that don't load properly
2. **Component Failures**: Missing or broken UI components
3. **Navigation Failures**: Broken links and routing
4. **Form Failures**: Form validation and submission issues
5. **Accessibility Issues**: Missing alt text, heading structure, etc.
6. **Performance Issues**: Slow page loads, poor metrics
7. **Console Errors**: JavaScript errors and warnings
8. **Network Errors**: Failed API calls and resources

### Error Reports Generated
- **JSON Report**: Machine-readable detailed report
- **Markdown Report**: Human-readable summary
- **HTML Report**: Interactive Playwright report
- **Screenshots**: Visual evidence of failures
- **Console Logs**: Detailed error information

## 🎯 Test Execution

### Running All Tests
```bash
# Run comprehensive test suite
npm run test:frontend:all

# This will:
# 1. Execute all test suites
# 2. Collect errors and failures
# 3. Generate comprehensive reports
# 4. Provide recommendations
```

### Test Results Location
```
test-results/
├── comprehensive-report.json      # Detailed JSON report
├── comprehensive-report.md        # Markdown summary
├── screenshots/                   # Error screenshots
├── videos/                        # Test videos
└── traces/                        # Test traces
```

## 🚨 Common Issues and Solutions

### Tests Failing Due to Missing Elements
- Ensure components have proper `data-testid` attributes
- Check if components are conditionally rendered
- Verify page routing is correct

### Performance Test Failures
- Check network conditions
- Verify page load times
- Review resource optimization

### Accessibility Test Failures
- Add missing alt text to images
- Fix heading hierarchy
- Ensure proper ARIA labels

### Network Error Failures
- Check API endpoints
- Verify authentication
- Review CORS configuration

## 🔍 Debugging Tests

### Debug Mode
```bash
npm run test:playwright:debug
```

### UI Mode
```bash
npm run test:playwright:ui
```

### Headed Mode
```bash
npm run test:playwright:headed
```

### Specific Test Debugging
```bash
# Debug specific test
npx playwright test --debug --grep "Home page loads successfully"

# Debug with specific browser
npx playwright test --project=chromium --debug
```

## 📈 Continuous Integration

### GitHub Actions Example
```yaml
name: Frontend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:install
      - run: npm run test:playwright
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: test-results/
```

## 🎉 Best Practices

1. **Test Data**: Use consistent test data across tests
2. **Selectors**: Prefer `data-testid` over CSS selectors
3. **Assertions**: Use descriptive assertion messages
4. **Error Handling**: Always capture and report errors
5. **Performance**: Monitor test execution time
6. **Accessibility**: Include accessibility testing
7. **Mobile**: Test on multiple device sizes
8. **Browsers**: Test across different browsers

## 🤝 Contributing

### Adding New Tests
1. Create test file in appropriate directory
2. Follow existing test structure
3. Include error handling and reporting
4. Add accessibility and performance tests
5. Update this README

### Test Naming Convention
- Test files: `{page-name}.spec.ts`
- Test descriptions: Clear, action-oriented descriptions
- Test groups: Logical grouping of related tests

### Error Reporting
- Always use `ErrorCollector` for error tracking
- Include screenshots for visual failures
- Provide detailed error context
- Suggest solutions when possible

## 📞 Support

For questions or issues with the testing suite:
1. Check the error reports in `test-results/`
2. Review the Playwright documentation
3. Check browser console for additional errors
4. Verify test environment setup

---

**Happy Testing! 🧪✨**

