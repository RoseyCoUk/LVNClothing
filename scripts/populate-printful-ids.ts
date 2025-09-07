#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { TshirtVariants } from '../src/hooks/tshirt-variants';
import { HoodieVariants } from '../src/hooks/hoodie-variants';
import { CapVariants } from '../src/hooks/cap-variants';
import { MugVariants } from '../src/hooks/mug-variants';
import { TotebagVariants } from '../src/hooks/totebag-variants';
import { WaterbottleVariants } from '../src/hooks/waterbottle-variants';
import { MousepadVariants } from '../src/hooks/mousepad-variants';

const supabase = createClient(
  process.env.SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

interface VariantMapping {
  productName: string;
  variants: any[];
}

async function populatePrintfulIds() {
  console.log('🚀 Populating Printful variant IDs in database...\n');

  // Map product names to their variant data
  const productVariantMappings: VariantMapping[] = [
    { productName: 'Reform UK T-Shirt', variants: TshirtVariants },
    { productName: 'Reform UK Hoodie', variants: HoodieVariants },
    { productName: 'Reform UK Cap', variants: CapVariants },
    { productName: 'Reform UK Mug', variants: MugVariants },
    { productName: 'Reform UK Tote Bag', variants: TotebagVariants },
    { productName: 'Reform UK Water Bottle', variants: WaterbottleVariants },
    { productName: 'Reform UK Mouse Pad', variants: MousepadVariants },
  ];

  let totalUpdated = 0;
  let totalFailed = 0;

  for (const mapping of productVariantMappings) {
    console.log(`\n📦 Processing ${mapping.productName}`);
    
    // Get the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .eq('name', mapping.productName)
      .single();

    if (productError || !product) {
      console.error(`  ❌ Product not found: ${mapping.productName}`);
      continue;
    }

    console.log(`  Found product ID: ${product.id}`);

    // Get existing variants for this product
    const { data: existingVariants, error: variantError } = await supabase
      .from('product_variants')
      .select('id, name, size, color, printful_variant_id')
      .eq('product_id', product.id);

    if (variantError) {
      console.error(`  ❌ Error fetching variants: ${variantError.message}`);
      continue;
    }

    console.log(`  Found ${existingVariants?.length || 0} existing variants`);

    // Update each variant with its Printful ID
    for (const printfulVariant of mapping.variants) {
      // Extract size and color from variant name
      // e.g., "Black / S" -> color: "Black", size: "S"
      const parts = printfulVariant.name?.split(' / ') || [];
      const variantColor = parts[0]?.trim();
      const variantSize = parts[1]?.trim();
      
      // Find matching variant in database
      const dbVariant = existingVariants?.find(v => {
        // For single variant products (mug, mousepad, etc)
        if (!variantSize && !variantColor) {
          return existingVariants.length === 1; // Match the only variant
        }
        
        // Match by size and color combination
        const sizeMatch = (!v.size && !variantSize) || 
                         (v.size?.toLowerCase() === variantSize?.toLowerCase());
        const colorMatch = (!v.color && !variantColor) || 
                          (v.color?.toLowerCase() === variantColor?.toLowerCase());
        return sizeMatch && colorMatch;
      });

      if (dbVariant) {
        // Update with Printful variant ID
        const { error: updateError } = await supabase
          .from('product_variants')
          .update({ 
            printful_variant_id: printfulVariant.syncVariantId, // Use syncVariantId
            // Also update the variant name to match Printful
            name: printfulVariant.name || dbVariant.name
          })
          .eq('id', dbVariant.id);

        if (updateError) {
          console.error(`    ❌ Failed to update variant ${dbVariant.name}: ${updateError.message}`);
          totalFailed++;
        } else {
          console.log(`    ✅ Updated variant: ${printfulVariant.name} (ID: ${printfulVariant.syncVariantId})`);
          totalUpdated++;
        }
      } else {
        // Create new variant if it doesn't exist
        // The value field is a unique identifier combining size/color
        const value = [variantColor, variantSize].filter(Boolean).join('-').toLowerCase() || 'default';
        
        const { error: insertError } = await supabase
          .from('product_variants')
          .insert({
            product_id: product.id,
            name: printfulVariant.name,
            value: value,
            size: variantSize,
            color: variantColor,
            printful_variant_id: printfulVariant.syncVariantId,
            price: parseFloat(printfulVariant.price) || 0,
            is_available: true
          });

        if (insertError) {
          console.error(`    ❌ Failed to create variant ${printfulVariant.name}: ${insertError.message}`);
          totalFailed++;
        } else {
          console.log(`    ✅ Created variant: ${printfulVariant.name} (ID: ${printfulVariant.syncVariantId})`);
          totalUpdated++;
        }
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`✅ Successfully updated/created: ${totalUpdated} variants`);
  console.log(`❌ Failed: ${totalFailed} variants`);

  // Verify the update
  console.log('\n🔍 Verifying update...');
  const { data: verifyData, error: verifyError } = await supabase
    .from('product_variants')
    .select('printful_variant_id')
    .not('printful_variant_id', 'is', null);

  if (!verifyError) {
    console.log(`✅ Total variants with Printful IDs: ${verifyData.length}`);
  }

  console.log('\n✨ Done! Automatic fulfillment should now work.');
}

populatePrintfulIds().catch(console.error);