-- Script to create your first admin user
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from auth.users table

-- 1. First, find your user ID from the auth.users table
-- Run this query in your Supabase SQL editor to get your user ID:
/*
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';
*/

-- 2. Create admin role for your user (replace with your actual user ID)
INSERT INTO public.admin_roles (user_id, role, permissions) 
VALUES (
  'YOUR_USER_ID_HERE', -- Replace this with your actual user ID
  'super_admin', 
  '["admin_access"]'
);

-- 3. Verify the admin role was created
SELECT 
  ar.id,
  ar.user_id,
  ar.role,
  ar.permissions,
  ar.is_active,
  u.email
FROM public.admin_roles ar
JOIN auth.users u ON ar.user_id = u.id
WHERE ar.user_id = 'YOUR_USER_ID_HERE';

-- 4. Test the admin permission function
SELECT public.check_admin_permission('YOUR_USER_ID_HERE', 'orders', 'read');

-- 5. Get your full admin role information
SELECT public.get_user_admin_role('YOUR_USER_ID_HERE');

-- After running this script:
-- 1. You should be able to log in at /admin/login
-- 2. You'll have full admin access to all features
-- 3. You can create additional admin users through the dashboard
