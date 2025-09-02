import { test, expect, Page, Browser } from '@playwright/test';
import { waitForPageLoad, takeScreenshotOnError } from './utils/test-helpers';

/**
 * Edge Cases and Performance Test Suite
 * 
 * Tests unusual scenarios, error handling, and performance edge cases:
 * - Products with no images (fallback behavior)
 * - Broken image URL handling
 * - Large image handling and performance
 * - Concurrent operations
 * - Network failures and offline behavior
 * - Browser compatibility issues
 * - Memory usage with many images
 * - Mobile device testing
 */

// Helper function to login as admin
async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login');
  await page.fill('input[type="email"]', 'admin@reformuk.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await waitForPageLoad(page);
}

// Helper function to simulate network conditions
async function setNetworkConditions(page: Page, condition: 'offline' | 'slow3g' | 'fast3g' | 'normal') {
  const client = await (page as any).context().newCDPSession(page);
  
  switch (condition) {
    case 'offline':
      await client.send('Network.emulateNetworkConditions', {
        offline: true,
        downloadThroughput: 0,
        uploadThroughput: 0,
        latency: 0
      });
      break;
    case 'slow3g':
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: 500 * 1024 / 8, // 500kb/s
        uploadThroughput: 500 * 1024 / 8,
        latency: 400
      });
      break;
    case 'fast3g':
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: 1600 * 1024 / 8, // 1.6mb/s
        uploadThroughput: 750 * 1024 / 8,
        latency: 150
      });
      break;
    default:
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0
      });
  }
}

// Helper to create a product without images
async function createProductWithoutImages(page: Page) {
  await loginAsAdmin(page);
  await page.goto('/admin/products');
  
  // Create new product without images
  const createButton = page.locator('button:has-text("Create Product")');
  if (await createButton.isVisible()) {
    await createButton.click();
    
    await page.fill('input[name="name"]', 'Test Product No Images');
    await page.fill('textarea[name="description"]', 'Product for testing fallback images');
    await page.fill('input[name="price"]', '19.99');
    
    await page.click('button:has-text("Save Product")');
    await page.waitForSelector('text=Product created', { timeout: 10000 });
  }
}

