import { test, expect } from '@playwright/test';
import { ErrorCollector, waitForPageLoad, checkForErrors, takeScreenshotOnError, testPageAccessibility, testPagePerformance } from '../utils/test-helpers';

test.describe('Authentication Pages Tests', () => {
  let errorCollector: ErrorCollector;

  test.beforeEach(async ({ page }) => {
    errorCollector = new ErrorCollector();
  });

  test.describe('Login Page', () => {
    test('Login page loads successfully', async ({ page }) => {
      try {
        await page.goto('/login');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Login|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for login form elements
        await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
        await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="login-button"]')).toBeVisible();

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'login-page-load-failure');
        errorCollector.addError({
          page: 'Login Page',
          error: `Failed to load login page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Login form validation', async ({ page }) => {
      try {
        await page.goto('/login');
        await waitForPageLoad(page);

        const loginButton = page.locator('[data-testid="login-button"]');
        
        // Test empty form submission
        await loginButton.click();
        await page.waitForTimeout(1000);

        // Test with invalid email
        await page.locator('[data-testid="email-input"]').fill('invalid-email');
        await page.locator('[data-testid="password-input"]').fill('password123');
        await loginButton.click();
        await page.waitForTimeout(1000);

        // Test with valid format but non-existent credentials
        await page.locator('[data-testid="email-input"]').fill('test@example.com');
        await page.locator('[data-testid="password-input"]').fill('wrongpassword');
        await loginButton.click();
        await page.waitForTimeout(2000);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'login-validation-failure');
        errorCollector.addError({
          page: 'Login Page Validation',
          error: `Login validation failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Login page navigation', async ({ page }) => {
      try {
        await page.goto('/login');
        await waitForPageLoad(page);

        // Test back button
        const backButton = page.locator('[data-testid="back-button"]');
        if (await backButton.isVisible()) {
          await backButton.click();
          await expect(page).toHaveURL('/');
        }

        // Test signup link
        const signupLink = page.locator('[data-testid="signup-link"]');
        if (await signupLink.isVisible()) {
          await signupLink.click();
          await expect(page).toHaveURL('/signup');
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'login-navigation-failure');
        errorCollector.addError({
          page: 'Login Page Navigation',
          error: `Login navigation failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Signup Page', () => {
    test('Signup page loads successfully', async ({ page }) => {
      try {
        await page.goto('/signup');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Signup|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for signup form elements
        await expect(page.locator('[data-testid="signup-form"]')).toBeVisible();
        await expect(page.locator('[data-testid="name-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="signup-button"]')).toBeVisible();

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'signup-page-load-failure');
        errorCollector.addError({
          page: 'Signup Page',
          error: `Failed to load signup page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Signup form validation', async ({ page }) => {
      try {
        await page.goto('/signup');
        await waitForPageLoad(page);

        const signupButton = page.locator('[data-testid="signup-button"]');
        
        // Test empty form submission
        await signupButton.click();
        await page.waitForTimeout(1000);

        // Test with invalid email
        await page.locator('[data-testid="name-input"]').fill('Test User');
        await page.locator('[data-testid="email-input"]').fill('invalid-email');
        await page.locator('[data-testid="password-input"]').fill('password123');
        await page.locator('[data-testid="confirm-password-input"]').fill('password123');
        await signupButton.click();
        await page.waitForTimeout(1000);

        // Test with password mismatch
        await page.locator('[data-testid="email-input"]').fill('test@example.com');
        await page.locator('[data-testid="confirm-password-input"]').fill('differentpassword');
        await signupButton.click();
        await page.waitForTimeout(1000);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'signup-validation-failure');
        errorCollector.addError({
          page: 'Signup Page Validation',
          error: `Signup validation failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Signup page navigation', async ({ page }) => {
      try {
        await page.goto('/signup');
        await waitForPageLoad(page);

        // Test back button
        const backButton = page.locator('[data-testid="back-button"]');
        if (await backButton.isVisible()) {
          await backButton.click();
          await expect(page).toHaveURL('/');
        }

        // Test login link
        const loginLink = page.locator('[data-testid="login-link"]');
        if (await loginLink.isVisible()) {
          await loginLink.click();
          await expect(page).toHaveURL('/login');
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'signup-navigation-failure');
        errorCollector.addError({
          page: 'Signup Page Navigation',
          error: `Signup navigation failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Account Page', () => {
    test('Account page loads successfully', async ({ page }) => {
      try {
        await page.goto('/account');
        await waitForPageLoad(page);

        // Account page might redirect to login if not authenticated
        if (page.url().includes('/login')) {
          // User not authenticated, which is expected behavior
          return;
        }

        await expect(page).toHaveTitle(/Account|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for account page elements
        await expect(page.locator('[data-testid="account-header"]')).toBeVisible();

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'account-page-load-failure');
        errorCollector.addError({
          page: 'Account Page',
          error: `Failed to load account page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Account page redirects when not authenticated', async ({ page }) => {
      try {
        await page.goto('/account');
        await waitForPageLoad(page);

        // Should redirect to login page
        await expect(page).toHaveURL(/\/login/);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'account-redirect-failure');
        errorCollector.addError({
          page: 'Account Page Redirect',
          error: `Account redirect failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test('Accessibility compliance for all auth pages', async ({ page }) => {
    const authPages = ['/login', '/signup'];
    
    for (const path of authPages) {
      try {
        await page.goto(path);
        await waitForPageLoad(page);

        const accessibilityIssues = await testPageAccessibility(page);
        
        if (accessibilityIssues.length > 0) {
          errorCollector.addError({
            page: `Auth Page ${path}`,
            error: `Accessibility issues found: ${accessibilityIssues.join(', ')}`,
            timestamp: new Date().toISOString(),
            consoleErrors: accessibilityIssues,
            networkErrors: []
          });
        }

        expect(accessibilityIssues).toHaveLength(0);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, `auth-accessibility-failure-${path.replace('/', '')}`);
        errorCollector.addError({
          page: `Auth Page ${path} Accessibility`,
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

  test('Performance metrics for all auth pages', async ({ page }) => {
    const authPages = ['/login', '/signup'];
    
    for (const path of authPages) {
      try {
        await page.goto(path);
        await waitForPageLoad(page);

        const performanceIssues = await testPagePerformance(page);
        
        if (performanceIssues.length > 0) {
          errorCollector.addError({
            page: `Auth Page ${path}`,
            error: `Performance issues found: ${performanceIssues.join(', ')}`,
            timestamp: new Date().toISOString(),
            consoleErrors: performanceIssues,
            networkErrors: []
          });
        }

        expect(performanceIssues).toHaveLength(0);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, `auth-performance-failure-${path.replace('/', '')}`);
        errorCollector.addError({
          page: `Auth Page ${path} Performance`,
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

  test('Error handling and console errors for all auth pages', async ({ page }) => {
    const authPages = ['/login', '/signup'];
    
    for (const path of authPages) {
      try {
        await page.goto(path);
        await waitForPageLoad(page);

        const { consoleErrors, networkErrors } = await checkForErrors(page);
        
        if (consoleErrors.length > 0 || networkErrors.length > 0) {
          errorCollector.addError({
            page: `Auth Page ${path}`,
            error: 'Console or network errors detected',
            timestamp: new Date().toISOString(),
            consoleErrors,
            networkErrors
          });
        }

        expect(consoleErrors).toHaveLength(0);
        expect(networkErrors).toHaveLength(0);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, `auth-error-handling-failure-${path.replace('/', '')}`);
        errorCollector.addError({
          page: `Auth Page ${path} Error Handling`,
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
      console.log('Errors found during authentication pages testing:');
      errors.forEach(error => {
        console.log(`- ${error.page}: ${error.error}`);
      });
    }
  });
});
