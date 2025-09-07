#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugVariantLookup() {
  console.log('🔍 Debugging variant lookup issue...\n');
  
  // 1. Check products table
  console.log('1. Products in database:');
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .order('name');
    
  if (products) {
    products.forEach(p => console.log(`  - ${p.name} (ID: ${p.id})`));
  }
  console.log();
  
  // 2. Check all variants in database
  console.log('2. All product variants in database:');
  const { data: allVariants } = await supabase
    .from('product_variants')
    .select('id, value, size, color, printful_variant_id, product_id, products!inner(name)')
    .order('product_id, size, color')
    .limit(20);
    
  if (allVariants && allVariants.length > 0) {
    console.log(`  Found ${allVariants.length} variants (showing first 20):`);
    allVariants.forEach((v: any) => 
      console.log(`    - Product: ${v.products?.name}, ID: ${v.id}, Value: ${v.value}, Size: ${v.size}, Color: ${v.color}, Printful: ${v.printful_variant_id}`)
    );
  } else {
    console.log('  ❌ No variants found in database!');
  }
  console.log();
  
  // 3. Test problematic item ID
  const problemItemId = 'tshirt-M-Autumn';
  console.log(`3. Testing lookup for "${problemItemId}":`);
  
  // Try various lookup methods
  console.log('   Trying direct UUID lookup...');
  const { data: uuidResult } = await supabase
    .from('product_variants')
    .select('printful_variant_id')
    .eq('id', problemItemId)
    .single();
  console.log(`   Result: ${uuidResult?.printful_variant_id || 'null'}`);
  
  console.log('   Trying value field lookup...');
  const { data: valueResult } = await supabase
    .from('product_variants')
    .select('printful_variant_id')
    .eq('value', problemItemId)
    .single();
  console.log(`   Result: ${valueResult?.printful_variant_id || 'null'}`);
  
  // 4. Try parsing the item ID
  console.log(`   Parsing "${problemItemId}":`);
  const parts = problemItemId.split('-');
  console.log(`   Parts: [${parts.join(', ')}]`);
  
  if (parts.length >= 3) {
    const productType = parts[0].toLowerCase(); // 'tshirt'
    const size = parts[1]; // 'M'
    const color = parts[2]; // 'Autumn'
    
    console.log(`   Parsed: product=${productType}, size=${size}, color=${color}`);
    
    // Find product by name
    const productName = productType === 'tshirt' ? 'Reform UK T-Shirt' : productType;
    const product = products?.find(p => p.name === productName);
    
    if (product) {
      console.log(`   Found product: ${product.name}`);
      
      // Try to find variant
      const { data: parsedVariant } = await supabase
        .from('product_variants')
        .select('printful_variant_id, size, color, value')
        .eq('product_id', product.id)
        .ilike('size', size)
        .ilike('color', color)
        .single();
        
      console.log(`   Variant lookup result: ${parsedVariant?.printful_variant_id || 'null'}`);
      
      if (parsedVariant) {
        console.log(`   Variant details: size=${parsedVariant.size}, color=${parsedVariant.color}, value=${parsedVariant.value}`);
      } else {
        // Show all available variants for this product
        const { data: allVariants } = await supabase
          .from('product_variants')
          .select('size, color, value, printful_variant_id')
          .eq('product_id', product.id)
          .limit(20);
          
        console.log(`   Available variants for ${product.name}:`);
        allVariants?.forEach(v => 
          console.log(`     - Size: ${v.size}, Color: ${v.color}, Value: ${v.value}, Printful: ${v.printful_variant_id}`)
        );
      }
    } else {
      console.log(`   ❌ Product not found for type: ${productType}`);
    }
  }
  
  console.log('\n✅ Debug analysis complete!');
}

debugVariantLookup().catch(console.error);