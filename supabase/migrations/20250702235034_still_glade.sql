/*
  # Create Stripe integration tables and view

  1. New Tables
    - `stripe_customers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `customer_id` (text, unique Stripe customer ID)
      - `created_at` (timestamp)
      - `deleted_at` (timestamp, nullable)
    
    - `stripe_subscriptions`
      - `id` (uuid, primary key)
      - `customer_id` (text, foreign key to stripe_customers)
      - `subscription_id` (text, unique Stripe subscription ID)
      - `price_id` (text, Stripe price ID)
      - `current_period_start` (timestamp)
      - `current_period_end` (timestamp)
      - `cancel_at_period_end` (boolean)
      - `payment_method_brand` (text)
      - `payment_method_last4` (text)
      - `status` (text, subscription status)
      - `created_at` (timestamp)

    - `stripe_user_orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `customer_id` (text, foreign key to stripe_customers)
      - `order_id` (text, unique order identifier)
      - `amount` (integer, amount in cents)
      - `currency` (text, currency code)
      - `status` (text, order status)
      - `order_date` (timestamp)
      - `created_at` (timestamp)

  2. Views
    - `stripe_user_subscriptions` - joins subscriptions with customers filtered by authenticated user

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
*/

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS public.stripe_customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    customer_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);

ALTER TABLE public.stripe_customers ADD CONSTRAINT stripe_customers_pkey PRIMARY KEY (id);
ALTER TABLE public.stripe_customers ADD CONSTRAINT stripe_customers_customer_id_key UNIQUE (customer_id);
ALTER TABLE public.stripe_customers ADD CONSTRAINT stripe_customers_user_id_key UNIQUE (user_id);
ALTER TABLE public.stripe_customers ADD CONSTRAINT stripe_customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create stripe_subscriptions table
CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id text NOT NULL,
    subscription_id text UNIQUE,
    price_id text,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancel_at_period_end boolean DEFAULT false,
    payment_method_brand text,
    payment_method_last4 text,
    status text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.stripe_subscriptions ADD CONSTRAINT stripe_subscriptions_pkey PRIMARY KEY (id);
ALTER TABLE public.stripe_subscriptions ADD CONSTRAINT stripe_subscriptions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.stripe_customers(customer_id) ON DELETE CASCADE;

-- Create stripe_user_orders table
CREATE TABLE IF NOT EXISTS public.stripe_user_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    customer_id text,
    order_id text NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'gbp',
    status text NOT NULL,
    order_date timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.stripe_user_orders ADD CONSTRAINT stripe_user_orders_pkey PRIMARY KEY (id);
ALTER TABLE public.stripe_user_orders ADD CONSTRAINT stripe_user_orders_order_id_key UNIQUE (order_id);
ALTER TABLE public.stripe_user_orders ADD CONSTRAINT stripe_user_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_user_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for stripe_customers
CREATE POLICY "Users can read own customer data"
    ON public.stripe_customers
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own customer data"
    ON public.stripe_customers
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own customer data"
    ON public.stripe_customers
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create policies for stripe_subscriptions
CREATE POLICY "Users can read own subscription data"
    ON public.stripe_subscriptions
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.stripe_customers 
        WHERE stripe_customers.customer_id = stripe_subscriptions.customer_id 
        AND stripe_customers.user_id = auth.uid()
    ));

CREATE POLICY "Service role can manage subscriptions"
    ON public.stripe_subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policies for stripe_user_orders
CREATE POLICY "Users can read own orders"
    ON public.stripe_user_orders
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own orders"
    ON public.stripe_user_orders
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage orders"
    ON public.stripe_user_orders
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create the stripe_user_subscriptions view
CREATE OR REPLACE VIEW public.stripe_user_subscriptions AS
SELECT
    s.*,
    c.user_id
FROM
    public.stripe_subscriptions s
JOIN
    public.stripe_customers c ON s.customer_id = c.customer_id
WHERE
    c.user_id = auth.uid();