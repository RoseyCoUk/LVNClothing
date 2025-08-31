-- Simple Storage Buckets Creation
-- This script creates the required storage buckets

-- First, let's check what buckets currently exist
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
ORDER BY id;

-- Create product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create admin-assets bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'admin-assets',
  'admin-assets',
  false,
  52428800, -- 50MB
  ARRAY['*/*']
) ON CONFLICT (id) DO NOTHING;

-- Verify buckets were created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id IN ('product-images', 'admin-assets')
ORDER BY id;

-- Check if we need to create storage policies
SELECT COUNT(*) as existing_policies
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- If no storage policies exist, create them
DO $$
BEGIN
    -- Check if storage policies exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        -- Create storage policies for product-images bucket
        CREATE POLICY "Public read access to product images" ON storage.objects
        FOR SELECT USING (bucket_id = 'product-images');

        CREATE POLICY "Authenticated users can upload product images" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

        CREATE POLICY "Authenticated users can update product images" ON storage.objects
        FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

        CREATE POLICY "Authenticated users can delete product images" ON storage.objects
        FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

        -- Create storage policies for admin-assets bucket
        CREATE POLICY "Authenticated users can access admin assets" ON storage.objects
        FOR ALL USING (bucket_id = 'admin-assets' AND auth.role() = 'authenticated');

        RAISE NOTICE 'Storage policies created successfully';
    ELSE
        RAISE NOTICE 'Storage policies already exist';
    END IF;
END $$;

-- Final verification
SELECT 'BUCKETS:' as check_type, COUNT(*) as count FROM storage.buckets WHERE id IN ('product-images', 'admin-assets')
UNION ALL
SELECT 'STORAGE POLICIES:' as check_type, COUNT(*) as count FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
