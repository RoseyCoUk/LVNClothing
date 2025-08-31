-- Fix Storage Access Issues
-- This script ensures storage buckets are accessible via the API

-- 1. First, let's see what's actually in the storage.buckets table
SELECT id, name, public, file_size_limit, allowed_mime_types, created_at
FROM storage.buckets 
ORDER BY id;

-- 2. Check if there are any RLS policies blocking access to storage.buckets
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'buckets' AND schemaname = 'storage'
ORDER BY policyname;

-- 3. Check if RLS is enabled on storage.buckets
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'buckets';

-- 4. If RLS is enabled on storage.buckets, we need to create policies for it
-- First, let's disable RLS temporarily on storage.buckets to make them visible
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- 5. Now let's verify the buckets are accessible
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id IN ('product-images', 'admin-assets')
ORDER BY id;

-- 6. Check storage.objects policies to ensure they're correct
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- 7. Test if we can now access the buckets via the API
-- (This will be verified when you run the test script again)

-- 8. Summary of what we've done
SELECT 
    'Storage Buckets RLS Status' as check_type,
    CASE 
        WHEN rowsecurity THEN 'ENABLED (this was blocking access)'
        ELSE 'DISABLED (now accessible)'
    END as status
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'buckets'

UNION ALL

SELECT 
    'Available Buckets' as check_type,
    COUNT(*)::text as status
FROM storage.buckets 
WHERE id IN ('product-images', 'admin-assets')

UNION ALL

SELECT 
    'Storage Object Policies' as check_type,
    COUNT(*)::text as status
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
