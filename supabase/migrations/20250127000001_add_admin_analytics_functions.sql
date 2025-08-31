-- Add admin analytics and reporting functions

-- up

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
-- Commented out due to missing tables dependency
-- CREATE OR REPLACE FUNCTION public.get_order_status_timeline(order_id uuid)
-- RETURNS TABLE (
--   status text,
--   timestamp timestamptz,
--   duration_interval interval
-- ) AS $$
-- BEGIN
--   RETURN QUERY
--   SELECT 
--     o.status,
--     o.updated_at as timestamp,
--     o.updated_at - o.created_at as duration_interval
--   FROM public.orders o
--   WHERE o.id = order_id;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_orders_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_customer_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_revenue_trends(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_products(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_customer_acquisition_trends(integer) TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.get_order_status_timeline(uuid) TO authenticated;

-- down
-- DROP FUNCTION IF EXISTS public.get_order_status_timeline(uuid);
-- DROP FUNCTION IF EXISTS public.get_customer_acquisition_trends(integer);
-- DROP FUNCTION IF EXISTS public.get_top_products(integer);
-- DROP FUNCTION IF EXISTS public.get_revenue_trends(integer);
-- DROP FUNCTION IF EXISTS public.get_customer_statistics();
-- DROP FUNCTION IF EXISTS public.get_orders_statistics();
