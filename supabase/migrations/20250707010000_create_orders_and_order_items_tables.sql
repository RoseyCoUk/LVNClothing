-- up
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

-- down
DROP TABLE IF EXISTS orders;