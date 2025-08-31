-- Enable RLS on Admin Products Management Tables
-- This script enables Row Level Security on all tables that need it

-- 1. Check current RLS status on all tables
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN 'ENABLED'
        ELSE 'DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN (
    'product_overrides', 
    'product_images', 
    'bundles', 
    'bundle_items'
)
ORDER BY tablename;

-- 2. Enable RLS on product_overrides table
ALTER TABLE public.product_overrides ENABLE ROW LEVEL SECURITY;

-- 3. Enable RLS on product_images table
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- 4. Enable RLS on bundles table
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;

-- 5. Enable RLS on bundle_items table
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;

-- 6. Verify RLS is now enabled on all tables
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN 'ENABLED'
        ELSE 'DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN (
    'product_overrides', 
    'product_images', 
    'bundles', 
    'bundle_items'
)
ORDER BY tablename;

-- 7. Summary of what we've done
SELECT 
    'Tables with RLS Enabled' as check_type,
    COUNT(*)::text as count
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN (
    'product_overrides', 
    'product_images', 
    'bundles', 
    'bundle_items'
) AND rowsecurity = true

UNION ALL

SELECT 
    'Total Tables Checked' as check_type,
    '4'::text as count;
