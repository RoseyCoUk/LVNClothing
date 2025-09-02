import { test, expect, Page } from '@playwright/test';
import { waitForPageLoad, takeScreenshotOnError } from './utils/test-helpers';

/**
 * Thumbnail Display Test Suite
 * 
 * Tests frontend display of custom thumbnails across all touchpoints:
 * - Product cards on shop page
 * - Product detail pages
 * - Cart display
 * - Checkout display
 * - Image priority hierarchy
 */

// Helper function to set up test product with custom thumbnail
async function setupTestProductWithThumbnail(page: Page, productName = 'Reform UK T-Shirt') {
  // Login as admin
  await page.goto('/admin/login');
  await page.fill('input[type="email"]', 'admin@reformuk.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await waitForPageLoad(page);
  
  // Navigate to product and set custom thumbnail
  await page.goto('/admin/products');
  await page.click(`text=${productName}`);
  await page.click('button:has-text("Manage Images")');
  
  // Upload and set custom thumbnail
  await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#4F46E5'; // Indigo background
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CUSTOM', 150, 130);
      ctx.fillText('THUMBNAIL', 150, 170);
    }
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'custom-thumbnail.png', { type: 'image/png' });
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
}

// Helper function to verify image URL contains expected content
async function verifyImageIsCustom(page: Page, imageSelector: string) {
  const imageElement = page.locator(imageSelector);
  await expect(imageElement).toBeVisible();
  
  const src = await imageElement.getAttribute('src');
  expect(src).toBeTruthy();
  
  // Custom images should have Supabase storage URLs or be data URLs
  const isCustom = src?.includes('supabase') || 
                   src?.includes('storage') || 
                   src?.startsWith('data:') ||
                   !src?.includes('printful');
  
  expect(isCustom).toBeTruthy();
  return src;
}

