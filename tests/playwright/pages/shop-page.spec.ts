import { test, expect } from '@playwright/test';
import { ErrorCollector, waitForPageLoad, checkForErrors, takeScreenshotOnError, testPageAccessibility, testPagePerformance } from '../utils/test-helpers';

test.describe('Shop Page Tests', () => {
  let errorCollector: ErrorCollector;

  test.beforeEach(async ({ page }) => {
    errorCollector = new ErrorCollector();
  });

  test('Shop page loads successfully', async ({ page }) => {
    try {
      await page.goto('/shop');
      await waitForPageLoad(page);

      // Check if page loaded
      await expect(page).toHaveTitle(/Shop|Reform UK/);
      await expect(page.locator('main')).toBeVisible();

      // Check for key components
      await expect(page.locator('[data-testid="shop-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'shop-page-load-failure');
      errorCollector.addError({
        page: 'Shop Page',
        error: `Failed to load shop page: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Product grid displays products', async ({ page }) => {
    try {
      await page.goto('/shop');
      await waitForPageLoad(page);

      const productGrid = page.locator('[data-testid="product-grid"]');
      await expect(productGrid).toBeVisible();

      // Check if products are displayed
      const products = productGrid.locator('[data-testid="product-card"]');
      await expect(products.first()).toBeVisible();

      // Check product information
      const firstProduct = products.first();
      await expect(firstProduct.locator('[data-testid="product-name"]')).toBeVisible();
      await expect(firstProduct.locator('[data-testid="product-price"]')).toBeVisible();

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'product-grid-failure');
      errorCollector.addError({
        page: 'Shop Page Product Grid',
        error: `Product grid failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Product filtering and sorting', async ({ page }) => {
    try {
      await page.goto('/shop');
      await waitForPageLoad(page);

      // Test category filtering if available
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();
        await page.waitForTimeout(1000);
      }

      // Test sorting if available
      const sortDropdown = page.locator('[data-testid="sort-dropdown"]');
      if (await sortDropdown.isVisible()) {
        await sortDropdown.click();
        await page.waitForTimeout(1000);
      }

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'filtering-sorting-failure');
      errorCollector.addError({
        page: 'Shop Page Filtering/Sorting',
        error: `Filtering/sorting failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Product search functionality', async ({ page }) => {
    try {
      await page.goto('/shop');
      await waitForPageLoad(page);

      const searchInput = page.locator('[data-testid="search-input"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('tshirt');
        await searchInput.press('Enter');
        await page.waitForTimeout(2000);

        // Check if search results are displayed
        const searchResults = page.locator('[data-testid="search-results"]');
        if (await searchResults.isVisible()) {
          await expect(searchResults).toBeVisible();
        }
      }

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'search-failure');
      errorCollector.addError({
        page: 'Shop Page Search',
        error: `Search functionality failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Product card interactions', async ({ page }) => {
    try {
      await page.goto('/shop');
      await waitForPageLoad(page);

      const firstProduct = page.locator('[data-testid="product-card"]').first();
      await expect(firstProduct).toBeVisible();

      // Test add to cart button
      const addToCartButton = firstProduct.locator('[data-testid="add-to-cart"]');
      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();
        await page.waitForTimeout(1000);
      }

      // Test quick view if available
      const quickViewButton = firstProduct.locator('[data-testid="quick-view"]');
      if (await quickViewButton.isVisible()) {
        await quickViewButton.click();
        await page.waitForTimeout(1000);
      }

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'product-card-interactions-failure');
      errorCollector.addError({
        page: 'Shop Page Product Interactions',
        error: `Product card interactions failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Product navigation to detail page', async ({ page }) => {
    try {
      await page.goto('/shop');
      await waitForPageLoad(page);

      const firstProduct = page.locator('[data-testid="product-card"]').first();
      await expect(firstProduct).toBeVisible();

      // Click on product to navigate to detail page
      const productLink = firstProduct.locator('a');
      if (await productLink.isVisible()) {
        await productLink.click();
        await page.waitForURL(/\/product\//);
        await expect(page.url()).toContain('/product/');
      }

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'product-navigation-failure');
      errorCollector.addError({
        page: 'Shop Page Product Navigation',
        error: `Product navigation failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Pagination if available', async ({ page }) => {
    try {
      await page.goto('/shop');
      await waitForPageLoad(page);

      const pagination = page.locator('[data-testid="pagination"]');
      if (await pagination.isVisible()) {
        // Test next page button
        const nextButton = pagination.locator('[data-testid="next-page"]');
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(2000);
        }

        // Test previous page button
        const prevButton = pagination.locator('[data-testid="prev-page"]');
        if (await prevButton.isVisible()) {
          await prevButton.click();
          await page.waitForTimeout(2000);
        }
      }

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'pagination-failure');
      errorCollector.addError({
        page: 'Shop Page Pagination',
        error: `Pagination failed: ${error}`,
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
      await page.goto('/shop');
      await waitForPageLoad(page);

      const accessibilityIssues = await testPageAccessibility(page);
      
      if (accessibilityIssues.length > 0) {
        errorCollector.addError({
          page: 'Shop Page Accessibility',
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
        page: 'Shop Page Accessibility',
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
      await page.goto('/shop');
      await waitForPageLoad(page);

      const performanceIssues = await testPagePerformance(page);
      
      if (performanceIssues.length > 0) {
        errorCollector.addError({
          page: 'Shop Page Performance',
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
        page: 'Shop Page Performance',
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
      await page.goto('/shop');
      await waitForPageLoad(page);

      const { consoleErrors, networkErrors } = await checkForErrors(page);
      
      if (consoleErrors.length > 0 || networkErrors.length > 0) {
        errorCollector.addError({
          page: 'Shop Page Error Handling',
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
        page: 'Shop Page Error Handling',
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
      console.log('Errors found during shop page testing:');
      errors.forEach(error => {
        console.log(`- ${error.page}: ${error.error}`);
      });
    }
  });
});

