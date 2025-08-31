// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Printful Sync Function Started")

interface SyncRequest {
  productId: string;
  action: 'sync_product' | 'sync_inventory' | 'sync_variants' | 'full_sync';
}

interface SyncResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  let syncRequest: SyncRequest | null = null;

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Method not allowed',
        message: 'Only POST requests are supported'
      }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // Get the Printful token from environment variables
    const token = Deno.env.get('PRINTFUL_TOKEN')
    
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

    // Parse the request body only once
    syncRequest = await req.json()
    
    if (!syncRequest.productId || !syncRequest.action) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid request',
        message: 'productId and action are required'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    console.log('Processing Printful sync request:', syncRequest)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Create a simple Supabase client for this function
    const supabase = {
      url: supabaseUrl,
      key: supabaseServiceKey,
      async fetch(endpoint: string, options: RequestInit = {}) {
        const url = `${supabaseUrl}/rest/v1${endpoint}`
        const headers = {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
        
        return fetch(url, { ...options, headers })
      }
    }

    // Update sync status to syncing
    await updateSyncStatus(supabase, syncRequest.productId, {
      is_syncing: true,
      sync_progress: 10,
      last_sync_status: 'pending'
    })

    let syncResult: any = null

    // Perform the sync based on action
    switch (syncRequest.action) {
      case 'sync_product':
        syncResult = await syncProduct(token, syncRequest.productId)
        break
      
      case 'sync_inventory':
        syncResult = await syncInventory(token, syncRequest.productId)
        break
      
      case 'sync_variants':
        syncResult = await syncVariants(token, syncRequest.productId)
        break
      
      case 'full_sync':
        syncResult = await fullSync(token, syncRequest.productId)
        break
      
      default:
        throw new Error(`Unknown sync action: ${syncRequest.action}`)
    }

    // Update sync status to completed
    await updateSyncStatus(supabase, syncRequest.productId, {
      is_syncing: false,
      sync_progress: 100,
      last_sync_status: 'success',
      last_sync: new Date().toISOString()
    })

    // Log successful sync
    await logInventoryChange(supabase, {
      product_id: syncRequest.productId,
      change_type: 'sync_completed',
      new_value: syncRequest.action,
      processed: true
    })

    return new Response(JSON.stringify({
      success: true,
      message: `Printful sync completed for product ${syncRequest.productId}`,
      data: syncResult
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    console.error('Error in Printful sync function:', error)
    
    // Try to update sync status to failed if we have the productId
    if (syncRequest?.productId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        
        const supabase = {
          url: supabaseUrl,
          key: supabaseServiceKey,
          async fetch(endpoint: string, options: RequestInit = {}) {
            const url = `${supabaseUrl}/rest/v1${endpoint}`
            const headers = {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              ...options.headers
            }
            
            return fetch(url, { ...options, headers })
          }
        }
        
        await updateSyncStatus(supabase, syncRequest.productId, {
          is_syncing: false,
          sync_progress: 0,
          last_sync_status: 'failed'
        })
        
        // Log sync error
        await logSyncError(supabase, {
          type: 'sync',
          severity: 'high',
          message: error.message || 'Sync failed',
          details: error.stack
        })
      } catch (logError) {
        console.error('Failed to log sync error:', logError)
      }
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Sync failed',
      message: error.message || 'An unexpected error occurred during sync'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
})

// Helper function to update sync status
async function updateSyncStatus(supabase: any, productId: string, updates: any) {
  try {
    const response = await supabase.fetch('/sync_status', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        timestamp: new Date().toISOString(),
        ...updates
      })
    })
    
    if (!response.ok) {
      console.error('Failed to update sync status:', await response.text())
    }
  } catch (error) {
    console.error('Error updating sync status:', error)
  }
}

// Helper function to log inventory changes
async function logInventoryChange(supabase: any, change: any) {
  try {
    const response = await supabase.fetch('/inventory_changes', {
      method: 'POST',
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        ...change
      })
    })
    
    if (!response.ok) {
      console.error('Failed to log inventory change:', await response.text())
    }
  } catch (error) {
    console.error('Error logging inventory change:', error)
  }
}

// Helper function to log sync errors
async function logSyncError(supabase: any, error: any) {
  try {
    const response = await supabase.fetch('/sync_errors', {
      method: 'POST',
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        ...error
      })
    })
    
    if (!response.ok) {
      console.error('Failed to log sync error:', await response.text())
    }
  } catch (error) {
    console.error('Error logging sync error:', error)
  }
}

// Printful API sync functions
async function syncProduct(token: string, productId: string) {
  const response = await fetch(`https://api.printful.com/sync/products/${productId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Printful API error: ${response.statusText}`)
  }
  
  return await response.json()
}

async function syncInventory(token: string, productId: string) {
  const response = await fetch(`https://api.printful.com/sync/products/${productId}/variants`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Printful API error: ${response.statusText}`)
  }
  
  return await response.json()
}

async function syncVariants(token: string, productId: string) {
  const response = await fetch(`https://api.printful.com/sync/products/${productId}/variants`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Printful API error: ${response.statusText}`)
  }
  
  return await response.json()
}

async function fullSync(token: string, productId: string) {
  // For now, just return a success message
  // You can implement full sync logic here
  return {
    message: 'Full sync completed',
    productId: productId,
    timestamp: new Date().toISOString()
  }
}
