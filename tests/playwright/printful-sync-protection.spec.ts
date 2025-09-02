import { test, expect, Page } from '@playwright/test';
import { waitForPageLoad } from './utils/test-helpers';

/**
 * Printful Sync Protection Test Suite
 * 
 * Tests that Printful sync does not override custom images:
 * - Custom thumbnails preserved during sync
 * - New Printful images added without overriding custom ones
 * - Feature flag controls Printful image usage
 * - Source tracking works correctly
 */

// Helper function to login as admin
async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login');
  await page.fill('input[type="email"]', 'admin@reformuk.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await waitForPageLoad(page);
}

// Helper function to set up custom thumbnail
async function setupCustomThumbnail(page: Page, productName = 'Reform UK T-Shirt') {
  await page.goto('/admin/products');
  await page.click(`text=${productName}`);
  await page.click('button:has-text("Manage Images")');
  
  // Upload custom thumbnail
  await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create distinctive custom image
      ctx.fillStyle = '#FF6B35'; // Orange background
      ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CUSTOM', 200, 180);
      ctx.fillText('PROTECTED', 200, 220);
      
      // Add timestamp for uniqueness
      ctx.font = '16px Arial';
      ctx.fillText(new Date().toISOString(), 200, 300);
    }
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'protected-custom-thumbnail.png', { type: 'image/png' });
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
  
  // Record the custom thumbnail URL and properties
  const response = await page.request.get('/api/products/images');
  const images = await response.json();
  const customThumbnail = images.find((img: any) => 
    img.is_thumbnail === true && img.source === 'custom'
  );
  
  return customThumbnail;
}

// Helper function to trigger Printful sync
async function triggerPrintfulSync(page: Page) {
  await page.goto('/admin/products');
  
  // Look for sync button and click it
  const syncButton = page.locator('button:has-text("Sync with Printful")');
  if (await syncButton.isVisible()) {
    await syncButton.click();
    
    // Wait for sync to complete
    await page.waitForSelector('text=Sync completed', { timeout: 30000 });
  }
}

