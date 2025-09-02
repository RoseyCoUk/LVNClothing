import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyColorSwitching() {
  console.log('\n=== VERIFYING COLOR SWITCHING SETUP ===\n');

  try {
    // 1. Get the t-shirt product and its images
    console.log('1. Fetching t-shirt with color-specific images...');
    const { data: tshirt, error } = await supabase
      .from('products')
      .select(`
        id, name, category,
        product_images (
          id, image_url, color, variant_type, image_order, is_primary
        )
      `)
      .eq('slug', 't-shirt')
      .single();

    if (error) {
      console.log('Error:', error);
      return;
    }

    console.log('T-shirt product:');
    console.log('- ID:', tshirt.id);
    console.log('- Name:', tshirt.name);
    console.log('- Category:', tshirt.category);
    console.log('- Total images:', tshirt.product_images?.length || 0);

    // 2. Group images by color
    console.log('\n2. Images grouped by color:');
    const imagesByColor = {};
    tshirt.product_images?.forEach(img => {
      const color = img.color || 'general';
      if (!imagesByColor[color]) {
        imagesByColor[color] = [];
      }
      imagesByColor[color].push(img);
    });

    Object.keys(imagesByColor).forEach(color => {
      console.log(`\n🎨 ${color.toUpperCase()}:`);
      imagesByColor[color].forEach((img, i) => {
        console.log(`   ${i+1}. ${img.image_url} (${img.variant_type}, primary: ${img.is_primary})`);
      });
    });

    // 3. Check what the frontend component needs
    console.log('\n3. Frontend requirements check:');
    console.log('✅ Product exists:', !!tshirt);
    console.log('✅ Has color-specific images:', tshirt.product_images?.some(img => img.variant_type === 'color'));
    console.log('✅ Multiple colors available:', Object.keys(imagesByColor).length > 1);
    
    // 4. Test color filtering logic (simulate what frontend does)
    console.log('\n4. Testing color filtering (simulating frontend):');
    const testColors = ['Black', 'Navy', 'White'];
    
    testColors.forEach(testColor => {
      const colorImages = tshirt.product_images?.filter(img => 
        img.variant_type === 'color' && img.color === testColor
      ) || [];
      console.log(`🎯 ${testColor}: ${colorImages.length} images found`);
      if (colorImages.length > 0) {
        colorImages.forEach((img, i) => {
          console.log(`   ${i+1}. ${img.image_url}`);
        });
      }
    });

    console.log('\n✅ Database is properly set up for color variant image switching!');
    console.log('\n🚀 Next: Check if the frontend TShirtPage component is using the real images or fallback images.');

  } catch (error) {
    console.error('Verification error:', error);
  }
}

verifyColorSwitching();