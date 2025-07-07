-- up
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT,
  customer_email TEXT,
  items JSONB,
  customer_details JSONB,
  created_at TIMESTAMP DEFAULT timezone('utc', now())
);

-- down
-- Drop order_items dependencies first
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;

-- Now drop the orders table
DROP TABLE IF EXISTS orders; 