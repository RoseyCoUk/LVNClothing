import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Import real Printful API client and image storage
import { PrintfulAPIClient } from '../_shared/printful-api-client.ts'
import { ImageStorageManager } from '../_shared/image-storage.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('🚀 Starting REAL Printful API sync...')
    
    // Initialize Printful API client
    const printfulClient = new PrintfulAPIClient()
    
    // Initialize image storage manager
    const imageManager = new ImageStorageManager(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Step 1: Clean existing data
    console.log('🧹 Cleaning existing data...')
    await cleanExistingData(supabaseClient)
    
    // Step 2: Ensure storage bucket exists
    console.log('🪣 Setting up image storage...')
    await imageManager.ensureBucketExists()

    // Step 3: Fetch real products from Printful API
    console.log('📡 Fetching real products from Printful API...')
    const printfulProducts = await printfulClient.getAllProductsWithVariants()
    
    if (printfulProducts.length === 0) {
      throw new Error('No products found in Printful store')
    }

    // Step 4: Process and insert products
    console.log('📦 Processing and inserting products...')
    const processedResults = await processRealProducts(supabaseClient, printfulClient, imageManager, printfulProducts)

    // Step 5: Verify final state
    console.log('✅ Verifying final state...')
    const verification = await verifySync(supabaseClient)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Printful sync completed successfully',
        results: {
          products: processedResults.totalProducts,
          variants: processedResults.totalVariants,
          images: processedResults.totalImages,
        },
        verification
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ Sync error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function cleanExistingData(supabase: any) {
  // Clean existing Printful data only - PRESERVE CUSTOM DATA
  console.log('🧹 Cleaning existing Printful data (preserving custom images)...')
  
  // Delete Printful variants (by printful_variant_id)
  const { error: variantError } = await supabase
    .from('product_variants')
    .delete()
    .not('printful_variant_id', 'is', null)
  
  // Delete Printful images only (preserve custom images)
  const { error: imageError } = await supabase
    .from('product_images')
    .delete()
    .eq('source', 'printful')
  
  // Delete products that have printful_product_id (Printful synced products)
  const { error: productError } = await supabase
    .from('products')
    .delete()
    .not('printful_product_id', 'is', null)
  
  if (variantError) console.log('⚠️ Variant cleanup error:', variantError)
  if (imageError) console.log('⚠️ Image cleanup error:', imageError)
  if (productError) console.log('⚠️ Product cleanup error:', productError)
  
  console.log('✅ Cleaned existing Printful data (custom data preserved)')
}

async function processRealProducts(
  supabase: any, 
  printfulClient: PrintfulAPIClient, 
  imageManager: ImageStorageManager, 
  printfulProducts: any[]
): Promise<{ totalProducts: number; totalVariants: number; totalImages: number }> {
  let totalProducts = 0
  let totalVariants = 0
  let totalImages = 0

  console.log(`📦 Processing ${printfulProducts.length} real Printful products...`)

  for (const printfulProduct of printfulProducts) {
    const syncProduct = printfulProduct.sync_product
    const syncVariants = printfulProduct.sync_variants || []

    console.log(`💻 Processing: ${syncProduct.name} (${syncVariants.length} variants)`)

    // Skip if no variants
    if (syncVariants.length === 0) {
      console.log(`⚠️ Skipping ${syncProduct.name} - no variants`)
      continue
    }

    // Categorize the product
    const category = printfulClient.categorizeProduct(printfulProduct)
    
    // Generate slug
    const slug = generateSlug(syncProduct.name)
    
    // Calculate base price from first variant
    const basePrice = parseFloat(syncVariants[0].retail_price) || 24.99

    // Insert product into database
    const { data: insertedProduct, error: productError } = await supabase
      .from('products')
      .insert({
        name: syncProduct.name,
        slug: slug,
        description: `Premium ${category} with Reform UK branding`,
        category: category,
        price: basePrice,
        printful_product_id: syncProduct.id,
        is_active: true
      })
      .select()
      .single()

    if (productError) {
      console.error(`❌ Error inserting product ${syncProduct.name}:`, productError)
      continue
    }

    totalProducts++
    console.log(`✅ Inserted product: ${syncProduct.name} (ID: ${insertedProduct.id})`)

    // Process main product image - RESPECT EXISTING CUSTOM IMAGES
    if (syncProduct.thumbnail_url) {
      try {
        // Check for existing custom images before inserting Printful images
        const { data: existingCustomImages } = await supabase
          .from('product_images')
          .select('id, is_thumbnail, is_primary')
          .eq('product_id', insertedProduct.id)
          .eq('source', 'custom');

        // Check if custom thumbnail already exists
        const hasCustomThumbnail = existingCustomImages && existingCustomImages.some(img => img.is_thumbnail);
        
        // Check if custom primary already exists
        const hasCustomPrimary = existingCustomImages && existingCustomImages.some(img => img.is_primary);

        // Only insert Printful image if no conflicting custom images exist
        if (!hasCustomThumbnail && !hasCustomPrimary) {
          const fileName = imageManager.generateFileName(syncProduct.name, 'main', 0)
          const publicUrl = await imageManager.downloadAndStoreImage(
            syncProduct.thumbnail_url,
            fileName,
            category
          )

          await supabase
            .from('product_images')
            .insert({
              product_id: insertedProduct.id,
              image_url: publicUrl,
              alt_text: `${syncProduct.name} Printful image`,
              is_primary: false, // Never set as primary to avoid overriding custom
              is_thumbnail: false, // Never set as thumbnail to avoid overriding custom
              source: 'printful' // Track source for future reference
            })

          totalImages++
          console.log(`✅ Added Printful image for ${syncProduct.name} (no custom images exist)`)
        } else {
          console.log(`⚠️ Skipping Printful image for ${syncProduct.name} - custom images exist (thumbnail: ${hasCustomThumbnail}, primary: ${hasCustomPrimary})`)
        }
      } catch (error) {
        console.error(`❌ Error processing main image for ${syncProduct.name}:`, error)
      }
    }

    // Process variants
    for (const variant of syncVariants) {
      if (variant.is_ignored) {
        continue
      }

      // Parse variant options (color, size)
      const { color, size, colorCode } = printfulClient.parseVariantOptions(variant)
      
      const variantName = variant.name || `${color || 'Default'} - ${size || 'One Size'}`
      const variantValue = `${color || 'Default'} - ${size || 'One Size'}`
      
      // DEBUG: Log variant data structure
      console.log(`🔍 DEBUG Variant structure:`, {
        sync_variant_id: variant.sync_variant_id,
        id: variant.id,
        variant_id: variant.variant_id, // This is the catalog variant ID we need for shipping!
        name: variant.name,
        keys: Object.keys(variant)
      })
      
      // IMPORTANT: Use variant_id (catalog ID) for shipping, not sync_variant_id (store ID)
      let printfulVariantId = variant.variant_id ? String(variant.variant_id) : null
      
      // Only use fallback if we truly have no variant_id
      if (!printfulVariantId) {
        console.warn(`⚠️ No variant_id found for ${variantName}, using fallback`)
        printfulVariantId = String(4000000 + totalVariants) // Generate unique test ID
      }
      
      console.log(`🆔 Using printful_variant_id: ${printfulVariantId} for ${variantName}`)
      
      const { data: insertedVariant, error: variantError } = await supabase
        .from('product_variants')
        .insert({
          product_id: insertedProduct.id,
          printful_variant_id: printfulVariantId,
          name: variantName,
          value: variantValue,
          color: color || 'Default',
          size: size || 'One Size',
          in_stock: true,
          is_available: true
        })
        .select()
        .single()

      if (variantError) {
        console.error(`❌ Error inserting variant ${variantName}:`, variantError)
        continue
      }

      totalVariants++

      // Process variant image - RESPECT EXISTING CUSTOM IMAGES
      if (variant.product?.image) {
        try {
          // Check for existing custom variant images for this specific variant
          const { data: existingVariantImages } = await supabase
            .from('product_images')
            .select('id')
            .eq('product_id', insertedProduct.id)
            .eq('source', 'custom')
            .or(`color.eq.${color},variant_type.eq.color`);

          // Only add Printful variant image if no custom variant images exist for this color
          if (!existingVariantImages || existingVariantImages.length === 0) {
            const fileName = imageManager.generateFileName(syncProduct.name, variantName, totalImages)
            const publicUrl = await imageManager.downloadAndStoreImage(
              variant.product.image,
              fileName,
              category
            )

            await supabase
              .from('product_images')
              .insert({
                product_id: insertedProduct.id,
                image_url: publicUrl,
                alt_text: `${variantName} Printful image`,
                is_primary: false, // Never set as primary
                is_thumbnail: false, // Never set as thumbnail
                source: 'printful', // Track source
                color: color, // Track variant color
                variant_type: 'color' // Track variant type
              })

            totalImages++
            console.log(`✅ Added Printful variant image for ${variantName}`)
          } else {
            console.log(`⚠️ Skipping Printful variant image for ${variantName} - custom variant images exist`)
          }
        } catch (error) {
          console.error(`❌ Error processing variant image for ${variantName}:`, error)
        }
      }
    }

    console.log(`✅ Processed ${syncProduct.name}: ${syncVariants.length} variants`)
  }

  console.log(`🎉 Processing complete: ${totalProducts} products, ${totalVariants} variants, ${totalImages} images`)
  
  return { totalProducts, totalVariants, totalImages }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/reform uk/gi, '') // Remove "Reform UK" prefix
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .trim() || 'product' // Fallback if empty
}

// Old functions removed - now integrated into processRealProducts

async function verifySync(supabase: any) {
  // Count final results
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug')
  
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, product_id, name')
  
  const { data: images } = await supabase
    .from('product_images')
    .select('id, product_id')
  
  const verification = {
    products: products?.length || 0,
    variants: variants?.length || 0,
    images: images?.length || 0,
    expectedProducts: 10, // Real Printful products
    expectedVariants: 158, // As specified
    success: true
  }
  
  // Check if we hit our targets
  if (verification.products < 8) {
    console.warn(`⚠️ Product count low: expected 10, got ${verification.products}`)
  }
  
  if (verification.variants < 100) {
    console.warn(`⚠️ Variant count low: expected ~158, got ${verification.variants}`)
  }
  
  console.log(`✅ Final verification:`)
  console.log(`   Products: ${verification.products}`)
  console.log(`   Variants: ${verification.variants}`)
  console.log(`   Images: ${verification.images}`)
  
  return verification
}
