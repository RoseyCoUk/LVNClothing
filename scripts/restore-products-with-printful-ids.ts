import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

const productsData = [
  {
    name: "Reform UK Sticker",
    description: "Reform UK branded sticker",
    price: 2.99,
    category: "gear",
    slug: "reform-uk-sticker",
    printful_product_id: 390637627,
    image_url: "/StickerToteWater/ReformStickersMain1.webp"
  },
  {
    name: "Reform UK Mug",
    description: "Ceramic mug with Reform UK logo",
    price: 9.99,
    category: "gear", 
    slug: "reform-uk-mug",
    printful_product_id: 390637302,
    image_url: "/MugMouse/ReformMug1.webp"
  },
  {
    name: "Reform UK Mouse Pad",
    description: "Mouse pad with Reform UK branding",
    price: 14.99,
    category: "gear",
    slug: "reform-uk-mouse-pad", 
    printful_product_id: 390637071,
    image_url: "/MugMouse/ReformMousePadWhite1.webp"
  },
  {
    name: "Reform UK Water Bottle",
    description: "Reusable water bottle with Reform UK logo",
    price: 24.99,
    category: "gear",
    slug: "reform-uk-water-bottle",
    printful_product_id: 390636972,
    image_url: "/StickerToteWater/ReformWaterBottleWhite1.webp"
  },
  {
    name: "Reform UK Cap",
    description: "Adjustable cap with Reform UK logo",
    price: 19.99,
    category: "apparel",
    slug: "reform-uk-cap",
    printful_product_id: 390636644,
    image_url: "/Cap/ReformCapBlue1.webp"
  },
  {
    name: "Unisex t-shirt DARK",
    description: "Premium unisex t-shirt with Reform UK branding - Dark colors",
    price: 24.99,
    category: "apparel",
    slug: "unisex-t-shirt-dark",
    printful_product_id: 390630122,
    image_url: "/Tshirt/Men/ReformMenTshirtCharcoal1.webp"
  },
  {
    name: "Unisex t-shirt LIGHT",
    description: "Premium unisex t-shirt with Reform UK branding - Light colors",
    price: 24.99,
    category: "apparel",
    slug: "unisex-t-shirt-light",
    printful_product_id: 390629811,
    image_url: "/Tshirt/Men/ReformMenTshirtCharcoal1.webp"
  },
  {
    name: "Unisex Hoodie DARK",
    description: "Premium unisex hoodie with Reform UK branding - Dark colors",
    price: 39.99,
    category: "apparel",
    slug: "unisex-hoodie-dark",
    printful_product_id: 390628740,
    image_url: "/Hoodie/Men/ReformMenHoodieBlack1.webp"
  },
  {
    name: "Unisex Hoodie LIGHT",
    description: "Premium unisex hoodie with Reform UK branding - Light colors", 
    price: 39.99,
    category: "apparel",
    slug: "unisex-hoodie-light",
    printful_product_id: 390628620,
    image_url: "/Hoodie/Men/ReformMenHoodieBlack1.webp"
  },
  {
    name: "Reform UK Tote Bag",
    description: "Eco-friendly tote bag with Reform UK branding",
    price: 24.99,
    category: "gear",
    slug: "reform-uk-tote-bag",
    printful_product_id: 390552402,
    image_url: "/StickerToteWater/ReformToteBagBlack1.webp"
  }
];

async function restoreProducts() {
  console.log('=== RESTORING PRODUCTS WITH PRINTFUL IDS ===\n');

  for (const product of productsData) {
    console.log(`Creating product: ${product.name}`);
    
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description,
        price: product.price,
        retail_price: product.price,
        category: product.category,
        slug: product.slug,
        printful_product_id: product.printful_product_id,
        image_url: product.image_url,
        is_active: true,
        tags: ['printful-sync'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id');

    if (error) {
      console.error(`Error creating ${product.name}:`, error);
    } else {
      console.log(`✅ Created ${product.name} with ID: ${data[0]?.id}`);
    }
  }

  // Check total products created
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact' });

  console.log(`\n✅ Total products in database: ${count}`);
}

restoreProducts().catch(console.error);