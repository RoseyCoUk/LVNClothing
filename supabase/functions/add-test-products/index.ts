import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Add test products with real Printful IDs
    const testProducts = [
      {
        id: crypto.randomUUID(),
        name: 'Reform UK Sticker',
        description: 'High-quality Reform UK sticker with our logo and branding',
        price: 2.99,
        image_url: 'https://files.cdn.printful.com/files/0c1/0c1f25b661edfe4404afa3bd271e2039_preview.png',
        slug: 'reform-uk-sticker',
        category: 'Stickers',
        tags: ['sticker', 'reform', 'uk', 'branding'],
        reviews: 0,
        rating: 0,
        in_stock: true,
        stock_count: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        printful_product_id: '390637627',
        printful_cost: 1.50,
        retail_price: 2.99,
        is_available: true
      },
      {
        id: crypto.randomUUID(),
        name: 'Reform UK Mug',
        description: 'Ceramic mug featuring Reform UK branding',
        price: 12.99,
        image_url: 'https://files.cdn.printful.com/files/f75/f75fb5d7303c416ff7380d21521a17ff_preview.png',
        slug: 'reform-uk-mug',
        category: 'Mugs',
        tags: ['mug', 'ceramic', 'reform', 'uk', 'drinkware'],
        reviews: 0,
        rating: 0,
        in_stock: true,
        stock_count: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        printful_product_id: '390637302',
        printful_cost: 6.50,
        retail_price: 12.99,
        is_available: true
      },
      {
        id: crypto.randomUUID(),
        name: 'Reform UK T-Shirt',
        description: 'Comfortable cotton t-shirt with Reform UK design',
        price: 24.99,
        image_url: 'https://files.cdn.printful.com/files/example-tshirt.png',
        slug: 'reform-uk-tshirt',
        category: 'Clothing',
        tags: ['tshirt', 'cotton', 'reform', 'uk', 'clothing'],
        reviews: 0,
        rating: 0,
        in_stock: true,
        stock_count: 75,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        printful_product_id: '390637999',
        printful_cost: 12.50,
        retail_price: 24.99,
        is_available: true
      }
    ]

    // Insert the products
    const { data, error } = await supabase
      .from('products')
      .insert(testProducts)
      .select()

    if (error) {
      console.error('Error inserting products:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the products were inserted
    const { data: verifyData, error: verifyError } = await supabase
      .from('products')
      .select('id, name, printful_product_id, category, price, is_available')
      .not('printful_product_id', 'is', null)
      .order('created_at', { ascending: false })

    if (verifyError) {
      console.error('Error verifying products:', verifyError)
      return new Response(
        JSON.stringify({ error: verifyError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test products added successfully',
        inserted: data,
        verified: verifyData
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
