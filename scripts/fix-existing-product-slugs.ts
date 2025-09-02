#!/usr/bin/env npx tsx

/**
 * Fix Existing Product Slugs Script
 * 
 * This script fixes the existing products in the remote database that have null slugs
 * instead of creating duplicate products.
 */

import { createClient } from '@supabase/supabase-js';

// Remote database credentials
const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw';

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

async function fixExistingProductSlugs() {
  try {
    console.log('🔧 Fixing existing product slugs...');

    // Fetch all products to see what we have
    const { data: allProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name, slug')
      .order('name');

    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError);
      return;
    }

    if (!allProducts || allProducts.length === 0) {
      console.log('ℹ️ No products found in database');
      return;
    }

    console.log(`📦 Found ${allProducts.length} products:`);
    allProducts.forEach((p, i) => {
      console.log(`  ${i + 1}. "${p.name}" - slug: ${p.slug || 'NULL'}`);
    });

    // Find products that need slug fixes (null slugs or duplicate slugs)
    const productsNeedingFix = allProducts.filter(p => !p.slug || p.slug === null);
    
    console.log(`\n🔄 Products needing slug fixes: ${productsNeedingFix.length}`);

    if (productsNeedingFix.length === 0) {
      console.log('✅ All products already have proper slugs!');
      return;
    }

    // Generate slugs and check for conflicts
    const slugUpdates = [];
    const usedSlugs = new Set(allProducts.filter(p => p.slug).map(p => p.slug));

    for (const product of productsNeedingFix) {
      let baseSlug = generateSlug(product.name);
      let finalSlug = baseSlug;
      let counter = 1;
      
      // Handle potential conflicts
      while (usedSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      usedSlugs.add(finalSlug);
      slugUpdates.push({
        id: product.id,
        name: product.name,
        oldSlug: product.slug,
        newSlug: finalSlug
      });
    }

    // Apply updates
    console.log('\\n🚀 Applying slug updates...');
    for (const update of slugUpdates) {
      try {
        const { error: updateError } = await supabase
          .from('products')
          .update({ slug: update.newSlug })
          .eq('id', update.id);

        if (updateError) {
          console.error(`❌ Failed to update ${update.name}:`, updateError);
        } else {
          console.log(`✅ "${update.name}": ${update.oldSlug || 'NULL'} → "${update.newSlug}"`);
        }
      } catch (err) {
        console.error(`❌ Exception updating ${update.name}:`, err);
      }
    }

    // Remove duplicate products if we accidentally created any
    console.log('\\n🧹 Checking for and removing duplicates...');
    
    const { data: updatedProducts, error: finalFetchError } = await supabase
      .from('products')
      .select('id, name, slug')
      .order('created_at');

    if (finalFetchError) {
      console.error('❌ Error fetching updated products:', finalFetchError);
    } else {
      // Group by slug to find duplicates
      const slugGroups: Record<string, any[]> = {};
      updatedProducts?.forEach(product => {
        if (product.slug) {
          if (!slugGroups[product.slug]) {
            slugGroups[product.slug] = [];
          }
          slugGroups[product.slug].push(product);
        }
      });

      // Remove duplicates (keep oldest)
      for (const [slug, products] of Object.entries(slugGroups)) {
        if (products.length > 1) {
          console.log(`🔍 Found ${products.length} products with slug "${slug}"`);
          products.forEach(p => console.log(`  - "${p.name}" (id: ${p.id})`));
          
          // Keep the first (oldest) product, delete the rest
          const toDelete = products.slice(1);
          for (const product of toDelete) {
            console.log(`🗑️ Deleting duplicate: "${product.name}" (${product.id})`);
            const { error: deleteError } = await supabase
              .from('products')
              .delete()
              .eq('id', product.id);
              
            if (deleteError) {
              console.error(`❌ Failed to delete duplicate:`, deleteError);
            } else {
              console.log(`✅ Deleted duplicate product`);
            }
          }
        }
      }
    }

    console.log('\\n🎉 Product slug fix completed!');

  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
}

// Run the script
fixExistingProductSlugs()
  .then(() => {
    console.log('\\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });