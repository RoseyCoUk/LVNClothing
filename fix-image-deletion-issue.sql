-- Fix Image Deletion Issue
-- This script investigates why images are being deleted from the product-images bucket

-- 1. Check current storage bucket policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- 2. Check if there are any triggers that might be deleting images
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'product_images'
OR event_object_table = 'objects';

-- 3. Check RLS status on storage.objects
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- 4. Check if there are any foreign key constraints that might cascade delete
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND (tc.table_name = 'product_images' OR ccu.table_name = 'product_images');

-- 5. Check for any cron jobs or scheduled tasks that might be cleaning up
-- (This would be in Supabase dashboard, not SQL)

-- 6. Check current product_images table state
SELECT 
    COUNT(*) as total_images,
    COUNT(CASE WHEN is_primary = true THEN 1 END) as primary_images,
    COUNT(CASE WHEN is_thumbnail = true THEN 1 END) as thumbnail_images,
    COUNT(CASE WHEN variant_type = 'product' THEN 1 END) as product_images,
    COUNT(CASE WHEN variant_type = 'color' THEN 1 END) as color_images,
    COUNT(CASE WHEN variant_type = 'size' THEN 1 END) as size_images
FROM product_images;

-- 7. Check recent image deletions (if audit logging is enabled)
-- This might not be available depending on your setup

-- 8. Create a backup of current images before making changes
CREATE TABLE IF NOT EXISTS product_images_backup AS 
SELECT * FROM product_images;

-- 9. Add logging to track image operations
-- Create a table to log all image operations
CREATE TABLE IF NOT EXISTS image_operations_log (
    id SERIAL PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
    table_name VARCHAR(100) NOT NULL, -- 'product_images' or 'storage.objects'
    record_id VARCHAR(100),
    operation_details JSONB,
    user_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create a function to safely delete images
CREATE OR REPLACE FUNCTION safe_delete_product_image(image_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    image_record RECORD;
    storage_path TEXT;
BEGIN
    -- Get image details before deletion
    SELECT * INTO image_record FROM product_images WHERE id = image_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Image not found: %', image_id;
    END IF;
    
    -- Log the deletion operation
    INSERT INTO image_operations_log (operation_type, table_name, record_id, operation_details)
    VALUES ('delete', 'product_images', image_id::text, 
            jsonb_build_object('image_url', image_record.image_url, 'product_id', image_record.product_id));
    
    -- Delete from database first
    DELETE FROM product_images WHERE id = image_id;
    
    -- Extract storage path from image_url if possible
    -- This is a simplified approach - you might need to adjust based on your URL structure
    storage_path := REPLACE(image_record.image_url, 'https://nsmrxwnrtsllxvplazmm.supabase.co/storage/v1/object/public/product-images/', '');
    
    -- Log storage deletion attempt
    INSERT INTO image_operations_log (operation_type, table_name, record_id, operation_details)
    VALUES ('delete', 'storage.objects', storage_path, 
            jsonb_build_object('original_image_id', image_id, 'storage_path', storage_path));
    
    -- Note: Storage deletion would be done via Supabase client, not SQL
    -- This is just logging the intention
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error
        INSERT INTO image_operations_log (operation_type, table_name, record_id, operation_details)
        VALUES ('error', 'product_images', image_id::text, 
                jsonb_build_object('error', SQLERRM, 'operation', 'delete'));
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 11. Grant permissions for the logging table
GRANT ALL ON image_operations_log TO authenticated;
GRANT ALL ON image_operations_log TO service_role;

-- 12. Check if there are any policies that might be too aggressive
-- Look for policies that might delete images based on certain conditions
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'product_images'
AND (qual LIKE '%DELETE%' OR with_check LIKE '%DELETE%');

-- 13. Verify the backup was created
SELECT COUNT(*) as backup_count FROM product_images_backup;

-- 14. Show summary of current state
SELECT 
    'Current State Summary' as info,
    (SELECT COUNT(*) FROM product_images) as current_images,
    (SELECT COUNT(*) FROM product_images_backup) as backup_images,
    (SELECT COUNT(*) FROM image_operations_log) as operation_logs;

