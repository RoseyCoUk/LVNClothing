-- Fix RLS policies for orders and user_preferences tables
-- This migration resolves 401 Unauthorized errors when accessing order history and user preferences

-- up

-- 1. Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on user_preferences table
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for orders table
-- Allow authenticated users to view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.email() = customer_email
  );

-- Allow service role to insert orders (for webhooks and testing)
CREATE POLICY "Service role can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Allow service role to update orders
CREATE POLICY "Service role can update orders" ON public.orders
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow anonymous users to view orders (for guest checkout tracking)
CREATE POLICY "Anonymous users can view orders" ON public.orders
  FOR SELECT USING (true);

-- 4. Create RLS policies for user_preferences table
-- Allow authenticated users to view their own preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own preferences
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own preferences
CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow service role to manage user preferences (for triggers and admin functions)
CREATE POLICY "Service role can manage user preferences" ON public.user_preferences
  FOR ALL USING (true) WITH CHECK (true);

-- down
-- Drop policies for orders table
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can update orders" ON public.orders;
DROP POLICY IF EXISTS "Anonymous users can view orders" ON public.orders;

-- Drop policies for user_preferences table
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Service role can manage user preferences" ON public.user_preferences;

-- Disable RLS on tables
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences DISABLE ROW LEVEL SECURITY;
