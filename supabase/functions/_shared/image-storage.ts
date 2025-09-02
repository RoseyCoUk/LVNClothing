// Image Storage Management for Supabase
// Downloads images from Printful and stores them in Supabase Storage

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export class ImageStorageManager {
  private supabase: any;
  private readonly bucketName = 'product-images';

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async ensureBucketExists(): Promise<void> {
    console.log('🪣 Ensuring product-images bucket exists...');
    
    const { data: buckets } = await this.supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket: any) => bucket.name === this.bucketName);
    
    if (!bucketExists) {
      console.log('📦 Creating product-images bucket...');
      const { error } = await this.supabase.storage.createBucket(this.bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB limit
      });
      
      if (error) {
        console.error('❌ Failed to create bucket:', error);
        throw new Error(`Failed to create storage bucket: ${error.message}`);
      }
      
      console.log('✅ Created product-images bucket');
    } else {
      console.log('✅ product-images bucket already exists');
    }
  }

  async downloadAndStoreImage(
    imageUrl: string, 
    fileName: string, 
    productCategory: string
  ): Promise<string> {
    try {
      console.log(`📸 Processing image: ${fileName}`);
      
      // Download the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }

      const imageData = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      // Create file path with category organization
      const filePath = `${productCategory}/${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, imageData, {
          contentType,
          upsert: true, // Overwrite if exists
        });

      if (error) {
        console.error(`❌ Failed to upload ${fileName}:`, error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      console.log(`✅ Stored image: ${fileName} -> ${publicUrl}`);
      
      return publicUrl;
    } catch (error) {
      console.error(`❌ Error processing image ${fileName}:`, error);
      throw error;
    }
  }

  generateFileName(productName: string, variantName: string, imageIndex: number = 0): string {
    // Create a clean filename from product and variant names
    const cleanProductName = productName
      .replace(/reform uk/gi, '')
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase();

    const cleanVariantName = variantName
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase();

    const timestamp = Date.now();
    const suffix = imageIndex > 0 ? `_${imageIndex}` : '';
    
    return `${cleanProductName}_${cleanVariantName}_${timestamp}${suffix}.webp`;
  }

  async cleanupOldImages(category?: string): Promise<void> {
    console.log(`🧹 Cleaning up old images${category ? ` in category: ${category}` : ''}...`);
    
    try {
      const prefix = category ? `${category}/` : '';
      const { data: files } = await this.supabase.storage
        .from(this.bucketName)
        .list(category || '', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (files && files.length > 0) {
        const filePaths = files.map((file: any) => 
          category ? `${category}/${file.name}` : file.name
        );

        const { error } = await this.supabase.storage
          .from(this.bucketName)
          .remove(filePaths);

        if (error) {
          console.error('❌ Error cleaning up images:', error);
        } else {
          console.log(`✅ Cleaned up ${filePaths.length} images`);
        }
      }
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      // Don't throw - cleanup failures shouldn't stop the sync
    }
  }

  // Helper to extract file extension from URL or content type
  private getFileExtension(url: string, contentType?: string): string {
    // Try to get extension from URL first
    const urlMatch = url.match(/\.(\w{3,4})(\?|$)/);
    if (urlMatch) {
      return urlMatch[1].toLowerCase();
    }

    // Fallback to content type
    if (contentType) {
      if (contentType.includes('jpeg')) return 'jpg';
      if (contentType.includes('png')) return 'png';
      if (contentType.includes('webp')) return 'webp';
    }

    // Default fallback
    return 'jpg';
  }
}