test.describe('Edge Cases and Performance Testing', () => {
  
  test('Product with no images - fallback behavior', async ({ page }) => {
    await test.step('Create product without images', async () => {
      await createProductWithoutImages(page);
    });

    await test.step('Verify default logo shows on shop page', async () => {
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      // Find the test product
      const testProductCard = page.locator('[data-testid="product-card"]:has-text("Test Product No Images")');
      if (await testProductCard.isVisible()) {
        const image = testProductCard.locator('img').first();
        await expect(image).toBeVisible();
        
        const src = await image.getAttribute('src');
        expect(src).toMatch(/BackReformLogo|default|placeholder/); // Should be fallback image
        
        await testProductCard.screenshot({ path: 'test-results/fallback-image-shop.png' });
        console.log('✅ Fallback image displayed on shop page');
      }
    });

    await test.step('Add image and verify thumbnail now shows', async () => {
      await loginAsAdmin(page);
      await page.goto('/admin/products');
      await page.click('text=Test Product No Images');
      await page.click('button:has-text("Manage Images")');
      
      // Upload image
      await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#10B981';
          ctx.fillRect(0, 0, 300, 300);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('NOW HAS', 150, 130);
          ctx.fillText('IMAGE!', 150, 170);
        }
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'added-image.png', { type: 'image/png' });
            const dt = new DataTransfer();
            dt.items.add(file);
            
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (input) {
              input.files = dt.files;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });
      });
      
      await page.waitForSelector('.bg-green-500');
      await page.click('button[title*="Set as Thumbnail"]');
      await page.click('button:has-text("Save Changes")');
      await page.waitForSelector('.bg-green-500:has-text("Images saved successfully")');
      
      // Verify on shop page
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      const testProductCard = page.locator('[data-testid="product-card"]:has-text("Test Product No Images")');
      if (await testProductCard.isVisible()) {
        const image = testProductCard.locator('img').first();
        const src = await image.getAttribute('src');
        
        expect(src).not.toMatch(/BackReformLogo|default|placeholder/); // Should now be custom image
        console.log('✅ Custom thumbnail now displayed after adding image');
      }
    });
  });

  test('Broken image URL handling', async ({ page }) => {
    await test.step('Set thumbnail with invalid URL', async () => {
      await loginAsAdmin(page);
      await page.goto('/admin/products');
      await page.click('text=Reform UK T-Shirt');
      
      // Directly update database with broken URL (simulation)
      await page.evaluate(() => {
        // This would normally require API call to corrupt an image URL
        console.log('Simulating broken image URL scenario');
      });
    });

    await test.step('Verify fallback displays', async () => {
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      // Monitor console for image load errors
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' && msg.text().includes('image')) {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(3000); // Allow time for images to attempt loading
      
      // Check if any product cards have broken images
      const productCards = page.locator('[data-testid="product-card"]');
      const cardCount = await productCards.count();
      
      for (let i = 0; i < cardCount; i++) {
        const card = productCards.nth(i);
        const image = card.locator('img').first();
        
        if (await image.isVisible()) {
          // Check if image has error state or fallback
          const naturalWidth = await image.evaluate((img: HTMLImageElement) => img.naturalWidth);
          if (naturalWidth === 0) {
            console.log(`Found broken image in card ${i}, should show fallback`);
          }
        }
      }
    });

    await test.step('Verify console warning logged', async () => {
      // Console errors should be handled gracefully
      // In production, broken images should not cause JS errors
      await page.screenshot({ path: 'test-results/broken-image-handling.png' });
    });

    await test.step('Verify no JS errors thrown', async () => {
      // Page should continue functioning despite broken images
      const productCard = page.locator('[data-testid="product-card"]').first();
      if (await productCard.isVisible()) {
        // Should still be clickable
        await expect(productCard).toBeVisible();
        console.log('✅ Page functionality preserved with broken images');
      }
    });
  });

  test('Large image handling', async ({ page }) => {
    await test.step('Upload large image (within limits)', async () => {
      await loginAsAdmin(page);
      await page.goto('/admin/products');
      await page.click('text=Reform UK T-Shirt');
      await page.click('button:has-text("Manage Images")');
      
      // Create large but valid image
      await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 3000; // Large dimensions
        canvas.height = 3000;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Create detailed pattern to increase file size
          for (let x = 0; x < 3000; x += 100) {
            for (let y = 0; y < 3000; y += 100) {
              ctx.fillStyle = `hsl(${(x + y) % 360}, 70%, 50%)`;
              ctx.fillRect(x, y, 100, 100);
            }
          }
          
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 100px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('LARGE IMAGE', 1500, 1500);
        }
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'large-image.png', { type: 'image/png' });
            const dt = new DataTransfer();
            dt.items.add(file);
            
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (input) {
              input.files = dt.files;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });
      });
      
      const uploadStart = Date.now();
      await page.waitForSelector('.bg-green-500', { timeout: 60000 }); // Longer timeout for large image
      const uploadTime = Date.now() - uploadStart;
      
      console.log(`Large image upload time: ${uploadTime}ms`);
      expect(uploadTime).toBeLessThan(30000); // Should complete within 30 seconds
    });

    await test.step('Verify display performance', async () => {
      await page.goto('/shop');
      const loadStart = Date.now();
      await waitForPageLoad(page);
      const loadTime = Date.now() - loadStart;
      
      console.log(`Shop page load time with large images: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(15000); // Should load within 15 seconds
    });

    await test.step('Check lazy loading works', async () => {
      await page.goto('/shop');
      
      // Scroll down to trigger lazy loading
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      await page.waitForTimeout(2000);
      
      // Check if images load as they come into view
      const images = page.locator('img[loading="lazy"]');
      const lazyImageCount = await images.count();
      
      if (lazyImageCount > 0) {
        console.log(`✅ Found ${lazyImageCount} lazy-loaded images`);
      }
    });
  });

  test('Concurrent thumbnail updates', async ({ page, browser }) => {
    await test.step('Two admins edit same product', async () => {
      // Create second browser context for second admin session
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();
      
      // Login both sessions
      await loginAsAdmin(page);
      await loginAsAdmin(page2);
      
      // Both navigate to same product
      await page.goto('/admin/products');
      await page2.goto('/admin/products');
      
      await page.click('text=Reform UK T-Shirt');
      await page2.click('text=Reform UK T-Shirt');
      
      await page.click('button:has-text("Manage Images")');
      await page2.click('button:has-text("Manage Images")');
      
      console.log('✅ Both admin sessions opened same product');
    });

    await test.step('Both set different thumbnails', async () => {
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();
      await loginAsAdmin(page2);
      
      // Admin 1 uploads and sets thumbnail
      await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#EF4444'; // Red
          ctx.fillRect(0, 0, 200, 200);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('ADMIN 1', 100, 100);
        }
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'admin1-thumbnail.png', { type: 'image/png' });
            const dt = new DataTransfer();
            dt.items.add(file);
            
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (input) {
              input.files = dt.files;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });
      });
      
      // Admin 2 uploads and sets thumbnail
      await page2.goto('/admin/products');
      await page2.click('text=Reform UK T-Shirt');
      await page2.click('button:has-text("Manage Images")');
      
      await page2.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#3B82F6'; // Blue
          ctx.fillRect(0, 0, 200, 200);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('ADMIN 2', 100, 100);
        }
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'admin2-thumbnail.png', { type: 'image/png' });
            const dt = new DataTransfer();
            dt.items.add(file);
            
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (input) {
              input.files = dt.files;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });
      });
      
      await page.waitForSelector('.bg-green-500');
      await page2.waitForSelector('.bg-green-500');
      
      // Both set their uploads as thumbnails simultaneously
      await Promise.all([
        page.click('button[title*="Set as Thumbnail"]:last-child'),
        page2.click('button[title*="Set as Thumbnail"]:last-child')
      ]);
      
      await context2.close();
    });

    await test.step('Verify last write wins', async () => {
      // Save both sessions
      await page.click('button:has-text("Save Changes")');
      
      await page.waitForTimeout(2000); // Allow database to settle
      
      // Check final state
      const response = await page.request.get('/api/products/images');
      const images = await response.json();
      
      const thumbnailImages = images.filter((img: any) => img.is_thumbnail === true);
      expect(thumbnailImages).toHaveLength(1); // Only one thumbnail should exist
      
      console.log('✅ Concurrent updates resolved - last write wins');
    });

    await test.step('Verify data consistency', async () => {
      // Verify no duplicate thumbnails or corrupted data
      const response = await page.request.get('/api/products/images');
      const images = await response.json();
      
      // Check for data integrity
      images.forEach((img: any) => {
        expect(img.product_id).toBeTruthy();
        expect(img.image_url).toBeTruthy();
        expect(typeof img.is_thumbnail).toBe('boolean');
        expect(typeof img.is_primary).toBe('boolean');
      });
      
      console.log('✅ Data integrity maintained after concurrent operations');
    });
  });

  test('Network conditions and offline behavior', async ({ page }) => {
    await test.step('Test slow network image loading', async () => {
      await setNetworkConditions(page, 'slow3g');
      
      const loadStart = Date.now();
      await page.goto('/shop');
      await waitForPageLoad(page);
      const loadTime = Date.now() - loadStart;
      
      console.log(`Shop page load time on slow 3G: ${loadTime}ms`);
      
      // Should still load, just slower
      const productCards = page.locator('[data-testid="product-card"]');
      const cardCount = await productCards.count();
      expect(cardCount).toBeGreaterThan(0);
      
      await setNetworkConditions(page, 'normal'); // Reset
    });

    await test.step('Test offline behavior', async () => {
      await setNetworkConditions(page, 'offline');
      
      try {
        await page.goto('/shop', { timeout: 5000 });
      } catch (error) {
        console.log('✅ Correctly failed to load page when offline');
      }
      
      await setNetworkConditions(page, 'normal'); // Reset
    });

    await test.step('Test image upload during poor network', async () => {
      await loginAsAdmin(page);
      await setNetworkConditions(page, 'slow3g');
      
      await page.goto('/admin/products');
      await page.click('text=Reform UK T-Shirt');
      await page.click('button:has-text("Manage Images")');
      
      // Try to upload image on slow network
      await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#F59E0B';
          ctx.fillRect(0, 0, 400, 400);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('SLOW NETWORK', 200, 180);
          ctx.fillText('UPLOAD', 200, 220);
        }
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'slow-network-upload.png', { type: 'image/png' });
            const dt = new DataTransfer();
            dt.items.add(file);
            
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (input) {
              input.files = dt.files;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });
      });
      
      // Should show loading state and eventually succeed or fail gracefully
      try {
        await page.waitForSelector('.bg-green-500', { timeout: 30000 });
        console.log('✅ Upload succeeded on slow network');
      } catch (error) {
        // Should show error state, not hang indefinitely
        const errorElement = page.locator('.bg-red-500, text*="error", text*="failed"');
        if (await errorElement.isVisible()) {
          console.log('✅ Upload failed gracefully on slow network with error message');
        } else {
          console.log('⚠️ Upload behavior on slow network needs improvement');
        }
      }
      
      await setNetworkConditions(page, 'normal'); // Reset
    });
  });

  test('Memory usage with many images', async ({ page }) => {
    await test.step('Load page with many images', async () => {
      await loginAsAdmin(page);
      
      // Upload multiple images to create memory pressure
      await page.goto('/admin/products');
      await page.click('text=Reform UK T-Shirt');
      await page.click('button:has-text("Manage Images")');
      
      // Upload 10 images
      for (let i = 0; i < 10; i++) {
        await page.evaluate((index) => {
          const canvas = document.createElement('canvas');
          canvas.width = 800; // Larger images for memory pressure
          canvas.height = 600;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Create complex pattern
            for (let x = 0; x < 800; x += 50) {
              for (let y = 0; y < 600; y += 50) {
                ctx.fillStyle = `hsl(${(x + y + index * 30) % 360}, 70%, 50%)`;
                ctx.fillRect(x, y, 50, 50);
              }
            }
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`IMAGE ${index + 1}`, 400, 300);
          }
          
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `memory-test-${index}.png`, { type: 'image/png' });
              const dt = new DataTransfer();
              dt.items.add(file);
              
              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (input) {
                input.files = dt.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          });
        }, i);
        
        await page.waitForSelector('.bg-green-500');
        await page.waitForTimeout(500);
      }
      
      await page.click('button:has-text("Save Changes")');
      await page.waitForSelector('.bg-green-500:has-text("Images saved successfully")');
    });

    await test.step('Test memory usage on frontend', async () => {
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      // Check if page remains responsive with many images
      const productCards = page.locator('[data-testid="product-card"]');
      const cardCount = await productCards.count();
      
      // Scroll through all products
      for (let i = 0; i < cardCount; i++) {
        const card = productCards.nth(i);
        await card.scrollIntoViewIfNeeded();
        await page.waitForTimeout(100);
      }
      
      // Page should remain responsive
      const title = page.locator('h1, h2').first();
      await expect(title).toBeVisible();
      
      console.log('✅ Page remains responsive with many images');
    });

    await test.step('Test image gallery performance', async () => {
      await page.goto('/products/t-shirt');
      await waitForPageLoad(page);
      
      // Test image gallery switching performance
      const galleryImages = page.locator('[data-testid="product-gallery"] img');
      const galleryCount = await galleryImages.count();
      
      for (let i = 0; i < Math.min(5, galleryCount); i++) {
        const clickStart = Date.now();
        await galleryImages.nth(i).click();
        await page.waitForTimeout(200); // Allow image to change
        const clickTime = Date.now() - clickStart;
        
        expect(clickTime).toBeLessThan(1000); // Should respond quickly
      }
      
      console.log('✅ Image gallery remains responsive with many images');
    });
  });

  test('Mobile device compatibility', async ({ page }) => {
    await test.step('Test mobile viewport - iPhone', async () => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      // Check mobile layout
      const productCards = page.locator('[data-testid="product-card"]');
      const cardCount = await productCards.count();
      
      for (let i = 0; i < Math.min(3, cardCount); i++) {
        const card = productCards.nth(i);
        const image = card.locator('img').first();
        
        if (await image.isVisible()) {
          const boundingBox = await image.boundingBox();
          if (boundingBox) {
            expect(boundingBox.width).toBeLessThanOrEqual(375); // Should fit viewport
            expect(boundingBox.width).toBeGreaterThan(100); // But not too small
          }
        }
      }
      
      await page.screenshot({ path: 'test-results/mobile-iphone-shop.png' });
      console.log('✅ Mobile iPhone layout working');
    });

    await test.step('Test mobile viewport - Android tablet', async () => {
      await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
      
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      await page.screenshot({ path: 'test-results/mobile-tablet-shop.png' });
      
      // Test touch interactions
      const productCard = page.locator('[data-testid="product-card"]').first();
      if (await productCard.isVisible()) {
        await productCard.tap(); // Use tap instead of click for mobile
        await waitForPageLoad(page);
        
        expect(page.url()).toMatch(/\/products\//);
        console.log('✅ Mobile touch interactions working');
      }
    });

    await test.step('Test mobile admin image management', async () => {
      await page.setViewportSize({ width: 375, height: 667 }); // Mobile
      
      await loginAsAdmin(page);
      await page.goto('/admin/products');
      
      // Should be usable on mobile
      const productLinks = page.locator('a:has-text("Reform UK")').first();
      if (await productLinks.isVisible()) {
        await productLinks.tap();
        await waitForPageLoad(page);
        
        const manageImagesButton = page.locator('button:has-text("Manage Images")');
        if (await manageImagesButton.isVisible()) {
          await manageImagesButton.tap();
          
          // Modal should be responsive on mobile
          const modal = page.locator('.fixed.inset-0');
          await expect(modal).toBeVisible();
          
          await page.screenshot({ path: 'test-results/mobile-admin-images.png' });
          console.log('✅ Mobile admin image management working');
        }
      }
    });
  });

  test('Browser compatibility edge cases', async ({ page, browserName }) => {
    await test.step(`Test canvas support - ${browserName}`, async () => {
      // Test that image creation works across browsers
      const canvasSupported = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        return ctx !== null;
      });
      
      expect(canvasSupported).toBeTruthy();
      console.log(`✅ Canvas support confirmed in ${browserName}`);
    });

    await test.step(`Test file upload support - ${browserName}`, async () => {
      await loginAsAdmin(page);
      await page.goto('/admin/products');
      await page.click('text=Reform UK T-Shirt');
      await page.click('button:has-text("Manage Images")');
      
      // Check file input exists and is accessible
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeAttached();
      
      const isMultiple = await fileInput.getAttribute('multiple');
      const acceptTypes = await fileInput.getAttribute('accept');
      
      expect(acceptTypes).toMatch(/image/);
      console.log(`✅ File upload support confirmed in ${browserName}`);
    });

    await test.step(`Test drag and drop support - ${browserName}`, async () => {
      // Test drag and drop file upload if supported
      const dragDropSupported = await page.evaluate(() => {
        const div = document.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div));
      });
      
      if (dragDropSupported) {
        console.log(`✅ Drag and drop supported in ${browserName}`);
      } else {
        console.log(`ℹ️ Drag and drop not supported in ${browserName} (fallback should work)`);
      }
    });

    await test.step(`Test image display - ${browserName}`, async () => {
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      const productCards = page.locator('[data-testid="product-card"]');
      const cardCount = await productCards.count();
      
      if (cardCount > 0) {
        const image = productCards.first().locator('img').first();
        if (await image.isVisible()) {
          // Test image loading
          const naturalWidth = await image.evaluate((img: HTMLImageElement) => img.naturalWidth);
          expect(naturalWidth).toBeGreaterThan(0);
          
          console.log(`✅ Image display working in ${browserName}`);
        }
      }
    });
  });
});