-- Create order_items table for storing individual items in orders
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(stripe_session_id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price INT NOT NULL, -- store in pennies
  total_price INT GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Create index on order_id for faster lookups
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Create index on product_name for analytics
CREATE INDEX idx_order_items_product_name ON order_items(product_name);

-- Enable Row Level Security (RLS)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to insert order items
CREATE POLICY "Service role can insert order items" ON order_items
  FOR INSERT WITH CHECK (true);

-- Create policy to allow service role to select order items
CREATE POLICY "Service role can select order items" ON order_items
  FOR SELECT USING (true);

-- Create policy to allow service role to update order items
CREATE POLICY "Service role can update order items" ON order_items
  FOR UPDATE USING (true);

-- Create policy to allow service role to delete order items
CREATE POLICY "Service role can delete order items" ON order_items
  FOR DELETE USING (true); 