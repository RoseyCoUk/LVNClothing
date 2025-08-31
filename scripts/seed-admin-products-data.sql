-- Seed Admin Products System with Initial Data
-- This script populates the database with sample data for testing the admin products management system

-- 1. Insert sample products (if they don't exist)
INSERT INTO public.products (id, printful_product_id, name, description, retail_price, printful_cost, category, is_available, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'starter-bundle',
    'Starter Bundle',
    'Perfect introduction to Reform UK merchandise. Includes essential items for supporters.',
    29.99,
    15.50,
    'bundle',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'champion-bundle',
    'Champion Bundle',
    'Premium collection for dedicated supporters. High-quality items with exclusive designs.',
    49.99,
    25.75,
    'bundle',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'activist-bundle',
    'Activist Bundle',
    'Complete activist kit with all essential items for campaigning and events.',
    79.99,
    40.25,
    'bundle',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'reform-tshirt-ash-grey',
    'Reform UK T-Shirt - Ash Grey',
    'High-quality cotton t-shirt featuring the Reform UK logo in a classic ash grey color.',
    19.99,
    8.50,
    'clothing',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'reform-hoodie-ash-grey',
    'Reform UK Hoodie - Ash Grey',
    'Comfortable and warm hoodie with the Reform UK logo, perfect for outdoor events.',
    34.99,
    15.25,
    'clothing',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'reform-cap-black',
    'Reform UK Cap - Black',
    'Stylish black cap with embroidered Reform UK logo, adjustable fit.',
    14.99,
    6.75,
    'accessories',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (printful_product_id) DO NOTHING;

-- 2. Insert sample product overrides
INSERT INTO public.product_overrides (id, printful_product_id, custom_retail_price, custom_description, is_active, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'starter-bundle',
    29.99,
    'Perfect introduction to Reform UK merchandise. Includes essential items for supporters. Limited time offer!',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'champion-bundle',
    49.99,
    'Premium collection for dedicated supporters. High-quality items with exclusive designs. Best value!',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'reform-tshirt-ash-grey',
    19.99,
    'High-quality cotton t-shirt featuring the Reform UK logo in a classic ash grey color. Comfortable fit.',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (printful_product_id) DO NOTHING;

-- 3. Insert sample bundles
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

-- 4. Insert sample bundle items (get the actual IDs from the bundles table)
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
  
  -- Get product IDs
  SELECT id INTO tshirt_product_id FROM public.products WHERE printful_product_id = 'reform-tshirt-ash-grey' LIMIT 1;
  SELECT id INTO hoodie_product_id FROM public.products WHERE printful_product_id = 'reform-hoodie-ash-grey' LIMIT 1;
  SELECT id INTO cap_product_id FROM public.products WHERE printful_product_id = 'reform-cap-black' LIMIT 1;
  
  -- Insert bundle items if we have valid IDs
  IF starter_bundle_id IS NOT NULL AND tshirt_product_id IS NOT NULL AND cap_product_id IS NOT NULL THEN
    INSERT INTO public.bundle_items (id, bundle_id, product_id, quantity, created_at)
    VALUES 
      (gen_random_uuid(), starter_bundle_id, tshirt_product_id, 1, NOW()),
      (gen_random_uuid(), starter_bundle_id, cap_product_id, 1, NOW())
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF champion_bundle_id IS NOT NULL AND tshirt_product_id IS NOT NULL AND hoodie_product_id IS NOT NULL AND cap_product_id IS NOT NULL THEN
    INSERT INTO public.bundle_items (id, bundle_id, product_id, quantity, created_at)
    VALUES 
      (gen_random_uuid(), champion_bundle_id, tshirt_product_id, 1, NOW()),
      (gen_random_uuid(), champion_bundle_id, hoodie_product_id, 1, NOW()),
      (gen_random_uuid(), champion_bundle_id, cap_product_id, 1, NOW())
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF activist_bundle_id IS NOT NULL AND tshirt_product_id IS NOT NULL AND hoodie_product_id IS NOT NULL AND cap_product_id IS NOT NULL THEN
    INSERT INTO public.bundle_items (id, bundle_id, product_id, quantity, created_at)
    VALUES 
      (gen_random_uuid(), activist_bundle_id, tshirt_product_id, 2, NOW()),
      (gen_random_uuid(), activist_bundle_id, hoodie_product_id, 1, NOW()),
      (gen_random_uuid(), activist_bundle_id, cap_product_id, 1, NOW())
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 5. Insert sample product images (get the actual product IDs)
DO $$
DECLARE
  tshirt_product_id uuid;
  hoodie_product_id uuid;
  cap_product_id uuid;
BEGIN
  -- Get product IDs
  SELECT id INTO tshirt_product_id FROM public.products WHERE printful_product_id = 'reform-tshirt-ash-grey' LIMIT 1;
  SELECT id INTO hoodie_product_id FROM public.products WHERE printful_product_id = 'reform-hoodie-ash-grey' LIMIT 1;
  SELECT id INTO cap_product_id FROM public.products WHERE printful_product_id = 'reform-cap-black' LIMIT 1;
  
  -- Insert sample images if we have valid product IDs
  IF tshirt_product_id IS NOT NULL THEN
    INSERT INTO public.product_images (id, product_id, image_url, image_order, is_primary, created_at)
    VALUES 
      (gen_random_uuid(), tshirt_product_id, 'https://example.com/tshirt-front.jpg', 1, true, NOW()),
      (gen_random_uuid(), tshirt_product_id, 'https://example.com/tshirt-back.jpg', 2, false, NOW()),
      (gen_random_uuid(), tshirt_product_id, 'https://example.com/tshirt-detail.jpg', 3, false, NOW())
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF hoodie_product_id IS NOT NULL THEN
    INSERT INTO public.product_images (id, product_id, image_url, image_order, is_primary, created_at)
    VALUES 
      (gen_random_uuid(), hoodie_product_id, 'https://example.com/hoodie-front.jpg', 1, true, NOW()),
      (gen_random_uuid(), hoodie_product_id, 'https://example.com/hoodie-back.jpg', 2, false, NOW())
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF cap_product_id IS NOT NULL THEN
    INSERT INTO public.product_images (id, product_id, image_url, image_order, is_primary, created_at)
    VALUES 
      (gen_random_uuid(), cap_product_id, 'https://example.com/cap-front.jpg', 1, true, NOW()),
      (gen_random_uuid(), cap_product_id, 'https://example.com/cap-side.jpg', 2, false, NOW())
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 6. Insert initial sync status
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

-- 7. Insert sample inventory changes
INSERT INTO public.inventory_changes (id, timestamp, product_id, product_name, variant_id, variant_name, change_type, old_value, new_value, processed, printful_data, created_at)
VALUES 
  (
    gen_random_uuid(),
    NOW() - INTERVAL '1 hour',
    'reform-tshirt-ash-grey',
    'Reform UK T-Shirt - Ash Grey',
    'tshirt-medium',
    'Medium',
    'stock_update',
    '50',
    '45',
    true,
    '{"stock": 45, "variant_id": "tshirt-medium"}',
    NOW()
  ),
  (
    gen_random_uuid(),
    NOW() - INTERVAL '30 minutes',
    'reform-hoodie-ash-grey',
    'Reform UK Hoodie - Ash Grey',
    'hoodie-large',
    'Large',
    'availability_change',
    'true',
    'false',
    false,
    '{"available": false, "variant_id": "hoodie-large"}',
    NOW()
  )
ON CONFLICT DO NOTHING;

-- 8. Insert sample sync errors
INSERT INTO public.sync_errors (id, timestamp, type, severity, message, details, resolved, webhook_data, created_at)
VALUES 
  (
    gen_random_uuid(),
    NOW() - INTERVAL '2 hours',
    'webhook',
    'medium',
    'Webhook timeout during inventory sync',
    'Printful webhook request timed out after 30 seconds',
    false,
    '{"webhook_id": "webhook_123", "timeout": 30000}',
    NOW()
  )
ON CONFLICT DO NOTHING;

-- 9. Insert sample data conflicts
INSERT INTO public.data_conflicts (id, timestamp, product_id, conflict_type, printful_data, local_data, resolution, auto_resolution, resolved_at, resolved_by, created_at)
VALUES 
  (
    gen_random_uuid(),
    NOW() - INTERVAL '1 day',
    'reform-tshirt-ash-grey',
    'price_mismatch',
    '{"retail_price": "22.99"}',
    '{"retail_price": "19.99"}',
    'pending',
    'Use local price (custom override)',
    NULL,
    NULL,
    NOW()
  )
ON CONFLICT DO NOTHING;

-- 10. Insert sample webhook logs
INSERT INTO public.webhook_logs (id, timestamp, type, webhook_type, data, processed, processing_time_ms, created_at)
VALUES 
  (
    gen_random_uuid(),
    NOW() - INTERVAL '1 hour',
    'success',
    'inventory_update',
    '{"product_id": "reform-tshirt-ash-grey", "variants_updated": 3}',
    true,
    1250,
    NOW()
  ),
  (
    gen_random_uuid(),
    NOW() - INTERVAL '30 minutes',
    'success',
    'order_update',
    '{"order_id": "order_123", "status": "shipped"}',
    true,
    850,
    NOW()
  )
ON CONFLICT DO NOTHING;

-- 11. Insert sample notifications
INSERT INTO public.notifications (id, user_id, type, message, timestamp, read, action_url, metadata, created_at)
VALUES 
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'info',
    'Product sync completed successfully',
    NOW() - INTERVAL '1 hour',
    false,
    '/admin/products',
    '{"product_count": 15, "sync_duration": "2m 30s"}',
    NOW()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'warning',
    'Low stock alert: Reform UK T-Shirt - Ash Grey (Medium)',
    NOW() - INTERVAL '30 minutes',
    false,
    '/admin/products',
    '{"product_id": "reform-tshirt-ash-grey", "variant": "Medium", "stock_level": 5}',
    NOW()
  )
ON CONFLICT DO NOTHING;

-- 12. Verify the data was inserted
SELECT 
  'Products' as table_name,
  COUNT(*) as record_count
FROM public.products
UNION ALL
SELECT 
  'Product Overrides' as table_name,
  COUNT(*) as record_count
FROM public.product_overrides
UNION ALL
SELECT 
  'Bundles' as table_name,
  COUNT(*) as record_count
FROM public.bundles
UNION ALL
SELECT 
  'Bundle Items' as table_name,
  COUNT(*) as record_count
FROM public.bundle_items
UNION ALL
SELECT 
  'Product Images' as table_name,
  COUNT(*) as record_count
FROM public.product_images
UNION ALL
SELECT 
  'Sync Status' as table_name,
  COUNT(*) as record_count
FROM public.sync_status
UNION ALL
SELECT 
  'Inventory Changes' as table_name,
  COUNT(*) as record_count
FROM public.inventory_changes
UNION ALL
SELECT 
  'Sync Errors' as table_name,
  COUNT(*) as record_count
FROM public.sync_errors
UNION ALL
SELECT 
  'Data Conflicts' as table_name,
  COUNT(*) as record_count
FROM public.data_conflicts
UNION ALL
SELECT 
  'Webhook Logs' as table_name,
  COUNT(*) as record_count
FROM public.webhook_logs
UNION ALL
SELECT 
  'Notifications' as table_name,
  COUNT(*) as record_count
FROM public.notifications
ORDER BY table_name;

-- 13. Show sample data for verification
SELECT 'Sample Products' as section, name, printful_product_id, retail_price, is_available FROM public.products LIMIT 3;
SELECT 'Sample Bundles' as section, name, custom_price, is_active FROM public.bundles LIMIT 3;
SELECT 'Sample Product Overrides' as section, printful_product_id, custom_retail_price, is_active FROM public.product_overrides LIMIT 3;