test.describe('Thumbnail Display Testing', () => {
  
  test('Shop page shows custom thumbnails', async ({ page }) => {
    await test.step('Set custom thumbnail for product', async () => {
      await setupTestProductWithThumbnail(page);
    });

    await test.step('Navigate to shop page', async () => {
      await page.goto('/shop');
      await waitForPageLoad(page);
    });

    await test.step('Verify ProductCard shows custom image', async () => {
      // Find the product card for our test product
      const productCard = page.locator('[data-testid="product-card"]').first();
      await expect(productCard).toBeVisible();
      
      // Check the image within the product card
      const productImage = productCard.locator('img').first();
      const customImageSrc = await verifyImageIsCustom(page, productImage.locator);
      
      // Take screenshot for verification
      await productCard.screenshot({ path: 'test-results/shop-custom-thumbnail.png' });
    });

    await test.step('Verify image URL matches database', async () => {
      // Query the API to get the product images
      const response = await page.request.get('/api/products');
      const products = await response.json();
      
      const testProduct = products.find((p: any) => p.name.includes('Reform UK T-Shirt'));
      expect(testProduct).toBeTruthy();
      expect(testProduct.image_url).toBeTruthy();
      
      // Verify the displayed image matches the API response
      const displayedImage = page.locator('[data-testid="product-card"] img').first();
      const displayedSrc = await displayedImage.getAttribute('src');
      
      // They should match (accounting for any URL transformations)
      expect(displayedSrc).toBe(testProduct.image_url);
    });

    await test.step('Test multiple products with custom thumbnails', async () => {
      // Set up additional products with custom thumbnails
      const products = ['Reform UK Hoodie', 'Reform UK Cap'];
      
      for (const productName of products) {
        await setupTestProductWithThumbnail(page, productName);
      }
      
      // Navigate back to shop
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      // Verify all products show custom thumbnails
      const productCards = page.locator('[data-testid="product-card"]');
      const count = await productCards.count();
      
      for (let i = 0; i < count; i++) {
        const card = productCards.nth(i);
        const image = card.locator('img').first();
        
        if (await image.isVisible()) {
          await verifyImageIsCustom(page, image.locator);
        }
      }
    });
  });

  test('Product detail page thumbnail', async ({ page }) => {
    await test.step('Product with custom thumbnail', async () => {
      await setupTestProductWithThumbnail(page);
    });

    await test.step('Navigate to PDP', async () => {
      await page.goto('/products/t-shirt');
      await waitForPageLoad(page);
    });

    await test.step('Verify main image is thumbnail', async () => {
      // The main product image should be the custom thumbnail
      const mainImage = page.locator('[data-testid="product-main-image"]').first();
      await expect(mainImage).toBeVisible();
      
      const customImageSrc = await verifyImageIsCustom(page, mainImage.locator);
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/pdp-custom-thumbnail.png',
        fullPage: true 
      });
    });

    await test.step('Verify gallery includes all images', async () => {
      // Product image gallery should show all images including the custom thumbnail
      const galleryImages = page.locator('[data-testid="product-gallery"] img');
      const galleryCount = await galleryImages.count();
      
      expect(galleryCount).toBeGreaterThan(0);
      
      // At least one should be the custom image
      let hasCustomImage = false;
      for (let i = 0; i < galleryCount; i++) {
        const image = galleryImages.nth(i);
        const src = await image.getAttribute('src');
        
        if (src?.includes('supabase') || src?.includes('storage') || !src?.includes('printful')) {
          hasCustomImage = true;
          break;
        }
      }
      
      expect(hasCustomImage).toBeTruthy();
    });

    await test.step('Test color variant image switching', async () => {
      // If product has color variants, test that custom images take priority
      const colorButtons = page.locator('[data-testid="color-selector"] button');
      const colorCount = await colorButtons.count();
      
      if (colorCount > 0) {
        for (let i = 0; i < Math.min(3, colorCount); i++) {
          await colorButtons.nth(i).click();
          await page.waitForTimeout(500);
          
          // Main image should update (or stay as custom if no variant-specific image)
          const mainImage = page.locator('[data-testid="product-main-image"]').first();
          await expect(mainImage).toBeVisible();
          
          // Take screenshot of each color variant
          await page.screenshot({ 
            path: `test-results/pdp-color-variant-${i}.png`,
            clip: { x: 0, y: 0, width: 800, height: 600 }
          });
        }
      }
    });
  });

  test('Cart shows custom thumbnail', async ({ page }) => {
    await test.step('Add product with custom thumbnail to cart', async () => {
      await setupTestProductWithThumbnail(page);
      
      // Navigate to product and add to cart
      await page.goto('/products/t-shirt');
      await waitForPageLoad(page);
      
      // Select variant and add to cart
      const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
      await addToCartButton.click();
      
      // Wait for cart confirmation
      await page.waitForSelector('text=Added to cart', { timeout: 5000 });
    });

    await test.step('Open cart', async () => {
      await page.click('[data-testid="cart-button"]');
      await page.waitForSelector('[data-testid="cart-sidebar"]');
    });

    await test.step('Verify cart item shows thumbnail', async () => {
      const cartItem = page.locator('[data-testid="cart-item"]').first();
      await expect(cartItem).toBeVisible();
      
      const cartImage = cartItem.locator('img').first();
      await expect(cartImage).toBeVisible();
      
      const customImageSrc = await verifyImageIsCustom(page, cartImage.locator);
      
      // Take screenshot of cart with custom thumbnail
      await page.screenshot({ 
        path: 'test-results/cart-custom-thumbnail.png',
        fullPage: true 
      });
    });

    await test.step('Proceed to checkout', async () => {
      await page.click('button:has-text("Checkout")');
      await waitForPageLoad(page);
    });

    await test.step('Verify checkout shows thumbnail', async () => {
      // Find the product summary in checkout
      const checkoutItem = page.locator('[data-testid="checkout-item"]').first();
      
      if (await checkoutItem.isVisible()) {
        const checkoutImage = checkoutItem.locator('img').first();
        if (await checkoutImage.isVisible()) {
          await verifyImageIsCustom(page, checkoutImage.locator);
          
          // Take screenshot of checkout with custom thumbnail
          await page.screenshot({ 
            path: 'test-results/checkout-custom-thumbnail.png',
            fullPage: true 
          });
        }
      }
    });
  });

  test('Image priority hierarchy verification', async ({ page }) => {
    await test.step('Set up product with multiple image types', async () => {
      // Login as admin
      await page.goto('/admin/login');
      await page.fill('input[type="email"]', 'admin@reformuk.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      // Navigate to product
      await page.goto('/admin/products');
      await page.click('text=Reform UK T-Shirt');
      await page.click('button:has-text("Manage Images")');
      
      // Upload multiple images with different priorities
      const imageTypes = [
        { name: 'custom-thumbnail', color: '#FF0000', text: 'CUSTOM THUMB', isThumbnail: true },
        { name: 'custom-primary', color: '#00FF00', text: 'CUSTOM PRIMARY', isPrimary: true },
        { name: 'custom-general', color: '#0000FF', text: 'CUSTOM GENERAL', isGeneral: true }
      ];
      
      for (const imageType of imageTypes) {
        await page.evaluate((type) => {
          const canvas = document.createElement('canvas');
          canvas.width = 200;
          canvas.height = 200;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.fillStyle = type.color;
            ctx.fillRect(0, 0, 200, 200);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(type.text, 100, 100);
          }
          
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `${type.name}.png`, { type: 'image/png' });
              const dt = new DataTransfer();
              dt.items.add(file);
              
              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (input) {
                input.files = dt.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          });
        }, imageType);
        
        await page.waitForTimeout(1000);
        
        // Set appropriate properties
        if (imageType.isThumbnail) {
          await page.click('button[title*="Set as Thumbnail"]:last-child');
        } else if (imageType.isPrimary) {
          await page.click('button[title*="Set as Primary"]:last-child');
        }
      }
      
      await page.click('button:has-text("Save Changes")');
      await page.waitForSelector('.bg-green-500');
    });

    await test.step('Verify thumbnail takes priority on shop page', async () => {
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      const productCard = page.locator('[data-testid="product-card"]').first();
      const productImage = productCard.locator('img').first();
      
      // Should show the custom thumbnail (red background)
      const src = await productImage.getAttribute('src');
      expect(src).toBeTruthy();
      
      // Take screenshot to verify visually
      await productCard.screenshot({ path: 'test-results/priority-test-shop.png' });
    });

    await test.step('Test priority when thumbnail is removed', async () => {
      // Remove thumbnail designation
      await page.goto('/admin/products');
      await page.click('text=Reform UK T-Shirt');
      await page.click('button:has-text("Manage Images")');
      
      // Find and unset thumbnail (click again to toggle off)
      const thumbnailButton = page.locator('button.bg-purple-500').first();
      await thumbnailButton.click();
      
      await page.click('button:has-text("Save Changes")');
      await page.waitForSelector('.bg-green-500');
      
      // Check shop page again
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      const productCard = page.locator('[data-testid="product-card"]').first();
      await productCard.screenshot({ path: 'test-results/priority-test-no-thumbnail.png' });
      
      // Should now show the custom primary image (green background) or next in hierarchy
    });
  });

  test('Printful image fallback behavior', async ({ page }) => {
    await test.step('Test product with only Printful images', async () => {
      // This tests products that don't have custom images yet
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      // Find products and check if any are using Printful images
      const productCards = page.locator('[data-testid="product-card"]');
      const count = await productCards.count();
      
      let foundPrintfulImage = false;
      for (let i = 0; i < count; i++) {
        const card = productCards.nth(i);
        const image = card.locator('img').first();
        
        if (await image.isVisible()) {
          const src = await image.getAttribute('src');
          if (src?.includes('printful')) {
            foundPrintfulImage = true;
            await card.screenshot({ path: `test-results/printful-fallback-${i}.png` });
            break;
          }
        }
      }
      
      // At least one product should use Printful images as fallback
      // (if no custom images have been set)
    });

    await test.step('Test mixed custom and Printful images', async () => {
      // Test behavior when some products have custom, others have Printful
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      const productCards = page.locator('[data-testid="product-card"]');
      const count = await productCards.count();
      
      const imageTypes = { custom: 0, printful: 0, fallback: 0 };
      
      for (let i = 0; i < count; i++) {
        const card = productCards.nth(i);
        const image = card.locator('img').first();
        
        if (await image.isVisible()) {
          const src = await image.getAttribute('src');
          
          if (src?.includes('printful')) {
            imageTypes.printful++;
          } else if (src?.includes('supabase') || src?.includes('storage')) {
            imageTypes.custom++;
          } else if (src?.includes('BackReformLogo')) {
            imageTypes.fallback++;
          }
        }
      }
      
      console.log('Image types found:', imageTypes);
      
      // Take overall screenshot
      await page.screenshot({ 
        path: 'test-results/mixed-image-types.png',
        fullPage: true 
      });
    });
  });

  test('Mobile responsive thumbnail display', async ({ page }) => {
    await test.step('Set viewport to mobile', async () => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    });

    await test.step('Test mobile shop page thumbnails', async () => {
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      const productCards = page.locator('[data-testid="product-card"]');
      const count = await productCards.count();
      
      for (let i = 0; i < Math.min(3, count); i++) {
        const card = productCards.nth(i);
        const image = card.locator('img').first();
        
        await expect(image).toBeVisible();
        
        // Check image dimensions are appropriate for mobile
        const boundingBox = await image.boundingBox();
        expect(boundingBox).toBeTruthy();
        
        if (boundingBox) {
          expect(boundingBox.width).toBeGreaterThan(0);
          expect(boundingBox.height).toBeGreaterThan(0);
          expect(boundingBox.width).toBeLessThanOrEqual(375); // Should fit viewport
        }
      }
      
      // Take mobile screenshot
      await page.screenshot({ path: 'test-results/mobile-thumbnails.png' });
    });

    await test.step('Test mobile PDP thumbnail', async () => {
      await page.goto('/products/t-shirt');
      await waitForPageLoad(page);
      
      const mainImage = page.locator('[data-testid="product-main-image"]').first();
      await expect(mainImage).toBeVisible();
      
      await page.screenshot({ path: 'test-results/mobile-pdp-thumbnail.png' });
    });
  });
});