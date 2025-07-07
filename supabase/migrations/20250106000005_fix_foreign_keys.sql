-- Fix foreign key relationships and make schema more robust
-- Migration: 20250106000005_fix_foreign_keys.sql

-- Step 1: Update orders table to have proper UUID primary key
ALTER TABLE orders 
ADD COLUMN id UUID DEFAULT gen_random_uuid();

-- Make the new id column the primary key
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_pkey;

ALTER TABLE orders 
ADD PRIMARY KEY (id);

-- Add unique constraint to stripe_session_id
ALTER TABLE orders 
ADD CONSTRAINT orders_stripe_session_id_unique UNIQUE (stripe_session_id);

-- Step 2: Update order_items table to reference orders.id instead of stripe_session_id
-- First, add the new order_id column
ALTER TABLE order_items 
ADD COLUMN order_id_new UUID;

-- Update the new column with the corresponding orders.id values
UPDATE order_items 
SET order_id_new = orders.id 
FROM orders 
WHERE order_items.order_id = orders.stripe_session_id;

-- Drop the old foreign key constraint
ALTER TABLE order_items 
DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

-- Drop the old order_id column
ALTER TABLE order_items 
DROP COLUMN order_id;

-- Rename the new column to order_id
ALTER TABLE order_items 
RENAME COLUMN order_id_new TO order_id;

-- Add the new foreign key constraint
ALTER TABLE order_items 
ADD CONSTRAINT order_items_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- Step 3: Update products table to ensure it has UUID primary key
-- Check if products table exists and has proper structure
DO $$
BEGIN
    -- Create products table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        CREATE TABLE products (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            variant TEXT,
            description TEXT,
            price_pence INTEGER NOT NULL,
            category TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- Ensure products table has UUID primary key
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'id' AND data_type = 'uuid'
        ) THEN
            -- Add id column if it doesn't exist
            ALTER TABLE products ADD COLUMN id UUID DEFAULT gen_random_uuid();
            
            -- Make it primary key
            ALTER TABLE products DROP CONSTRAINT IF EXISTS products_pkey;
            ALTER TABLE products ADD PRIMARY KEY (id);
        END IF;
    END IF;
END $$;

-- Step 4: Update order_items to properly reference products
-- Ensure order_items has product_id column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'product_id'
    ) THEN
        ALTER TABLE order_items ADD COLUMN product_id UUID;
    END IF;
END $$;

-- Add foreign key constraint for product_id
ALTER TABLE order_items 
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE order_items 
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id);

-- Step 5: Drop the old order_items view and recreate it
DROP VIEW IF EXISTS order_items_with_products;

-- Create new view with proper joins
CREATE VIEW order_items_with_products AS
SELECT 
    oi.id,
    oi.order_id,
    oi.product_id,
    p.name as product_name,
    oi.quantity,
    oi.unit_price,
    oi.created_at,
    oi.updated_at
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id;

-- Step 6: Update RLS policies for the new structure
-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON order_items;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON order_items;

-- Recreate policies for orders
CREATE POLICY "Enable read access for all users" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON orders
    FOR INSERT WITH CHECK (true);

-- Recreate policies for order_items
CREATE POLICY "Enable read access for all users" ON order_items
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON order_items
    FOR INSERT WITH CHECK (true);

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category); 