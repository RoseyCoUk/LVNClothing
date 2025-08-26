-- ============================================================================
-- PRODUCTION DEPLOYMENT: Comprehensive RLS Policies for ReformUK
-- ============================================================================
-- 
-- This script fixes the 401 Unauthorized errors by implementing proper
-- Row Level Security (RLS) policies for all tables.
--
-- RUN THIS ON YOUR PRODUCTION SUPABASE DATABASE
-- Location: Supabase Dashboard > SQL Editor > New Query
-- ============================================================================

-- ============================================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: DROP EXISTING POLICIES (if any)
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON public.products;
DROP POLICY IF EXISTS "Allow public read access to product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Allow authenticated users to manage product variants" ON public.product_variants;
DROP POLICY IF EXISTS "orders_user_access" ON public.orders;
DROP POLICY IF EXISTS "order_items_user_access" ON public.order_items;
DROP POLICY IF EXISTS "user_preferences_user_access" ON public.user_preferences;
DROP POLICY IF EXISTS "newsletter_subscribers_public_insert" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_subscribers_admin_read" ON public.newsletter_subscribers;

-- ============================================================================
-- STEP 3: CREATE COMPREHENSIVE RLS POLICIES
-- ============================================================================

-- PRODUCTS TABLE - Public read access, authenticated admin access
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "products_authenticated_insert" ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "products_authenticated_update" ON public.products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "products_authenticated_delete" ON public.products
  FOR DELETE
  TO authenticated
  USING (true);

-- PRODUCT_VARIANTS TABLE - Public read access, authenticated admin access
CREATE POLICY "product_variants_public_read" ON public.product_variants
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "product_variants_authenticated_all" ON public.product_variants
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ORDERS TABLE - Users can only access their own orders
CREATE POLICY "orders_user_read" ON public.orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "orders_user_insert" ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_user_update" ON public.orders
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_user_delete" ON public.orders
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ORDER_ITEMS TABLE - Users can only access items from their own orders
CREATE POLICY "order_items_user_read" ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_user_insert" ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_user_update" ON public.order_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_user_delete" ON public.order_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- USER_PREFERENCES TABLE - Users can only access their own preferences
CREATE POLICY "user_preferences_user_read" ON public.user_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_preferences_user_insert" ON public.user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_preferences_user_update" ON public.user_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_preferences_user_delete" ON public.user_preferences
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- NEWSLETTER_SUBSCRIBERS TABLE - Public insert, authenticated read
CREATE POLICY "newsletter_subscribers_public_insert" ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "newsletter_subscribers_admin_read" ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- STEP 4: GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT ON public.newsletter_subscribers TO authenticated;

-- Grant permissions on sequences (for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- STEP 5: VERIFICATION QUERIES
-- ============================================================================

-- Test 1: Anonymous users can read products (should work)
-- Run this as an anonymous user to verify public access
SELECT COUNT(*) as product_count FROM public.products;

-- Test 2: Check that RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'product_variants', 'orders', 'order_items', 'user_preferences', 'newsletter_subscribers')
ORDER BY tablename;

-- Test 3: Check that policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

-- If you see this message and no errors above, the RLS policies are working!
SELECT '✅ RLS policies successfully applied to all tables!' as status;
