-- up
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text,
  customer_email text,
  items jsonb,
  customer_details jsonb,
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- down
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders; 