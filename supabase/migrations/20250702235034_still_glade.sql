/*
  # Create Stripe Integration Tables for E-commerce

  This migration file sets up the necessary tables for a Stripe integration
  that supports both authenticated user and guest checkouts. It is designed
  for one-off payments and does NOT include subscription logic.

  1. New Tables:
     - `stripe_customers`: Links your application's users to Stripe Customer IDs.
     - `stripe_orders`: Stores order information, with support for both
       logged-in users (via `customer_id`) and guests (via `session_id`).

  2. Security (RLS):
     - Enables Row Level Security on all tables.
     - `stripe_customers`: Policies allow users to manage their own customer object.
     - `stripe_orders`: A single, robust policy allows users (authenticated or guest)
       to read their own order data, ensuring guests cannot see other users' orders.
     - It is recommended that inserts/updates to these tables are handled by a
       secure backend process (e.g., webhook handler) using the 'service_role' key.
*/

-- Create stripe_customers table
-- This table links your auth.users to Stripe Customer IDs
CREATE TABLE IF NOT EXISTS public.stripe_customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    customer_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add constraints for stripe_customers
ALTER TABLE public.stripe_customers ADD CONSTRAINT stripe_customers_pkey PRIMARY KEY (id);
ALTER TABLE public.stripe_customers ADD CONSTRAINT stripe_customers_customer_id_key UNIQUE (customer_id);
ALTER TABLE public.stripe_customers ADD CONSTRAINT stripe_customers_user_id_key UNIQUE (user_id);
ALTER TABLE public.stripe_customers ADD CONSTRAINT stripe_customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create stripe_orders table (replaces stripe_user_orders)
-- This table stores order data for both guests and logged-in users.
CREATE TABLE IF NOT EXISTS public.stripe_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id text, -- Nullable because a guest won't have a customer object initially
    session_id text,  -- Used to identify guest user orders
    amount_subtotal integer,
    amount_total integer,
    currency text,
    payment_status text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add constraints for stripe_orders
ALTER TABLE public.stripe_orders ADD CONSTRAINT stripe_orders_pkey PRIMARY KEY (id);
ALTER TABLE public.stripe_orders ADD CONSTRAINT stripe_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.stripe_customers(customer_id) ON DELETE SET NULL;


-- Enable Row Level Security on all tables
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_orders ENABLE ROW LEVEL SECURITY;


-- Create policies for stripe_customers
-- Users should be able to view their own customer data.
CREATE POLICY "Users can read own customer data"
    ON public.stripe_customers
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());


-- Create policies for stripe_orders
-- This single policy handles both authenticated and guest users.
CREATE POLICY "Allow users (authenticated or guest) to view their own orders"
    ON public.stripe_orders
    FOR SELECT
    TO authenticated, anon -- Apply policy to both logged-in and guest users
    USING (
      -- Case 1: The user is authenticated, and their UID matches the user_id in the customers table
      (auth.role() = 'authenticated' AND customer_id IN (SELECT c.customer_id FROM public.stripe_customers c WHERE c.user_id = auth.uid())) OR
      -- Case 2: The user is a guest, and their session ID matches the order's session_id
      (auth.role() = 'anon' AND session_id = current_setting('request.jwt.claims.session_id', true))
    );


-- Grant permissions. The RLS policies above will handle the actual data security.
GRANT SELECT ON public.stripe_customers TO authenticated;
GRANT SELECT ON public.stripe_orders TO authenticated, anon;

-- It is recommended to use the service_role for all INSERT, UPDATE, DELETE operations
-- from a secure backend environment (e.g., Stripe webhook handler).
-- Example policy for service_role (optional, as service_role bypasses RLS by default)
CREATE POLICY "Service role can manage all data"
    ON public.stripe_orders
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can manage all customer data"
    ON public.stripe_customers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
