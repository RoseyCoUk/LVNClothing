#!/usr/bin/env npx tsx

/**
 * Fix Product Slugs Script
 * 
 * This script generates proper URL-friendly slugs for products that currently have
 * UUID slugs or missing slugs. This fixes the routing issue where product pages
 * show "Product Not Found" errors.
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables - using local dev database
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'; // Service role key for local dev

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to generate URL-friendly slug from product name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .trim();
}

// Check if string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

async function fixProductSlugs() {
  try {
    console.log('🔧 Starting product slug fix...');

    // Fetch all products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug');

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    if (!products || products.length === 0) {
      console.log('ℹ️ No products found in database');
      return;
    }

    console.log(`📦 Found ${products.length} products`);

    // Track changes
    const updates: Array<{ id: string; oldSlug: string | null; newSlug: string }> = [];

    // Process each product
    for (const product of products) {
      const needsUpdate = !product.slug || isUUID(product.slug) || product.slug === product.id;
      
      if (needsUpdate) {
        const newSlug = generateSlug(product.name);
        updates.push({
          id: product.id,
          oldSlug: product.slug,
          newSlug
        });
        
        console.log(`🔄 Will update "${product.name}": "${product.slug || 'null'}" → "${newSlug}"`);
      } else {
        console.log(`✅ "${product.name}": slug already good ("${product.slug}")`);
      }
    }

    if (updates.length === 0) {
      console.log('🎉 All product slugs are already correct!');
      return;
    }

    console.log(`\n🚀 Applying ${updates.length} updates...`);

    // Apply updates
    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      try {
        const { error: updateError } = await supabase
          .from('products')
          .update({ slug: update.newSlug })
          .eq('id', update.id);

        if (updateError) {
          console.error(`❌ Failed to update ${update.id}:`, updateError);
          errorCount++;
        } else {
          console.log(`✅ Updated product slug: "${update.oldSlug}" → "${update.newSlug}"`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception updating ${update.id}:`, err);
        errorCount++;
      }
    }

    console.log(`\n📊 Update Summary:`);
    console.log(`✅ Successful updates: ${successCount}`);
    console.log(`❌ Failed updates: ${errorCount}`);
    console.log(`📦 Total products processed: ${products.length}`);

    if (successCount > 0) {
      console.log('\n🎉 Product slugs have been fixed! Product pages should now work correctly.');
    }

  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
}

// Run the script
fixProductSlugs()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });