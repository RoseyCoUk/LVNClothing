-- Seed Admin Products System with Initial Data (FIXED VERSION)
-- This script populates the database with sample data for testing the admin products management system
-- Run the fix-products-table.sql script first if you get column errors

-- 1. First, let's check what we're working with
SELECT 'Current database state:' as info;
SELECT 
  table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) 
    THEN 'exists' 
    ELSE 'missing' 
  END as table_status
FROM (VALUES 
  ('products'), ('product_overrides'), ('product_images'), 
  ('bundles'), ('bundle_items'), ('sync_status'), 
  ('inventory_changes'), ('sync_errors'), ('data_conflicts'),
  ('webhook_logs'), ('notifications')
) AS t(table_name);

-- 2. Check products table structure
SELECT 'Products table columns:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- 3. Insert sample products (using the actual column structure)
DO $$
DECLARE
  product_id_1 uuid;
  product_id_2 uuid;
  product_id_3 uuid;
  product_id_4 uuid;
  product_id_5 uuid;
  product_id_6 uuid;
BEGIN
  -- Insert products and capture their IDs
  INSERT INTO public.products (id, name, description, retail_price, printful_cost, category, is_available, created_at, updated_at)
  VALUES 
    (
      gen_random_uuid(),
      'Starter Bundle',
      'Perfect introduction to Reform UK merchandise. Includes essential items for supporters.',
      29.99,
      15.50,
      'bundle',
      true,
      NOW(),
      NOW()
    )
  RETURNING id INTO product_id_1;
  
  INSERT INTO public.products (id, name, description, retail_price, printful_cost, category, is_available, created_at, updated_at)
  VALUES 
    (
      gen_random_uuid(),
      'Champion Bundle',
      'Premium collection for dedicated supporters. High-quality items with exclusive designs.',
      49.99,
      25.75,
      'bundle',
      true,
      NOW(),
      NOW()
    )
  RETURNING id INTO product_id_2;
  
  INSERT INTO public.products (id, name, description, retail_price, printful_cost, category, is_available, created_at, updated_at)
  VALUES 
    (
      gen_random_uuid(),
      'Activist Bundle',
      'Complete activist kit with all essential items for campaigning and events.',
      79.99,
      40.25,
      'bundle',
      true,
      NOW(),
      NOW()
    )
  RETURNING id INTO product_id_3;
  
  INSERT INTO public.products (id, name, description, retail_price, printful_cost, category, is_available, created_at, updated_at)
  VALUES 
    (
      gen_random_uuid(),
      'Reform UK T-Shirt - Ash Grey',
      'High-quality cotton t-shirt featuring the Reform UK logo in a classic ash grey color.',
      19.99,
      8.50,
      'clothing',
      true,
      NOW(),
      NOW()
    )
  RETURNING id INTO product_id_4;
  
  INSERT INTO public.products (id, name, description, retail_price, printful_cost, category, is_available, created_at, updated_at)
  VALUES 
    (
      gen_random_uuid(),
      'Reform UK Hoodie - Ash Grey',
      'Comfortable and warm hoodie with the Reform UK logo, perfect for outdoor events.',
      34.99,
      15.25,
      'clothing',
      true,
      NOW(),
      NOW()
    )
  RETURNING id INTO product_id_5;
  
  INSERT INTO public.products (id, name, description, retail_price, printful_cost, category, is_available, created_at, updated_at)
  VALUES 
    (
      gen_random_uuid(),
      'Reform UK Cap - Black',
      'Stylish black cap with embroidered Reform UK logo, adjustable fit.',
      14.99,
      6.75,
      'accessories',
      true,
      NOW(),
      NOW()
    )
  RETURNING id INTO product_id_6;
  
  RAISE NOTICE 'Inserted 6 sample products with IDs: %, %, %, %, %, %', 
    product_id_1, product_id_2, product_id_3, product_id_4, product_id_5, product_id_6;
END $$;

-- 4. Insert sample bundles
INSERT INTO public.bundles (id, name, description, custom_price, is_active, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'Starter Bundle',
    'Perfect introduction to Reform UK merchandise. Includes essential items for supporters.',
    29.99,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Champion Bundle',
    'Premium collection for dedicated supporters. High-quality items with exclusive designs.',
    49.99,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Activist Bundle',
    'Complete activist kit with all essential items for campaigning and events.',
    79.99,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- 5. Insert sample product images (get the actual product IDs)
DO $$
DECLARE
  tshirt_product_id uuid;
  hoodie_product_id uuid;
  cap_product_id uuid;
BEGIN
  -- Get product IDs by name
  SELECT id INTO tshirt_product_id FROM public.products WHERE name LIKE '%T-Shirt%' LIMIT 1;
  SELECT id INTO hoodie_product_id FROM public.products WHERE name LIKE '%Hoodie%' LIMIT 1;
  SELECT id INTO cap_product_id FROM public.products WHERE name LIKE '%Cap%' LIMIT 1;
  
  -- Insert sample images if we have valid product IDs
  IF tshirt_product_id IS NOT NULL THEN
    INSERT INTO public.product_images (id, product_id, image_url, image_order, is_primary, created_at)
    VALUES 
      (gen_random_uuid(), tshirt_product_id, 'https://example.com/tshirt-front.jpg', 1, true, NOW()),
      (gen_random_uuid(), tshirt_product_id, 'https://example.com/tshirt-back.jpg', 2, false, NOW()),
      (gen_random_uuid(), tshirt_product_id, 'https://example.com/tshirt-detail.jpg', 3, false, NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Added images for T-Shirt product: %', tshirt_product_id;
  END IF;
  
  IF hoodie_product_id IS NOT NULL THEN
    INSERT INTO public.product_images (id, product_id, image_url, image_order, is_primary, created_at)
    VALUES 
      (gen_random_uuid(), hoodie_product_id, 'https://example.com/hoodie-front.jpg', 1, true, NOW()),
      (gen_random_uuid(), hoodie_product_id, 'https://example.com/hoodie-back.jpg', 2, false, NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Added images for Hoodie product: %', hoodie_product_id;
  END IF;
  
  IF cap_product_id IS NOT NULL THEN
    INSERT INTO public.product_images (id, product_id, image_url, image_order, is_primary, created_at)
    VALUES 
      (gen_random_uuid(), cap_product_id, 'https://example.com/cap-front.jpg', 1, true, NOW()),
      (gen_random_uuid(), cap_product_id, 'https://example.com/cap-side.jpg', 2, false, NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Added images for Cap product: %', cap_product_id;
  END IF;
END $$;

-- 6. Insert sample bundle items (get the actual IDs)
DO $$
DECLARE
  starter_bundle_id uuid;
  champion_bundle_id uuid;
  activist_bundle_id uuid;
  tshirt_product_id uuid;
  hoodie_product_id uuid;
  cap_product_id uuid;
BEGIN
  -- Get bundle IDs
  SELECT id INTO starter_bundle_id FROM public.bundles WHERE name = 'Starter Bundle' LIMIT 1;
  SELECT id INTO champion_bundle_id FROM public.bundles WHERE name = 'Champion Bundle' LIMIT 1;
  SELECT id INTO activist_bundle_id FROM public.bundles WHERE name = 'Activist Bundle' LIMIT 1;
  
  -- Get product IDs by name
  SELECT id INTO tshirt_product_id FROM public.products WHERE name LIKE '%T-Shirt%' LIMIT 1;
  SELECT id INTO hoodie_product_id FROM public.products WHERE name LIKE '%Hoodie%' LIMIT 1;
  SELECT id INTO cap_product_id FROM public.products WHERE name LIKE '%Cap%' LIMIT 1;
  
  -- Insert bundle items if we have valid IDs
  IF starter_bundle_id IS NOT NULL AND tshirt_product_id IS NOT NULL AND cap_product_id IS NOT NULL THEN
    INSERT INTO public.bundle_items (id, bundle_id, product_id, quantity, created_at)
    VALUES 
      (gen_random_uuid(), starter_bundle_id, tshirt_product_id, 1, NOW()),
      (gen_random_uuid(), starter_bundle_id, cap_product_id, 1, NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Added items to Starter Bundle';
  END IF;
  
  IF champion_bundle_id IS NOT NULL AND tshirt_product_id IS NOT NULL AND hoodie_product_id IS NOT NULL AND cap_product_id IS NOT NULL THEN
    INSERT INTO public.bundle_items (id, bundle_id, product_id, quantity, created_at)
    VALUES 
      (gen_random_uuid(), champion_bundle_id, tshirt_product_id, 1, NOW()),
      (gen_random_uuid(), champion_bundle_id, hoodie_product_id, 1, NOW()),
      (gen_random_uuid(), champion_bundle_id, cap_product_id, 1, NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Added items to Champion Bundle';
  END IF;
  
  IF activist_bundle_id IS NOT NULL AND tshirt_product_id IS NOT NULL AND hoodie_product_id IS NOT NULL AND cap_product_id IS NOT NULL THEN
    INSERT INTO public.bundle_items (id, bundle_id, product_id, quantity, created_at)
    VALUES 
      (gen_random_uuid(), activist_bundle_id, tshirt_product_id, 2, NOW()),
      (gen_random_uuid(), activist_bundle_id, hoodie_product_id, 1, NOW()),
      (gen_random_uuid(), activist_bundle_id, cap_product_id, 1, NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Added items to Activist Bundle';
  END IF;
END $$;

-- 7. Insert initial sync status
INSERT INTO public.sync_status (id, timestamp, is_connected, last_sync, last_sync_status, sync_progress, is_syncing, connection_health, error_count, warning_count, inventory_changes, data_conflicts, created_at)
VALUES 
  (
    gen_random_uuid(),
    NOW(),
    true,
    NOW(),
    'success',
    100,
    false,
    'excellent',
    0,
    0,
    0,
    0,
    NOW()
  )
ON CONFLICT DO NOTHING;

-- 8. Verify the data was inserted
SELECT 
  'Data Insertion Summary:' as info,
  'Products' as table_name,
  COUNT(*) as record_count
FROM public.products
UNION ALL
SELECT 
  'Data Insertion Summary:' as info,
  'Bundles' as table_name,
  COUNT(*) as record_count
FROM public.bundles
UNION ALL
SELECT 
  'Data Insertion Summary:' as info,
  'Bundle Items' as table_name,
  COUNT(*) as record_count
FROM public.bundle_items
UNION ALL
SELECT 
  'Data Insertion Summary:' as info,
  'Product Images' as table_name,
  COUNT(*) as record_count
FROM public.product_images
UNION ALL
SELECT 
  'Data Insertion Summary:' as info,
  'Sync Status' as table_name,
  COUNT(*) as record_count
FROM public.sync_status
ORDER BY table_name;

-- 9. Show sample data for verification
SELECT 'Sample Products' as section, name, retail_price, is_available FROM public.products LIMIT 3;
SELECT 'Sample Bundles' as section, name, custom_price, is_active FROM public.bundles LIMIT 3;
SELECT 'Sample Bundle Items' as section, COUNT(*) as item_count FROM public.bundle_items GROUP BY bundle_id LIMIT 3;
SELECT 'Sample Product Images' as section, COUNT(*) as image_count FROM public.product_images GROUP BY product_id LIMIT 3;

RAISE NOTICE 'Database seeding completed successfully!';

