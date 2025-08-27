-- Fix Admin User Setup
-- This migration sets up the admin user properly

-- Step 1: Get the user ID for support@backreform.co.uk
DO $$
DECLARE
  user_uuid uuid;
BEGIN
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = 'support@backreform.co.uk';
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User support@backreform.co.uk not found';
  END IF;
  
  -- Create admin role if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = user_uuid) THEN
    INSERT INTO public.admin_roles (user_id, role, permissions, is_active)
    VALUES (user_uuid, 'super_admin', '["admin_access"]', true);
    RAISE NOTICE 'Created admin role for user %', user_uuid;
  ELSE
    RAISE NOTICE 'Admin role already exists for user %', user_uuid;
  END IF;
  
  -- Get the admin role ID
  DECLARE
    role_id uuid;
    perm_id uuid;
  BEGIN
    SELECT id INTO role_id FROM public.admin_roles WHERE user_id = user_uuid;
    SELECT id INTO perm_id FROM public.admin_permissions WHERE name = 'admin_access';
    
    -- Link admin role to admin_access permission
    IF NOT EXISTS (
      SELECT 1 FROM public.admin_role_permissions 
      WHERE admin_role_id = role_id AND permission_id = perm_id
    ) THEN
      INSERT INTO public.admin_role_permissions (admin_role_id, permission_id)
      VALUES (role_id, perm_id);
      RAISE NOTICE 'Linked admin role to admin_access permission';
    ELSE
      RAISE NOTICE 'Admin role already linked to admin_access permission';
    END IF;
  END;
  
END $$;
