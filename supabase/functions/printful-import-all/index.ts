// Printful Import All Function - Import all products from Printful and replace existing data
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Printful Import All Function Started")

interface PrintfulProduct {
  id: number;
  name: string;
  description: string;
  retail_price: string;
  sync_product: {
    id: number;
    name: string;
    description: string;
    retail_price: string;
    thumbnail_url: string;
    variants: Array<{
      id: number;
      name: string;
      retail_price: string;
      in_stock: boolean;
    }>;
  };
}

interface ImportResult {
  success: boolean;
  message: string;
  productsImported?: number;
  productsUpdated?: number;
  productsSkipped?: number;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    // Only allow POST requests for importing products
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Method not allowed',
        message: 'Only POST requests are supported for importing products'
      }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // Get the Printful token and Supabase credentials from environment variables
    const token = Deno.env.get('PRINTFUL_TOKEN')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Environment variables check:')
    console.log('- PRINTFUL_TOKEN:', token ? 'SET' : 'NOT SET')
    console.log('- SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET')
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'NOT SET')
    
    if (!token) {
      console.error('PRINTFUL_TOKEN environment variable is not set');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'PRINTFUL_TOKEN not configured',
        message: 'Please check if PRINTFUL_TOKEN is set in Supabase secrets'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Supabase credentials not configured',
        message: 'Please check Supabase environment variables'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    console.log('Starting comprehensive Printful import...')
    console.log('Supabase URL:', supabaseUrl)

    // Create Supabase client with service role key
    let supabase;
    try {
      supabase = createClient(supabaseUrl, supabaseServiceKey)
      console.log('Supabase client created successfully')
    } catch (error) {
      console.error('Failed to create Supabase client:', error)
      throw new Error(`Failed to create Supabase client: ${error.message}`)
    }

    // Fetch all products from Printful
    console.log('Fetching all products from Printful...')
    console.log('Using token:', token ? `${token.substring(0, 10)}...` : 'NO TOKEN')
    
    let response;
    try {
      response = await fetch('https://api.printful.com/sync/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      console.log('Printful API response status:', response.status)
    } catch (error) {
      console.error('Failed to fetch from Printful API:', error)
      throw new Error(`Failed to fetch from Printful API: ${error.message}`)
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Printful API error response:', errorText)
      throw new Error(`Printful API error: ${response.status} ${response.statusText}`)
    }

    let printfulData;
    try {
      printfulData = await response.json()
      console.log('Printful API response parsed successfully')
    } catch (error) {
      console.error('Failed to parse Printful API response:', error)
      throw new Error(`Failed to parse Printful API response: ${error.message}`)
    }
    
    const products = printfulData.result || []
    console.log('Products extracted from response:', products.length)
    
    // Debug: Log the first product structure to understand the data format
    if (products.length > 0) {
      console.log('First product structure:', JSON.stringify(products[0], null, 2))
    }

    if (products.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No products found in Printful',
        productsImported: 0,
        productsUpdated: 0,
        productsSkipped: 0
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // Filter out products that don't have the required sync_product structure
    console.log('Filtering products with valid structure...')
    const validProducts = products.filter(product => {
      if (!product.sync_product) {
        console.log(`Skipping product ${product.id}: missing sync_product`)
        return false
      }
      if (!product.sync_product.name) {
        console.log(`Skipping product ${product.id}: missing sync_product.name`)
        return false
      }
      if (!product.sync_product.retail_price) {
        console.log(`Skipping product ${product.id}: missing sync_product.retail_price`)
        return false
      }
      return true
    })
    
    console.log(`Valid products found: ${validProducts.length} out of ${products.length}`)

    if (validProducts.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No valid products found in Printful response',
        productsImported: 0,
        productsUpdated: 0,
        productsSkipped: 0
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // Transform valid Printful products to match your database schema
    const transformedProducts = validProducts.map((product: PrintfulProduct) => {
      const retailPrice = parseFloat(product.sync_product.retail_price)
      const name = product.sync_product.name
      
      return {
        printful_product_id: product.id.toString(),
        name: name,
        description: product.sync_product.description || 'No description available',
        retail_price: retailPrice,
        image_url: product.sync_product.thumbnail_url || '',
        category: 'Printful Import', // Default category
        tags: ['printful', 'imported'],
        is_available: true,
        in_stock: true,
        stock_count: 999, // Default stock count
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        reviews: 0,
        rating: 0,
        price: retailPrice, // Use retail price as base price
        printful_cost: retailPrice * 0.7, // Estimate cost
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })

    console.log(`Transformed ${transformedProducts.length} products`)

    // Get existing products to check for duplicates
    console.log('Checking existing products...')
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, printful_product_id, name')

    if (fetchError) {
      console.error('Error fetching existing products:', fetchError)
      throw new Error(`Failed to fetch existing products: ${fetchError.message}`)
    }

    console.log(`Found ${existingProducts?.length || 0} existing products`)

    // Separate new products from existing ones
    const newProducts = []
    const productsToUpdate = []
    let skippedCount = 0

    for (const printfulProduct of transformedProducts) {
      const existingProduct = existingProducts?.find(p => p.printful_product_id === printfulProduct.printful_product_id)
      
      if (existingProduct) {
        // Product exists, add to update list
        productsToUpdate.push({
          id: existingProduct.id,
          ...printfulProduct,
          updated_at: new Date().toISOString()
        })
      } else {
        // New product, add to insert list
        newProducts.push(printfulProduct)
      }
    }

    console.log(`New products to insert: ${newProducts.length}`)
    console.log(`Existing products to update: ${productsToUpdate.length}`)

    let insertResult = null
    let updateResult = null

    // Insert new products
    if (newProducts.length > 0) {
      console.log('Inserting new products...')
      const { data: insertedProducts, error: insertError } = await supabase
        .from('products')
        .insert(newProducts)
        .select()

      if (insertError) {
        console.error('Error inserting new products:', insertError)
        throw new Error(`Failed to insert new products: ${insertError.message}`)
      }

      insertResult = insertedProducts
      console.log(`Successfully inserted ${insertResult?.length || 0} new products`)
    }

    // Update existing products
    if (productsToUpdate.length > 0) {
      console.log('Updating existing products...')
      
      for (const product of productsToUpdate) {
        const { error: updateError } = await supabase
          .from('products')
          .update({
            name: product.name,
            description: product.description,
            retail_price: product.retail_price,
            image_url: product.image_url,
            category: product.category,
            tags: product.tags,
            is_available: product.is_available,
            in_stock: product.in_stock,
            stock_count: product.stock_count,
            slug: product.slug,
            price: product.price,
            printful_cost: product.printful_cost,
            updated_at: product.updated_at
          })
          .eq('id', product.id)

        if (updateError) {
          console.error(`Error updating product ${product.id}:`, updateError)
          skippedCount++
        }
      }

      console.log(`Successfully updated ${productsToUpdate.length - skippedCount} products`)
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully processed ${products.length} products from Printful`,
      productsImported: insertResult?.length || 0,
      productsUpdated: productsToUpdate.length - skippedCount,
      productsSkipped: skippedCount
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    console.error('Error in Printful import function:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to import products',
      message: error.message || 'An error occurred while importing products from Printful'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
})
