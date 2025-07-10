-- Update order ID format to REFORM-2025-0001
-- Migration: 20250707340000_update_order_id_format.sql

-- Add readable_order_id column if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS readable_order_id TEXT;

-- Create unique index on readable_order_id to ensure no duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_readable_order_id ON orders(readable_order_id);

-- Create index for efficient ordering by readable_order_id
CREATE INDEX IF NOT EXISTS idx_orders_readable_order_id_asc ON orders(readable_order_id ASC);

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS set_readable_order_id ON orders;
DROP FUNCTION IF EXISTS generate_readable_order_id();

-- Create the updated trigger function to generate readable order IDs in REFORM-2025-0001 format
CREATE OR REPLACE FUNCTION generate_readable_order_id()
RETURNS TRIGGER AS $$
DECLARE
    current_year TEXT := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    org_prefix TEXT := 'REFORM';
    max_number INTEGER := 0;
    next_number INTEGER;
    new_readable_id TEXT;
BEGIN
    -- Only generate if readable_order_id is NULL
    IF NEW.readable_order_id IS NULL THEN
        -- Get the maximum number for this organization prefix and year
        -- Use advisory lock to prevent race conditions
        PERFORM pg_advisory_xact_lock(12345); -- Arbitrary lock ID
        
        SELECT COALESCE(MAX(
            CASE 
                WHEN readable_order_id ~ ('^' || org_prefix || '-' || current_year || '-[0-9]+$') 
                THEN CAST(SUBSTRING(readable_order_id FROM LENGTH(org_prefix || '-' || current_year || '-') + 1) AS INTEGER)
                ELSE 0
            END
        ), 0) INTO max_number
        FROM orders 
        WHERE readable_order_id IS NOT NULL;
        
        -- Increment the number
        next_number := max_number + 1;
        
        -- Format the new readable order ID: REFORM-2025-0001
        new_readable_id := org_prefix || '-' || current_year || '-' || LPAD(next_number::TEXT, 4, '0');
        
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