import { test, expect } from '@playwright/test';
import { ErrorCollector, waitForPageLoad, checkForErrors, takeScreenshotOnError, testPageAccessibility, testPagePerformance } from '../utils/test-helpers';

test.describe('Product Detail Pages Tests', () => {
  let errorCollector: ErrorCollector;

  test.beforeEach(async ({ page }) => {
    errorCollector = new ErrorCollector();
  });

  test.describe('T-Shirt Product Page', () => {
    test('T-shirt product page loads successfully', async ({ page }) => {
      try {
        await page.goto('/product/reform-uk-tshirt');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/T-shirt|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for product elements
        await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
        await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
        await expect(page.locator('[data-testid="product-description"]')).toBeVisible();

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'tshirt-page-load-failure');
        errorCollector.addError({
          page: 'T-Shirt Product Page',
          error: `Failed to load t-shirt page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('T-shirt variant selection', async ({ page }) => {
      try {
        await page.goto('/product/reform-uk-tshirt');
        await waitForPageLoad(page);

        // Test size selection
        const sizeSelector = page.locator('[data-testid="size-selector"]');
        if (await sizeSelector.isVisible()) {
          const sizeOptions = sizeSelector.locator('[data-testid="size-option"]');
          await expect(sizeOptions.first()).toBeVisible();
          
          // Select first available size
          await sizeOptions.first().click();
          await page.waitForTimeout(1000);
        }

        // Test color selection if available
        const colorSelector = page.locator('[data-testid="color-selector"]');
        if (await colorSelector.isVisible()) {
          const colorOptions = colorSelector.locator('[data-testid="color-option"]');
          await expect(colorOptions.first()).toBeVisible();
          
          // Select first available color
          await colorOptions.first().click();
          await page.waitForTimeout(1000);
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'tshirt-variant-selection-failure');
        errorCollector.addError({
          page: 'T-Shirt Variant Selection',
          error: `T-shirt variant selection failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('T-shirt add to cart functionality', async ({ page }) => {
      try {
        await page.goto('/product/reform-uk-tshirt');
        await waitForPageLoad(page);

        const addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
        if (await addToCartButton.isVisible()) {
          await addToCartButton.click();
          await page.waitForTimeout(2000);

          // Check if cart notification appears
          const cartNotification = page.locator('[data-testid="cart-notification"]');
          if (await cartNotification.isVisible()) {
            await expect(cartNotification).toBeVisible();
          }
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'tshirt-add-to-cart-failure');
        errorCollector.addError({
          page: 'T-Shirt Add to Cart',
          error: `T-shirt add to cart failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Hoodie Product Page', () => {
    test('Hoodie product page loads successfully', async ({ page }) => {
      try {
        await page.goto('/product/reform-uk-hoodie');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Hoodie|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for product elements
        await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
        await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
        await expect(page.locator('[data-testid="product-description"]')).toBeVisible();

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'hoodie-page-load-failure');
        errorCollector.addError({
          page: 'Hoodie Product Page',
          error: `Failed to load hoodie page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Hoodie variant selection', async ({ page }) => {
      try {
        await page.goto('/product/reform-uk-hoodie');
        await waitForPageLoad(page);

        // Test size selection
        const sizeSelector = page.locator('[data-testid="size-selector"]');
        if (await sizeSelector.isVisible()) {
          const sizeOptions = sizeSelector.locator('[data-testid="size-option"]');
          await expect(sizeOptions.first()).toBeVisible();
          
          // Select first available size
          await sizeOptions.first().click();
          await page.waitForTimeout(1000);
        }

        // Test color selection if available
        const colorSelector = page.locator('[data-testid="color-selector"]');
        if (await colorSelector.isVisible()) {
          const colorOptions = colorSelector.locator('[data-testid="color-option"]');
          await expect(colorOptions.first()).toBeVisible();
          
          // Select first available color
          await colorOptions.first().click();
          await page.waitForTimeout(1000);
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'hoodie-variant-selection-failure');
        errorCollector.addError({
          page: 'Hoodie Variant Selection',
          error: `Hoodie variant selection failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Bundle Product Pages', () => {
    test('Starter bundle page loads successfully', async ({ page }) => {
      try {
        await page.goto('/product/starter-bundle');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Starter Bundle|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for bundle elements
        await expect(page.locator('[data-testid="bundle-title"]')).toBeVisible();
        await expect(page.locator('[data-testid="bundle-price"]')).toBeVisible();
        await expect(page.locator('[data-testid="bundle-description"]')).toBeVisible();

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'starter-bundle-load-failure');
        errorCollector.addError({
          page: 'Starter Bundle Page',
          error: `Failed to load starter bundle page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Champion bundle page loads successfully', async ({ page }) => {
      try {
        await page.goto('/product/champion-bundle');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Champion Bundle|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for bundle elements
        await expect(page.locator('[data-testid="bundle-title"]')).toBeVisible();
        await expect(page.locator('[data-testid="bundle-price"]')).toBeVisible();
        await expect(page.locator('[data-testid="bundle-description"]')).toBeVisible();

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'champion-bundle-load-failure');
        errorCollector.addError({
          page: 'Champion Bundle Page',
          error: `Failed to load champion bundle page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Activist bundle page loads successfully', async ({ page }) => {
      try {
        await page.goto('/product/activist-bundle');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Activist Bundle|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for bundle elements
        await expect(page.locator('[data-testid="bundle-title"]')).toBeVisible();
        await expect(page.locator('[data-testid="bundle-price"]')).toBeVisible();
        await expect(page.locator('[data-testid="bundle-description"]')).toBeVisible();

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'activist-bundle-load-failure');
        errorCollector.addError({
          page: 'Activist Bundle Page',
          error: `Failed to load activist bundle page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Other Product Pages', () => {
    const otherProducts = [
      { path: '/product/reform-uk-cap', name: 'Cap' },
      { path: '/product/reform-uk-tote-bag', name: 'Tote Bag' },
      { path: '/product/reform-uk-water-bottle', name: 'Water Bottle' },
      { path: '/product/reform-uk-mug', name: 'Mug' },
      { path: '/product/reform-uk-mouse-pad', name: 'Mouse Pad' }
    ];

    for (const product of otherProducts) {
      test(`${product.name} product page loads successfully`, async ({ page }) => {
        try {
          await page.goto(product.path);
          await waitForPageLoad(page);

          await expect(page).toHaveTitle(/Reform UK/);
          await expect(page.locator('main')).toBeVisible();

          // Check for basic product elements
          await expect(page.locator('[data-testid="product-title"], [data-testid="bundle-title"]')).toBeVisible();

        } catch (error) {
          const screenshot = await takeScreenshotOnError(page, `${product.name.toLowerCase().replace(' ', '-')}-load-failure`);
          errorCollector.addError({
            page: `${product.name} Product Page`,
            error: `Failed to load ${product.name.toLowerCase()} page: ${error}`,
            timestamp: new Date().toISOString(),
            screenshot,
            consoleErrors: [],
            networkErrors: []
          });
          throw error;
        }
      });
    }
  });

  test('Product page navigation and back button', async ({ page }) => {
    try {
      await page.goto('/product/reform-uk-tshirt');
      await waitForPageLoad(page);

      const backButton = page.locator('[data-testid="back-button"]');
      if (await backButton.isVisible()) {
        await backButton.click();
        await expect(page).toHaveURL('/shop');
      }

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'product-navigation-failure');
      errorCollector.addError({
        page: 'Product Page Navigation',
        error: `Product navigation failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Product image gallery functionality', async ({ page }) => {
    try {
      await page.goto('/product/reform-uk-tshirt');
      await waitForPageLoad(page);

      const imageGallery = page.locator('[data-testid="image-gallery"]');
      if (await imageGallery.isVisible()) {
        // Check if main image is displayed
        const mainImage = imageGallery.locator('[data-testid="main-image"]');
        await expect(mainImage).toBeVisible();

        // Test thumbnail navigation if available
        const thumbnails = imageGallery.locator('[data-testid="thumbnail"]');
        if (await thumbnails.first().isVisible()) {
          await thumbnails.first().click();
          await page.waitForTimeout(1000);
        }
      }

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'image-gallery-failure');
      errorCollector.addError({
        page: 'Product Image Gallery',
        error: `Image gallery failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Product quantity selection', async ({ page }) => {
    try {
      await page.goto('/product/reform-uk-tshirt');
      await waitForPageLoad(page);

      const quantitySelector = page.locator('[data-testid="quantity-selector"]');
      if (await quantitySelector.isVisible()) {
        // Test increase quantity
        const increaseButton = quantitySelector.locator('[data-testid="increase-quantity"]');
        if (await increaseButton.isVisible()) {
          await increaseButton.click();
          await page.waitForTimeout(500);
        }

        // Test decrease quantity
        const decreaseButton = quantitySelector.locator('[data-testid="decrease-quantity"]');
        if (await decreaseButton.isVisible()) {
          await decreaseButton.click();
          await page.waitForTimeout(500);
        }
      }

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'quantity-selection-failure');
      errorCollector.addError({
        page: 'Product Quantity Selection',
        error: `Quantity selection failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Accessibility compliance for all product pages', async ({ page }) => {
    const productPages = [
      '/product/reform-uk-tshirt',
      '/product/reform-uk-hoodie',
      '/product/reform-uk-cap',
      '/product/starter-bundle',
      '/product/champion-bundle'
    ];
    
    for (const path of productPages) {
      try {
        await page.goto(path);
        await waitForPageLoad(page);

        const accessibilityIssues = await testPageAccessibility(page);
        
        if (accessibilityIssues.length > 0) {
          errorCollector.addError({
            page: `Product Page ${path}`,
            error: `Accessibility issues found: ${accessibilityIssues.join(', ')}`,
            timestamp: new Date().toISOString(),
            consoleErrors: accessibilityIssues,
            networkErrors: []
          });
        }

        expect(accessibilityIssues).toHaveLength(0);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, `product-accessibility-failure-${path.split('/').pop()}`);
        errorCollector.addError({
          page: `Product Page ${path} Accessibility`,
          error: `Accessibility test failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    }
  });

  test('Performance metrics for all product pages', async ({ page }) => {
    const productPages = [
      '/product/reform-uk-tshirt',
      '/product/reform-uk-hoodie',
      '/product/starter-bundle'
    ];
    
    for (const path of productPages) {
      try {
        await page.goto(path);
        await waitForPageLoad(page);

        const performanceIssues = await testPagePerformance(page);
        
        if (performanceIssues.length > 0) {
          errorCollector.addError({
            page: `Product Page ${path}`,
            error: `Performance issues found: ${performanceIssues.join(', ')}`,
            timestamp: new Date().toISOString(),
            consoleErrors: performanceIssues,
            networkErrors: []
          });
        }

        expect(performanceIssues).toHaveLength(0);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, `product-performance-failure-${path.split('/').pop()}`);
        errorCollector.addError({
          page: `Product Page ${path} Performance`,
          error: `Performance test failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    }
  });

  test('Error handling and console errors for all product pages', async ({ page }) => {
    const productPages = [
      '/product/reform-uk-tshirt',
      '/product/reform-uk-hoodie',
      '/product/starter-bundle'
    ];
    
    for (const path of productPages) {
      try {
        await page.goto(path);
        await waitForPageLoad(page);

        const { consoleErrors, networkErrors } = await checkForErrors(page);
        
        if (consoleErrors.length > 0 || networkErrors.length > 0) {
          errorCollector.addError({
            page: `Product Page ${path}`,
            error: 'Console or network errors detected',
            timestamp: new Date().toISOString(),
            consoleErrors,
            networkErrors
          });
        }

        expect(consoleErrors).toHaveLength(0);
        expect(networkErrors).toHaveLength(0);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, `product-error-handling-failure-${path.split('/').pop()}`);
        errorCollector.addError({
          page: `Product Page ${path} Error Handling`,
          error: `Error handling test failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    }
  });

  test.afterEach(async () => {
    // Log any collected errors
    const errors = errorCollector.getErrors();
    if (errors.length > 0) {
      console.log('Errors found during product pages testing:');
      errors.forEach(error => {
        console.log(`- ${error.page}: ${error.error}`);
      });
    }
  });
});

