-- Add readable_order_id with organization-specific prefixes
-- Migration: 20250707010100_add_readable_order_id_with_org_prefix.sql

-- up
-- Add readable_order_id column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS readable_order_id TEXT;

-- Create unique index on readable_order_id to ensure no duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_readable_order_id ON orders(readable_order_id);

-- Create index for efficient ordering by readable_order_id
CREATE INDEX IF NOT EXISTS idx_orders_readable_order_id_asc ON orders(readable_order_id ASC);

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS set_readable_order_id ON orders;
DROP FUNCTION IF EXISTS generate_readable_order_id();

-- Create the trigger function to generate readable order IDs
CREATE OR REPLACE FUNCTION generate_readable_order_id()
RETURNS TRIGGER AS $$
DECLARE
    org_prefix TEXT := 'RB'; -- Default prefix for Reform UK
    max_number INTEGER := 0;
    next_number INTEGER;
    new_readable_id TEXT;
BEGIN
    -- Only generate if readable_order_id is NULL
    IF NEW.readable_order_id IS NULL THEN
        -- Get the maximum number for this organization prefix
        -- Use advisory lock to prevent race conditions
        PERFORM pg_advisory_xact_lock(12345); -- Arbitrary lock ID
        
        SELECT COALESCE(MAX(
            CASE 
                WHEN readable_order_id ~ ('^' || org_prefix || '-[0-9]+$') 
                THEN CAST(SUBSTRING(readable_order_id FROM LENGTH(org_prefix) + 2) AS INTEGER)
                ELSE 0
            END
        ), 0) INTO max_number
        FROM orders 
        WHERE readable_order_id IS NOT NULL;
        
        -- Increment the number
        next_number := max_number + 1;
        
        -- Format the new readable order ID (left-pad to 5 digits)
        new_readable_id := org_prefix || '-' || LPAD(next_number::TEXT, 5, '0');
        
        -- Set the new readable order ID
        NEW.readable_order_id := new_readable_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER set_readable_order_id
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_readable_order_id();

-- down
-- Drop the trigger
DROP TRIGGER IF EXISTS set_readable_order_id ON orders;

-- Drop the function
DROP FUNCTION IF EXISTS generate_readable_order_id();

-- Drop the indexes
DROP INDEX IF EXISTS idx_orders_readable_order_id_asc;
DROP INDEX IF EXISTS idx_orders_readable_order_id;

-- Remove the column
ALTER TABLE orders DROP COLUMN IF EXISTS readable_order_id; 