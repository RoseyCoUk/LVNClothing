import { test, expect, Page } from '@playwright/test';
import path from 'path';
import { waitForPageLoad, takeScreenshotOnError } from './utils/test-helpers';

/**
 * Custom Image Upload Test Suite
 * 
 * Tests the complete admin workflow for custom image uploads:
 * - Image upload validation
 * - Thumbnail designation 
 * - Storage management
 * - Database integration
 * - Admin UI functionality
 */

// Test data for images
const testImages = {
  validJpg: 'test-assets/product-test.jpg',
  validPng: 'test-assets/product-test.png', 
  invalidFormat: 'test-assets/invalid.txt',
  largeFile: 'test-assets/large-image.jpg', // > 50MB for testing limits
  smallFile: 'test-assets/small-image.png'
};

// Helper function to login as admin
async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login');
  await page.fill('input[type="email"]', 'admin@reformuk.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await waitForPageLoad(page);
  
  // Verify we're logged in
  await expect(page).toHaveURL(/.*admin.*/);
}

// Helper function to navigate to product editor
async function navigateToProductEditor(page: Page, productName = 'Reform UK T-Shirt') {
  await page.goto('/admin/products');
  await waitForPageLoad(page);
  
  // Find and click the product
  await page.click(`text=${productName}`);
  await waitForPageLoad(page);
  
  // Open image management modal
  await page.click('button:has-text("Manage Images")');
  await page.waitForSelector('.fixed.inset-0'); // Wait for modal
}

// Helper function to create test image files
async function createTestImages() {
  // This would normally create actual test files
  // For now, we'll assume they exist in test-assets/
  console.log('Test images should be available in test-assets/ directory');
}

