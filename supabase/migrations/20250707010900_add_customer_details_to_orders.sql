-- Migration: Add customer_details column to orders table
-- This migration adds a JSONB column to store customer details from Stripe sessions

-- Add customer_details column to orders table
ALTER TABLE public.orders 
ADD COLUMN customer_details JSONB;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.customer_details IS 'Stores customer details from Stripe checkout session (name, phone, address, etc.)';

-- Create index for better query performance on customer_details
CREATE INDEX IF NOT EXISTS idx_orders_customer_details ON public.orders USING GIN (customer_details);

-- Add comment for the index
COMMENT ON INDEX public.idx_orders_customer_details IS 'GIN index for efficient JSONB queries on customer_details'; 