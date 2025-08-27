-- 🔧 Fix Admin User Setup
-- Run this in your Supabase SQL Editor to properly set up the admin user

-- Step 1: Find the user ID for support@backreform.co.uk
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users 
WHERE email = 'support@backreform.co.uk';

-- Step 2: Check if admin role exists for this user
SELECT 
  ar.id as role_id,
  ar.user_id,
  ar.role,
  ar.is_active,
  ar.created_at
FROM public.admin_roles ar
WHERE ar.user_id IN (
  SELECT id FROM auth.users WHERE email = 'support@backreform.co.uk'
);

-- Step 3: Check if admin permissions exist
SELECT 
  id,
  name,
  description,
  resource,
  action
FROM public.admin_permissions
ORDER BY name;

-- Step 4: Check admin role permissions junction table
SELECT 
  arp.id,
  arp.admin_role_id,
  arp.permission_id,
  ar.role,
  ap.name as permission_name
FROM public.admin_role_permissions arp
JOIN public.admin_roles ar ON arp.admin_role_id = ar.id
JOIN public.admin_permissions ap ON arp.permission_id = ap.id
WHERE ar.user_id IN (
  SELECT id FROM auth.users WHERE email = 'support@backreform.co.uk'
);

-- Step 5: If no admin role exists, create one
DO $$
DECLARE
  user_uuid uuid;
  admin_role_id uuid;
  admin_permission_id uuid;
BEGIN
  -- Get the user ID
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = 'support@backreform.co.uk';
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User support@backreform.co.uk not found';
  END IF;
  
  -- Check if admin role already exists
  IF NOT EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = user_uuid) THEN
    -- Create admin role
    INSERT INTO public.admin_roles (user_id, role, permissions, is_active)
    VALUES (user_uuid, 'super_admin', '["admin_access"]', true)
    RETURNING id INTO admin_role_id;
    
    RAISE NOTICE 'Created admin role with ID: %', admin_role_id;
  ELSE
    -- Get existing admin role ID
    SELECT id INTO admin_role_id 
    FROM public.admin_roles 
    WHERE user_id = user_uuid;
    
    RAISE NOTICE 'Admin role already exists with ID: %', admin_role_id;
  END IF;
  
  -- Get the admin_access permission ID
  SELECT id INTO admin_permission_id 
  FROM public.admin_permissions 
  WHERE name = 'admin_access';
  
  IF admin_permission_id IS NULL THEN
    RAISE EXCEPTION 'Admin access permission not found';
  END IF;
  
  -- Link admin role to admin_access permission
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_role_permissions arp
    WHERE arp.admin_role_id = admin_role_id AND arp.permission_id = admin_permission_id
  ) THEN
    INSERT INTO public.admin_role_permissions (admin_role_id, permission_id)
    VALUES (admin_role_id, admin_permission_id);
    
    RAISE NOTICE 'Linked admin role to admin_access permission';
  ELSE
    RAISE NOTICE 'Admin role already linked to admin_access permission';
  END IF;
  
END $$;

-- Step 6: Verify the setup
SELECT 
  'User Info' as check_type,
  u.email,
  u.id as user_id
FROM auth.users u
WHERE u.email = 'support@backreform.co.uk'

UNION ALL

SELECT 
  'Admin Role' as check_type,
  ar.role,
  ar.id::text
FROM public.admin_roles ar
JOIN auth.users u ON ar.user_id = u.id
WHERE u.email = 'support@backreform.co.uk'

UNION ALL

SELECT 
  'Permissions' as check_type,
  string_agg(ap.name, ', '),
  count(*)::text
FROM public.admin_role_permissions arp
JOIN public.admin_roles ar ON arp.admin_role_id = ar.id
JOIN public.admin_permissions ap ON arp.permission_id = ap.id
JOIN auth.users u ON ar.user_id = u.id
WHERE u.email = 'support@backreform.co.uk'
GROUP BY ar.id;

-- Step 7: Test the admin permission function
SELECT 
  'Permission Test' as test_type,
  public.check_admin_permission(
    (SELECT id FROM auth.users WHERE email = 'support@backreform.co.uk'),
    'orders',
    'read'
  ) as can_read_orders,
  public.check_admin_permission(
    (SELECT id FROM auth.users WHERE email = 'support@backreform.co.uk'),
    'analytics',
    'read'
  ) as can_read_analytics;
