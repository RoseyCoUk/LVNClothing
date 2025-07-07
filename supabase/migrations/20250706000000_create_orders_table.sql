-- 20250706000000_create_orders_table.sql

-- up
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT,
  customer_email TEXT,
  items JSONB,
  customer_details JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- down
DROP TABLE IF EXISTS orders; 