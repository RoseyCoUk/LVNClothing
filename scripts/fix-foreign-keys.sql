-- Fix Foreign Key Relationships
-- This script ensures all foreign key constraints are properly established

-- First, let's check what foreign keys exist
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('product_overrides', 'product_images', 'bundle_items', 'sync_status');

-- Drop existing foreign key constraints if they exist
DO $$ 
BEGIN
    -- Drop foreign keys from product_overrides
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'product_overrides_product_id_fkey'
    ) THEN
        ALTER TABLE public.product_overrides DROP CONSTRAINT product_overrides_product_id_fkey;
    END IF;
    
    -- Drop foreign keys from product_images
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'product_images_product_id_fkey'
    ) THEN
        ALTER TABLE public.product_images DROP CONSTRAINT product_images_product_id_fkey;
    END IF;
    
    -- Drop foreign keys from bundle_items
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bundle_items_product_id_fkey'
    ) THEN
        ALTER TABLE public.bundle_items DROP CONSTRAINT bundle_items_product_id_fkey;
    END IF;
    
    -- Drop foreign keys from sync_status
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sync_status_product_id_fkey'
    ) THEN
        ALTER TABLE public.sync_status DROP CONSTRAINT sync_status_product_id_fkey;
    END IF;
END $$;

-- Recreate foreign key constraints
ALTER TABLE public.product_overrides 
ADD CONSTRAINT product_overrides_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.product_images 
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.bundle_items 
ADD CONSTRAINT bundle_items_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.sync_status 
ADD CONSTRAINT sync_status_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Verify the constraints were created
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('product_overrides', 'product_images', 'bundle_items', 'sync_status');

-- Test the relationship by trying to insert a test record
INSERT INTO public.sync_status (product_id, last_sync_status, last_sync, is_syncing, sync_progress)
SELECT id, 'unknown', NOW(), false, 0 FROM public.products LIMIT 1;

-- Clean up test record
DELETE FROM public.sync_status WHERE last_sync_status = 'unknown';

SELECT 'Foreign key relationships fixed successfully!' as status;
