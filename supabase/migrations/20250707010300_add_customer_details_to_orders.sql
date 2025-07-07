-- up
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text,
  customer_email text,
  items jsonb,
  customer_details jsonb,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- down
DROP TABLE IF EXISTS orders; 