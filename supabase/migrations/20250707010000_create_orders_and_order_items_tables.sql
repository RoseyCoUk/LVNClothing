-- up
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text
);

-- down
DROP TABLE IF EXISTS orders;