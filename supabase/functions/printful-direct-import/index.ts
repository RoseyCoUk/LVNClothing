// Printful Direct Import Function - Complete Catalog Import (158 variants)
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Printful Direct Import Function Started")

Deno.serve(async (req) => {
  console.log('🚀 FUNCTION STARTED - Request received');
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('📤 CORS preflight request handled');
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }

  try {
    console.log('🔧 Creating Supabase client...');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log('✅ Supabase client created');

    console.log('🧪 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Database connection failed',
        message: testError.message,
        debug: { errorType: 'DatabaseError', errorStack: testError }
      }), { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        } 
      });
    }
    console.log('✅ Database connection successful');

    // Check if product_variants table exists by trying to query it
    console.log('🔍 Checking if product_variants table exists...');
    const { data: tableCheck, error: tableCheckError } = await supabase
      .from('product_variants')
      .select('*')  // Fixed: was 'count' which is invalid SQL
      .limit(1);

    if (tableCheckError && tableCheckError.message.includes('does not exist')) {
      console.log('❌ product_variants table does not exist');
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing table',
        message: 'The product_variants table does not exist in the database. This is a critical database schema issue that needs to be resolved by running the proper database migrations.',
        debug: { 
          errorType: 'MissingTableError', 
          errorStack: tableCheckError,
          suggestion: 'Run: supabase db push --linked'
        }
      }), { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        } 
      });
    }

    if (tableCheckError) {
      console.error('❌ Unexpected error checking table:', tableCheckError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Table check failed',
        message: `Unexpected error checking product_variants table: ${tableCheckError.message}`,
        debug: { errorType: 'TableCheckError', errorStack: tableCheckError }
      }), { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        } 
      });
    }

    console.log('✅ product_variants table exists and is accessible');

    // Check products table structure
    console.log('🔍 Checking products table structure...');
    const { data: productsStructure, error: productsStructureError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsStructureError) {
      console.error('❌ Error checking products table:', productsStructureError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Products table error',
        message: `Cannot access products table: ${productsStructureError.message}`,
        debug: { errorType: 'ProductsTableError', errorStack: productsStructureError }
      }), { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        } 
      });
    }
    
    console.log('✅ Products table accessible');
    console.log('Products table columns:', Object.keys(productsStructure?.[0] || {}));

    console.log('🚀 ABOUT TO START IMPORT LOGIC');

    // Full product catalog from your Printful account
    const printfulCatalog = [
      {
        product: { 
          name: 'Reform UK Sticker', 
          description: 'High-quality Reform UK sticker with our logo and branding',
          category: 'Stickers',
          printful_product_id: '68a9f9b78dd634',
          custom_price: 2.99,
          printful_cost: 2.00,
          margin: 0.99
        },
        variants: [
          { name: 'Sticker', value: 'Standard', printful_variant_id: '68a9f9b78dd6d8', price: 2.99, in_stock: true, is_available: true }
        ]
      },
      {
        product: { 
          name: 'Reform UK Mug', 
          description: 'Premium Reform UK mug with our logo',
          category: 'Mugs',
          printful_product_id: '68a9f81d60c1c4',
          custom_price: 9.99,
          printful_cost: 4.99,
          margin: 5.00
        },
        variants: [
          { name: 'Mug', value: 'White Glossy', printful_variant_id: '68a9f81d60c2b4', price: 9.99, in_stock: true, is_available: true }
        ]
      },
      {
        product: { 
          name: 'Reform UK Mouse Pad', 
          description: 'High-quality Reform UK mouse pad',
          category: 'Mouse Pads',
          printful_product_id: '68a9f6e8eeb5e4',
          custom_price: 14.99,
          printful_cost: 6.95,
          margin: 8.04
        },
        variants: [
          { name: 'Mouse Pad', value: 'Standard', printful_variant_id: '68a9f6e8eeb689', price: 14.99, in_stock: true, is_available: true }
        ]
      },
      {
        product: { 
          name: 'Reform UK Water Bottle', 
          description: 'Stainless steel Reform UK water bottle with straw lid',
          category: 'Water Bottles',
          printful_product_id: '68a9f6414ae524',
          custom_price: 24.99,
          printful_cost: 15.75,
          margin: 9.24
        },
        variants: [
          { name: 'Water Bottle', value: 'Stainless Steel with Straw', printful_variant_id: '68a9f6414ae5b8', price: 24.99, in_stock: true, is_available: true }
        ]
      },
      {
        product: { 
          name: 'Reform UK Cap', 
          description: 'Premium Reform UK cap in multiple colors',
          category: 'Caps',
          printful_product_id: '68a9f52cc3d797',
          custom_price: 19.99,
          printful_cost: 12.25,
          margin: 7.74
        },
        variants: [
          { name: 'Cap', value: 'Black', printful_variant_id: '68a9f52cc3d834', price: 19.99, in_stock: true, is_available: true },
          { name: 'Cap', value: 'Dark Grey', printful_variant_id: '68a9f52cc3d8f7', price: 19.99, in_stock: true, is_available: true },
          { name: 'Cap', value: 'Khaki', printful_variant_id: '68a9f52cc3d939', price: 19.99, in_stock: true, is_available: true },
          { name: 'Cap', value: 'Light Blue', printful_variant_id: '68a9f52cc3da28', price: 19.99, in_stock: true, is_available: true },
          { name: 'Cap', value: 'Navy', printful_variant_id: '68a9f52cc3d899', price: 19.99, in_stock: true, is_available: true },
          { name: 'Cap', value: 'Pink', printful_variant_id: '68a9f52cc3d9d7', price: 19.99, in_stock: true, is_available: true },
          { name: 'Cap', value: 'Stone', printful_variant_id: '68a9f52cc3d988', price: 19.99, in_stock: true, is_available: true },
          { name: 'Cap', value: 'White', printful_variant_id: '68a9f52cc3da68', price: 19.99, in_stock: true, is_available: true }
        ]
      },
      {
        product: { 
          name: 'Reform UK T-Shirt', 
          description: 'Premium Reform UK t-shirt in multiple colors and sizes',
          category: 'T-Shirts',
          printful_product_id: '68a9daac4dc0e6',
          custom_price: 24.99,
          printful_cost: 13.75,
          margin: 11.24
        },
        variants: [
          // Dark T-Shirt Variants (60 total) - Only S, M, L, XL, 2XL sizes
          { name: 'T-Shirt', value: 'Army / S', printful_variant_id: '68a9daac4dcb25', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Army / M', printful_variant_id: '68a9daac4dcb79', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Army / L', printful_variant_id: '68a9daac4dcbc1', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Army / XL', printful_variant_id: '68a9daac4dcc04', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Army / 2XL', printful_variant_id: '68a9daac4dcc52', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Asphalt / S', printful_variant_id: '68a9daac4dc997', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Asphalt / M', printful_variant_id: '68a9daac4dc9e2', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Asphalt / L', printful_variant_id: '68a9daac4dca33', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Asphalt / XL', printful_variant_id: '68a9daac4dca85', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Asphalt / 2XL', printful_variant_id: '68a9daac4dcad1', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Autumn / S', printful_variant_id: '68a9daac4dce36', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Autumn / M', printful_variant_id: '68a9daac4dce81', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Autumn / L', printful_variant_id: '68a9daac4dcee9', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Autumn / XL', printful_variant_id: '68a9daac4dcf23', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Autumn / 2XL', printful_variant_id: '68a9daac4dcf77', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Black / S', printful_variant_id: '68a9daac4dc349', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Black / M', printful_variant_id: '68a9daac4dc395', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Black / L', printful_variant_id: '68a9daac4dc3e8', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Black / XL', printful_variant_id: '68a9daac4dc438', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Black / 2XL', printful_variant_id: '68a9daac4dc482', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Black Heather / S', printful_variant_id: '68a9daac4dc184', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Black Heather / M', printful_variant_id: '68a9daac4dc201', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Black Heather / L', printful_variant_id: '68a9daac4dc263', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Black Heather / XL', printful_variant_id: '68a9daac4dc2a4', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Black Heather / 2XL', printful_variant_id: '68a9daac4dc2f9', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Dark Grey Heather / S', printful_variant_id: '68a9daac4dc7d6', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Dark Grey Heather / M', printful_variant_id: '68a9daac4dc864', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Dark Grey Heather / L', printful_variant_id: '68a9daac4dc8b2', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Dark Grey Heather / XL', printful_variant_id: '68a9daac4dc904', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Dark Grey Heather / 2XL', printful_variant_id: '68a9daac4dc952', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Heather Deep Teal / S', printful_variant_id: '68a9daac4dcfd5', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Heather Deep Teal / M', printful_variant_id: '68a9daac4dd018', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Heather Deep Teal / L', printful_variant_id: '68a9daac4dd068', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Heather Deep Teal / XL', printful_variant_id: '68a9daac4dd0b3', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Heather Deep Teal / 2XL', printful_variant_id: '68a9daac4dd102', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Mauve / S', printful_variant_id: '68a9daac4dd149', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Mauve / M', printful_variant_id: '68a9daac4dd197', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Mauve / L', printful_variant_id: '68a9daac4dd1e9', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Mauve / XL', printful_variant_id: '68a9daac4dd236', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Mauve / 2XL', printful_variant_id: '68a9daac4dd283', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Navy / S', printful_variant_id: '68a9daac4dc4c4', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Navy / M', printful_variant_id: '68a9daac4dc511', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Navy / L', printful_variant_id: '68a9daac4dc564', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Navy / XL', printful_variant_id: '68a9daac4dc5b7', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Navy / 2XL', printful_variant_id: '68a9daac4dc603', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Olive / S', printful_variant_id: '68a9daac4dccb2', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Olive / M', printful_variant_id: '68a9daac4dccf5', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Olive / L', printful_variant_id: '68a9daac4dcd47', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Olive / XL', printful_variant_id: '68a9daac4dcd98', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Olive / 2XL', printful_variant_id: '68a9daac4dcde6', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Red / S', printful_variant_id: '68a9daac4dc655', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Red / M', printful_variant_id: '68a9daac4dc6a7', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Red / L', printful_variant_id: '68a9daac4dc6f4', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Red / XL', printful_variant_id: '68a9daac4dc738', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Red / 2XL', printful_variant_id: '68a9daac4dc784', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Steel Blue / S', printful_variant_id: '68a9daac4dd2d1', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Steel Blue / M', printful_variant_id: '68a9daac4dd321', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Steel Blue / L', printful_variant_id: '68a9daac4dd376', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Steel Blue / XL', printful_variant_id: '68a9daac4dd3c2', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt', value: 'Steel Blue / 2XL', printful_variant_id: '68a9daac4dd416', price: 24.99, in_stock: true, is_available: true }
        ]
      },
      {
        product: { 
          name: 'Reform UK T-Shirt Light', 
          description: 'Premium Reform UK t-shirt in light colors and sizes',
          category: 'T-Shirts',
          printful_product_id: '68a9d8c287b938',
          custom_price: 24.99,
          printful_cost: 13.75,
          margin: 11.24
        },
        variants: [
          // Light T-Shirt Variants (40 total) - Only S, M, L, XL, 2XL sizes
          { name: 'T-Shirt Light', value: 'Ash / S', printful_variant_id: '68a9d8c287c311', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Ash / M', printful_variant_id: '68a9d8c287c367', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Ash / L', printful_variant_id: '68a9d8c287c3b2', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Ash / XL', printful_variant_id: '68a9d8c287c409', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Ash / 2XL', printful_variant_id: '68a9d8c287c443', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Athletic Heather / S', printful_variant_id: '68a9d8c287bea5', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Athletic Heather / M', printful_variant_id: '68a9d8c287bee3', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Athletic Heather / L', printful_variant_id: '68a9d8c287bf32', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Athletic Heather / XL', printful_variant_id: '68a9d8c287bf85', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Athletic Heather / 2XL', printful_variant_id: '68a9d8c287bfc6', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Heather Dust / S', printful_variant_id: '68a9d8c287c195', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Heather Dust / M', printful_variant_id: '68a9d8c287c1e1', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Heather Dust / L', printful_variant_id: '68a9d8c287c226', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Heather Dust / XL', printful_variant_id: '68a9d8c287c272', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Heather Dust / 2XL', printful_variant_id: '68a9d8c287c2c5', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Heather Prism Peach / S', printful_variant_id: '68a9d8c287bba4', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Heather Prism Peach / M', printful_variant_id: '68a9d8c287bbe7', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Heather Prism Peach / L', printful_variant_id: '68a9d8c287bc39', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Heather Prism Peach / XL', printful_variant_id: '68a9d8c287bc83', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Heather Prism Peach / 2XL', printful_variant_id: '68a9d8c287bcd5', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Mustard / S', printful_variant_id: '68a9d8c287b9e7', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Mustard / M', printful_variant_id: '68a9d8c287ba54', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Mustard / L', printful_variant_id: '68a9d8c287bab6', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Mustard / XL', printful_variant_id: '68a9d8c287bb05', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Mustard / 2XL', printful_variant_id: '68a9d8c287bb52', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Pink / S', printful_variant_id: '68a9d8c287bd24', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Pink / M', printful_variant_id: '68a9d8c287bd79', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Pink / L', printful_variant_id: '68a9d8c287bdc6', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Pink / XL', printful_variant_id: '68a9d8c287be03', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Pink / 2XL', printful_variant_id: '68a9d8c287be52', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'White / S', printful_variant_id: '68a9d8c287c495', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'White / M', printful_variant_id: '68a9d8c287c4e9', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'White / L', printful_variant_id: '68a9d8c287c535', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'White / XL', printful_variant_id: '68a9d8c287c584', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'White / 2XL', printful_variant_id: '68a9d8c287c5d4', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Yellow / S', printful_variant_id: '68a9d8c287c017', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Yellow / M', printful_variant_id: '68a9d8c287c063', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Yellow / L', printful_variant_id: '68a9d8c287c0b3', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Yellow / XL', printful_variant_id: '68a9d8c287c0f2', price: 24.99, in_stock: true, is_available: true },
          { name: 'T-Shirt Light', value: 'Yellow / 2XL', printful_variant_id: '68a9d8c287c149', price: 24.99, in_stock: true, is_available: true }
        ]
      },
      {
        product: { 
          name: 'Reform UK Hoodie', 
          description: 'Premium Reform UK hoodie in multiple colors and sizes',
          category: 'Hoodies',
          printful_product_id: '68a9d381e56565',
          custom_price: 39.99,
          printful_cost: 22.50,
          margin: 17.49
        },
        variants: [
          // Dark Hoodie Variants (25 total) - Only S, M, L, XL, 2XL sizes
          { name: 'Hoodie', value: 'Black / S', printful_variant_id: '68a9d381e56616', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Black / M', printful_variant_id: '68a9d381e56696', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Black / L', printful_variant_id: '68a9d381e566e2', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Black / XL', printful_variant_id: '68a9d381e56741', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Black / 2XL', printful_variant_id: '68a9d381e56797', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Dark Heather / S', printful_variant_id: '68a9d381e56b11', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Dark Heather / M', printful_variant_id: '68a9d381e56b63', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Dark Heather / L', printful_variant_id: '68a9d381e56ba3', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Dark Heather / XL', printful_variant_id: '68a9d381e56bf2', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Dark Heather / 2XL', printful_variant_id: '68a9d381e56c57', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Indigo Blue / S', printful_variant_id: '68a9d381e56ca1', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Indigo Blue / M', printful_variant_id: '68a9d381e56cf5', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Indigo Blue / L', printful_variant_id: '68a9d381e56d44', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Indigo Blue / XL', printful_variant_id: '68a9d381e56d98', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Indigo Blue / 2XL', printful_variant_id: '68a9d381e56de2', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Navy / S', printful_variant_id: '68a9d381e567e5', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Navy / M', printful_variant_id: '68a9d381e56833', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Navy / L', printful_variant_id: '68a9d381e56881', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Navy / XL', printful_variant_id: '68a9d381e568d2', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Navy / 2XL', printful_variant_id: '68a9d381e56925', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Red / S', printful_variant_id: '68a9d381e56976', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Red / M', printful_variant_id: '68a9d381e569c2', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Red / L', printful_variant_id: '68a9d381e56a15', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Red / XL', printful_variant_id: '68a9d381e56a63', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie', value: 'Red / 2XL', printful_variant_id: '68a9d381e56ac9', price: 39.99, in_stock: true, is_available: true }
        ]
      },
      {
        product: { 
          name: 'Reform UK Hoodie Light', 
          description: 'Premium Reform UK hoodie in light colors and sizes',
          category: 'Hoodies',
          printful_product_id: '68a9d27b158207',
          custom_price: 39.99,
          printful_cost: 22.50,
          margin: 17.49
        },
        variants: [
          // Light Hoodie Variants (20 total) - Only S, M, L, XL, 2XL sizes
          { name: 'Hoodie Light', value: 'Light Blue / S', printful_variant_id: '68a9d27b158456', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'Light Blue / M', printful_variant_id: '68a9d27b1584a1', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'Light Blue / L', printful_variant_id: '68a9d27b1584e2', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'Light Blue / XL', printful_variant_id: '68a9d27b158534', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'Light Blue / 2XL', printful_variant_id: '68a9d27b158581', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'Light Pink / S', printful_variant_id: '68a9d27b158626', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'Light Pink / M', printful_variant_id: '68a9d27b158663', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'Light Pink / L', printful_variant_id: '68a9d27b1586b2', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'Light Pink / XL', printful_variant_id: '68a9d27b158707', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'Light Pink / 2XL', printful_variant_id: '68a9d27b158746', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'Sport Grey / S', printful_variant_id: '68a9d27b1582a6', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'Sport Grey / M', printful_variant_id: '68a9d27b158311', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'Sport Grey / L', printful_variant_id: '68a9d27b158375', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'Sport Grey / XL', printful_variant_id: '68a9d27b1583b6', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'Sport Grey / 2XL', printful_variant_id: '68a9d27b158405', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'White / S', printful_variant_id: '68a9d27b158796', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'White / M', printful_variant_id: '68a9d27b1587d6', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'White / L', printful_variant_id: '68a9d27b158827', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'White / XL', printful_variant_id: '68a9d27b158863', price: 39.99, in_stock: true, is_available: true },
          { name: 'Hoodie Light', value: 'White / 2XL', printful_variant_id: '68a9d27b1588b1', price: 39.99, in_stock: true, is_available: true }
        ]
      },
      {
        product: { 
          name: 'Reform UK Tote Bag', 
          description: 'Eco-friendly Reform UK tote bag',
          category: 'Tote Bags',
          printful_product_id: '68a8a3b526d263',
          custom_price: 24.99,
          printful_cost: 17.75,
          margin: 7.24
        },
        variants: [
          { name: 'Tote Bag', value: 'Organic Cotton', printful_variant_id: '68a8a3b526d2f1', price: 24.99, in_stock: true, is_available: true }
        ]
      }
    ];

    let productsImported = 0;
    let variantsImported = 0;

    console.log(`Starting import of ${printfulCatalog.length} catalog items...`);

    for (const catalogItem of printfulCatalog) {
      try {
        console.log(`Processing product: ${catalogItem.product.name}`);
        
        // Check if product already exists
        const { data: existingProduct, error: checkError } = await supabase
          .from('products')
          .select('id')
          .eq('printful_product_id', catalogItem.product.printful_product_id)
          .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when no rows found

        let productId;
        let isNewProduct = false;
        
        if (existingProduct && !checkError) {
          console.log(`Product ${catalogItem.product.name} already exists, using existing ID: ${existingProduct.id}`);
          productId = existingProduct.id;
          // Count existing products too - they're still part of the import
          productsImported++;
        } else {
          console.log(`Creating new product: ${catalogItem.product.name}`);
          
          // Create product data based on actual table structure
          const productData = {
            name: catalogItem.product.name,
            description: catalogItem.product.description,
            category: catalogItem.product.category,
            printful_product_id: catalogItem.product.printful_product_id,
            price: catalogItem.product.custom_price, // Use the product's custom price
            printful_cost: catalogItem.product.printful_cost, // Use the product's printful cost
            margin: catalogItem.product.margin, // Use the product's margin
            is_available: true
          };
          
          // Add optional columns if they exist
          if (productsStructure?.[0]?.printful_product_id_light !== undefined) {
            productData.printful_product_id_light = catalogItem.product.printful_product_id_light || null;
          }
          
          if (productsStructure?.[0]?.custom_price !== undefined) {
            productData.custom_price = catalogItem.product.custom_price;
          }
          
          console.log('Product insert data:', productData);

          const { data: product, error: productError } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

          if (productError) {
            console.error(`Error inserting product ${catalogItem.product.name}:`, productError);
            console.error('Product data that failed:', productData);
            continue;
          }

          console.log(`✅ Product created: ${catalogItem.product.name} (ID: ${product.id})`);
          productId = product.id;
          isNewProduct = true;
          productsImported++;
        }

        console.log(`Inserting ${catalogItem.variants.length} variants for ${catalogItem.product.name}...`);
        
        // Track total cost for margin calculation
        let totalCost = 0;
        let totalPrice = 0;
        let variantsInserted = 0;
        
        for (const variantData of catalogItem.variants) {
          try {
            console.log(`Inserting variant: ${variantData.name} ${variantData.value}`);
            
            const variantInsertData = {
              product_id: productId,
              name: variantData.name,
              value: variantData.value,
              printful_variant_id: variantData.printful_variant_id,
              price: variantData.price,
              in_stock: variantData.in_stock,
              is_available: variantData.is_available,
              color: null, // Will be extracted from value if needed
              color_hex: null,
              design: null,
              size: null
            };
            
            console.log('Variant insert data:', variantInsertData);
            
            // Use upsert to prevent duplicates - check by printful_variant_id
            const { data: variantResult, error: variantError } = await supabase
              .from('product_variants')
              .upsert(variantInsertData, {
                onConflict: 'printful_variant_id',
                ignoreDuplicates: false
              })
              .select()
              .single();
            
            if (variantError) {
              console.error(`Error inserting variant ${variantData.name} ${variantData.value}:`, variantError);
              continue;
            }
            
            console.log(`✅ Variant inserted: ${variantData.name} ${variantData.value} (ID: ${variantResult.id})`);
            variantsInserted++;
            
            // Accumulate costs for margin calculation
            totalCost += variantData.price * 0.67; // Assume 67% is cost (rough estimate)
            totalPrice += variantData.price;
            
          } catch (error) {
            console.error(`Error inserting variant ${variantData.name} ${variantData.value}:`, error);
            continue;
          }
        }
        
        // Update product with calculated costs and margins
        if (totalPrice > 0) {
          const avgCost = totalCost / catalogItem.variants.length;
          const avgPrice = totalPrice / catalogItem.variants.length;
          const avgMargin = avgPrice - avgCost;
          
          const { error: updateError } = await supabase
            .from('products')
            .update({
              price: avgPrice,
              printful_cost: avgCost,
              margin: avgMargin
            })
            .eq('id', productId);
          
          if (updateError) {
            console.error(`Error updating product costs for ${catalogItem.product.name}:`, updateError);
          } else {
            console.log(`✅ Product costs updated for ${catalogItem.product.name}: Price: £${avgPrice.toFixed(2)}, Cost: £${avgCost.toFixed(2)}, Margin: £${avgMargin.toFixed(2)}`);
          }
        }
        
        // Increment counters
        variantsImported += variantsInserted;
        
      } catch (error) {
        console.error(`Error processing product ${catalogItem.product.name}:`, error);
        continue;
      }
    }

    console.log(`Import completed. Products: ${productsImported}, Variants: ${variantsImported}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully imported ${productsImported} products and ${variantsImported} variants`,
      data: {
        products_imported: productsImported,
        variants_imported: variantsImported,
        total_catalog_items: printfulCatalog.length
      }
    }), { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      } 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Unexpected error',
      message: error.message,
      debug: { errorType: 'Error', errorStack: error.stack }
    }), { 
      status: 500, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      } 
    });
  }
});

