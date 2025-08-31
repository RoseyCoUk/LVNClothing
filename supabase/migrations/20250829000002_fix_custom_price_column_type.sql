-- Fix the custom_price column type from BOOLEAN to DECIMAL(10,2)
-- This fixes the "invalid input syntax for type boolean" error

-- First, drop the existing column
ALTER TABLE products DROP COLUMN IF EXISTS custom_price;

-- Then add it back with the correct type
ALTER TABLE products ADD COLUMN custom_price DECIMAL(10,2);

-- Update any existing boolean values to NULL (since they can't be converted)
-- This is safe as custom_price is optional
