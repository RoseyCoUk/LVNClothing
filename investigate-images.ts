import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateImages() {
  console.log('\n=== INVESTIGATING PRODUCT IMAGES DATABASE ===\n');

  // 1. Check product_images table structure
  console.log('1. Checking product_images table structure:');
  const { data: imageTableInfo, error: imageTableError } = await supabase
    .from('product_images')
    .select('*')
    .limit(5);
  
  if (imageTableError) {
    console.log('Error querying product_images:', imageTableError);
  } else {
    console.log('Sample product_images records:', JSON.stringify(imageTableInfo, null, 2));
  }

  // 2. Check products table
  console.log('\n2. Checking products table:');
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('id, name, slug, printful_product_id')
    .limit(10);
  
  if (productsError) {
    console.log('Error querying products:', productsError);
  } else {
    console.log('Products:', JSON.stringify(productsData, null, 2));
  }

  // 3. Check product_variants table
  console.log('\n3. Checking product_variants table:');
  const { data: variantsData, error: variantsError } = await supabase
    .from('product_variants')
    .select('*')
    .limit(5);
  
  if (variantsError) {
    console.log('Error querying product_variants:', variantsError);
  } else {
    console.log('Sample product_variants:', JSON.stringify(variantsData, null, 2));
  }

  // 4. Check for t-shirt specifically
  console.log('\n4. Checking for t-shirt product and its images:');
  const { data: tshirtData, error: tshirtError } = await supabase
    .from('products')
    .select(`
      id, name, slug,
      product_images (*)
    `)
    .eq('slug', 't-shirt')
    .single();
  
  if (tshirtError) {
    console.log('Error querying t-shirt:', tshirtError);
  } else {
    console.log('T-shirt with images:', JSON.stringify(tshirtData, null, 2));
  }

  // 5. Count total images in database
  console.log('\n5. Total images in database:');
  const { count, error: countError } = await supabase
    .from('product_images')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.log('Error counting images:', countError);
  } else {
    console.log('Total product_images records:', count);
  }

  // 6. Check image metadata/color associations
  console.log('\n6. Checking image color associations:');
  const { data: imageMetadata, error: metadataError } = await supabase
    .from('product_images')
    .select('product_id, color, metadata, alt_text, image_url')
    .limit(10);
  
  if (metadataError) {
    console.log('Error querying image metadata:', metadataError);
  } else {
    console.log('Image metadata:', JSON.stringify(imageMetadata, null, 2));
  }
}

investigateImages().catch(console.error);