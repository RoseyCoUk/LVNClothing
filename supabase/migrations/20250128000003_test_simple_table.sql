-- Test migration to verify the system is working
-- up

CREATE TABLE IF NOT EXISTS public.test_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- down
DROP TABLE IF EXISTS public.test_table;
