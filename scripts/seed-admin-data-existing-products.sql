-- Seed Admin Products System with Existing Products
-- This script adds admin management data to your existing e-commerce products

-- 1. First, let's see what we're working with
SELECT 'Current products in database:' as info;
SELECT 
  id,
  name,
  price,
  category,
  in_stock,
  stock_count
FROM public.products
ORDER BY name;

-- 2. Create sample bundles using existing products
DO $$
DECLARE
  tshirt_id uuid;
  hoodie_id uuid;
  cap_id uuid;
  badge_id uuid;
  stickers_id uuid;
  starter_bundle_id uuid;
  champion_bundle_id uuid;
  activist_bundle_id uuid;
BEGIN
  -- Get existing product IDs
  SELECT id INTO tshirt_id FROM public.products WHERE name LIKE '%T-Shirt%' LIMIT 1;
  SELECT id INTO hoodie_id FROM public.products WHERE name LIKE '%Hoodie%' LIMIT 1;
  SELECT id INTO cap_id FROM public.products WHERE name LIKE '%Cap%' LIMIT 1;
  SELECT id INTO badge_id FROM public.products WHERE name LIKE '%Badge%' LIMIT 1;
  SELECT id INTO stickers_id FROM public.products WHERE name LIKE '%Stickers%' LIMIT 1;
  
  -- Create Starter Bundle (T-Shirt + Cap)
  IF tshirt_id IS NOT NULL AND cap_id IS NOT NULL THEN
    INSERT INTO public.bundles (id, name, description, custom_price, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Starter Bundle',
      'Perfect introduction to Reform UK merchandise. Includes T-Shirt and Cap.',
      39.98,
      true,
      NOW(),
      NOW()
    )
    RETURNING id INTO starter_bundle_id;
    
    -- Add bundle items
    INSERT INTO public.bundle_items (id, bundle_id, product_id, quantity, created_at)
    VALUES 
      (gen_random_uuid(), starter_bundle_id, tshirt_id, 1, NOW()),
      (gen_random_uuid(), starter_bundle_id, cap_id, 1, NOW());
    
    RAISE NOTICE 'Created Starter Bundle with ID: %', starter_bundle_id;
  END IF;
  
  -- Create Champion Bundle (Hoodie + T-Shirt + Cap)
  IF hoodie_id IS NOT NULL AND tshirt_id IS NOT NULL AND cap_id IS NOT NULL THEN
    INSERT INTO public.bundles (id, name, description, custom_price, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Champion Bundle',
      'Premium collection for dedicated supporters. High-quality items with exclusive designs.',
      89.97,
      true,
      NOW(),
      NOW()
    )
    RETURNING id INTO champion_bundle_id;
    
    -- Add bundle items
    INSERT INTO public.bundle_items (id, bundle_id, product_id, quantity, created_at)
    VALUES 
      (gen_random_uuid(), champion_bundle_id, hoodie_id, 1, NOW()),
      (gen_random_uuid(), champion_bundle_id, tshirt_id, 1, NOW()),
      (gen_random_uuid(), champion_bundle_id, cap_id, 1, NOW());
    
    RAISE NOTICE 'Created Champion Bundle with ID: %', champion_bundle_id;
  END IF;
  
  -- Create Activist Bundle (Everything + Badges + Stickers)
  IF hoodie_id IS NOT NULL AND tshirt_id IS NOT NULL AND cap_id IS NOT NULL AND badge_id IS NOT NULL AND stickers_id IS NOT NULL THEN
    INSERT INTO public.bundles (id, name, description, custom_price, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Activist Bundle',
      'Complete activist kit with all essential items for campaigning and events.',
      119.95,
      true,
      NOW(),
      NOW()
    )
    RETURNING id INTO activist_bundle_id;
    
    -- Add bundle items
    INSERT INTO public.bundle_items (id, bundle_id, product_id, quantity, created_at)
    VALUES 
      (gen_random_uuid(), activist_bundle_id, hoodie_id, 1, NOW()),
      (gen_random_uuid(), activist_bundle_id, tshirt_id, 1, NOW()),
      (gen_random_uuid(), activist_bundle_id, cap_id, 1, NOW()),
      (gen_random_uuid(), activist_bundle_id, badge_id, 1, NOW()),
      (gen_random_uuid(), activist_bundle_id, stickers_id, 1, NOW());
    
    RAISE NOTICE 'Created Activist Bundle with ID: %', activist_bundle_id;
  END IF;
