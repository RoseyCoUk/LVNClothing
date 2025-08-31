-- Fix Storage Bucket Access by Adding RLS Policies
-- This script creates policies to allow access to storage.buckets

-- 1. First, let's check the current state
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'buckets' AND schemaname = 'storage'
ORDER BY policyname;

-- 2. Check if RLS is enabled on storage.buckets
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'buckets';

-- 3. Create policies to allow access to storage.buckets
-- Policy to allow reading bucket information
CREATE POLICY "Allow read access to storage buckets" ON storage.buckets
FOR SELECT USING (true);

-- Policy to allow authenticated users to create buckets
CREATE POLICY "Allow authenticated users to create buckets" ON storage.buckets
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow authenticated users to update buckets
CREATE POLICY "Allow authenticated users to update buckets" ON storage.buckets
FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to delete buckets
CREATE POLICY "Allow authenticated users to delete buckets" ON storage.buckets
FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'buckets' AND schemaname = 'storage'
ORDER BY policyname;

-- 5. Test if buckets are now accessible
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id IN ('product-images', 'admin-assets')
ORDER BY id;

-- 6. Summary
SELECT 
    'Storage Bucket Policies Created' as check_type,
    COUNT(*)::text as count
FROM pg_policies 
WHERE tablename = 'buckets' AND schemaname = 'storage'

UNION ALL

SELECT 
    'Storage Buckets Accessible' as check_type,
    COUNT(*)::text as count
FROM storage.buckets 
WHERE id IN ('product-images', 'admin-assets');
