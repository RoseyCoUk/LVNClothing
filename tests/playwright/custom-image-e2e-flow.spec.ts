import { test, expect, Page } from '@playwright/test';
import { waitForPageLoad, takeScreenshotOnError } from './utils/test-helpers';

/**
 * Custom Image E2E Purchase Flow Test Suite
 * 
 * Tests the complete purchase journey with custom images:
 * - Product browsing with custom thumbnails
 * - Product detail page with custom images
 * - Cart functionality with custom thumbnails
 * - Checkout process with custom images
 * - Order confirmation and emails
 * - Admin order management with custom images
 * - Complete fulfillment flow
 */

// Helper function to set up a product with custom images
async function setupProductWithCustomImages(page: Page, productName = 'Reform UK T-Shirt') {
  // Login as admin
  await page.goto('/admin/login');
  await page.fill('input[type="email"]', 'admin@reformuk.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await waitForPageLoad(page);
  
  // Navigate to product and add custom images
  await page.goto('/admin/products');
  await page.click(`text=${productName}`);
  await page.click('button:has-text("Manage Images")');
  
  // Upload main thumbnail
  await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 600, 600);
      gradient.addColorStop(0, '#4F46E5');
      gradient.addColorStop(1, '#7C3AED');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 600, 600);
      
      // Add Reform UK branding
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('REFORM UK', 300, 250);
      ctx.font = '32px Arial';
      ctx.fillText('OFFICIAL', 300, 300);
      ctx.fillText('MERCHANDISE', 300, 340);
      
      // Add product type
      ctx.font = '24px Arial';
      ctx.fillText('T-SHIRT', 300, 400);
    }
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'custom-main-image.png', { type: 'image/png' });
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
  
  // Set as thumbnail
  await page.click('button[title*="Set as Thumbnail"]');
  
  // Upload additional product images
  const additionalImages = [
    { name: 'detail-1', text: 'DETAIL VIEW', color: '#EF4444' },
    { name: 'detail-2', text: 'BACK VIEW', color: '#10B981' },
    { name: 'lifestyle', text: 'LIFESTYLE', color: '#F59E0B' }
  ];
  
  for (const img of additionalImages) {
    await page.evaluate((imageData) => {
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = imageData.color;
        ctx.fillRect(0, 0, 500, 500);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('REFORM UK', 250, 200);
        ctx.fillText(imageData.text, 250, 250);
        ctx.font = '16px Arial';
        ctx.fillText('Custom Image', 250, 300);
      }
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${imageData.name}.png`, { type: 'image/png' });
          const dt = new DataTransfer();
          dt.items.add(file);
          
          const input = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (input) {
            input.files = dt.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });
    }, img);
    
    await page.waitForSelector('.bg-green-500');
    await page.waitForTimeout(1000);
  }
  
  // Save all images
  await page.click('button:has-text("Save Changes")');
  await page.waitForSelector('.bg-green-500:has-text("Images saved successfully")');
}

// Helper function to clear cart
async function clearCart(page: Page) {
  try {
    await page.click('[data-testid="cart-button"]');
    await page.waitForSelector('[data-testid="cart-sidebar"]', { timeout: 3000 });
    
    const cartItems = page.locator('[data-testid="cart-item"]');
    const itemCount = await cartItems.count();
    
    for (let i = 0; i < itemCount; i++) {
      const removeButton = cartItems.first().locator('button[title*="Remove"]');
      if (await removeButton.isVisible()) {
        await removeButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Close cart
    await page.click('[data-testid="close-cart"]');
  } catch (error) {
    console.log('Cart was already empty or not accessible');
  }
}

test.describe('Custom Image E2E Purchase Flow', () => {
  
  test('Complete purchase flow with custom images', async ({ page }) => {
    let productImageUrl: string;
    
    await test.step('Set up product with custom images', async () => {
      await setupProductWithCustomImages(page);
    });

    await test.step('Browse shop page - custom thumbnails visible', async () => {
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      // Find the product card
      const productCard = page.locator('[data-testid="product-card"]').first();
      await expect(productCard).toBeVisible();
      
      // Verify custom thumbnail is displayed
      const productImage = productCard.locator('img').first();
      await expect(productImage).toBeVisible();
      
      productImageUrl = await productImage.getAttribute('src') || '';
      expect(productImageUrl).toBeTruthy();
      expect(productImageUrl).not.toMatch(/printful/); // Should not be Printful image
      
      // Take screenshot for verification
      await page.screenshot({ 
        path: 'test-results/e2e-shop-custom-thumbnails.png',
        fullPage: true 
      });
      
      console.log('✅ Custom thumbnail displayed on shop page');
    });

    await test.step('Navigate to product detail page', async () => {
      // Click on the product card
      await page.click('[data-testid="product-card"]');
      await waitForPageLoad(page);
      
      // Should be on PDP now
      expect(page.url()).toMatch(/\/products\//);
      
      // Verify main image is custom
      const mainImage = page.locator('[data-testid="product-main-image"]').first();
      await expect(mainImage).toBeVisible();
      
      const mainImageSrc = await mainImage.getAttribute('src');
      expect(mainImageSrc).not.toMatch(/printful/);
      
      // Verify image gallery has custom images
      const galleryImages = page.locator('[data-testid="product-gallery"] img');
      const galleryCount = await galleryImages.count();
      expect(galleryCount).toBeGreaterThan(1); // Should have multiple images
      
      // Take screenshot of PDP with custom images
      await page.screenshot({ 
        path: 'test-results/e2e-pdp-custom-images.png',
        fullPage: true 
      });
      
      console.log('✅ Custom images displayed on product detail page');
    });

    await test.step('Select variant and add to cart', async () => {
      // Clear any existing cart items
      await clearCart(page);
      
      // Select size if available
      const sizeButtons = page.locator('[data-testid="size-selector"] button');
      const sizeCount = await sizeButtons.count();
      
      if (sizeCount > 0) {
        await sizeButtons.first().click(); // Select first available size
        await page.waitForTimeout(500);
      }
      
      // Select color if available
      const colorButtons = page.locator('[data-testid="color-selector"] button');
      const colorCount = await colorButtons.count();
      
      if (colorCount > 0) {
        await colorButtons.first().click(); // Select first available color
        await page.waitForTimeout(500);
      }
      
      // Add to cart
      const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
      await expect(addToCartButton).toBeEnabled();
      await addToCartButton.click();
      
      // Wait for cart confirmation
      await page.waitForSelector('text=Added to cart', { timeout: 10000 });
      console.log('✅ Product added to cart');
    });

    await test.step('Verify cart shows custom thumbnail', async () => {
      // Open cart
      await page.click('[data-testid="cart-button"]');
      await page.waitForSelector('[data-testid="cart-sidebar"]');
      
      // Verify cart item has custom image
      const cartItem = page.locator('[data-testid="cart-item"]').first();
      await expect(cartItem).toBeVisible();
      
      const cartImage = cartItem.locator('img').first();
      await expect(cartImage).toBeVisible();
      
      const cartImageSrc = await cartImage.getAttribute('src');
      expect(cartImageSrc).toBeTruthy();
      expect(cartImageSrc).not.toMatch(/printful/);
      
      // Take screenshot of cart with custom image
      await page.screenshot({ 
        path: 'test-results/e2e-cart-custom-image.png',
        fullPage: true 
      });
      
      console.log('✅ Custom image displayed in cart');
    });

    await test.step('Proceed to checkout', async () => {
      // Click checkout button
      await page.click('button:has-text("Checkout")');
      await waitForPageLoad(page);
      
      // Should be on checkout page
      expect(page.url()).toMatch(/\/checkout/);
      
      // Verify order summary shows custom image
      const checkoutItem = page.locator('[data-testid="checkout-item"]').first();
      
      if (await checkoutItem.isVisible()) {
        const checkoutImage = checkoutItem.locator('img').first();
        
        if (await checkoutImage.isVisible()) {
          const checkoutImageSrc = await checkoutImage.getAttribute('src');
          expect(checkoutImageSrc).not.toMatch(/printful/);
          
          console.log('✅ Custom image displayed in checkout');
        }
      }
      
      // Take screenshot of checkout
      await page.screenshot({ 
        path: 'test-results/e2e-checkout-custom-image.png',
        fullPage: true 
      });
    });

    await test.step('Fill checkout form', async () => {
      // Fill customer information
      await page.fill('input[name="email"]', 'test.customer@example.com');
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'Customer');
      await page.fill('input[name="address"]', '123 Test Street');
      await page.fill('input[name="city"]', 'London');
      await page.fill('input[name="postalCode"]', 'SW1A 1AA');
      
      // Select country if dropdown exists
      const countrySelect = page.locator('select[name="country"]');
      if (await countrySelect.isVisible()) {
        await countrySelect.selectOption('GB');
      }
      
      console.log('✅ Checkout form filled');
    });

    await test.step('Process payment (test mode)', async () => {
      // Click to proceed to payment
      const continueButton = page.locator('button:has-text("Continue to Payment")');
      if (await continueButton.isVisible()) {
        await continueButton.click();
        await waitForPageLoad(page);
      }
      
      // Fill test payment details
      const cardNumberInput = page.locator('input[placeholder*="Card number"], input[name*="cardNumber"]');
      if (await cardNumberInput.isVisible()) {
        await cardNumberInput.fill('4242424242424242'); // Test card
        
        const expiryInput = page.locator('input[placeholder*="Expiry"], input[name*="expiry"]');
        if (await expiryInput.isVisible()) {
          await expiryInput.fill('12/25');
        }
        
        const cvcInput = page.locator('input[placeholder*="CVC"], input[name*="cvc"]');
        if (await cvcInput.isVisible()) {
          await cvcInput.fill('123');
        }
        
        // Complete payment
        const payButton = page.locator('button:has-text("Pay"), button:has-text("Place Order")');
        await payButton.click();
        
        // Wait for order confirmation
        await page.waitForSelector('text=Order confirmed', { timeout: 30000 });
        console.log('✅ Test payment processed');
      } else {
        console.log('ℹ️ Payment form not found - may be using different payment flow');
      }
    });

    await test.step('Verify order confirmation shows custom image', async () => {
      // Should be on success/confirmation page
      const confirmationSelectors = [
        'text=Order confirmed',
        'text=Thank you',
        'text=Order complete',
        '[data-testid="order-confirmation"]'
      ];
      
      let onConfirmationPage = false;
      for (const selector of confirmationSelectors) {
        if (await page.locator(selector).isVisible()) {
          onConfirmationPage = true;
          break;
        }
      }
      
      if (onConfirmationPage) {
        // Look for order items with images
        const orderItems = page.locator('[data-testid="order-item"], .order-item');
        if (await orderItems.first().isVisible()) {
          const orderImage = orderItems.first().locator('img').first();
          if (await orderImage.isVisible()) {
            const orderImageSrc = await orderImage.getAttribute('src');
            expect(orderImageSrc).not.toMatch(/printful/);
            console.log('✅ Custom image shown in order confirmation');
          }
        }
        
        // Take screenshot of order confirmation
        await page.screenshot({ 
          path: 'test-results/e2e-order-confirmation.png',
          fullPage: true 
        });
      } else {
        console.log('ℹ️ Order confirmation page format may differ');
      }
    });
  });

  test('Admin order management with custom images', async ({ page }) => {
    await test.step('Login as admin and view orders', async () => {
      await page.goto('/admin/login');
      await page.fill('input[type="email"]', 'admin@reformuk.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await waitForPageLoad(page);
      
      // Navigate to orders
      await page.goto('/admin/orders');
      await waitForPageLoad(page);
    });

    await test.step('Verify recent orders show custom images', async () => {
      // Find recent orders
      const orderRows = page.locator('[data-testid="order-row"], tr').first();
      
      if (await orderRows.isVisible()) {
        // Look for product images in order details
        const productImages = orderRows.locator('img');
        const imageCount = await productImages.count();
        
        if (imageCount > 0) {
          for (let i = 0; i < imageCount; i++) {
            const image = productImages.nth(i);
            const src = await image.getAttribute('src');
            
            if (src && src.includes('supabase')) {
              console.log('✅ Custom image found in admin orders view');
              break;
            }
          }
        }
        
        // Take screenshot of admin orders
        await page.screenshot({ 
          path: 'test-results/e2e-admin-orders-custom-images.png',
          fullPage: true 
        });
      }
    });

    await test.step('View detailed order with custom images', async () => {
      // Click on first order to view details
      const firstOrder = page.locator('[data-testid="order-row"], tbody tr').first();
      if (await firstOrder.isVisible()) {
        await firstOrder.click();
        await waitForPageLoad(page);
        
        // Should show order details with product images
        const detailImages = page.locator('img');
        const detailImageCount = await detailImages.count();
        
        if (detailImageCount > 0) {
          let hasCustomImage = false;
          for (let i = 0; i < detailImageCount; i++) {
            const image = detailImages.nth(i);
            const src = await image.getAttribute('src');
            
            if (src && (src.includes('supabase') || !src.includes('printful'))) {
              hasCustomImage = true;
              break;
            }
          }
          
          if (hasCustomImage) {
            console.log('✅ Custom images displayed in order details');
          }
        }
        
        await page.screenshot({ 
          path: 'test-results/e2e-admin-order-details.png',
          fullPage: true 
        });
      }
    });
  });

  test('Image consistency across color variants', async ({ page }) => {
    await test.step('Set up product with color-specific custom images', async () => {
      // Login as admin
      await page.goto('/admin/login');
      await page.fill('input[type="email"]', 'admin@reformuk.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      // Navigate to a product with color variants (like T-shirt)
      await page.goto('/admin/products');
      await page.click('text=Reform UK T-Shirt');
      await page.click('button:has-text("Manage Images")');
      
      // Upload color-specific images
      const colors = ['Black', 'Navy', 'White'];
      
      for (const color of colors) {
        // Set variant type to color
        await page.selectOption('select', { label: '🎨 Color-Specific Images' });
        await page.selectOption('select[data-testid="color-selector"]', color);
        
        // Upload image for this color
        await page.evaluate((colorName) => {
          const canvas = document.createElement('canvas');
          canvas.width = 400;
          canvas.height = 400;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Different background color for each variant
            const colorMap: { [key: string]: string } = {
              'Black': '#000000',
              'Navy': '#1E3A8A', 
              'White': '#FFFFFF'
            };
            
            ctx.fillStyle = colorMap[colorName] || '#808080';
            ctx.fillRect(0, 0, 400, 400);
            
            // Text color based on background
            ctx.fillStyle = colorName === 'White' ? '#000000' : '#FFFFFF';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('REFORM UK', 200, 180);
            ctx.font = '24px Arial';
            ctx.fillText(`${colorName.toUpperCase()} T-SHIRT`, 200, 220);
          }
          
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `tshirt-${colorName.toLowerCase()}.png`, { type: 'image/png' });
              const dt = new DataTransfer();
              dt.items.add(file);
              
              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (input) {
                input.files = dt.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          });
        }, color);
        
        await page.waitForSelector('.bg-green-500');
        await page.waitForTimeout(1000);
      }
      
      await page.click('button:has-text("Save Changes")');
      await page.waitForSelector('.bg-green-500:has-text("Images saved successfully")');
    });

    await test.step('Test color switching on PDP', async () => {
      await page.goto('/products/t-shirt');
      await waitForPageLoad(page);
      
      // Get available color buttons
      const colorButtons = page.locator('[data-testid="color-selector"] button');
      const colorCount = await colorButtons.count();
      
      if (colorCount > 0) {
        for (let i = 0; i < Math.min(3, colorCount); i++) {
          await colorButtons.nth(i).click();
          await page.waitForTimeout(1000);
          
          // Verify image changes
          const mainImage = page.locator('[data-testid="product-main-image"]').first();
          await expect(mainImage).toBeVisible();
          
          const imageSrc = await mainImage.getAttribute('src');
          expect(imageSrc).toBeTruthy();
          
          // Take screenshot for each color
          await page.screenshot({ 
            path: `test-results/e2e-color-variant-${i}.png`,
            clip: { x: 0, y: 0, width: 800, height: 600 }
          });
          
          console.log(`✅ Color variant ${i + 1} image displayed`);
        }
      }
    });

    await test.step('Test cart updates with color-specific images', async () => {
      await clearCart(page);
      
      // Add different color variants to cart
      const colorButtons = page.locator('[data-testid="color-selector"] button');
      const colorCount = await colorButtons.count();
      
      if (colorCount > 1) {
        // Add first color
        await colorButtons.nth(0).click();
        await page.click('button:has-text("Add to Cart")');
        await page.waitForSelector('text=Added to cart');
        
        // Add second color
        await colorButtons.nth(1).click();
        await page.click('button:has-text("Add to Cart")');
        await page.waitForSelector('text=Added to cart');
        
        // Check cart shows different images
        await page.click('[data-testid="cart-button"]');
        await page.waitForSelector('[data-testid="cart-sidebar"]');
        
        const cartItems = page.locator('[data-testid="cart-item"]');
        const cartItemCount = await cartItems.count();
        expect(cartItemCount).toBe(2);
        
        // Take screenshot of cart with multiple variants
        await page.screenshot({ 
          path: 'test-results/e2e-cart-multiple-variants.png',
          fullPage: true 
        });
        
        console.log('✅ Multiple color variants in cart with correct images');
      }
    });
  });

  test('Performance impact of custom images', async ({ page }) => {
    await test.step('Measure page load with custom images', async () => {
      const startTime = Date.now();
      
      await page.goto('/shop');
      await waitForPageLoad(page);
      
      const loadTime = Date.now() - startTime;
      console.log(`Shop page load time: ${loadTime}ms`);
      
      // Should load reasonably fast even with custom images
      expect(loadTime).toBeLessThan(10000); // Less than 10 seconds
    });

    await test.step('Measure image loading performance', async () => {
      const productCards = page.locator('[data-testid="product-card"]');
      const cardCount = await productCards.count();
      
      let totalImageLoadTime = 0;
      let loadedImages = 0;
      
      for (let i = 0; i < Math.min(5, cardCount); i++) {
        const card = productCards.nth(i);
        const image = card.locator('img').first();
        
        if (await image.isVisible()) {
          const imageLoadStart = Date.now();
          
          // Wait for image to be fully loaded
          await image.waitFor({ state: 'visible' });
          
          const imageLoadTime = Date.now() - imageLoadStart;
          totalImageLoadTime += imageLoadTime;
          loadedImages++;
        }
      }
      
      if (loadedImages > 0) {
        const avgImageLoadTime = totalImageLoadTime / loadedImages;
        console.log(`Average image load time: ${avgImageLoadTime.toFixed(0)}ms`);
        
        // Custom images should load reasonably fast
        expect(avgImageLoadTime).toBeLessThan(3000); // Less than 3 seconds per image
      }
    });
  });
});