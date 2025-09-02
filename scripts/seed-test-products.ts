#!/usr/bin/env npx tsx

/**
 * Seed Test Products Script
 * 
 * This script creates test products in the database with proper slugs
 * to test the product navigation functionality.
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables - using REMOTE database to match frontend
const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw'; // Service role key for remote db

const supabase = createClient(supabaseUrl, supabaseKey);

const testProducts = [
  {
    name: 'Reform UK T-Shirt',
    description: 'Premium cotton t-shirt with Reform UK branding. Available in multiple colors and sizes.',
    price: 19.99,
    slug: 'reform-uk-t-shirt',
    category: 'clothing',
    tags: ['t-shirt', 'clothing', 'reform', 'uk'],
    image_url: 'https://files.cdn.printful.com/products/71/black_tshirt_m_mockup.jpg',
    printful_product_id: '390637611',
    retail_price: 19.99,
    printful_cost: 8.50,
    is_available: true,
    rating: 4.8,
    reviews: 156
  },
  {
    name: 'Reform UK Hoodie',
    description: 'Comfortable cotton hoodie perfect for cooler weather. Features Reform UK logo and branding.',
    price: 39.99,
    slug: 'reform-uk-hoodie',
    category: 'clothing',
    tags: ['hoodie', 'clothing', 'reform', 'uk'],
    image_url: 'https://files.cdn.printful.com/products/71/black_hoodie_m_mockup.jpg',
    printful_product_id: '390637612',
    retail_price: 39.99,
    printful_cost: 22.50,
    is_available: true,
    rating: 4.9,
    reviews: 89
  },
  {
    name: 'Reform UK Cap',
    description: 'Adjustable baseball cap with embroidered Reform UK logo. One size fits most.',
    price: 24.99,
    slug: 'reform-uk-cap',
    category: 'accessories',
    tags: ['cap', 'hat', 'accessories', 'reform', 'uk'],
    image_url: 'https://files.cdn.printful.com/products/71/black_cap_mockup.jpg',
    printful_product_id: '390637613',
    retail_price: 24.99,
    printful_cost: 12.99,
    is_available: true,
    rating: 4.7,
    reviews: 67
  },
  {
    name: 'Reform UK Tote Bag',
    description: 'Durable canvas tote bag perfect for shopping or everyday use. Features Reform UK branding.',
    price: 16.99,
    slug: 'reform-uk-tote-bag',
    category: 'accessories',
    tags: ['bag', 'tote', 'accessories', 'reform', 'uk'],
    image_url: 'https://files.cdn.printful.com/products/71/tote_bag_mockup.jpg',
    printful_product_id: '390637614',
    retail_price: 16.99,
    printful_cost: 8.25,
    is_available: true,
    rating: 4.6,
    reviews: 43
  },
  {
    name: 'Reform UK Water Bottle',
    description: 'Insulated stainless steel water bottle with Reform UK logo. Keeps drinks hot or cold.',
    price: 22.99,
    slug: 'reform-uk-water-bottle',
    category: 'accessories',
    tags: ['bottle', 'water', 'accessories', 'reform', 'uk'],
    image_url: 'https://files.cdn.printful.com/products/71/water_bottle_mockup.jpg',
    printful_product_id: '390637615',
    retail_price: 22.99,
    printful_cost: 11.75,
    is_available: true,
    rating: 4.8,
    reviews: 92
  },
  {
    name: 'Reform UK Mug',
    description: 'Ceramic coffee mug with Reform UK branding. Dishwasher and microwave safe.',
    price: 14.99,
    slug: 'reform-uk-mug',
    category: 'accessories',
    tags: ['mug', 'coffee', 'accessories', 'reform', 'uk'],
    image_url: 'https://files.cdn.printful.com/products/71/mug_mockup.jpg',
    printful_product_id: '390637616',
    retail_price: 14.99,
    printful_cost: 7.25,
    is_available: true,
    rating: 4.5,
    reviews: 128
  },
  {
    name: 'Reform UK Mouse Pad',
    description: 'High-quality mouse pad with Reform UK design. Non-slip rubber base.',
    price: 9.99,
    slug: 'reform-uk-mouse-pad',
    category: 'accessories',
    tags: ['mousepad', 'office', 'accessories', 'reform', 'uk'],
    image_url: 'https://files.cdn.printful.com/products/71/mousepad_mockup.jpg',
    printful_product_id: '390637617',
    retail_price: 9.99,
    printful_cost: 4.50,
    is_available: true,
    rating: 4.4,
    reviews: 34
  }
];

async function seedProducts() {
  try {
    console.log('🌱 Starting product seed...');

    // Check if products already exist
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('name, slug')
      .limit(5);

    if (checkError) {
      console.error('❌ Error checking existing products:', checkError);
      throw checkError;
    }

    if (existingProducts && existingProducts.length > 0) {
      console.log(`ℹ️ Found ${existingProducts.length} existing products:`);
      existingProducts.forEach(p => console.log(`  - ${p.name} (${p.slug})`));
      console.log('\n🤔 Do you want to proceed? This will add more products.');
    }

    // Insert test products
    console.log(`\n🚀 Inserting ${testProducts.length} test products...`);
    
    const { data: insertedProducts, error: insertError } = await supabase
      .from('products')
      .insert(testProducts)
      .select();

    if (insertError) {
      console.error('❌ Error inserting products:', insertError);
      throw insertError;
    }

    console.log(`✅ Successfully inserted ${insertedProducts?.length || 0} products!`);
    
    // Display inserted products
    if (insertedProducts && insertedProducts.length > 0) {
      console.log('\n📦 Inserted products:');
      insertedProducts.forEach(product => {
        console.log(`  ✓ ${product.name} - /product/${product.slug} - £${product.price}`);
      });
    }

    // Also create some sample product variants
    console.log('\n🔧 Creating sample product variants...');
    
    const variants = [];
    for (const product of insertedProducts || []) {
      if (product.category === 'clothing') {
        // Add size/color variants for clothing
        const colors = ['Black', 'White', 'Navy'];
        const sizes = ['S', 'M', 'L', 'XL'];
        
        for (const color of colors) {
          for (const size of sizes) {
            variants.push({
              product_id: product.id,
              name: `${color} ${size}`,
              color,
              size,
              printful_variant_id: `${Math.floor(Math.random() * 10000) + 1000}`, // Mock Printful ID
              price: product.price,
              in_stock: true,
              is_available: true
            });
          }
        }
      } else {
        // Add basic variant for non-clothing items
        variants.push({
          product_id: product.id,
          name: 'Default',
          printful_variant_id: `${Math.floor(Math.random() * 10000) + 1000}`,
          price: product.price,
          in_stock: true,
          is_available: true
        });
      }
    }

    if (variants.length > 0) {
      const { data: insertedVariants, error: variantError } = await supabase
        .from('product_variants')
        .insert(variants)
        .select();

      if (variantError) {
        console.warn('⚠️ Error inserting variants (this is OK if table doesn\'t exist):', variantError.message);
      } else {
        console.log(`✅ Successfully inserted ${insertedVariants?.length || 0} product variants!`);
      }
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📍 You can now test the product pages:');
    testProducts.forEach(product => {
      console.log(`  🔗 http://localhost:5177/product/${product.slug}`);
    });

  } catch (error) {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  }
}

// Run the script
seedProducts()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });