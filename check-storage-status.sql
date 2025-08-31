-- Check Storage Status and Provide Alternative Solution
-- This script checks what's happening with storage without requiring owner permissions

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

-- 4. Check storage.objects policies to ensure they're correct
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- 5. Try to create a test file in one of the buckets to see if the issue is with bucket listing or file access
-- (This will be done via the test script)

-- 6. Summary of current state
SELECT 
    'Storage Buckets Count' as check_type,
    COUNT(*)::text as count
FROM storage.buckets 
WHERE id IN ('product-images', 'admin-assets')

UNION ALL

SELECT 
    'Storage Object Policies' as check_type,
    COUNT(*)::text as count
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'

UNION ALL

SELECT 
    'Storage Bucket Policies' as check_type,
    COUNT(*)::text as count
FROM pg_policies 
WHERE tablename = 'buckets' AND schemaname = 'storage';