test.describe('Admin Image Upload Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    await createTestImages();
    await loginAsAdmin(page);
  });

  test('Upload custom image and set as thumbnail', async ({ page }) => {
    await test.step('Navigate to product editor', async () => {
      await navigateToProductEditor(page);
    });

    await test.step('Upload custom image file', async () => {
      // Set up file input
      const fileInput = page.locator('input[type="file"]');
      
      // Create a test image blob
      const testImagePath = path.join(__dirname, '../', testImages.validJpg);
      
      try {
        await fileInput.setInputFiles(testImagePath);
      } catch (error) {
        // If test file doesn't exist, create a mock one
        console.log('Creating mock image file for testing...');
        
        // Create a simple test image using canvas
        await page.evaluate(() => {
          const canvas = document.createElement('canvas');
          canvas.width = 300;
          canvas.height = 300;
          const ctx = canvas.getContext('2d');
          
          // Draw a simple test pattern
          if (ctx) {
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(0, 0, 300, 300);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px Arial';
            ctx.fillText('TEST IMAGE', 100, 150);
          }
          
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'test-image.png', { type: 'image/png' });
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
      }
      
      // Wait for upload to complete
      await page.waitForSelector('.bg-green-500', { timeout: 10000 });
    });

    await test.step('Set image as thumbnail', async () => {
      // Find the uploaded image and click thumbnail button (Crown icon)
      await page.click('button[title*="Set as Thumbnail"]');
      
      // Verify thumbnail is set (purple background)
      await expect(page.locator('button.bg-purple-500')).toBeVisible();
    });

    await test.step('Save product', async () => {
      await page.click('button:has-text("Save Changes")');
      await page.waitForSelector('.bg-green-500:has-text("Images saved successfully")', { timeout: 15000 });
    });

    await test.step('Verify database has is_thumbnail = true', async () => {
      // Check database state (this would require API endpoint or direct DB query)
      const response = await page.request.get('/api/products/images');
      const images = await response.json();
      
      // Verify at least one image has is_thumbnail = true
      const thumbnailImage = images.find((img: any) => img.is_thumbnail === true);
      expect(thumbnailImage).toBeTruthy();
      expect(thumbnailImage.source).toBe('custom');
    });
  });

  test('Replace existing thumbnail', async ({ page }) => {
    await test.step('Navigate to product with existing thumbnail', async () => {
      await navigateToProductEditor(page);
    });

    await test.step('Upload new image', async () => {
      // Upload second test image
      await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#00FF00';
          ctx.fillRect(0, 0, 400, 400);
          ctx.fillStyle = '#000000';
          ctx.font = '24px Arial';
          ctx.fillText('NEW THUMBNAIL', 120, 200);
        }
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'new-thumbnail.png', { type: 'image/png' });
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
    });

    await test.step('Set new image as thumbnail', async () => {
      // Get all thumbnail buttons (should be multiple now)
      const thumbnailButtons = page.locator('button[title*="Set as Thumbnail"]');
      const count = await thumbnailButtons.count();
      
      // Click the last one (newly uploaded)
      await thumbnailButtons.nth(count - 1).click();
    });

    await test.step('Verify old thumbnail is_thumbnail = false', async () => {
      // Only one thumbnail button should be active (purple)
      const activeThumbnails = page.locator('button.bg-purple-500');
      await expect(activeThumbnails).toHaveCount(1);
    });

    await test.step('Save and verify new thumbnail', async () => {
      await page.click('button:has-text("Save Changes")');
      await page.waitForSelector('.bg-green-500:has-text("Images saved successfully")');
      
      // Verify in database that only one image has is_thumbnail = true
      const response = await page.request.get('/api/products/images');
      const images = await response.json();
      
      const thumbnailImages = images.filter((img: any) => img.is_thumbnail === true);
      expect(thumbnailImages).toHaveLength(1);
      expect(thumbnailImages[0].source).toBe('custom');
    });
  });

  test('Multiple images with one thumbnail', async ({ page }) => {
    await test.step('Upload 5 images', async () => {
      await navigateToProductEditor(page);
      
      for (let i = 0; i < 5; i++) {
        await page.evaluate((index) => {
          const canvas = document.createElement('canvas');
          canvas.width = 200;
          canvas.height = 200;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Different color for each image
            const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
            ctx.fillStyle = colors[index];
            ctx.fillRect(0, 0, 200, 200);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '16px Arial';
            ctx.fillText(`IMAGE ${index + 1}`, 60, 100);
          }
          
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `image-${index + 1}.png`, { type: 'image/png' });
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
        
        // Wait for each upload
        await page.waitForTimeout(1000);
      }
      
      await page.waitForSelector('.bg-green-500');
    });

    await test.step('Set image 3 as thumbnail', async () => {
      const thumbnailButtons = page.locator('button[title*="Set as Thumbnail"]');
      await thumbnailButtons.nth(2).click(); // Third image (index 2)
      
      // Verify only one is active
      await expect(page.locator('button.bg-purple-500')).toHaveCount(1);
    });

    await test.step('Verify only one is_thumbnail = true', async () => {
      await page.click('button:has-text("Save Changes")');
      await page.waitForSelector('.bg-green-500:has-text("Images saved successfully")');
      
      const response = await page.request.get('/api/products/images');
      const images = await response.json();
      
      const thumbnailImages = images.filter((img: any) => img.is_thumbnail === true);
      expect(thumbnailImages).toHaveLength(1);
    });

    await test.step('Change thumbnail to image 5', async () => {
      // Reopen modal if needed
      const thumbnailButtons = page.locator('button[title*="Set as Thumbnail"]');
      await thumbnailButtons.nth(4).click(); // Fifth image (index 4)
    });

    await test.step('Verify thumbnail changed correctly', async () => {
      // Only one thumbnail should be active
      await expect(page.locator('button.bg-purple-500')).toHaveCount(1);
      
      await page.click('button:has-text("Save Changes")');
      await page.waitForSelector('.bg-green-500:has-text("Images saved successfully")');
      
      const response = await page.request.get('/api/products/images');
      const images = await response.json();
      
      const thumbnailImages = images.filter((img: any) => img.is_thumbnail === true);
      expect(thumbnailImages).toHaveLength(1);
      // The last uploaded image should now be the thumbnail
    });
  });

  test('File format validation', async ({ page }) => {
    await navigateToProductEditor(page);

    await test.step('Test invalid file format rejection', async () => {
      // Try to upload a text file
      await page.evaluate(() => {
        const file = new File(['test content'], 'invalid.txt', { type: 'text/plain' });
        const dt = new DataTransfer();
        dt.items.add(file);
        
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      // Should show error message
      await expect(page.locator('text=Invalid file format')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Test valid image formats', async () => {
      // Test PNG
      await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#FF0000';
          ctx.fillRect(0, 0, 100, 100);
        }
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'test.png', { type: 'image/png' });
            const dt = new DataTransfer();
            dt.items.add(file);
            
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (input) {
              input.files = dt.files;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        }, 'image/png');
      });
      
      // Should show success
      await page.waitForSelector('.bg-green-500');
    });
  });

  test('File size limit enforcement', async ({ page }) => {
    await navigateToProductEditor(page);

    await test.step('Test file size limit (50MB)', async () => {
      // Create a large file (simulate)
      await page.evaluate(() => {
        // Create large array buffer to simulate big file
        const size = 51 * 1024 * 1024; // 51MB
        const buffer = new ArrayBuffer(size);
        const file = new File([buffer], 'large-image.jpg', { type: 'image/jpeg' });
        const dt = new DataTransfer();
        dt.items.add(file);
        
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      // Should show error message about file size
      await expect(page.locator('text=File too large')).toBeVisible({ timeout: 5000 });
    });
  });

  test('Concurrent image management', async ({ page, browser }) => {
    await test.step('Simulate concurrent admin sessions', async () => {
      // Create second browser context
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();
      
      // Login both sessions
      await loginAsAdmin(page);
      await loginAsAdmin(page2);
      
      // Both navigate to same product
      await navigateToProductEditor(page);
      await navigateToProductEditor(page2);
      
      // Both upload images simultaneously
      await Promise.all([
        page.evaluate(() => {
          const canvas = document.createElement('canvas');
          canvas.width = 100;
          canvas.height = 100;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(0, 0, 100, 100);
          }
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'admin1-image.png', { type: 'image/png' });
              const dt = new DataTransfer();
              dt.items.add(file);
              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (input) {
                input.files = dt.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          });
        }),
        page2.evaluate(() => {
          const canvas = document.createElement('canvas');
          canvas.width = 100;
          canvas.height = 100;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(0, 0, 100, 100);
          }
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'admin2-image.png', { type: 'image/png' });
              const dt = new DataTransfer();
              dt.items.add(file);
              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (input) {
                input.files = dt.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          });
        })
      ]);
      
      // Both set their images as thumbnail
      await page.click('button[title*="Set as Thumbnail"]:last-child');
      await page2.click('button[title*="Set as Thumbnail"]:last-child');
      
      // Both save
      await Promise.all([
        page.click('button:has-text("Save Changes")'),
        page2.click('button:has-text("Save Changes")')
      ]);
      
      // Verify data consistency (last write wins)
      await page.waitForTimeout(2000);
      const response = await page.request.get('/api/products/images');
      const images = await response.json();
      
      const thumbnailImages = images.filter((img: any) => img.is_thumbnail === true);
      expect(thumbnailImages).toHaveLength(1); // Only one thumbnail should exist
      
      await context2.close();
    });
  });
});