import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzMzMyODAsImV4cCI6MjA0OTkwOTI4MH0.aBqF9OMfj5-RrsoMZXBGMsaP1z9QmqZfGHn3O93qzxs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCapImages() {
  // Get cap product
  const { data: capProduct } = await supabase
    .from('products')
    .select('*')
    .or('category.eq.cap,category.eq.individual-cap')
    .single();

  console.log('Cap Product ID:', capProduct?.id);

  // Get cap product images
  const { data: images, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', capProduct?.id || 3)
    .order('image_order', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n=== Cap Images from Database (Ordered by image_order) ===\n');
  
  // Group by color
  const imagesByColor: Record<string, any[]> = {};
  images?.forEach(img => {
    const color = img.color || 'General';
    if (!imagesByColor[color]) {
      imagesByColor[color] = [];
    }
    imagesByColor[color].push(img);
  });

  // Display images by color
  Object.entries(imagesByColor).forEach(([color, colorImages]) => {
    console.log(`\n${color} Images:`);
    colorImages.forEach(img => {
      console.log(`  Order: ${img.image_order?.toString().padStart(2, '0')}, Primary: ${img.is_primary ? 'YES' : 'no '}, Type: ${(img.variant_type || 'product').padEnd(7)}, URL: ${img.image_url?.split('/').pop()}`);
    });
  });

  // Check for missing order values
  const missingOrder = images?.filter(img => img.image_order === null || img.image_order === undefined);
  if (missingOrder && missingOrder.length > 0) {
    console.log('\n⚠️  Images with missing order values:');
    missingOrder.forEach(img => {
      console.log(`  Color: ${img.color}, URL: ${img.image_url?.split('/').pop()}`);
    });
  }

  // Check primary image
  const primaryImages = images?.filter(img => img.is_primary);
  console.log('\n🎯 Primary Images:', primaryImages?.length || 0);
  primaryImages?.forEach(img => {
    console.log(`  Color: ${img.color}, Order: ${img.image_order}, URL: ${img.image_url?.split('/').pop()}`);
  });
}

checkCapImages();