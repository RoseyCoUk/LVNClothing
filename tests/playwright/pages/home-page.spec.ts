import { test, expect } from '@playwright/test';
import { ErrorCollector, waitForPageLoad, checkForErrors, takeScreenshotOnError, testPageAccessibility, testPagePerformance } from '../utils/test-helpers';

test.describe('Home Page Tests', () => {
  let errorCollector: ErrorCollector;

  test.beforeEach(async ({ page }) => {
    errorCollector = new ErrorCollector();
  });

  test('Home page loads successfully', async ({ page }) => {
    try {
      await page.goto('/');
      await waitForPageLoad(page);

      // Check if page loaded
      await expect(page).toHaveTitle(/Reform UK/);
      await expect(page.locator('main')).toBeVisible();

      // Check for key components
      await expect(page.locator('[data-testid="hero"]')).toBeVisible();
      await expect(page.locator('[data-testid="top-sellers"]')).toBeVisible();
      await expect(page.locator('[data-testid="movement-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-bundles"]')).toBeVisible();
      await expect(page.locator('[data-testid="testimonials"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-signup"]')).toBeVisible();

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'home-page-load-failure');
      errorCollector.addError({
        page: 'Home Page',
        error: `Failed to load home page: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Navigation works correctly', async ({ page }) => {
    try {
      await page.goto('/');
      await waitForPageLoad(page);

      // Test navigation to shop
      await page.click('[data-testid="shop-nav"]');
      await expect(page).toHaveURL('/shop');

      // Test navigation to about
      await page.goto('/');
      await page.click('[data-testid="about-nav"]');
      await expect(page).toHaveURL('/about');

      // Test navigation to contact
      await page.goto('/');
      await page.click('[data-testid="contact-nav"]');
      await expect(page).toHaveURL('/contact');

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'home-navigation-failure');
      errorCollector.addError({
        page: 'Home Page Navigation',
        error: `Navigation failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Hero section functionality', async ({ page }) => {
    try {
      await page.goto('/');
      await waitForPageLoad(page);

      // Check hero section content
      const hero = page.locator('[data-testid="hero"]');
      await expect(hero).toBeVisible();

      // Test shop button in hero
      const shopButton = hero.locator('[data-testid="shop-button"]');
      await expect(shopButton).toBeVisible();
      await shopButton.click();
      await expect(page).toHaveURL('/shop');

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'hero-section-failure');
      errorCollector.addError({
        page: 'Home Page Hero Section',
        error: `Hero section failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Top sellers section', async ({ page }) => {
    try {
      await page.goto('/');
      await waitForPageLoad(page);

      const topSellers = page.locator('[data-testid="top-sellers"]');
      await expect(topSellers).toBeVisible();

      // Check if products are displayed
      const products = topSellers.locator('[data-testid="product-card"]');
      await expect(products.first()).toBeVisible();

      // Test view all button
      const viewAllButton = topSellers.locator('[data-testid="view-all-button"]');
      if (await viewAllButton.isVisible()) {
        await viewAllButton.click();
        await expect(page).toHaveURL('/shop');
      }

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'top-sellers-failure');
      errorCollector.addError({
        page: 'Home Page Top Sellers',
        error: `Top sellers section failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Product bundles section', async ({ page }) => {
    try {
      await page.goto('/');
      await waitForPageLoad(page);

      const bundles = page.locator('[data-testid="product-bundles"]');
      await expect(bundles).toBeVisible();

      // Check if bundle cards are displayed
      const bundleCards = bundles.locator('[data-testid="bundle-card"]');
      await expect(bundleCards.first()).toBeVisible();

      // Test bundle navigation
      const firstBundle = bundleCards.first();
      const bundleLink = firstBundle.locator('a');
      if (await bundleLink.isVisible()) {
        await bundleLink.click();
        await expect(page.url()).toContain('/product/');
      }

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'product-bundles-failure');
      errorCollector.addError({
        page: 'Home Page Product Bundles',
        error: `Product bundles section failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Email signup functionality', async ({ page }) => {
    try {
      await page.goto('/');
      await waitForPageLoad(page);

      const emailSignup = page.locator('[data-testid="email-signup"]');
      await expect(emailSignup).toBeVisible();

      // Test email input
      const emailInput = emailSignup.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();

      // Test submit button
      const submitButton = emailSignup.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();

      // Test with valid email
      await emailInput.fill('test@example.com');
      await submitButton.click();

      // Wait for response (success or error message)
      await page.waitForTimeout(2000);

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'email-signup-failure');
      errorCollector.addError({
        page: 'Home Page Email Signup',
        error: `Email signup failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Accessibility compliance', async ({ page }) => {
    try {
      await page.goto('/');
      await waitForPageLoad(page);

      const accessibilityIssues = await testPageAccessibility(page);
      
      if (accessibilityIssues.length > 0) {
        errorCollector.addError({
          page: 'Home Page Accessibility',
          error: `Accessibility issues found: ${accessibilityIssues.join(', ')}`,
          timestamp: new Date().toISOString(),
          consoleErrors: accessibilityIssues,
          networkErrors: []
        });
      }

      expect(accessibilityIssues).toHaveLength(0);

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'accessibility-failure');
      errorCollector.addError({
        page: 'Home Page Accessibility',
        error: `Accessibility test failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Performance metrics', async ({ page }) => {
    try {
      await page.goto('/');
      await waitForPageLoad(page);

      const performanceIssues = await testPagePerformance(page);
      
      if (performanceIssues.length > 0) {
        errorCollector.addError({
          page: 'Home Page Performance',
          error: `Performance issues found: ${performanceIssues.join(', ')}`,
          timestamp: new Date().toISOString(),
          consoleErrors: performanceIssues,
          networkErrors: []
        });
      }

      expect(performanceIssues).toHaveLength(0);

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'performance-failure');
      errorCollector.addError({
        page: 'Home Page Performance',
        error: `Performance test failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Error handling and console errors', async ({ page }) => {
    try {
      await page.goto('/');
      await waitForPageLoad(page);

      const { consoleErrors, networkErrors } = await checkForErrors(page);
      
      if (consoleErrors.length > 0 || networkErrors.length > 0) {
        errorCollector.addError({
          page: 'Home Page Error Handling',
          error: 'Console or network errors detected',
          timestamp: new Date().toISOString(),
          consoleErrors,
          networkErrors
        });
      }

      expect(consoleErrors).toHaveLength(0);
      expect(networkErrors).toHaveLength(0);

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'error-handling-failure');
      errorCollector.addError({
        page: 'Home Page Error Handling',
        error: `Error handling test failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test.afterEach(async () => {
    // Log any collected errors
    const errors = errorCollector.getErrors();
    if (errors.length > 0) {
      console.log('Errors found during home page testing:');
      errors.forEach(error => {
        console.log(`- ${error.page}: ${error.error}`);
      });
    }
  });
});

