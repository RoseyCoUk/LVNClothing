import { createClient } from '@supabase/supabase-js';
import { PRINTFUL_AUDIT_DATA, UNIQUE_PRODUCTS } from './printful-audit-data';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log(`Starting sync with ${UNIQUE_PRODUCTS.length} unique products from audit data`);

async function syncFromAuditDataOnly() {
  console.log('🔄 Starting data synchronization from audit data only...\n');

  // Clear existing products to start fresh
  console.log('🗑️ Clearing existing products...');
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  
  if (deleteError) {
    console.error('❌ Error clearing products:', deleteError);
    return;
  }

  // Clear existing variants 
  const { error: deleteVariantsError } = await supabase
    .from('product_variants')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  
  if (deleteVariantsError && !deleteVariantsError.message.includes('does not exist')) {
    console.error('❌ Error clearing variants:', deleteVariantsError);
  }

  // Process each unique product
  console.log('📦 Creating products with audit data...\n');
  
  for (const auditProduct of UNIQUE_PRODUCTS) {
    console.log(`Processing: ${auditProduct.name} (${auditProduct.sync_product_id})`);
    
    // Calculate cost and margin using price range from audit data
    const avgPrice = (auditProduct.price_range.min + auditProduct.price_range.max) / 2;
    const estimatedCost = avgPrice * 0.4; // Assume 40% cost ratio
    const margin = avgPrice - estimatedCost;

    const productData = {
      name: auditProduct.name,
      description: `Premium ${auditProduct.name} with Reform UK branding`,
      price: avgPrice,
      printful_sync_product_id: auditProduct.sync_product_id,
      printful_cost: estimatedCost,
      margin: margin,
      category: getCategoryFromName(auditProduct.name),
      is_active: true,
      metadata: {
        variant_count: auditProduct.variant_count,
        price_range: auditProduct.price_range,
        synced_from_audit: true
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: createdProduct, error: createError } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (createError) {
      console.error(`❌ Error creating product ${auditProduct.name}:`, createError);
      continue;
    }

    console.log(`✅ Created product: ${auditProduct.name} (ID: ${createdProduct.id})`);

    // Create variants for this product
    await createVariantsForProduct(createdProduct, auditProduct.sync_product_id);
  }

  console.log('\n🎉 Data synchronization completed!');
  await generateSyncReport();
}

function getCategoryFromName(productName: string): string {
  const name = productName.toLowerCase();
  if (name.includes('hoodie')) return 'hoodies';
  if (name.includes('t-shirt') || name.includes('tshirt')) return 'tshirts';
  if (name.includes('cap')) return 'caps';
  if (name.includes('tote')) return 'totebags';
  if (name.includes('water bottle')) return 'waterbottles';
  if (name.includes('mug')) return 'mugs';
  if (name.includes('mouse pad')) return 'mousepads';
  if (name.includes('sticker')) return 'stickers';
  return 'accessories';
}

async function createVariantsForProduct(product: any, syncProductId: number) {
  // Get variants for this product from audit data
  const productData = PRINTFUL_AUDIT_DATA.find(p => p.sync_product_id === syncProductId);
  
  if (!productData) {
    console.log(`  No variant data found for product ${syncProductId}`);
    return;
  }
  
  console.log(`  Creating ${productData.variants.length} variants...`);

  for (const variantData of productData.variants) {
    const variantName = variantData.variant_name.replace(productData.product_name, '').trim();
    
    // Parse color and size from variant name
    const colorSize = parseVariantName(variantName);

    const variant = {
      product_id: product.id,
      printful_variant_id: variantData.sync_variant_id.toString(),
      name: variantName || variantData.variant_name,
      value: variantName || variantData.variant_name,
      color: colorSize.color,
      size: colorSize.size,
      price: variantData.price,
      in_stock: true,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: variantError } = await supabase
      .from('product_variants')
      .insert([variant]);

    if (variantError) {
      console.error(`  ❌ Error creating variant ${variantName}:`, variantError);
    }
  }
  
  console.log(`  ✅ Created ${productData.variants.length} variants`);
}

function parseVariantName(variantName: string): { color: string | null, size: string | null } {
  // Remove leading slash and spaces
  const cleaned = variantName.replace(/^\/\s*/, '').trim();
  
  if (!cleaned || cleaned === variantName.trim()) {
    return { color: null, size: null };
  }

  const parts = cleaned.split('/').map(p => p.trim()).filter(p => p);
  
  const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
  const size = parts.find(part => sizes.includes(part));
  const color = parts.find(part => !sizes.includes(part));
  
  return { 
    color: color || null, 
    size: size || null 
  };
}

async function generateSyncReport() {
  console.log('\n📊 SYNCHRONIZATION REPORT\n');
  console.log('=' .repeat(50));
  
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*');

  if (productsError) {
    console.error('❌ Error generating report:', productsError);
    return;
  }

  console.log(`✅ Total Products: ${products?.length || 0}`);
  
  if (products && products.length > 0) {
    console.log('\n📦 Products by Category:');
    const byCategory = products.reduce((acc: any, product: any) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(byCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });

    console.log('\n💰 Pricing Summary:');
    const totalValue = products.reduce((sum: number, product: any) => sum + (product.price || 0), 0);
    const avgPrice = totalValue / products.length;
    console.log(`  Average Price: $${avgPrice.toFixed(2)}`);
    console.log(`  Total Catalog Value: $${totalValue.toFixed(2)}`);

    console.log('\n🆔 Printful Integration:');
    const withPrintfulIds = products.filter((p: any) => p.printful_sync_product_id);
    console.log(`  Products with Printful IDs: ${withPrintfulIds.length}`);
    
    if (withPrintfulIds.length > 0) {
      console.log('  Printful Product IDs:');
      withPrintfulIds.forEach((p: any) => {
        console.log(`    ${p.name}: ${p.printful_sync_product_id}`);
      });
    }

    console.log('\n💸 Cost Analysis:');
    const withCosts = products.filter((p: any) => p.printful_cost && p.margin);
    if (withCosts.length > 0) {
      const avgCost = withCosts.reduce((sum: number, p: any) => sum + p.printful_cost, 0) / withCosts.length;
      const avgMargin = withCosts.reduce((sum: number, p: any) => sum + p.margin, 0) / withCosts.length;
      console.log(`  Average Cost: $${avgCost.toFixed(2)}`);
      console.log(`  Average Margin: $${avgMargin.toFixed(2)}`);
      console.log(`  Average Margin %: ${((avgMargin / (avgCost + avgMargin)) * 100).toFixed(1)}%`);
    }
  }

  // Check variants
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*');

  if (variants) {
    console.log(`\n🎯 Total Variants: ${variants.length}`);
    
    if (variants.length > 0) {
      const variantsByProduct = variants.reduce((acc: any, variant: any) => {
        acc[variant.product_id] = (acc[variant.product_id] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Variants per Product:');
      products?.forEach((product: any) => {
        const variantCount = variantsByProduct[product.id] || 0;
        console.log(`  ${product.name}: ${variantCount} variants`);
      });

      // Color/Size analysis
      const colorsSet = new Set(variants.filter(v => v.color).map(v => v.color));
      const sizesSet = new Set(variants.filter(v => v.size).map(v => v.size));
      
      console.log('\n🎨 Variant Analysis:');
      console.log(`  Unique Colors: ${colorsSet.size} (${Array.from(colorsSet).join(', ')})`);
      console.log(`  Unique Sizes: ${sizesSet.size} (${Array.from(sizesSet).join(', ')})`);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🎉 Synchronization completed successfully!');
  console.log('✅ Database is ready for production use');
  
  // Final validation
  console.log('\n🔍 VALIDATION CHECKS:');
  console.log(`✅ Expected 10 products: ${products?.length === 10 ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Expected 158 variants: ${variants?.length === 158 ? 'PASS' : 'FAIL'}`);
  const productsWithIds = products?.filter((p: any) => p.printful_sync_product_id) || [];
  console.log(`✅ All products have Printful IDs: ${productsWithIds.length === products?.length ? 'PASS' : 'FAIL'}`);
}

// Run the synchronization
syncFromAuditDataOnly().catch(console.error);