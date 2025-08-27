-- 🚀 Admin Dashboard Database Migrations
-- Run this script in your Supabase SQL Editor to apply all admin-related migrations

-- ===== MIGRATION 1: Admin Roles and Permissions =====
-- This should already be applied, but let's verify and create if missing

-- 1. Create admin_roles table if it doesn't exist
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

-- 2. Create admin_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  resource text NOT NULL, -- e.g., 'orders', 'customers', 'analytics'
  action text NOT NULL,   -- e.g., 'read', 'write', 'delete'
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- 3. Insert default admin permissions (ignore conflicts)
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

-- 4. Create admin_role_permissions junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_role_id uuid REFERENCES public.admin_roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES public.admin_permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT timezone('utc', now()),
  UNIQUE(admin_role_id, permission_id)
);

-- 5. Create function to check admin permissions if it doesn't exist
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

-- 6. Create function to get user admin role if it doesn't exist
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

-- 8. Create RLS policies for admin_roles (ignore if they exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_roles' AND policyname = 'Users can view their own admin role') THEN
    CREATE POLICY "Users can view their own admin role" ON public.admin_roles
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_roles' AND policyname = 'Only super admins can manage admin roles') THEN
    CREATE POLICY "Only super admins can manage admin roles" ON public.admin_roles
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.admin_roles 
          WHERE user_id = auth.uid() 
            AND role = 'super_admin'
        )
      );
  END IF;
END $$;

-- 9. Create RLS policies for admin_permissions (ignore if they exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_permissions' AND policyname = 'Anyone can view admin permissions') THEN
    CREATE POLICY "Anyone can view admin permissions" ON public.admin_permissions
      FOR SELECT USING (true);
  END IF;
END $$;

-- 10. Create RLS policies for admin_role_permissions (ignore if they exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_role_permissions' AND policyname = 'Users can view their own role permissions') THEN
    CREATE POLICY "Users can view their own role permissions" ON public.admin_role_permissions
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.admin_roles 
          WHERE id = admin_role_id 
            AND user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- 11. Create indexes for better performance (ignore if they exist)
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON public.admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON public.admin_roles(role);
CREATE INDEX IF NOT EXISTS idx_admin_role_permissions_role_id ON public.admin_role_permissions(admin_role_id);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_resource_action ON public.admin_permissions(resource, action);

-- ===== MIGRATION 2: Admin Analytics Functions =====

-- 1. Create function to get orders statistics
CREATE OR REPLACE FUNCTION public.get_orders_statistics()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_orders', COUNT(*),
    'total_revenue', COALESCE(SUM(amount_total), 0),
    'average_order_value', COALESCE(AVG(amount_total), 0),
    'orders_today', COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE),
    'revenue_today', COALESCE(SUM(amount_total) FILTER (WHERE DATE(created_at) = CURRENT_DATE), 0),
    'orders_this_month', COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)),
    'revenue_this_month', COALESCE(SUM(amount_total) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)), 0),
    'status_breakdown', (
      SELECT jsonb_object_agg(status, count)
      FROM (
        SELECT status, COUNT(*) as count
        FROM public.orders
        GROUP BY status
      ) status_counts
    )
  ) INTO result
  FROM public.orders;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create function to get customer statistics
CREATE OR REPLACE FUNCTION public.get_customer_statistics()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_customers', COUNT(*),
    'customers_today', COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE),
    'customers_this_month', COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)),
    'customers_this_week', COUNT(*) FILTER (WHERE DATE_TRUNC('week', created_at) = DATE_TRUNC('week', CURRENT_DATE))
  ) INTO result
  FROM public.customer_profiles;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create function to get revenue trends
CREATE OR REPLACE FUNCTION public.get_revenue_trends(days_back integer DEFAULT 30)
RETURNS TABLE (
  date_key text,
  order_count bigint,
  total_revenue numeric,
  average_order_value numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date_key,
    COUNT(*) as order_count,
    COALESCE(SUM(amount_total), 0) as total_revenue,
    COALESCE(AVG(amount_total), 0) as average_order_value
  FROM public.orders
  WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
  GROUP BY DATE(created_at)
  ORDER BY date_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to get top performing products
CREATE OR REPLACE FUNCTION public.get_top_products(limit_count integer DEFAULT 10)
RETURNS TABLE (
  product_name text,
  order_count bigint,
  total_revenue numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(oi.product_name, 'Unknown Product') as product_name,
    COUNT(*) as order_count,
    COALESCE(SUM(oi.price * oi.quantity), 0) as total_revenue
  FROM public.order_items oi
  JOIN public.orders o ON oi.order_id = o.id
  WHERE o.status != 'cancelled'
  GROUP BY oi.product_name
  ORDER BY total_revenue DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to get customer acquisition trends
CREATE OR REPLACE FUNCTION public.get_customer_acquisition_trends(days_back integer DEFAULT 30)
RETURNS TABLE (
  date_key text,
  new_customers bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date_key,
    COUNT(*) as new_customers
  FROM public.customer_profiles
  WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
  GROUP BY DATE(created_at)
  ORDER BY date_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to get order status timeline
CREATE OR REPLACE FUNCTION public.get_order_status_timeline(order_id uuid)
RETURNS TABLE (
  status text,
  timestamp timestamptz,
  duration_interval interval
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.status,
    o.updated_at as timestamp,
    o.updated_at - o.created_at as duration_interval
  FROM public.orders o
  WHERE o.id = order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_orders_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_customer_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_revenue_trends(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_products(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_customer_acquisition_trends(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_status_timeline(uuid) TO authenticated;

-- ===== VERIFICATION =====
-- Check if everything was created successfully
SELECT 'Admin roles table' as check_item, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_roles') 
            THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'Admin permissions table' as check_item,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_permissions') 
            THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'Admin role permissions table' as check_item,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_role_permissions') 
            THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'check_admin_permission function' as check_item,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'check_admin_permission') 
            THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'get_orders_statistics function' as check_item,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_orders_statistics') 
            THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Show current admin roles (if any exist)
SELECT 'Current admin roles:' as info;
SELECT ar.role, ar.user_id, ar.is_active, ar.created_at
FROM public.admin_roles ar
ORDER BY ar.created_at DESC;
