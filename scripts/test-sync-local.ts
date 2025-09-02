import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

async function testPrintfulSyncLocal() {
  console.log('🧪 Testing Printful sync function locally...')
  
  try {
    const response = await fetch('http://127.0.0.1:54321/functions/v1/printful-sync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'full_sync' })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ Function error:', data)
      return
    }
    
    console.log('✅ Function response:', data)
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

testPrintfulSyncLocal()