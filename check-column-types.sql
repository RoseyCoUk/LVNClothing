-- Check the exact data types of price-related columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns
WHERE table_name = 'products'
AND table_schema = 'public'
AND column_name IN ('price', 'printful_cost', 'margin', 'custom_price')
ORDER BY ordinal_position;

-- Also check if there are any boolean columns that might be causing confusion
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
AND table_schema = 'public'
AND data_type = 'boolean'
ORDER BY ordinal_position;
