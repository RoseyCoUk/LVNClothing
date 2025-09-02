#!/usr/bin/env tsx
/**
 * CLEANUP: Remove Invalid Printful Variants
 * 
 * This script removes any variants with invalid (non-numeric) Printful IDs
 * These are leftover from previous test data and need to be cleaned up
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupInvalidVariants() {
  console.log('🧹 Starting cleanup of invalid Printful variants...');
  
  // Get all variants to check their IDs
  const { data: allVariants, error: fetchError } = await supabase
    .from('product_variants')
    .select('id, printful_variant_id, name, product_id');

  if (fetchError) {
    console.error('❌ Error fetching variants:', fetchError);
    return;
  }

  console.log(`📊 Found ${allVariants?.length || 0} total variants`);

  // Find invalid variants (non-numeric or null IDs)
  const invalidVariants = allVariants?.filter(v => {
    const id = v.printful_variant_id;
    return !id || isNaN(Number(id)) || id.length === 0 || id.includes('68a9'); // UUID pattern
  }) || [];

  console.log(`🔍 Found ${invalidVariants.length} invalid variants to remove:`);
  invalidVariants.forEach(v => {
    console.log(`  - ${v.name}: '${v.printful_variant_id}'`);
  });

  if (invalidVariants.length === 0) {
    console.log('✅ No invalid variants found. Database is clean!');
    return;
  }

  // Delete invalid variants
  const invalidIds = invalidVariants.map(v => v.id);
  console.log(`\n🗑️  Deleting ${invalidIds.length} invalid variants...`);
  
  const { error: deleteError } = await supabase
    .from('product_variants')
    .delete()
    .in('id', invalidIds);

  if (deleteError) {
    console.error('❌ Error deleting invalid variants:', deleteError);
    return;
  }

  console.log(`✅ Successfully deleted ${invalidIds.length} invalid variants`);

  // Verify cleanup
  const { data: remainingVariants, error: verifyError } = await supabase
    .from('product_variants')
    .select('printful_variant_id, name')
    .order('printful_variant_id');

  if (verifyError) {
    console.error('❌ Error verifying cleanup:', verifyError);
    return;
  }

  // Check if any invalid variants remain
  const stillInvalid = remainingVariants?.filter(v => {
    const id = v.printful_variant_id;
    return !id || isNaN(Number(id)) || id.length === 0 || id.includes('68a9');
  }) || [];

  console.log(`\n📊 CLEANUP SUMMARY:`);
  console.log(`✅ Remaining variants: ${remainingVariants?.length || 0}`);
  console.log(`❌ Still invalid: ${stillInvalid.length}`);

  if (stillInvalid.length === 0) {
    console.log('\n🎉 SUCCESS: All variants now have valid numeric Printful IDs!');
  } else {
    console.log('\n⚠️  WARNING: Some invalid variants still remain:');
    stillInvalid.forEach(v => {
      console.log(`  - ${v.name}: '${v.printful_variant_id}'`);
    });
  }

  // Show sample of valid variants
  const validVariants = remainingVariants?.filter(v => {
    const id = v.printful_variant_id;
    return id && !isNaN(Number(id)) && !id.includes('68a9');
  }) || [];

  console.log('\n📋 Sample of valid variants:');
  validVariants.slice(0, 10).forEach(v => {
    console.log(`  ${v.printful_variant_id}: ${v.name}`);
  });

  return {
    deleted: invalidIds.length,
    remaining: remainingVariants?.length || 0,
    stillInvalid: stillInvalid.length
  };
}

// Run the script
cleanupInvalidVariants()
  .then((result) => {
    if (result && result.stillInvalid === 0) {
      console.log('\n🎯 Cleanup complete - all variants are now valid!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Cleanup incomplete - manual intervention may be required');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 CLEANUP FAILED:', error);
    process.exit(1);
  });