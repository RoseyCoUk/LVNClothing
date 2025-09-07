// Emergency schema fix function
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req: Request) => {
  // Only allow POST requests from admin
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Simple auth check - should be called only by admin
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.includes(supabaseServiceKey)) {
    return new Response('Unauthorized', { status: 401 });
  }

  console.log('🔧 Starting emergency orders table schema fix...');

  try {
    const fixResults = [];

    // SQL statements to execute
    const sqlStatements = [
      {
        description: 'Add currency column',
        sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'GBP'`
      },
      {
        description: 'Add readable_order_id column',
        sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS readable_order_id TEXT`
      },
      {
        description: 'Add customer_email column',
        sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT`
      },
      {
        description: 'Add items column',
        sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB`
      },
      {
        description: 'Add shipping_cost column',
        sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2)`
      },
      {
        description: 'Add subtotal column',
        sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2)`
      },
      {
        description: 'Add guest_checkout column',
        sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_checkout BOOLEAN DEFAULT false`
      }
    ];

    // Execute each SQL statement
    for (const statement of sqlStatements) {
      console.log(`Executing: ${statement.description}`);
      
      try {
        const { error } = await supabase
          .from('_supabase_migrations') // This should fail, but let's try a different approach
          .select('*')
          .limit(0);

        // Since we can't execute raw SQL directly, we'll need to use a different approach
        // Let's try using a stored procedure approach or return the SQL for manual execution
        fixResults.push({
          step: statement.description,
          status: 'prepared',
          sql: statement.sql
        });

      } catch (error) {
        console.error(`Error with ${statement.description}:`, error);
        fixResults.push({
          step: statement.description,
          status: 'error',
          error: error.message,
          sql: statement.sql
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Schema fix SQL prepared. Execute these SQL statements manually in the Supabase SQL Editor:',
      sqlStatements: sqlStatements.map(s => s.sql),
      results: fixResults
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Emergency schema fix error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});