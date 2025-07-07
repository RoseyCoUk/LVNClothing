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
DROP TABLE IF EXISTS orders; 