END $$;

-- 3. Create sample product overrides for admin customization
DO $$
DECLARE
  tshirt_id uuid;
  hoodie_id uuid;
  cap_id uuid;
BEGIN
  -- Get existing product IDs
  SELECT id INTO tshirt_id FROM public.products WHERE name LIKE '%T-Shirt%' LIMIT 1;
  SELECT id INTO hoodie_id FROM public.products WHERE name LIKE '%Hoodie%' LIMIT 1;
  SELECT id INTO cap_id FROM public.products WHERE name LIKE '%Cap%' LIMIT 1;
  
  -- Create product overrides for admin customization
  IF tshirt_id IS NOT NULL THEN
    INSERT INTO public.product_overrides (id, product_id, printful_product_id, custom_retail_price, custom_description, custom_name, custom_category, custom_tags, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      tshirt_id,
      'reform-tshirt-ash-grey',
      24.99,
      'Classic T-shirt with Reform UK logo. High-quality cotton, comfortable fit.',
      'Reform UK T-Shirt - Ash Grey',
      'apparel',
      ARRAY['bestseller', 'cotton', 'comfortable'],
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created product override for T-Shirt';
  END IF;
  
  IF hoodie_id IS NOT NULL THEN
    INSERT INTO public.product_overrides (id, product_id, printful_product_id, custom_retail_price, custom_description, custom_name, custom_category, custom_tags, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      hoodie_id,
      'reform-hoodie-ash-grey',
      49.99,
      'Premium hoodie with Reform UK branding. Warm, comfortable, perfect for outdoor events.',
      'Reform UK Hoodie - Ash Grey',
      'apparel',
      ARRAY['bestseller', 'premium', 'warm'],
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created product override for Hoodie';
  END IF;
  
  IF cap_id IS NOT NULL THEN
    INSERT INTO public.product_overrides (id, product_id, printful_product_id, custom_retail_price, custom_description, custom_name, custom_category, custom_tags, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      cap_id,
      'reform-cap-black',
      19.99,
      'Adjustable cap with Reform UK logo. Stylish, comfortable, perfect for any occasion.',
      'Reform UK Cap - Black',
      'apparel',
      ARRAY['bestseller', 'adjustable', 'stylish'],
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created product override for Cap';
  END IF;
END $$;

-- 4. Add additional product images for existing products
DO $$
DECLARE
  tshirt_id uuid;
  hoodie_id uuid;
  cap_id uuid;
BEGIN
  -- Get existing product IDs
  SELECT id INTO tshirt_id FROM public.products WHERE name LIKE '%T-Shirt%' LIMIT 1;
  SELECT id INTO hoodie_id FROM public.products WHERE name LIKE '%Hoodie%' LIMIT 1;
  SELECT id INTO cap_id FROM public.products WHERE name LIKE '%Cap%' LIMIT 1;
  
  -- Add additional images for T-Shirt
  IF tshirt_id IS NOT NULL THEN
    INSERT INTO public.product_images (id, product_id, image_url, image_order, is_primary, created_at)
    VALUES 
      (gen_random_uuid(), tshirt_id, '/Tshirt/Men/ReformMenTshirtCharcoal2.webp', 2, false, NOW()),
      (gen_random_uuid(), tshirt_id, '/Tshirt/Men/ReformMenTshirtCharcoal3.webp', 3, false, NOW()),
      (gen_random_uuid(), tshirt_id, '/Tshirt/Women/ReformWomenTshirtCharcoal1.webp', 4, false, NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Added additional images for T-Shirt';
  END IF;
  
  -- Add additional images for Hoodie
  IF hoodie_id IS NOT NULL THEN
    INSERT INTO public.product_images (id, product_id, image_url, image_order, is_primary, created_at)
    VALUES 
      (gen_random_uuid(), hoodie_id, '/Hoodie/Men/ReformMenHoodieBlack2.webp', 2, false, NOW()),
      (gen_random_uuid(), hoodie_id, '/Hoodie/Men/ReformMenHoodieBlack3.webp', 3, false, NOW()),
      (gen_random_uuid(), hoodie_id, '/Hoodie/Women/ReformWomenHoodieBlack1.webp', 4, false, NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Added additional images for Hoodie';
  END IF;
  
  -- Add additional images for Cap
  IF cap_id IS NOT NULL THEN
    INSERT INTO public.product_images (id, product_id, image_url, image_order, is_primary, created_at)
    VALUES 
      (gen_random_uuid(), cap_id, '/Cap/ReformCapBlue2.webp', 2, false, NOW()),
      (gen_random_uuid(), cap_id, '/Cap/ReformCapBlue3.webp', 3, false, NOW()),
      (gen_random_uuid(), cap_id, '/Cap/ReformCapBlack1.webp', 4, false, NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Added additional images for Cap';
  END IF;
END $$;

-- 5. Create initial sync status for existing products
DO $$
DECLARE
  product_record RECORD;
BEGIN
  FOR product_record IN SELECT id, name FROM public.products
  LOOP
    INSERT INTO public.sync_status (id, product_id, timestamp, is_connected, last_sync, last_sync_status, sync_progress, is_syncing, connection_health, error_count, warning_count, inventory_changes, data_conflicts, created_at)
    VALUES (
      gen_random_uuid(),
      product_record.id,
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
    
    RAISE NOTICE 'Created sync status for product: %', product_record.name;
  END LOOP;
END $$;

-- 6. Verify the data was inserted
SELECT 
  'Admin Data Summary:' as info,
  'Bundles' as table_name,
  COUNT(*) as record_count
FROM public.bundles
UNION ALL
SELECT 
  'Admin Data Summary:' as info,
  'Bundle Items' as table_name,
  COUNT(*) as record_count
FROM public.bundle_items
UNION ALL
SELECT 
  'Admin Data Summary:' as info,
  'Product Overrides' as table_name,
  COUNT(*) as record_count
FROM public.product_overrides
UNION ALL
SELECT 
  'Admin Data Summary:' as info,
  'Product Images' as table_name,
  COUNT(*) as record_count
FROM public.product_images
UNION ALL
SELECT 
  'Admin Data Summary:' as info,
  'Sync Status' as table_name,
  COUNT(*) as record_count
FROM public.sync_status
ORDER BY table_name;

-- 7. Show sample data for verification
SELECT 'Sample Bundles' as section, name, custom_price, is_active FROM public.bundles LIMIT 3;
SELECT 'Sample Bundle Items' as section, COUNT(*) as item_count FROM public.bundle_items GROUP BY bundle_id LIMIT 3;
SELECT 'Sample Product Overrides' as section, custom_name, custom_retail_price, custom_category FROM public.product_overrides LIMIT 3;
SELECT 'Sample Product Images' as section, COUNT(*) as image_count FROM public.product_images GROUP BY product_id LIMIT 3;

-- 8. Show enhanced products with admin data
SELECT 
  'Enhanced Products with Admin Data:' as info,
  p.name,
  p.price,
  p.category,
  p.in_stock,
  COUNT(pi.id) as image_count,
  COUNT(po.id) as override_count,
  COUNT(bi.id) as bundle_count
FROM public.products p
LEFT JOIN public.product_images pi ON p.id = pi.product_id
LEFT JOIN public.product_overrides po ON p.id = po.product_id
LEFT JOIN public.bundle_items bi ON p.id = bi.product_id
GROUP BY p.id, p.name, p.price, p.category, p.in_stock
ORDER BY p.name;

-- Seeding completed successfully!
-- Your existing e-commerce products are now integrated with the admin management system.
-- You can now edit names, descriptions, prices, images, categories, and tags from the admin dashboard.
