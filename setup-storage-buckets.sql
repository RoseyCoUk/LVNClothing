-- Setup Storage Buckets for Admin Products Management
-- This script creates the required storage buckets

-- Note: Storage buckets are typically created through the Supabase dashboard
-- But we can also create them programmatically if needed

-- 1. Create product-images bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Create admin-assets bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'admin-assets',
  'admin-assets',
  false,
  52428800, -- 50MB in bytes
  ARRAY['*/*'] -- Allow all file types
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Create storage policies for product-images bucket

-- Public read access to product images
DROP POLICY IF EXISTS "Public read access to product images" ON storage.objects;
CREATE POLICY "Public read access to product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Authenticated users can upload product images
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Authenticated users can update product images
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
CREATE POLICY "Authenticated users can update product images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Authenticated users can delete product images
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
CREATE POLICY "Authenticated users can delete product images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- 4. Create storage policies for admin-assets bucket

-- Only authenticated users can access admin assets
DROP POLICY IF EXISTS "Authenticated users can access admin assets" ON storage.objects;
CREATE POLICY "Authenticated users can access admin assets" ON storage.objects
FOR ALL USING (bucket_id = 'admin-assets' AND auth.role() = 'authenticated');

-- 5. Verify buckets were created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id IN ('product-images', 'admin-assets')
ORDER BY id;

-- 6. Verify storage policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;