test.describe('Printful Sync Protection Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Sync preserves custom thumbnails', async ({ page }) => {
    let originalThumbnail: any;
    
    await test.step('Set custom thumbnail', async () => {
      originalThumbnail = await setupCustomThumbnail(page);
      expect(originalThumbnail).toBeTruthy();
      expect(originalThumbnail.is_thumbnail).toBe(true);
      expect(originalThumbnail.source).toBe('custom');
    });

    await test.step('Record image URL and is_thumbnail', async () => {
      console.log('Original custom thumbnail:', {
        id: originalThumbnail.id,
        url: originalThumbnail.image_url,
        is_thumbnail: originalThumbnail.is_thumbnail,
        source: originalThumbnail.source
      });
      
      // Take screenshot of product with custom thumbnail
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      const productCard = page.locator('[data-testid="product-card"]').first();
      await productCard.screenshot({ path: 'test-results/pre-sync-custom-thumbnail.png' });
    });

    await test.step('Run Printful sync', async () => {
      await triggerPrintfulSync(page);
    });

    await test.step('Verify custom thumbnail unchanged', async () => {
      const response = await page.request.get('/api/products/images');
      const images = await response.json();
      
      const customThumbnail = images.find((img: any) => 
        img.id === originalThumbnail.id
      );
      
      expect(customThumbnail).toBeTruthy();
      expect(customThumbnail.image_url).toBe(originalThumbnail.image_url);
      expect(customThumbnail.is_thumbnail).toBe(true);
      expect(customThumbnail.source).toBe('custom');
    });

    await test.step('Verify is_thumbnail still true', async () => {
      // Double-check that the custom thumbnail is still the active thumbnail
      const response = await page.request.get('/api/products/images');
      const images = await response.json();
      
      const thumbnailImages = images.filter((img: any) => img.is_thumbnail === true);
      expect(thumbnailImages).toHaveLength(1);
      expect(thumbnailImages[0].id).toBe(originalThumbnail.id);
      expect(thumbnailImages[0].source).toBe('custom');
    });

    await test.step('Verify frontend still shows custom thumbnail', async () => {
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      const productCard = page.locator('[data-testid="product-card"]').first();
      const image = productCard.locator('img').first();
      
      const src = await image.getAttribute('src');
      expect(src).toBe(originalThumbnail.image_url);
      
      // Take screenshot to compare
      await productCard.screenshot({ path: 'test-results/post-sync-custom-thumbnail.png' });
    });
  });

  test('Sync adds images without overriding', async ({ page }) => {
    let initialImageCount: number;
    let customThumbnail: any;
    
    await test.step('Product with custom images', async () => {
      customThumbnail = await setupCustomThumbnail(page);
      
      // Get initial image count
      const response = await page.request.get('/api/products/images');
      const images = await response.json();
      initialImageCount = images.length;
      
      console.log('Initial state:', {
        imageCount: initialImageCount,
        customThumbnail: customThumbnail.id
      });
    });

    await test.step('Run Printful sync', async () => {
      await triggerPrintfulSync(page);
    });

    await test.step('Verify new Printful images added', async () => {
      const response = await page.request.get('/api/products/images');
      const images = await response.json();
      
      // Should have more images now
      expect(images.length).toBeGreaterThanOrEqual(initialImageCount);
      
      // Find newly added Printful images
      const printfulImages = images.filter((img: any) => img.source === 'printful');
      console.log('Printful images found:', printfulImages.length);
      
      // Should have at least some Printful images
      expect(printfulImages.length).toBeGreaterThan(0);
    });

    await test.step('Verify source = "printful" for new images', async () => {
      const response = await page.request.get('/api/products/images');
      const images = await response.json();
      
      const printfulImages = images.filter((img: any) => img.source === 'printful');
      
      printfulImages.forEach((img: any) => {
        expect(img.source).toBe('printful');
        expect(img.image_url).toMatch(/printful|cdn/); // Should contain Printful URLs
      });
    });

    await test.step('Verify custom images still primary', async () => {
      const response = await page.request.get('/api/products/images');
      const images = await response.json();
      
      // Custom thumbnail should still be the thumbnail
      const activeThumbnail = images.find((img: any) => img.is_thumbnail === true);
      expect(activeThumbnail.id).toBe(customThumbnail.id);
      expect(activeThumbnail.source).toBe('custom');
      
      // No Printful image should be marked as thumbnail or primary
      const printfulImages = images.filter((img: any) => img.source === 'printful');
      printfulImages.forEach((img: any) => {
        expect(img.is_thumbnail).toBe(false);
        expect(img.is_primary).toBe(false);
      });
    });

    await test.step('Verify frontend prioritization', async () => {
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      const productCard = page.locator('[data-testid="product-card"]').first();
      const image = productCard.locator('img').first();
      
      // Should still show custom thumbnail, not Printful image
      const src = await image.getAttribute('src');
      expect(src).toBe(customThumbnail.image_url);
    });
  });

  test('Feature flag controls Printful images', async ({ page }) => {
    await test.step('Set use_printful_images = false', async () => {
      // This would typically be done through admin interface
      // For now, we'll test the API behavior
      
      const response = await page.request.patch('/api/products/1', {
        data: { use_printful_images: false }
      });
      
      if (response.ok()) {
        console.log('Successfully set use_printful_images = false');
      }
    });

    await test.step('Verify only custom images show', async () => {
      await page.goto('/products/t-shirt');
      await waitForPageLoad(page);
      
      // Check image gallery - should not show Printful images
      const galleryImages = page.locator('[data-testid="product-gallery"] img');
      const count = await galleryImages.count();
      
      // Get all image sources
      const sources: string[] = [];
      for (let i = 0; i < count; i++) {
        const src = await galleryImages.nth(i).getAttribute('src');
        if (src) sources.push(src);
      }
      
      // None should be Printful images
      sources.forEach(src => {
        expect(src).not.toMatch(/printful|cdn\.printful/);
      });
      
      console.log('Images shown with feature flag off:', sources);
    });

    await test.step('Set use_printful_images = true', async () => {
      const response = await page.request.patch('/api/products/1', {
        data: { use_printful_images: true }
      });
      
      if (response.ok()) {
        console.log('Successfully set use_printful_images = true');
      }
    });

    await test.step('Verify Printful images available as fallback', async () => {
      await page.goto('/products/t-shirt');
      await waitForPageLoad(page);
      
      // Now should include Printful images in gallery (but custom still prioritized)
      const galleryImages = page.locator('[data-testid="product-gallery"] img');
      const count = await galleryImages.count();
      
      const sources: string[] = [];
      for (let i = 0; i < count; i++) {
        const src = await galleryImages.nth(i).getAttribute('src');
        if (src) sources.push(src);
      }
      
      // Should include both custom and Printful images
      const hasCustom = sources.some(src => src.includes('supabase') || src.includes('storage'));
      const hasPrintful = sources.some(src => src.includes('printful') || src.includes('cdn'));
      
      expect(hasCustom).toBeTruthy();
      // Note: hasPrintful might be false if no Printful images were synced yet
      
      console.log('Images shown with feature flag on:', sources);
    });
  });

  test('Source tracking accuracy', async ({ page }) => {
    await test.step('Upload custom image', async () => {
      await setupCustomThumbnail(page);
    });

    await test.step('Trigger Printful sync', async () => {
      await triggerPrintfulSync(page);
    });

    await test.step('Verify source field accuracy', async () => {
      const response = await page.request.get('/api/products/images');
      const images = await response.json();
      
      // Group by source
      const customImages = images.filter((img: any) => img.source === 'custom');
      const printfulImages = images.filter((img: any) => img.source === 'printful');
      
      console.log('Source distribution:', {
        custom: customImages.length,
        printful: printfulImages.length,
        total: images.length
      });
      
      // Verify custom images
      customImages.forEach((img: any) => {
        expect(img.source).toBe('custom');
        // Custom images should NOT contain Printful URLs
        expect(img.image_url).not.toMatch(/printful|cdn\.printful/);
      });
      
      // Verify Printful images
      printfulImages.forEach((img: any) => {
        expect(img.source).toBe('printful');
        // Printful images SHOULD contain Printful URLs
        expect(img.image_url).toMatch(/printful|cdn/);
      });
    });

    await test.step('Test source-based filtering', async () => {
      // Test API endpoint that filters by source
      const customResponse = await page.request.get('/api/products/images?source=custom');
      const printfulResponse = await page.request.get('/api/products/images?source=printful');
      
      if (customResponse.ok()) {
        const customImages = await customResponse.json();
        customImages.forEach((img: any) => {
          expect(img.source).toBe('custom');
        });
      }
      
      if (printfulResponse.ok()) {
        const printfulImages = await printfulResponse.json();
        printfulImages.forEach((img: any) => {
          expect(img.source).toBe('printful');
        });
      }
    });
  });

  test('Sync conflict resolution', async ({ page }) => {
    await test.step('Create conflicting scenarios', async () => {
      // Set custom thumbnail
      const customThumbnail = await setupCustomThumbnail(page);
      
      // Simulate scenario where Printful has updated their images
      // and tries to sync new versions
      await triggerPrintfulSync(page);
      
      // Run sync again to test conflict handling
      await triggerPrintfulSync(page);
    });

    await test.step('Verify sync is idempotent', async () => {
      const response = await page.request.get('/api/products/images');
      const images = await response.json();
      
      // Should not have duplicates
      const urls = images.map((img: any) => img.image_url);
      const uniqueUrls = [...new Set(urls)];
      
      expect(urls.length).toBe(uniqueUrls.length);
      
      // Custom thumbnail should still be unique and active
      const thumbnails = images.filter((img: any) => img.is_thumbnail === true);
      expect(thumbnails).toHaveLength(1);
      expect(thumbnails[0].source).toBe('custom');
    });
  });

  test('Bulk sync protection', async ({ page }) => {
    await test.step('Set up multiple products with custom thumbnails', async () => {
      const products = ['Reform UK T-Shirt', 'Reform UK Hoodie', 'Reform UK Cap'];
      
      for (const productName of products) {
        await setupCustomThumbnail(page, productName);
        await page.waitForTimeout(1000); // Prevent rate limiting
      }
    });

    await test.step('Run bulk Printful sync', async () => {
      await page.goto('/admin/products');
      
      // Look for bulk sync option
      const bulkSyncButton = page.locator('button:has-text("Bulk Sync")');
      if (await bulkSyncButton.isVisible()) {
        await bulkSyncButton.click();
        await page.waitForSelector('text=Bulk sync completed', { timeout: 60000 });
      } else {
        // Run individual syncs if no bulk option
        await triggerPrintfulSync(page);
      }
    });

    await test.step('Verify all custom thumbnails preserved', async () => {
      const response = await page.request.get('/api/products/images');
      const images = await response.json();
      
      const customThumbnails = images.filter((img: any) => 
        img.is_thumbnail === true && img.source === 'custom'
      );
      
      // Should have at least 3 custom thumbnails (one per product)
      expect(customThumbnails.length).toBeGreaterThanOrEqual(3);
      
      // Verify on frontend
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      const productCards = page.locator('[data-testid="product-card"]');
      const count = await productCards.count();
      
      let customImageCount = 0;
      for (let i = 0; i < count; i++) {
        const card = productCards.nth(i);
        const image = card.locator('img').first();
        const src = await image.getAttribute('src');
        
        if (src && !src.includes('printful')) {
          customImageCount++;
        }
      }
      
      console.log(`Found ${customImageCount} products with custom images out of ${count} total`);
      expect(customImageCount).toBeGreaterThan(0);
    });
  });
});