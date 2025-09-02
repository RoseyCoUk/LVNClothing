#!/usr/bin/env tsx
/**
 * Cleanup Legacy Variants
 * 
 * Remove duplicate and legacy variants, keeping only the ones with real sync_variant_id values
 * from our Printful Store Sync API audit.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function loadValidSyncVariantIds(): Set<string> {
  const csvPath = '/Users/arnispiekus/Documents/Github/ReformUK/agents/artifacts/printful-variant-audit.csv';
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`❌ CSV file not found: ${csvPath}`);
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').slice(1); // Skip header
  const validIds = new Set<string>();
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const parts = line.split(',');
    if (parts.length >= 3) {
      const syncVariantId = parts[2].trim();
      if (syncVariantId && !isNaN(Number(syncVariantId))) {
        validIds.add(syncVariantId);
      }
    }
  }
  
  console.log(`📊 Loaded ${validIds.size} valid sync_variant_id values from CSV`);
  return validIds;
}

async function cleanupLegacyVariants() {
  console.log('🧹 Starting Legacy Variant Cleanup...\n');

  // Load valid sync variant IDs from our audit
  const validSyncIds = loadValidSyncVariantIds();
  
  // Get all variants from database
  const { data: allVariants, error: fetchError } = await supabase
    .from('product_variants')
    .select(`
      id,
      product_id,
      name,
      printful_variant_id,
      products (
        name,
        slug
      )
    `);

  if (fetchError) {
    console.error('❌ Error fetching variants:', fetchError);
    return;
  }

  console.log(`📦 Found ${allVariants.length} total variants in database`);

  // Identify legacy variants to remove
  const legacyVariants = allVariants.filter(v => {
    const id = v.printful_variant_id;
    
    // Keep variants with valid sync_variant_id from our audit
    if (id && validSyncIds.has(id)) {
      return false; // Keep this variant
    }
    
    // Remove variants with old hardcoded IDs or invalid IDs
    return true; // Remove this variant
  });

  const keepVariants = allVariants.filter(v => {
    const id = v.printful_variant_id;
    return id && validSyncIds.has(id);
  });

  console.log(`✅ Keeping ${keepVariants.length} variants with valid sync_variant_id`);
  console.log(`🗑️  Removing ${legacyVariants.length} legacy/invalid variants`);

  if (legacyVariants.length > 0) {
    console.log('\n📋 Legacy variants to remove:');
    const groupedLegacy = legacyVariants.reduce((acc, v) => {
      const productName = v.products?.name || 'Unknown';
      if (!acc[productName]) acc[productName] = [];
      acc[productName].push(`${v.printful_variant_id}: ${v.name}`);
      return acc;
    }, {} as Record<string, string[]>);

    for (const [productName, variants] of Object.entries(groupedLegacy)) {
      console.log(`  ${productName}: ${variants.length} variants`);
      variants.slice(0, 3).forEach(v => console.log(`    - ${v}`));
      if (variants.length > 3) {
        console.log(`    ... and ${variants.length - 3} more`);
      }
    }

    // Perform cleanup
    console.log('\n🗑️  Removing legacy variants...');
    const legacyIds = legacyVariants.map(v => v.id);
    
    const { error: deleteError } = await supabase
      .from('product_variants')
      .delete()
      .in('id', legacyIds);

    if (deleteError) {
      console.error('❌ Error removing legacy variants:', deleteError);
      return;
    }

    console.log(`✅ Successfully removed ${legacyVariants.length} legacy variants`);
  }

  // Final verification
  const { data: finalVariants, error: finalError } = await supabase
    .from('product_variants')
    .select('id, printful_variant_id')
    .order('printful_variant_id');

  if (finalError) {
    console.error('❌ Error in final verification:', finalError);
    return;
  }

  const finalCount = finalVariants?.length || 0;
  const validCount = finalVariants?.filter(v => v.printful_variant_id && validSyncIds.has(v.printful_variant_id)).length || 0;

  console.log('\n📊 CLEANUP SUMMARY:');
  console.log(`🎯 Expected: ${validSyncIds.size} variants (from Printful Sync API)`);
  console.log(`📊 Final count: ${finalCount} variants in database`);
  console.log(`✅ Valid sync IDs: ${validCount} variants`);
  console.log(`📈 Accuracy: ${validSyncIds.size > 0 ? (validCount / validSyncIds.size * 100).toFixed(1) : '0'}%`);

  const isClean = finalCount === validSyncIds.size && validCount === validSyncIds.size;
  
  if (isClean) {
    console.log('\n🎉 SUCCESS: Database cleaned successfully!');
    console.log('✅ Only valid Printful sync_variant_id values remain');
    console.log('✅ Ready for production fulfillment');
  } else {
    console.log('\n⚠️  WARNING: Database may still have issues');
    if (validCount < validSyncIds.size) {
      console.log(`   - Missing ${validSyncIds.size - validCount} valid variants`);
    }
    if (finalCount > validSyncIds.size) {
      console.log(`   - Still have ${finalCount - validSyncIds.size} extra variants`);
    }
  }

  return isClean;
}

// Run cleanup
cleanupLegacyVariants()
  .then((success) => {
    if (success) {
      console.log('\n🎯 Cleanup completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Cleanup completed with warnings.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 CLEANUP FAILED:', error);
    process.exit(1);
  });