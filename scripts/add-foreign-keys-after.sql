-- Add Foreign Key Constraints (Run AFTER integrate-no-foreign-keys-first.sql)
-- This script adds foreign key relationships between the admin tables and products table

-- STEP 1: Add foreign key for product_overrides -> products
ALTER TABLE public.product_overrides 
ADD CONSTRAINT fk_product_overrides_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- STEP 2: Add foreign key for product_images -> products
ALTER TABLE public.product_images 
ADD CONSTRAINT fk_product_images_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- STEP 3: Add foreign key for bundle_items -> bundles
ALTER TABLE public.bundle_items 
ADD CONSTRAINT fk_bundle_items_bundle_id 
FOREIGN KEY (bundle_id) REFERENCES public.bundles(id) ON DELETE CASCADE;

-- STEP 4: Add foreign key for bundle_items -> products
ALTER TABLE public.bundle_items 
ADD CONSTRAINT fk_bundle_items_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- STEP 5: Add foreign key for sync_status -> products
ALTER TABLE public.sync_status 
ADD CONSTRAINT fk_sync_status_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- STEP 6: Verification - Check all foreign keys were added
SELECT 
  'Foreign Keys Added:' as info,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN ('product_overrides', 'product_images', 'bundle_items', 'sync_status')
ORDER BY tc.table_name, kcu.column_name;

-- STEP 7: Final status
SELECT 'Foreign Keys Complete!' as status, 'All relationships established' as detail;
