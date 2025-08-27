-- Add admin roles and permissions for admin dashboard access

-- up

-- 1. Create admin_roles table
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin',
  permissions jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now()),
  UNIQUE(user_id)
);

-- 2. Create admin_permissions table for granular permissions
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  resource text NOT NULL, -- e.g., 'orders', 'customers', 'analytics'
  action text NOT NULL,   -- e.g., 'read', 'write', 'delete'
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- 3. Insert default admin permissions
INSERT INTO public.admin_permissions (name, description, resource, action) VALUES
  ('view_orders', 'View all orders', 'orders', 'read'),
  ('manage_orders', 'Update order statuses', 'orders', 'write'),
  ('view_customers', 'View customer profiles', 'customers', 'read'),
  ('manage_customers', 'Edit customer information', 'customers', 'write'),
  ('view_analytics', 'View business analytics', 'analytics', 'read'),
  ('view_settings', 'View admin settings', 'settings', 'read'),
  ('manage_settings', 'Update admin settings', 'settings', 'write'),
  ('admin_access', 'Full admin access', 'all', 'all')
ON CONFLICT (name) DO NOTHING;

-- 4. Create admin_role_permissions junction table
CREATE TABLE IF NOT EXISTS public.admin_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_role_id uuid REFERENCES public.admin_roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES public.admin_permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT timezone('utc', now()),
  UNIQUE(admin_role_id, permission_id)
);

-- 5. Create function to check admin permissions
CREATE OR REPLACE FUNCTION public.check_admin_permission(
  user_uuid uuid,
  resource_name text,
  action_name text DEFAULT 'read'
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_roles ar
    JOIN public.admin_role_permissions arp ON ar.id = arp.admin_role_id
    JOIN public.admin_permissions ap ON arp.permission_id = ap.id
    WHERE ar.user_id = user_uuid
      AND ar.is_active = true
      AND (ap.resource = resource_name OR ap.resource = 'all')
      AND (ap.action = action_name OR ap.action = 'all')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to get user admin role
CREATE OR REPLACE FUNCTION public.get_user_admin_role(user_uuid uuid)
RETURNS jsonb AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'role', ar.role,
      'permissions', COALESCE(
        (SELECT jsonb_agg(ap.name)
         FROM public.admin_role_permissions arp
         JOIN public.admin_permissions ap ON arp.permission_id = ap.id
         WHERE arp.admin_role_id = ar.id), 
        '[]'::jsonb
      ),
      'is_active', ar.is_active
    )
    FROM public.admin_roles ar
    WHERE ar.user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Enable RLS on new tables
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_role_permissions ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for admin_roles
CREATE POLICY "Users can view their own admin role" ON public.admin_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Only super admins can manage admin roles" ON public.admin_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() 
        AND role = 'super_admin'
    )
  );

-- 9. Create RLS policies for admin_permissions
CREATE POLICY "Anyone can view admin permissions" ON public.admin_permissions
  FOR SELECT USING (true);

-- 10. Create RLS policies for admin_role_permissions
CREATE POLICY "Users can view their own role permissions" ON public.admin_role_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE id = admin_role_id 
        AND user_id = auth.uid()
    )
  );

-- 11. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON public.admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON public.admin_roles(role);
CREATE INDEX IF NOT EXISTS idx_admin_role_permissions_role_id ON public.admin_role_permissions(admin_role_id);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_resource_action ON public.admin_permissions(resource, action);

-- 12. Insert a default super admin (you'll need to update this with your actual user ID)
-- Uncomment and modify the line below with your user ID after running the migration
-- INSERT INTO public.admin_roles (user_id, role, permissions) VALUES ('YOUR_USER_ID_HERE', 'super_admin', '["admin_access"]');

-- down
-- DROP FUNCTION IF EXISTS public.get_user_admin_role(uuid);
-- DROP FUNCTION IF EXISTS public.check_admin_permission(uuid, text, text);
-- DROP TABLE IF EXISTS public.admin_role_permissions;
-- DROP TABLE IF EXISTS public.admin_permissions;
-- DROP TABLE IF EXISTS public.admin_roles;
