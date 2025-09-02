#!/usr/bin/env ts-node

/**
 * Custom Image Data Validation Script
 * 
 * Comprehensive validation of the custom image system:
 * - Database integrity checks
 * - Image URL accessibility
 * - Thumbnail uniqueness validation
 * - Source tracking verification
 * - Storage organization audit
 * - Performance metrics collection
 * - Orphaned data detection
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';

// Load environment variables
config();

interface ValidationResult {
  timestamp: string;
  totalProducts: number;
  totalImages: number;
  customImages: number;
  printfulImages: number;
  issues: ValidationIssue[];
  metrics: PerformanceMetrics;
  summary: ValidationSummary;
}

interface ValidationIssue {
  type: 'ERROR' | 'WARNING' | 'INFO';
  category: 'DATABASE' | 'STORAGE' | 'PERFORMANCE' | 'INTEGRITY';
  description: string;
  details: any;
  productId?: string;
  imageId?: string;
}

interface PerformanceMetrics {
  avgImageLoadTime: number;
  largestImageSize: number;
  totalStorageUsed: number;
  slowestLoadingImages: Array<{url: string, loadTime: number}>;
}

interface ValidationSummary {
  productsWithoutImages: number;
  productsWithCustomThumbnails: number;
  duplicateThumbnails: number;
  brokenImageUrls: number;
  orphanedImages: number;
  storageHealthScore: number;
}

class CustomImageValidator {
  private supabase: any;
  private issues: ValidationIssue[] = [];

  constructor() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log('🔍 Custom Image Validator initialized');
    console.log(`📊 Connecting to: ${supabaseUrl}`);
  }

  private addIssue(type: 'ERROR' | 'WARNING' | 'INFO', category: string, description: string, details: any = null, productId?: string, imageId?: string) {
    this.issues.push({
      type,
      category: category as any,
      description,
      details,
      productId,
      imageId
    });
  }

  private async testImageAccessibility(url: string): Promise<{accessible: boolean, loadTime: number, size: number}> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const loadTime = Date.now() - startTime;
      
      if (response.ok) {
        const contentLength = response.headers.get('content-length');
        const size = contentLength ? parseInt(contentLength) : 0;
        
        return { accessible: true, loadTime, size };
      } else {
        return { accessible: false, loadTime, size: 0 };
      }
    } catch (error) {
      const loadTime = Date.now() - startTime;
      return { accessible: false, loadTime, size: 0 };
    }
  }

  async validateDatabaseIntegrity(): Promise<void> {
    console.log('🔍 Validating database integrity...');

    // Check all products have valid image URLs
    const { data: productsWithoutImages, error: productsError } = await this.supabase
      .from('products')
      .select('id, name, image_url')
      .is('image_url', null);

    if (productsError) {
      this.addIssue('ERROR', 'DATABASE', 'Failed to query products without images', productsError);
    } else if (productsWithoutImages && productsWithoutImages.length > 0) {
      this.addIssue('WARNING', 'DATABASE', `${productsWithoutImages.length} products have no image_url`, productsWithoutImages);
    }

    // Check thumbnail uniqueness per product
    const { data: thumbnailData, error: thumbnailError } = await this.supabase
      .from('product_images')
      .select('product_id, COUNT(*) as thumbnail_count')
      .eq('is_thumbnail', true)
      .group('product_id')
      .having('COUNT(*) > 1');

    if (thumbnailError) {
      this.addIssue('ERROR', 'DATABASE', 'Failed to check thumbnail uniqueness', thumbnailError);
    } else if (thumbnailData && thumbnailData.length > 0) {
      this.addIssue('ERROR', 'INTEGRITY', `${thumbnailData.length} products have multiple thumbnails`, thumbnailData);
    }

    // Verify image sources are tagged
    const { data: untaggedImages, error: sourceError } = await this.supabase
      .from('product_images')
      .select('id, image_url, product_id')
      .is('source', null);

    if (sourceError) {
      this.addIssue('ERROR', 'DATABASE', 'Failed to check image sources', sourceError);
    } else if (untaggedImages && untaggedImages.length > 0) {
      this.addIssue('WARNING', 'INTEGRITY', `${untaggedImages.length} images have no source tag`, untaggedImages);
    }

    // Check for orphaned images
    const { data: orphanedImages, error: orphanError } = await this.supabase
      .from('product_images')
      .select('id, image_url')
      .is('product_id', null);

    if (orphanError) {
      this.addIssue('ERROR', 'DATABASE', 'Failed to check for orphaned images', orphanError);
    } else if (orphanedImages && orphanedImages.length > 0) {
      this.addIssue('WARNING', 'INTEGRITY', `${orphanedImages.length} orphaned images found`, orphanedImages);
    }

    // Validate foreign key relationships
    const { data: invalidRefs, error: refError } = await this.supabase
      .from('product_images')
      .select(`
        id,
        product_id,
        products!inner(id)
      `)
      .is('products.id', null);

    if (refError) {
      this.addIssue('WARNING', 'DATABASE', 'Could not validate foreign key relationships', refError);
    } else if (invalidRefs && invalidRefs.length > 0) {
      this.addIssue('ERROR', 'INTEGRITY', `${invalidRefs.length} images reference non-existent products`, invalidRefs);
    }

    console.log('✅ Database integrity validation complete');
  }

  async validateImageAccessibility(): Promise<PerformanceMetrics> {
    console.log('🔍 Validating image accessibility and performance...');

    const { data: images, error } = await this.supabase
      .from('product_images')
      .select('id, image_url, product_id, source')
      .not('image_url', 'is', null);

    if (error) {
      this.addIssue('ERROR', 'DATABASE', 'Failed to fetch images for accessibility test', error);
      return { avgImageLoadTime: 0, largestImageSize: 0, totalStorageUsed: 0, slowestLoadingImages: [] };
    }

    const accessibilityResults: Array<{url: string, accessible: boolean, loadTime: number, size: number}> = [];
    const brokenImages: string[] = [];
    let totalLoadTime = 0;
    let totalSize = 0;
    let largestImageSize = 0;

    console.log(`📊 Testing accessibility of ${images.length} images...`);

    // Test each image in batches to avoid overwhelming the server
    const batchSize = 10;
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (image) => {
        const result = await this.testImageAccessibility(image.image_url);
        
        accessibilityResults.push({
          url: image.image_url,
          ...result
        });

        if (!result.accessible) {
          brokenImages.push(image.image_url);
          this.addIssue('ERROR', 'STORAGE', 'Broken image URL', { 
            url: image.image_url, 
            imageId: image.id,
            productId: image.product_id 
          });
        }

        totalLoadTime += result.loadTime;
        totalSize += result.size;
        largestImageSize = Math.max(largestImageSize, result.size);

        return result;
      });

      await Promise.all(batchPromises);
      
      // Progress update
      console.log(`📈 Tested ${Math.min(i + batchSize, images.length)}/${images.length} images`);
    }

    const avgImageLoadTime = images.length > 0 ? totalLoadTime / images.length : 0;
    const slowestLoadingImages = accessibilityResults
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 5)
      .map(r => ({ url: r.url, loadTime: r.loadTime }));

    // Report performance issues
    if (avgImageLoadTime > 2000) {
      this.addIssue('WARNING', 'PERFORMANCE', `Average image load time is slow: ${avgImageLoadTime.toFixed(0)}ms`, null);
    }

    if (brokenImages.length > 0) {
      this.addIssue('ERROR', 'STORAGE', `${brokenImages.length} images are not accessible`, brokenImages);
    }

    console.log('✅ Image accessibility validation complete');

    return {
      avgImageLoadTime,
      largestImageSize,
      totalStorageUsed: totalSize,
      slowestLoadingImages
    };
  }

  async validateCustomImagePriority(): Promise<void> {
    console.log('🔍 Validating custom image prioritization...');

    // Check products that should prioritize custom thumbnails
    const { data: products, error: productsError } = await this.supabase
      .from('products')
      .select(`
        id,
        name,
        image_url,
        product_images!inner(id, image_url, is_thumbnail, source)
      `)
      .eq('product_images.is_thumbnail', true);

    if (productsError) {
      this.addIssue('ERROR', 'DATABASE', 'Failed to query products with thumbnails', productsError);
      return;
    }

    for (const product of products || []) {
      const thumbnailImage = product.product_images[0];
      
      // Check if product image_url matches the thumbnail
      if (product.image_url !== thumbnailImage.image_url) {
        this.addIssue('WARNING', 'INTEGRITY', 
          'Product image_url does not match thumbnail image_url', 
          { 
            productId: product.id,
            productName: product.name,
            productImageUrl: product.image_url,
            thumbnailImageUrl: thumbnailImage.image_url
          }
        );
      }

      // Prefer custom thumbnails over Printful ones
      if (thumbnailImage.source === 'printful') {
        // Check if there are custom images that could be thumbnails instead
        const { data: customImages, error: customError } = await this.supabase
          .from('product_images')
          .select('id, image_url')
          .eq('product_id', product.id)
          .eq('source', 'custom');

        if (!customError && customImages && customImages.length > 0) {
          this.addIssue('WARNING', 'INTEGRITY',
            'Product uses Printful thumbnail but has custom images available',
            {
              productId: product.id,
              productName: product.name,
              customImageCount: customImages.length
            }
          );
        }
      }
    }

    console.log('✅ Custom image priority validation complete');
  }

  async validateStorageOrganization(): Promise<void> {
    console.log('🔍 Validating storage organization...');

    const { data: images, error } = await this.supabase
      .from('product_images')
      .select('id, image_url, product_id, source, created_at')
      .not('image_url', 'is', null);

    if (error) {
      this.addIssue('ERROR', 'DATABASE', 'Failed to fetch images for storage validation', error);
      return;
    }

    // Analyze storage patterns
    const storagePatterns = {
      supabaseStorage: 0,
      printfulCdn: 0,
      otherSources: 0,
      properlyOrganized: 0
    };

    const pathIssues: string[] = [];

    for (const image of images || []) {
      const url = image.image_url;
      
      if (url.includes('supabase') && url.includes('storage')) {
        storagePatterns.supabaseStorage++;
        
        // Check if path follows expected pattern: /storage/v1/object/public/product-images/...
        if (url.includes('/product-images/')) {
          storagePatterns.properlyOrganized++;
        } else {
          pathIssues.push(url);
        }
      } else if (url.includes('printful') || url.includes('cdn')) {
        storagePatterns.printfulCdn++;
        
        // Verify source tag matches
        if (image.source !== 'printful') {
          this.addIssue('WARNING', 'INTEGRITY',
            'Image from Printful CDN but source is not marked as "printful"',
            { imageId: image.id, url: image.image_url, source: image.source }
          );
        }
      } else {
        storagePatterns.otherSources++;
        this.addIssue('INFO', 'STORAGE',
          'Image stored in unexpected location',
          { imageId: image.id, url: image.image_url }
        );
      }
    }

    if (pathIssues.length > 0) {
      this.addIssue('WARNING', 'STORAGE',
        `${pathIssues.length} images stored in unexpected Supabase storage paths`,
        pathIssues
      );
    }

    // Report storage distribution
    this.addIssue('INFO', 'STORAGE', 'Storage distribution analysis', storagePatterns);

    console.log('✅ Storage organization validation complete');
  }

  async generateValidationReport(): Promise<ValidationResult> {
    console.log('📊 Generating comprehensive validation report...');

    const startTime = Date.now();

    // Get basic statistics
    const [productsResult, imagesResult] = await Promise.all([
      this.supabase.from('products').select('id', { count: 'exact' }),
      this.supabase.from('product_images').select('id, source', { count: 'exact' })
    ]);

    const totalProducts = productsResult.count || 0;
    const totalImages = imagesResult.count || 0;
    
    const customImages = imagesResult.data?.filter((img: any) => img.source === 'custom').length || 0;
    const printfulImages = imagesResult.data?.filter((img: any) => img.source === 'printful').length || 0;

    // Run all validations
    await this.validateDatabaseIntegrity();
    const metrics = await this.validateImageAccessibility();
    await this.validateCustomImagePriority();
    await this.validateStorageOrganization();

    // Calculate summary statistics
    const summary: ValidationSummary = {
      productsWithoutImages: this.issues.filter(i => i.description.includes('no image_url')).length,
      productsWithCustomThumbnails: customImages,
      duplicateThumbnails: this.issues.filter(i => i.description.includes('multiple thumbnails')).length,
      brokenImageUrls: this.issues.filter(i => i.description === 'Broken image URL').length,
      orphanedImages: this.issues.filter(i => i.description.includes('orphaned images')).length,
      storageHealthScore: this.calculateStorageHealthScore()
    };

    const executionTime = Date.now() - startTime;
    console.log(`⏱️ Validation completed in ${executionTime}ms`);

    return {
      timestamp: new Date().toISOString(),
      totalProducts,
      totalImages,
      customImages,
      printfulImages,
      issues: this.issues,
      metrics,
      summary
    };
  }

  private calculateStorageHealthScore(): number {
    const totalIssues = this.issues.length;
    const criticalIssues = this.issues.filter(i => i.type === 'ERROR').length;
    const warningIssues = this.issues.filter(i => i.type === 'WARNING').length;

    if (totalIssues === 0) return 100;

    // Score based on issue severity
    const score = Math.max(0, 100 - (criticalIssues * 20) - (warningIssues * 5));
    return Math.round(score);
  }

  async saveReport(result: ValidationResult, outputPath?: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = outputPath || `custom-image-validation-${timestamp}.json`;
    
    try {
      await fs.writeFile(filename, JSON.stringify(result, null, 2));
      console.log(`📁 Report saved to: ${filename}`);
    } catch (error) {
      console.error('❌ Failed to save report:', error);
    }
  }

  printSummary(result: ValidationResult): void {
    console.log('\n' + '='.repeat(60));
    console.log('📋 CUSTOM IMAGE VALIDATION SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`📊 Total Products: ${result.totalProducts}`);
    console.log(`🖼️  Total Images: ${result.totalImages}`);
    console.log(`🎨 Custom Images: ${result.customImages}`);
    console.log(`📦 Printful Images: ${result.printfulImages}`);
    console.log(`🏥 Storage Health Score: ${result.summary.storageHealthScore}/100`);
    
    console.log('\n📈 PERFORMANCE METRICS');
    console.log(`⏱️  Average Image Load Time: ${result.metrics.avgImageLoadTime.toFixed(0)}ms`);
    console.log(`📏 Largest Image Size: ${(result.metrics.largestImageSize / (1024 * 1024)).toFixed(2)}MB`);
    console.log(`💾 Total Storage Used: ${(result.metrics.totalStorageUsed / (1024 * 1024)).toFixed(2)}MB`);
    
    console.log('\n🔍 ISSUES FOUND');
    const errorCount = result.issues.filter(i => i.type === 'ERROR').length;
    const warningCount = result.issues.filter(i => i.type === 'WARNING').length;
    const infoCount = result.issues.filter(i => i.type === 'INFO').length;
    
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`⚠️  Warnings: ${warningCount}`);
    console.log(`ℹ️  Info: ${infoCount}`);
    
    if (errorCount > 0) {
      console.log('\n🚨 CRITICAL ERRORS');
      result.issues
        .filter(i => i.type === 'ERROR')
        .slice(0, 5) // Show first 5 errors
        .forEach(issue => {
          console.log(`❌ [${issue.category}] ${issue.description}`);
        });
      
      if (errorCount > 5) {
        console.log(`... and ${errorCount - 5} more errors`);
      }
    }
    
    console.log('\n📊 SUMMARY STATISTICS');
    console.log(`🚫 Products without images: ${result.summary.productsWithoutImages}`);
    console.log(`🎨 Products with custom thumbnails: ${result.summary.productsWithCustomThumbnails}`);
    console.log(`⚠️  Duplicate thumbnails: ${result.summary.duplicateThumbnails}`);
    console.log(`🔗 Broken image URLs: ${result.summary.brokenImageUrls}`);
    console.log(`👻 Orphaned images: ${result.summary.orphanedImages}`);
    
    // Overall assessment
    console.log('\n🎯 OVERALL ASSESSMENT');
    if (result.summary.storageHealthScore >= 90) {
      console.log('✅ EXCELLENT - Custom image system is in great shape!');
    } else if (result.summary.storageHealthScore >= 70) {
      console.log('🟡 GOOD - Minor issues found, but system is functional');
    } else if (result.summary.storageHealthScore >= 50) {
      console.log('🟠 FAIR - Several issues need attention');
    } else {
      console.log('🔴 POOR - Critical issues require immediate attention');
    }
    
    console.log('='.repeat(60));
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Custom Image Data Validation');
  console.log('📅 Timestamp:', new Date().toISOString());
  
  const validator = new CustomImageValidator();
  
  try {
    const result = await validator.generateValidationReport();
    
    validator.printSummary(result);
    await validator.saveReport(result);
    
    // Exit with error code if critical issues found
    const criticalIssues = result.issues.filter(i => i.type === 'ERROR').length;
    if (criticalIssues > 0) {
      console.log(`\n⚠️  Exiting with error code due to ${criticalIssues} critical issues`);
      process.exit(1);
    } else {
      console.log('\n✅ Validation completed successfully - no critical issues found');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('💥 Validation failed with error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { CustomImageValidator, ValidationResult, ValidationIssue };