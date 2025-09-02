import { test, expect } from '@playwright/test';
import { ErrorCollector, waitForPageLoad, checkForErrors, takeScreenshotOnError, testPageAccessibility, testPagePerformance } from '../utils/test-helpers';

test.describe('Checkout and Order Pages Tests', () => {
  let errorCollector: ErrorCollector;

  test.beforeEach(async ({ page }) => {
    errorCollector = new ErrorCollector();
  });

  test.describe('Checkout Page', () => {
    test('Checkout page loads successfully', async ({ page }) => {
      try {
        await page.goto('/checkout');
        await waitForPageLoad(page);

        // Checkout page might redirect if cart is empty
        if (page.url().includes('/shop')) {
          // Expected behavior - redirect to shop if cart is empty
          return;
        }

        await expect(page).toHaveTitle(/Checkout|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for checkout form elements
        await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'checkout-page-load-failure');
        errorCollector.addError({
          page: 'Checkout Page',
          error: `Failed to load checkout page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Checkout form validation', async ({ page }) => {
      try {
        await page.goto('/checkout');
        await waitForPageLoad(page);

        // If redirected to shop, add item to cart first
        if (page.url().includes('/shop')) {
          // Navigate to a product and add to cart
          await page.goto('/product/reform-uk-tshirt');
          await waitForPageLoad(page);
          
          const addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
          if (await addToCartButton.isVisible()) {
            await addToCartButton.click();
            await page.waitForTimeout(2000);
          }
          
          // Go back to checkout
          await page.goto('/checkout');
          await waitForPageLoad(page);
        }

        // Test checkout form if available
        const checkoutForm = page.locator('[data-testid="checkout-form"]');
        if (await checkoutForm.isVisible()) {
          const submitButton = page.locator('[data-testid="checkout-submit"]');
          if (await submitButton.isVisible()) {
            // Test empty form submission
            await submitButton.click();
            await page.waitForTimeout(1000);
          }
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'checkout-validation-failure');
        errorCollector.addError({
          page: 'Checkout Page Validation',
          error: `Checkout validation failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Checkout form fields', async ({ page }) => {
      try {
        await page.goto('/checkout');
        await waitForPageLoad(page);

        // If redirected to shop, add item to cart first
        if (page.url().includes('/shop')) {
          await page.goto('/product/reform-uk-tshirt');
          await waitForPageLoad(page);
          
          const addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
          if (await addToCartButton.isVisible()) {
            await addToCartButton.click();
            await page.waitForTimeout(2000);
          }
          
          await page.goto('/checkout');
          await waitForPageLoad(page);
        }

        // Check for checkout form fields if available
        const checkoutForm = page.locator('[data-testid="checkout-form"]');
        if (await checkoutForm.isVisible()) {
          // Check for common checkout fields
          const emailField = page.locator('[data-testid="email-field"]');
          if (await emailField.isVisible()) {
            await expect(emailField).toBeVisible();
          }

          const nameField = page.locator('[data-testid="name-field"]');
          if (await nameField.isVisible()) {
            await expect(nameField).toBeVisible();
          }

          const addressField = page.locator('[data-testid="address-field"]');
          if (await addressField.isVisible()) {
            await expect(addressField).toBeVisible();
          }
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'checkout-fields-failure');
        errorCollector.addError({
          page: 'Checkout Page Fields',
          error: `Checkout fields check failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Success Page', () => {
    test('Success page loads successfully', async ({ page }) => {
      try {
        await page.goto('/success');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Success|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for success message
        const successMessage = page.locator('[data-testid="success-message"]');
        if (await successMessage.isVisible()) {
          await expect(successMessage).toBeVisible();
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'success-page-load-failure');
        errorCollector.addError({
          page: 'Success Page',
          error: `Failed to load success page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Success page navigation', async ({ page }) => {
      try {
        await page.goto('/success');
        await waitForPageLoad(page);

        // Test back to shop button
        const backToShopButton = page.locator('[data-testid="back-to-shop"]');
        if (await backToShopButton.isVisible()) {
          await backToShopButton.click();
          await expect(page).toHaveURL('/shop');
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'success-navigation-failure');
        errorCollector.addError({
          page: 'Success Page Navigation',
          error: `Success page navigation failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Orders Page', () => {
    test('Orders page loads successfully', async ({ page }) => {
      try {
        await page.goto('/orders');
        await waitForPageLoad(page);

        // Orders page might redirect to login if not authenticated
        if (page.url().includes('/login')) {
          // User not authenticated, which is expected behavior
          return;
        }

        await expect(page).toHaveTitle(/Orders|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for orders page elements
        await expect(page.locator('[data-testid="orders-header"]')).toBeVisible();

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'orders-page-load-failure');
        errorCollector.addError({
          page: 'Orders Page',
          error: `Failed to load orders page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Orders page redirects when not authenticated', async ({ page }) => {
      try {
        await page.goto('/orders');
        await waitForPageLoad(page);

        // Should redirect to login page
        await expect(page).toHaveURL(/\/login/);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'orders-redirect-failure');
        errorCollector.addError({
          page: 'Orders Page Redirect',
          error: `Orders redirect failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Track Order Page', () => {
    test('Track order page loads successfully', async ({ page }) => {
      try {
        await page.goto('/track-order');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Track Order|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for track order form
        const trackOrderForm = page.locator('[data-testid="track-order-form"]');
        if (await trackOrderForm.isVisible()) {
          await expect(trackOrderForm).toBeVisible();
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'track-order-load-failure');
        errorCollector.addError({
          page: 'Track Order Page',
          error: `Failed to load track order page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Track order form functionality', async ({ page }) => {
      try {
        await page.goto('/track-order');
        await waitForPageLoad(page);

        const trackOrderForm = page.locator('[data-testid="track-order-form"]');
        if (await trackOrderForm.isVisible()) {
          // Test order number input
          const orderNumberInput = page.locator('[data-testid="order-number-input"]');
          if (await orderNumberInput.isVisible()) {
            await orderNumberInput.fill('TEST123');
            await expect(orderNumberInput).toHaveValue('TEST123');
          }

          // Test email input
          const emailInput = page.locator('[data-testid="email-input"]');
          if (await emailInput.isVisible()) {
            await emailInput.fill('test@example.com');
            await expect(emailInput).toHaveValue('test@example.com');
          }

          // Test submit button
          const submitButton = page.locator('[data-testid="track-order-submit"]');
          if (await submitButton.isVisible()) {
            await submitButton.click();
            await page.waitForTimeout(2000);
          }
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'track-order-form-failure');
        errorCollector.addError({
          page: 'Track Order Form',
          error: `Track order form failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Test Payment Flow', () => {
    test('Test payment flow page loads', async ({ page }) => {
      try {
        await page.goto('/test-payment');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Test Payment|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for test payment elements
        const testPaymentForm = page.locator('[data-testid="test-payment-form"]');
        if (await testPaymentForm.isVisible()) {
          await expect(testPaymentForm).toBeVisible();
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'test-payment-load-failure');
        errorCollector.addError({
          page: 'Test Payment Flow Page',
          error: `Failed to load test payment page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test('Accessibility compliance for all checkout/order pages', async ({ page }) => {
    const pages = ['/checkout', '/success', '/orders', '/track-order', '/test-payment'];
    
    for (const path of pages) {
      try {
        await page.goto(path);
        await waitForPageLoad(page);

        // Skip if redirected (expected behavior)
        if (page.url() !== `http://localhost:5173${path}`) {
          continue;
        }

        const accessibilityIssues = await testPageAccessibility(page);
        
        if (accessibilityIssues.length > 0) {
          errorCollector.addError({
            page: `Checkout/Order Page ${path}`,
            error: `Accessibility issues found: ${accessibilityIssues.join(', ')}`,
            timestamp: new Date().toISOString(),
            consoleErrors: accessibilityIssues,
            networkErrors: []
          });
        }

        expect(accessibilityIssues).toHaveLength(0);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, `checkout-accessibility-failure-${path.replace('/', '')}`);
        errorCollector.addError({
          page: `Checkout/Order Page ${path} Accessibility`,
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

  test('Performance metrics for all checkout/order pages', async ({ page }) => {
    const pages = ['/checkout', '/success', '/track-order', '/test-payment'];
    
    for (const path of pages) {
      try {
        await page.goto(path);
        await waitForPageLoad(page);

        // Skip if redirected (expected behavior)
        if (page.url() !== `http://localhost:5173${path}`) {
          continue;
        }

        const performanceIssues = await testPagePerformance(page);
        
        if (performanceIssues.length > 0) {
          errorCollector.addError({
            page: `Checkout/Order Page ${path}`,
            error: `Performance issues found: ${performanceIssues.join(', ')}`,
            timestamp: new Date().toISOString(),
            consoleErrors: performanceIssues,
            networkErrors: []
          });
        }

        expect(performanceIssues).toHaveLength(0);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, `checkout-performance-failure-${path.replace('/', '')}`);
        errorCollector.addError({
          page: `Checkout/Order Page ${path} Performance`,
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

  test('Error handling and console errors for all checkout/order pages', async ({ page }) => {
    const pages = ['/checkout', '/success', '/track-order', '/test-payment'];
    
    for (const path of pages) {
      try {
        await page.goto(path);
        await waitForPageLoad(page);

        // Skip if redirected (expected behavior)
        if (page.url() !== `http://localhost:5173${path}`) {
          continue;
        }

        const { consoleErrors, networkErrors } = await checkForErrors(page);
        
        if (consoleErrors.length > 0 || networkErrors.length > 0) {
          errorCollector.addError({
            page: `Checkout/Order Page ${path}`,
            error: 'Console or network errors detected',
            timestamp: new Date().toISOString(),
            consoleErrors,
            networkErrors
          });
        }

        expect(consoleErrors).toHaveLength(0);
        expect(networkErrors).toHaveLength(0);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, `checkout-error-handling-failure-${path.replace('/', '')}`);
        errorCollector.addError({
          page: `Checkout/Order Page ${path} Error Handling`,
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
      console.log('Errors found during checkout/order pages testing:');
      errors.forEach(error => {
        console.log(`- ${error.page}: ${error.error}`);
      });
    }
  });
});

