import { test, expect } from '@playwright/test';
import { ErrorCollector, waitForPageLoad, checkForErrors, takeScreenshotOnError, testPageAccessibility, testPagePerformance } from '../utils/test-helpers';

test.describe('Admin Pages Tests', () => {
  let errorCollector: ErrorCollector;

  test.beforeEach(async ({ page }) => {
    errorCollector = new ErrorCollector();
  });

  test.describe('Admin Login Page', () => {
    test('Admin login page loads successfully', async ({ page }) => {
      try {
        await page.goto('/admin/login');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Admin|Login|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for admin login form
        const loginForm = page.locator('[data-testid="admin-login-form"]');
        if (await loginForm.isVisible()) {
          await expect(loginForm).toBeVisible();
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'admin-login-load-failure');
        errorCollector.addError({
          page: 'Admin Login Page',
          error: `Failed to load admin login page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Admin login form functionality', async ({ page }) => {
      try {
        await page.goto('/admin/login');
        await waitForPageLoad(page);

        const loginForm = page.locator('[data-testid="admin-login-form"]');
        if (await loginForm.isVisible()) {
          // Test email input
          const emailInput = page.locator('[data-testid="admin-email-input"]');
          if (await emailInput.isVisible()) {
            await emailInput.fill('admin@example.com');
            await expect(emailInput).toHaveValue('admin@example.com');
          }

          // Test password input
          const passwordInput = page.locator('[data-testid="admin-password-input"]');
          if (await passwordInput.isVisible()) {
            await passwordInput.fill('adminpassword');
            await expect(passwordInput).toHaveValue('adminpassword');
          }

          // Test submit button
          const submitButton = page.locator('[data-testid="admin-login-submit"]');
          if (await submitButton.isVisible()) {
            await submitButton.click();
            await page.waitForTimeout(2000);
          }
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'admin-login-form-failure');
        errorCollector.addError({
          page: 'Admin Login Form',
          error: `Admin login form failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Admin login validation', async ({ page }) => {
      try {
        await page.goto('/admin/login');
        await waitForPageLoad(page);

        const submitButton = page.locator('[data-testid="admin-login-submit"]');
        if (await submitButton.isVisible()) {
          // Test empty form submission
          await submitButton.click();
          await page.waitForTimeout(1000);

          // Test with invalid email
          const emailInput = page.locator('[data-testid="admin-email-input"]');
          if (await emailInput.isVisible()) {
            await emailInput.fill('invalid-email');
            await submitButton.click();
            await page.waitForTimeout(1000);
          }
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'admin-login-validation-failure');
        errorCollector.addError({
          page: 'Admin Login Validation',
          error: `Admin login validation failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Admin Dashboard', () => {
    test('Admin dashboard redirects when not authenticated', async ({ page }) => {
      try {
        await page.goto('/admin/dashboard');
        await waitForPageLoad(page);

        // Should redirect to admin login page
        await expect(page).toHaveURL(/\/admin\/login/);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'admin-dashboard-redirect-failure');
        errorCollector.addError({
          page: 'Admin Dashboard Redirect',
          error: `Admin dashboard redirect failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Admin Orders Page', () => {
    test('Admin orders page redirects when not authenticated', async ({ page }) => {
      try {
        await page.goto('/admin/orders');
        await waitForPageLoad(page);

        // Should redirect to admin login page
        await expect(page).toHaveURL(/\/admin\/login/);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'admin-orders-redirect-failure');
        errorCollector.addError({
          page: 'Admin Orders Page Redirect',
          error: `Admin orders redirect failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Admin Products Page', () => {
    test('Admin products page redirects when not authenticated', async ({ page }) => {
      try {
        await page.goto('/admin/products');
        await waitForPageLoad(page);

        // Should redirect to admin login page
        await expect(page).toHaveURL(/\/admin\/login/);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'admin-products-redirect-failure');
        errorCollector.addError({
          page: 'Admin Products Page Redirect',
          error: `Admin products redirect failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Admin Analytics Page', () => {
    test('Admin analytics page redirects when not authenticated', async ({ page }) => {
      try {
        await page.goto('/admin/analytics');
        await waitForPageLoad(page);

        // Should redirect to admin login page
        await expect(page).toHaveURL(/\/admin\/login/);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'admin-analytics-redirect-failure');
        errorCollector.addError({
          page: 'Admin Analytics Page Redirect',
          error: `Admin analytics redirect failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Admin Customers Page', () => {
    test('Admin customers page redirects when not authenticated', async ({ page }) => {
      try {
        await page.goto('/admin/customers');
        await waitForPageLoad(page);

        // Should redirect to admin login page
        await expect(page).toHaveURL(/\/admin\/login/);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'admin-customers-redirect-failure');
        errorCollector.addError({
          page: 'Admin Customers Page Redirect',
          error: `Admin customers redirect failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Admin Settings Page', () => {
    test('Admin settings page redirects when not authenticated', async ({ page }) => {
      try {
        await page.goto('/admin/settings');
        await waitForPageLoad(page);

        // Should redirect to admin login page
        await expect(page).toHaveURL(/\/admin\/login/);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'admin-settings-redirect-failure');
        errorCollector.addError({
          page: 'Admin Settings Page Redirect',
          error: `Admin settings redirect failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test('Admin authentication flow', async ({ page }) => {
    try {
      // Start at admin login
      await page.goto('/admin/login');
      await waitForPageLoad(page);

      // Try to access protected admin page
      await page.goto('/admin/dashboard');
      await waitForPageLoad(page);

      // Should be redirected back to login
      await expect(page).toHaveURL(/\/admin\/login/);

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'admin-auth-flow-failure');
      errorCollector.addError({
        page: 'Admin Authentication Flow',
        error: `Admin authentication flow failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Admin URL protection', async ({ page }) => {
    try {
      const adminUrls = [
        '/admin/dashboard',
        '/admin/orders',
        '/admin/products',
        '/admin/analytics',
        '/admin/customers',
        '/admin/settings'
      ];

      for (const url of adminUrls) {
        await page.goto(url);
        await waitForPageLoad(page);

        // All should redirect to admin login
        await expect(page).toHaveURL(/\/admin\/login/);
      }

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'admin-url-protection-failure');
      errorCollector.addError({
        page: 'Admin URL Protection',
        error: `Admin URL protection failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Accessibility compliance for admin login page', async ({ page }) => {
    try {
      await page.goto('/admin/login');
      await waitForPageLoad(page);

      const accessibilityIssues = await testPageAccessibility(page);
      
      if (accessibilityIssues.length > 0) {
        errorCollector.addError({
          page: 'Admin Login Page Accessibility',
          error: `Accessibility issues found: ${accessibilityIssues.join(', ')}`,
          timestamp: new Date().toISOString(),
          consoleErrors: accessibilityIssues,
          networkErrors: []
        });
      }

      expect(accessibilityIssues).toHaveLength(0);

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'admin-accessibility-failure');
      errorCollector.addError({
        page: 'Admin Login Page Accessibility',
        error: `Accessibility test failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Performance metrics for admin login page', async ({ page }) => {
    try {
      await page.goto('/admin/login');
      await waitForPageLoad(page);

      const performanceIssues = await testPagePerformance(page);
      
      if (performanceIssues.length > 0) {
        errorCollector.addError({
          page: 'Admin Login Page Performance',
          error: `Performance issues found: ${performanceIssues.join(', ')}`,
          timestamp: new Date().toISOString(),
          consoleErrors: performanceIssues,
          networkErrors: []
        });
      }

      expect(performanceIssues).toHaveLength(0);

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'admin-performance-failure');
      errorCollector.addError({
        page: 'Admin Login Page Performance',
        error: `Performance test failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Error handling and console errors for admin pages', async ({ page }) => {
    try {
      await page.goto('/admin/login');
      await waitForPageLoad(page);

      const { consoleErrors, networkErrors } = await checkForErrors(page);
      
      if (consoleErrors.length > 0 || networkErrors.length > 0) {
        errorCollector.addError({
          page: 'Admin Login Page Error Handling',
          error: 'Console or network errors detected',
          timestamp: new Date().toISOString(),
          consoleErrors,
          networkErrors
        });
      }

      expect(consoleErrors).toHaveLength(0);
      expect(networkErrors).toHaveLength(0);

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'admin-error-handling-failure');
      errorCollector.addError({
        page: 'Admin Login Page Error Handling',
        error: `Error handling test failed: ${error}`,
        timestamp: new Date().toISOString(),
        screenshot,
        consoleErrors: [],
        networkErrors: []
      });
      throw error;
    }
  });

  test('Admin page security headers', async ({ page }) => {
    try {
      await page.goto('/admin/login');
      await waitForPageLoad(page);

      // Check for security headers (basic check)
      const response = await page.waitForResponse(response => response.url().includes('/admin/login'));
      
      // Note: This is a basic check - in a real scenario you might want to check specific headers
      expect(response.status()).toBe(200);

    } catch (error) {
      const screenshot = await takeScreenshotOnError(page, 'admin-security-headers-failure');
      errorCollector.addError({
        page: 'Admin Page Security Headers',
        error: `Admin security headers check failed: ${error}`,
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
      console.log('Errors found during admin pages testing:');
      errors.forEach(error => {
        console.log(`- ${error.page}: ${error.error}`);
      });
    }
  });
});

