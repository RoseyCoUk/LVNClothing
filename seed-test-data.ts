import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTestData() {
  console.log('\n=== SEEDING TEST DATA ===\n');

  try {
    // 1. Create a test product (T-shirt)
    console.log('1. Creating test product...');
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([
        {
          name: 'Reform UK T-Shirt',
          slug: 't-shirt',
          description: 'Premium quality Reform UK branded t-shirt',
          price: 19.99,
          printful_cost: 10.00,
          category: 'tshirt',
          is_active: true
        }
      ])
      .select()
      .single();

    if (productError) {
      console.log('Product creation error:', productError);
      return;
    }

    console.log('Product created:', product);
    const productId = product.id;

    // 2. Create product variants
    console.log('2. Creating product variants...');
    const variants = [
      // Black variants
      { color: 'Black', size: 'S', printful_variant_id: 'printful_black_s', price: 19.99, stock: 10 },
      { color: 'Black', size: 'M', printful_variant_id: 'printful_black_m', price: 19.99, stock: 15 },
      { color: 'Black', size: 'L', printful_variant_id: 'printful_black_l', price: 19.99, stock: 20 },
      // Navy variants  
      { color: 'Navy', size: 'S', printful_variant_id: 'printful_navy_s', price: 19.99, stock: 8 },
      { color: 'Navy', size: 'M', printful_variant_id: 'printful_navy_m', price: 19.99, stock: 12 },
      { color: 'Navy', size: 'L', printful_variant_id: 'printful_navy_l', price: 19.99, stock: 18 },
      // White variants
      { color: 'White', size: 'S', printful_variant_id: 'printful_white_s', price: 19.99, stock: 5 },
      { color: 'White', size: 'M', printful_variant_id: 'printful_white_m', price: 19.99, stock: 10 },
      { color: 'White', size: 'L', printful_variant_id: 'printful_white_l', price: 19.99, stock: 15 }
    ];

    for (const variant of variants) {
      const { data: variantData, error: variantError } = await supabase
        .from('product_variants')
        .insert([
          {
            product_id: productId,
            name: `${variant.color} ${variant.size}`,
            value: `${variant.color}-${variant.size}`,
            color: variant.color,
            size: variant.size,
            printful_variant_id: variant.printful_variant_id,
            price: variant.price,
            available: true,
            stock: variant.stock
          }
        ])
        .select()
        .single();

      if (variantError) {
        console.log('Variant creation error:', variantError);
      } else {
        console.log(`Created variant: ${variant.color} ${variant.size}`);
      }
    }

    // 3. Create color-specific images with proper metadata
    console.log('3. Creating color-specific images...');
    const images = [
      // Black t-shirt images
      {
        product_id: productId,
        image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop&crop=center',
        image_order: 0,
        is_primary: true,
        is_thumbnail: false,
        variant_type: 'color',
        color: 'Black',
        alt_text: 'Black Reform UK T-Shirt'
      },
      {
        product_id: productId,
        image_url: 'https://images.unsplash.com/photo-1583743814966-8936f37f7777?w=500&h=500&fit=crop&crop=center',
        image_order: 1,
        is_primary: false,
        is_thumbnail: false,
        variant_type: 'color',
        color: 'Black',
        alt_text: 'Black Reform UK T-Shirt Back View'
      },
      // Navy t-shirt images
      {
        product_id: productId,
        image_url: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500&h=500&fit=crop&crop=center',
        image_order: 0,
        is_primary: false,
        is_thumbnail: true,
        variant_type: 'color',
        color: 'Navy',
        alt_text: 'Navy Reform UK T-Shirt'
      },
      {
        product_id: productId,
        image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop&crop=center',
        image_order: 1,
        is_primary: false,
        is_thumbnail: false,
        variant_type: 'color',
        color: 'Navy',
        alt_text: 'Navy Reform UK T-Shirt Side View'
      },
      // White t-shirt images
      {
        product_id: productId,
        image_url: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=500&h=500&fit=crop&crop=center',
        image_order: 0,
        is_primary: false,
        is_thumbnail: false,
        variant_type: 'color',
        color: 'White',
        alt_text: 'White Reform UK T-Shirt'
      },
      {
        product_id: productId,
        image_url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&h=500&fit=crop&crop=center',
        image_order: 1,
        is_primary: false,
        is_thumbnail: false,
        variant_type: 'color',
        color: 'White',
        alt_text: 'White Reform UK T-Shirt Detail'
      },
      // General product image
      {
        product_id: productId,
        image_url: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=500&h=500&fit=crop&crop=center',
        image_order: 0,
        is_primary: false,
        is_thumbnail: false,
        variant_type: 'product',
        color: null,
        alt_text: 'Reform UK T-Shirt Collection'
      }
    ];

    for (const image of images) {
      const { data: imageData, error: imageError } = await supabase
        .from('product_images')
        .insert([image])
        .select()
        .single();

      if (imageError) {
        console.log('Image creation error:', imageError);
      } else {
        console.log(`Created image: ${image.variant_type} - ${image.color || 'general'}`);
      }
    }

    // 4. Verify the data
    console.log('4. Verifying seeded data...');
    
    const { data: productCheck, error: productCheckError } = await supabase
      .from('products')
      .select(`
        id, name, slug,
        product_variants (*),
        product_images (*)
      `)
      .eq('slug', 't-shirt')
      .single();

    if (productCheckError) {
      console.log('Verification error:', productCheckError);
    } else {
      console.log('Verification successful:');
      console.log('- Product:', productCheck.name);
      console.log('- Variants:', productCheck.product_variants?.length || 0);
      console.log('- Images:', productCheck.product_images?.length || 0);
      
      // Group images by color
      const imagesByColor = {};
      productCheck.product_images?.forEach(img => {
        const key = img.color || 'general';
        if (!imagesByColor[key]) imagesByColor[key] = [];
        imagesByColor[key].push(img);
      });
      
      console.log('- Images by color:', Object.keys(imagesByColor).map(color => 
        `${color}: ${imagesByColor[color].length}`
      ).join(', '));
    }

    console.log('\n✅ Test data seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding test data:', error);
  }
}

seedTestData();