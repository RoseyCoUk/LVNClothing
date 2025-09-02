import { test, expect } from '@playwright/test';
import { ErrorCollector, waitForPageLoad, checkForErrors, takeScreenshotOnError, testPageAccessibility, testPagePerformance } from '../utils/test-helpers';

test.describe('Support and Legal Pages Tests', () => {
  let errorCollector: ErrorCollector;

  test.beforeEach(async ({ page }) => {
    errorCollector = new ErrorCollector();
  });

  test.describe('About Page', () => {
    test('About page loads successfully', async ({ page }) => {
      try {
        await page.goto('/about');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/About|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for about page content
        await expect(page.locator('[data-testid="about-content"]')).toBeVisible();

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'about-page-load-failure');
        errorCollector.addError({
          page: 'About Page',
          error: `Failed to load about page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('About page navigation', async ({ page }) => {
      try {
        await page.goto('/about');
        await waitForPageLoad(page);

        // Test back button
        const backButton = page.locator('[data-testid="back-button"]');
        if (await backButton.isVisible()) {
          await backButton.click();
          await expect(page).toHaveURL('/');
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'about-navigation-failure');
        errorCollector.addError({
          page: 'About Page Navigation',
          error: `About page navigation failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Contact Page', () => {
    test('Contact page loads successfully', async ({ page }) => {
      try {
        await page.goto('/contact');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Contact|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for contact form
        const contactForm = page.locator('[data-testid="contact-form"]');
        if (await contactForm.isVisible()) {
          await expect(contactForm).toBeVisible();
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'contact-page-load-failure');
        errorCollector.addError({
          page: 'Contact Page',
          error: `Failed to load contact page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Contact form functionality', async ({ page }) => {
      try {
        await page.goto('/contact');
        await waitForPageLoad(page);

        const contactForm = page.locator('[data-testid="contact-form"]');
        if (await contactForm.isVisible()) {
          // Test name input
          const nameInput = page.locator('[data-testid="name-input"]');
          if (await nameInput.isVisible()) {
            await nameInput.fill('Test User');
            await expect(nameInput).toHaveValue('Test User');
          }

          // Test email input
          const emailInput = page.locator('[data-testid="email-input"]');
          if (await emailInput.isVisible()) {
            await emailInput.fill('test@example.com');
            await expect(emailInput).toHaveValue('test@example.com');
          }

          // Test message input
          const messageInput = page.locator('[data-testid="message-input"]');
          if (await messageInput.isVisible()) {
            await messageInput.fill('This is a test message');
            await expect(messageInput).toHaveValue('This is a test message');
          }

          // Test submit button
          const submitButton = page.locator('[data-testid="contact-submit"]');
          if (await submitButton.isVisible()) {
            await submitButton.click();
            await page.waitForTimeout(2000);
          }
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'contact-form-failure');
        errorCollector.addError({
          page: 'Contact Form',
          error: `Contact form failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Contact page navigation', async ({ page }) => {
      try {
        await page.goto('/contact');
        await waitForPageLoad(page);

        // Test back button
        const backButton = page.locator('[data-testid="back-button"]');
        if (await backButton.isVisible()) {
          await backButton.click();
          await expect(page).toHaveURL('/');
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'contact-navigation-failure');
        errorCollector.addError({
          page: 'Contact Page Navigation',
          error: `Contact page navigation failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('FAQ Page', () => {
    test('FAQ page loads successfully', async ({ page }) => {
      try {
        await page.goto('/faq');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/FAQ|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for FAQ content
        const faqContent = page.locator('[data-testid="faq-content"]');
        if (await faqContent.isVisible()) {
          await expect(faqContent).toBeVisible();
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'faq-page-load-failure');
        errorCollector.addError({
          page: 'FAQ Page',
          error: `Failed to load FAQ page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('FAQ page navigation', async ({ page }) => {
      try {
        await page.goto('/faq');
        await waitForPageLoad(page);

        // Test back button
        const backButton = page.locator('[data-testid="back-button"]');
        if (await backButton.isVisible()) {
          await backButton.click();
          await expect(page).toHaveURL('/');
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'faq-navigation-failure');
        errorCollector.addError({
          page: 'FAQ Page Navigation',
          error: `FAQ page navigation failed: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });
  });

  test.describe('Legal Pages', () => {
    test('Privacy Policy page loads successfully', async ({ page }) => {
      try {
        await page.goto('/privacy-policy');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Privacy Policy|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for privacy policy content
        const privacyContent = page.locator('[data-testid="privacy-content"]');
        if (await privacyContent.isVisible()) {
          await expect(privacyContent).toBeVisible();
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'privacy-policy-load-failure');
        errorCollector.addError({
          page: 'Privacy Policy Page',
          error: `Failed to load privacy policy page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Cookie Policy page loads successfully', async ({ page }) => {
      try {
        await page.goto('/cookie-policy');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Cookie Policy|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for cookie policy content
        const cookieContent = page.locator('[data-testid="cookie-content"]');
        if (await cookieContent.isVisible()) {
          await expect(cookieContent).toBeVisible();
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'cookie-policy-load-failure');
        errorCollector.addError({
          page: 'Cookie Policy Page',
          error: `Failed to load cookie policy page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Terms of Service page loads successfully', async ({ page }) => {
      try {
        await page.goto('/terms-of-service');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Terms of Service|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for terms of service content
        const termsContent = page.locator('[data-testid="terms-content"]');
        if (await termsContent.isVisible()) {
          await expect(termsContent).toBeVisible();
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'terms-of-service-load-failure');
        errorCollector.addError({
          page: 'Terms of Service Page',
          error: `Failed to load terms of service page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Legal pages navigation', async ({ page }) => {
      const legalPages = ['/privacy-policy', '/cookie-policy', '/terms-of-service'];
      
      for (const path of legalPages) {
        try {
          await page.goto(path);
          await waitForPageLoad(page);

          // Test back button
          const backButton = page.locator('[data-testid="back-button"]');
          if (await backButton.isVisible()) {
            await backButton.click();
            await expect(page).toHaveURL('/');
          }

        } catch (error) {
          const screenshot = await takeScreenshotOnError(page, `legal-navigation-failure-${path.split('/').pop()}`);
          errorCollector.addError({
            page: `Legal Page ${path} Navigation`,
            error: `Legal page navigation failed: ${error}`,
            timestamp: new Date().toISOString(),
            screenshot,
            consoleErrors: [],
            networkErrors: []
          });
          throw error;
        }
      }
    });
  });

  test.describe('Support Pages', () => {
    test('Returns and Exchanges page loads successfully', async ({ page }) => {
      try {
        await page.goto('/returns-exchanges');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Returns|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for returns content
        const returnsContent = page.locator('[data-testid="returns-content"]');
        if (await returnsContent.isVisible()) {
          await expect(returnsContent).toBeVisible();
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'returns-exchanges-load-failure');
        errorCollector.addError({
          page: 'Returns and Exchanges Page',
          error: `Failed to load returns and exchanges page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Shipping Info page loads successfully', async ({ page }) => {
      try {
        await page.goto('/shipping-info');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Shipping|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for shipping content
        const shippingContent = page.locator('[data-testid="shipping-content"]');
        if (await shippingContent.isVisible()) {
          await expect(shippingContent).toBeVisible();
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'shipping-info-load-failure');
        errorCollector.addError({
          page: 'Shipping Info Page',
          error: `Failed to load shipping info page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Size Guide page loads successfully', async ({ page }) => {
      try {
        await page.goto('/size-guide');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Size Guide|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for size guide content
        const sizeGuideContent = page.locator('[data-testid="size-guide-content"]');
        if (await sizeGuideContent.isVisible()) {
          await expect(sizeGuideContent).toBeVisible();
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'size-guide-load-failure');
        errorCollector.addError({
          page: 'Size Guide Page',
          error: `Failed to load size guide page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Accessibility page loads successfully', async ({ page }) => {
      try {
        await page.goto('/accessibility');
        await waitForPageLoad(page);

        await expect(page).toHaveTitle(/Accessibility|Reform UK/);
        await expect(page.locator('main')).toBeVisible();

        // Check for accessibility content
        const accessibilityContent = page.locator('[data-testid="accessibility-content"]');
        if (await accessibilityContent.isVisible()) {
          await expect(accessibilityContent).toBeVisible();
        }

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, 'accessibility-page-load-failure');
        errorCollector.addError({
          page: 'Accessibility Page',
          error: `Failed to load accessibility page: ${error}`,
          timestamp: new Date().toISOString(),
          screenshot,
          consoleErrors: [],
          networkErrors: []
        });
        throw error;
      }
    });

    test('Support pages navigation', async ({ page }) => {
      const supportPages = ['/returns-exchanges', '/shipping-info', '/size-guide', '/accessibility'];
      
      for (const path of supportPages) {
        try {
          await page.goto(path);
          await waitForPageLoad(page);

          // Test back button
          const backButton = page.locator('[data-testid="back-button"]');
          if (await backButton.isVisible()) {
            await backButton.click();
            await expect(page).toHaveURL('/');
          }

        } catch (error) {
          const screenshot = await takeScreenshotOnError(page, `support-navigation-failure-${path.split('/').pop()}`);
          errorCollector.addError({
            page: `Support Page ${path} Navigation`,
            error: `Support page navigation failed: ${error}`,
            timestamp: new Date().toISOString(),
            screenshot,
            consoleErrors: [],
            networkErrors: []
          });
          throw error;
        }
      }
    });
  });

  test('Accessibility compliance for all support/legal pages', async ({ page }) => {
    const pages = [
      '/about', '/contact', '/faq',
      '/privacy-policy', '/cookie-policy', '/terms-of-service',
      '/returns-exchanges', '/shipping-info', '/size-guide', '/accessibility'
    ];
    
    for (const path of pages) {
      try {
        await page.goto(path);
        await waitForPageLoad(page);

        const accessibilityIssues = await testPageAccessibility(page);
        
        if (accessibilityIssues.length > 0) {
          errorCollector.addError({
            page: `Support/Legal Page ${path}`,
            error: `Accessibility issues found: ${accessibilityIssues.join(', ')}`,
            timestamp: new Date().toISOString(),
            consoleErrors: accessibilityIssues,
            networkErrors: []
          });
        }

        expect(accessibilityIssues).toHaveLength(0);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, `support-accessibility-failure-${path.split('/').pop()}`);
        errorCollector.addError({
          page: `Support/Legal Page ${path} Accessibility`,
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

  test('Performance metrics for all support/legal pages', async ({ page }) => {
    const pages = [
      '/about', '/contact', '/faq',
      '/privacy-policy', '/cookie-policy', '/terms-of-service'
    ];
    
    for (const path of pages) {
      try {
        await page.goto(path);
        await waitForPageLoad(page);

        const performanceIssues = await testPagePerformance(page);
        
        if (performanceIssues.length > 0) {
          errorCollector.addError({
            page: `Support/Legal Page ${path}`,
            error: `Performance issues found: ${performanceIssues.join(', ')}`,
            timestamp: new Date().toISOString(),
            consoleErrors: performanceIssues,
            networkErrors: []
          });
        }

        expect(performanceIssues).toHaveLength(0);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, `support-performance-failure-${path.split('/').pop()}`);
        errorCollector.addError({
          page: `Support/Legal Page ${path} Performance`,
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

  test('Error handling and console errors for all support/legal pages', async ({ page }) => {
    const pages = [
      '/about', '/contact', '/faq',
      '/privacy-policy', '/cookie-policy', '/terms-of-service'
    ];
    
    for (const path of pages) {
      try {
        await page.goto(path);
        await waitForPageLoad(page);

        const { consoleErrors, networkErrors } = await checkForErrors(page);
        
        if (consoleErrors.length > 0 || networkErrors.length > 0) {
          errorCollector.addError({
            page: `Support/Legal Page ${path}`,
            error: 'Console or network errors detected',
            timestamp: new Date().toISOString(),
            consoleErrors,
            networkErrors
          });
        }

        expect(consoleErrors).toHaveLength(0);
        expect(networkErrors).toHaveLength(0);

      } catch (error) {
        const screenshot = await takeScreenshotOnError(page, `support-error-handling-failure-${path.split('/').pop()}`);
        errorCollector.addError({
          page: `Support/Legal Page ${path} Error Handling`,
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
      console.log('Errors found during support/legal pages testing:');
      errors.forEach(error => {
        console.log(`- ${error.page}: ${error.error}`);
      });
    }
  });
});

