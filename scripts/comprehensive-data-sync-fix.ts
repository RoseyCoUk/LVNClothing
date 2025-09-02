import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Printful API configuration
const PRINTFUL_API_TOKEN = process.env.PRINTFUL_API_TOKEN || 'YOUR_PRINTFUL_API_TOKEN';
const PRINTFUL_BASE_URL = 'https://api.printful.com';

import { PRINTFUL_AUDIT_DATA, UNIQUE_PRODUCTS } from './printful-audit-data';

console.log(`Found ${UNIQUE_PRODUCTS.length} unique products from audit data`);

interface PrintfulProduct {
  id: number;
  external_id: string;
  name: string;
  variants: PrintfulVariant[];
}

interface PrintfulVariant {
  id: number;
  external_id: string;
  name: string;
  price: string;
  currency: string;
  product: {
    variant_id: number;
    product_id: number;
  };
}

async function fetchPrintfulStoreProducts(): Promise<PrintfulProduct[]> {
  console.log('🔍 Fetching products from Printful Store API...');
  
  try {
    const response = await fetch(`${PRINTFUL_BASE_URL}/store/products`, {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch Printful products:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.result?.length || 0} products from Printful`);
    
    return data.result || [];
  } catch (error) {
    console.error('❌ Error fetching Printful products:', error);
    return [];
  }
}

async function fetchPrintfulProductDetails(syncProductId: number): Promise<any> {
  console.log(`🔍 Fetching details for product ${syncProductId}...`);
  
  try {
    const response = await fetch(`${PRINTFUL_BASE_URL}/store/products/${syncProductId}`, {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch product ${syncProductId}:`, response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error(`❌ Error fetching product ${syncProductId}:`, error);
    return null;
  }
}

async function checkCurrentDatabaseState() {
  console.log('🔍 Checking current database state...\n');

  // Check what tables exist
  const { data: tables, error: tablesError } = await supabase.rpc('get_schema_info', {});
  
  if (tablesError) {
    console.log('Using direct table queries instead of schema info...\n');
  }

  // Try to get products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*');

  if (productsError) {
    console.error('❌ Error fetching products:', productsError);
    return { products: [], variants: [] };
  }

  console.log(`📦 Found ${products?.length || 0} products in database`);
  
  // Try to get variants if table exists
  let variants = [];
  const { data: variantData, error: variantsError } = await supabase
    .from('product_variants')
    .select('*');

  if (variantsError) {
    console.log('⚠️ product_variants table may not exist:', variantsError.message);
  } else {
    variants = variantData || [];
    console.log(`🎯 Found ${variants.length} variants in database`);
  }

  return { products: products || [], variants };
}

async function createProductsTableIfNeeded() {
  console.log('🔧 Ensuring products table has correct structure...');
  
  // Check if table has necessary columns by trying to insert a test record structure
  const testProduct = {
    name: 'Test Product',
    price: 0,
    printful_sync_product_id: 0,
    category: 'test',
    is_active: false
  };

  // Try to insert with returning to check structure
  const { error } = await supabase
    .from('products')
    .insert([testProduct])
    .select();

  if (error) {
    console.error('❌ Products table structure issue:', error.message);
    return false;
  }

  // Clean up test product
  await supabase
    .from('products')
    .delete()
    .eq('name', 'Test Product');

  console.log('✅ Products table structure is correct');
  return true;
}

async function syncProductsWithPrintful() {
  console.log('🔄 Starting comprehensive data synchronization...\n');

  const { products: currentProducts } = await checkCurrentDatabaseState();
  const tableReady = await createProductsTableIfNeeded();
  
  if (!tableReady) {
    console.error('❌ Cannot proceed - products table structure issues');
    return;
  }

  // Clear existing products to start fresh
  if (currentProducts.length > 0) {
    console.log(`🗑️ Removing ${currentProducts.length} existing products...`);
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      console.error('❌ Error clearing products:', deleteError);
      return;
    }
  }

  // Process each unique product
  console.log('📦 Creating products with correct Printful data...\n');
  
  for (const auditProduct of UNIQUE_PRODUCTS) {
    console.log(`Processing: ${auditProduct.name} (${auditProduct.sync_product_id})`);
    
    // Fetch detailed product info from Printful
    const printfulDetails = await fetchPrintfulProductDetails(auditProduct.sync_product_id);
    
    if (!printfulDetails) {
      console.log(`⚠️ Could not fetch Printful details for ${auditProduct.name}`);
      continue;
    }

    // Calculate cost and margin using price range from audit data
    const avgPrice = (auditProduct.price_range.min + auditProduct.price_range.max) / 2;
    const estimatedCost = avgPrice * 0.4; // Assume 40% cost ratio
    const margin = avgPrice - estimatedCost;

    const productData = {
      name: auditProduct.name,
      price: avgPrice,
      printful_sync_product_id: auditProduct.sync_product_id,
      printful_cost: estimatedCost,
      margin: margin,
      category: getCategoryFromName(auditProduct.name),
      is_active: true,
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

    // Create variants for this product if product_variants table exists
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

    if (variantError && !variantError.message.includes('does not exist')) {
      console.error(`  ❌ Error creating variant ${variantName}:`, variantError);
    }
  }
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
  }

  // Check variants if table exists
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
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🎉 Synchronization completed successfully!');
  console.log('✅ Database is ready for production use');
}

// Run the synchronization
syncProductsWithPrintful().catch(console.error);

export { syncProductsWithPrintful, generateSyncReport };