-- Migration: Comprehensive RLS policies for all tables
-- This fixes the 401 errors that are blocking all functionality

-- ============================================================================
-- PRODUCTS TABLE - Public read access, authenticated admin access
-- ============================================================================

-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON public.products;

-- Create comprehensive policies for products
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

-- ============================================================================
-- PRODUCT_VARIANTS TABLE - Public read access, authenticated admin access
-- ============================================================================

-- Enable RLS on product_variants table
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Allow authenticated users to manage product variants" ON public.product_variants;

-- Create comprehensive policies for product_variants
CREATE POLICY "product_variants_public_read" ON public.product_variants
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "product_variants_authenticated_all" ON public.product_variants
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ORDERS TABLE - Users can only access their own orders
-- ============================================================================

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "orders_user_access" ON public.orders;

-- Create policies for orders
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

-- ============================================================================
-- ORDER_ITEMS TABLE - Users can only access items from their own orders
-- ============================================================================

-- Enable RLS on order_items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "order_items_user_access" ON public.order_items;

-- Create policies for order_items
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

-- ============================================================================
-- USER_PREFERENCES TABLE - Users can only access their own preferences
-- ============================================================================

-- Enable RLS on user_preferences table
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "user_preferences_user_access" ON public.user_preferences;

-- Create policies for user_preferences
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

-- ============================================================================
-- NEWSLETTER_SUBSCRIBERS TABLE - Public insert, authenticated read (for admins)
-- ============================================================================

-- Enable RLS on newsletter_subscribers table
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "newsletter_subscribers_public_insert" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_subscribers_admin_read" ON public.newsletter_subscribers;

-- Create policies for newsletter_subscribers
CREATE POLICY "newsletter_subscribers_public_insert" ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "newsletter_subscribers_admin_read" ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true); -- In production, you might want to restrict this to admin users only

-- ============================================================================
-- GRANT NECESSARY PERMISSIONS
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
-- VERIFICATION QUERIES (for testing)
-- ============================================================================

-- These queries can be run to verify the policies are working:
/*
-- Test anonymous access to products
SELECT * FROM public.products LIMIT 1;

-- Test authenticated user access to their own orders
-- (requires being logged in)
SELECT * FROM public.orders WHERE user_id = auth.uid();

-- Test newsletter subscription
INSERT INTO public.newsletter_subscribers (email) VALUES ('test@example.com');
*/
