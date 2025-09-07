#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testVariantLookupFix() {
  console.log('🧪 Testing variant lookup fix for "tshirt-M-Autumn"...\n');
  
  // Simulate the webhook lookup logic for the problematic item
  const itemId = 'tshirt-M-Autumn';
  console.log(`Testing item ID: ${itemId}`);
  
  // Parse the item ID (same logic as in the fixed webhook)
  const parts = itemId.split('-');
  console.log(`Parsed parts: [${parts.join(', ')}]`);
  
  if (parts.length >= 2) {
    const productType = parts[0].toLowerCase(); // 'tshirt'
    let size = '';
    let color = '';
    
    if (parts.length === 3) {
      size = parts[1]; // 'M'
      color = parts[2]; // 'Autumn'
    } else if (parts.length === 2) {
      color = parts[1];
    }
    
    console.log(`Extracted: productType=${productType}, size=${size}, color=${color}\n`);
    
    // Test the fixed product name mapping
    const productNameMap: Record<string, string> = {
      'hoodie': 'Unisex Hoodie DARK',
      'tshirt': 'Unisex t-shirt DARK',
      't-shirt': 'Unisex t-shirt DARK',
      'cap': 'Reform UK Cap',
      'mug': 'Reform UK Mug'
    };
    
    const productName = productNameMap[productType];
    console.log(`Mapped product name: ${productName}`);
    
    if (productName) {
      // Try to find the product (DARK variant first)
      let product = null;
      console.log(`Looking for product: ${productName}`);
      const { data: darkProduct } = await supabase
        .from('products')
        .select('id, name')
        .eq('name', productName)
        .single();
      
      product = darkProduct;
      
      // If DARK variant not found, try LIGHT variant
      if (!product && (productType === 'tshirt' || productType === 't-shirt' || productType === 'hoodie')) {
        const lightProductName = productName.replace('DARK', 'LIGHT');
        console.log(`DARK not found, trying LIGHT variant: ${lightProductName}`);
        const { data: lightProduct } = await supabase
          .from('products')
          .select('id, name')
          .eq('name', lightProductName)
          .single();
        product = lightProduct;
      }
      
      if (product) {
        console.log(`✅ Found product: ${product.name} (ID: ${product.id})\n`);
        
        // Test variant lookup
        console.log(`Looking for variants with size='${size}' and color='${color}'...`);
        
        // Get all variants for debugging
        const { data: allVariants } = await supabase
          .from('product_variants')
          .select('printful_variant_id, size, color, value')
          .eq('product_id', product.id);
        
        console.log(`Total variants found: ${allVariants?.length || 0}`);
        
        if (allVariants && allVariants.length > 0) {
          console.log('Available variants:');
          allVariants.forEach((v, i) => 
            console.log(`  ${i + 1}. Size: '${v.size}', Color: '${v.color}', Value: '${v.value}', Printful: ${v.printful_variant_id}`)
          );
          console.log();
          
          // Test direct match
          const directMatch = allVariants.find(v => {
            const sizeMatch = !size || v.size?.toLowerCase() === size.toLowerCase();
            const colorMatch = !color || v.color?.toLowerCase() === color.toLowerCase();
            return sizeMatch && colorMatch;
          });
          
          if (directMatch) {
            console.log(`✅ Direct match found: Printful ID ${directMatch.printful_variant_id}`);
            console.log(`   Variant: Size='${directMatch.size}', Color='${directMatch.color}', Value='${directMatch.value}'`);
            return;
          }
          
          console.log('❌ No direct match, trying color mapping...');
          
          // Test color mapping
          const colorMapping: Record<string, string[]> = {
            'autumn': ['Autumn', 'Orange', 'Brown', 'Rust', 'Burnt Orange'],
            'black': ['Black', 'Charcoal', 'Dark Grey'],
            'white': ['White', 'Off White', 'Ivory', 'Natural'],
            'blue': ['Blue', 'Navy', 'Light Blue', 'Royal Blue'],
            'grey': ['Grey', 'Gray', 'Sport Grey', 'Ash'],
            'gray': ['Grey', 'Gray', 'Sport Grey', 'Ash']
          };
          
          if (color) {
            const possibleColors = colorMapping[color.toLowerCase()] || [color];
            console.log(`Possible colors for '${color}': [${possibleColors.join(', ')}]`);
            
            const colorMappedMatch = allVariants.find(v => {
              const sizeMatch = !size || v.size?.toLowerCase() === size.toLowerCase();
              const colorMatch = possibleColors.some(pc => 
                v.color?.toLowerCase().includes(pc.toLowerCase()) ||
                pc.toLowerCase().includes(v.color?.toLowerCase() || '')
              );
              return sizeMatch && colorMatch;
            });
            
            if (colorMappedMatch) {
              console.log(`✅ Color mapping match found: Printful ID ${colorMappedMatch.printful_variant_id}`);
              console.log(`   Variant: Size='${colorMappedMatch.size}', Color='${colorMappedMatch.color}', Value='${colorMappedMatch.value}'`);
              console.log(`   Color mapping: '${color}' matched '${colorMappedMatch.color}'`);
              return;
            }
          }
          
          console.log('❌ No color mapping match, trying value field matching...');
          
          // Test value field matching
          const valueMatch = allVariants.find(v => {
            if (v.value) {
              const valueLower = v.value.toLowerCase();
              const sizeMatch = !size || valueLower.includes(size.toLowerCase());
              const colorMatch = !color || valueLower.includes(color.toLowerCase());
              return sizeMatch && colorMatch;
            }
            return false;
          });
          
          if (valueMatch) {
            console.log(`✅ Value field match found: Printful ID ${valueMatch.printful_variant_id}`);
            console.log(`   Variant: Size='${valueMatch.size}', Color='${valueMatch.color}', Value='${valueMatch.value}'`);
            return;
          }
          
          console.log('❌ No value field match. Trying fallback options...');
          
          // If it's a single variant product, use it
          if (allVariants.length === 1) {
            const fallbackVariant = allVariants[0];
            console.log(`✅ Using single available variant: Printful ID ${fallbackVariant.printful_variant_id}`);
            console.log(`   Variant: Size='${fallbackVariant.size}', Color='${fallbackVariant.color}', Value='${fallbackVariant.value}'`);
            return;
          }
          
          // Try to find any variant with matching size (ignore color)
          if (size) {
            const sizeMatch = allVariants.find(v => 
              v.size?.toLowerCase() === size.toLowerCase()
            );
            
            if (sizeMatch) {
              console.log(`⚠️  Size-only match found: Printful ID ${sizeMatch.printful_variant_id}`);
              console.log(`   Variant: Size='${sizeMatch.size}', Color='${sizeMatch.color}', Value='${sizeMatch.value}'`);
              console.log(`   Note: Color '${color}' not matched, using '${sizeMatch.color}'`);
              return;
            }
          }
          
          console.log('❌ No variant found with any matching criteria');
        } else {
          console.log('❌ No variants found for this product');
        }
      } else {
        console.log(`❌ No product found for: ${productName}`);
        
        // List all products to see what's available
        const { data: allProducts } = await supabase
          .from('products')
          .select('name')
          .order('name');
          
        console.log('\nAvailable products in database:');
        allProducts?.forEach(p => console.log(`  - ${p.name}`));
      }
    } else {
      console.log(`❌ No product mapping found for type: ${productType}`);
    }
  } else {
    console.log(`❌ Could not parse item ID: ${itemId}`);
  }
  
  console.log('\n🏁 Test completed!');
}

testVariantLookupFix().catch(console.error);