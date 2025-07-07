-- Add UNIQUE constraint to stripe_session_id
ALTER TABLE orders
ADD CONSTRAINT unique_stripe_session_id UNIQUE (stripe_session_id);

-- Re-create order_items table with proper foreign key reference
DROP TABLE IF EXISTS order_items CASCADE;

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES orders(stripe_session_id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price INT NOT NULL, -- store in pennies
  total_price INT GENERATED ALWAYS AS (quantity * unit_price) STORED
);