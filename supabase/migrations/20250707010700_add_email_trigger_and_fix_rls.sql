-- Removed email trigger due to unsupported 'http' extension on Supabase
-- Migration: Fix RLS policies for orders table
-- This migration fixes RLS policies for manual testing and webhook operations

-- Fix RLS policies for orders table
-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Service role can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can update orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create new, more permissive policies
CREATE POLICY "Allow service role full access to orders"
ON public.orders
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.email() = customer_email);

-- Allow anonymous users to view orders (for guest checkout)
CREATE POLICY "Allow anonymous users to view orders"
ON public.orders
AS PERMISSIVE
FOR SELECT
TO anon
USING (true);

-- Allow service role to insert orders (for webhooks and testing)
CREATE POLICY "Allow service role to insert orders"
ON public.orders
AS PERMISSIVE
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow service role to update orders
CREATE POLICY "Allow service role to update orders"
ON public.orders
AS PERMISSIVE
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

 