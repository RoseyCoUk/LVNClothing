-- Analytics Verification: LIVE Orders Only
-- This script verifies that analytics exclude test orders

-- 1. Revenue (LIVE only)
SELECT 
  'LIVE Revenue' as metric,
  COALESCE(SUM(total_amount), 0) as value,
  COUNT(*) as order_count
FROM orders 
WHERE (status IS NULL OR status != 'test')
  AND total_amount > 0
  AND customer_email NOT LIKE '%test%'
  AND customer_email NOT LIKE '%example%'
  AND LENGTH(customer_email) > 1;

-- 2. Test Revenue (for comparison)
SELECT 
  'Test Revenue (Excluded)' as metric,
  COALESCE(SUM(total_amount), 0) as value,
  COUNT(*) as order_count
FROM orders 
WHERE (status = 'test' 
  OR total_amount = 0
  OR customer_email LIKE '%test%'
  OR customer_email LIKE '%example%'
  OR LENGTH(customer_email) = 1);

-- 3. Unique Customers (LIVE only)
SELECT 
  'Unique Customers' as metric,
  COUNT(DISTINCT customer_email) as value
FROM orders 
WHERE (status IS NULL OR status != 'test')
  AND total_amount > 0
  AND customer_email NOT LIKE '%test%'
  AND customer_email NOT LIKE '%example%'
  AND LENGTH(customer_email) > 1;

-- 4. Average Order Value (LIVE only)
SELECT 
  'Average Order Value' as metric,
  COALESCE(AVG(total_amount), 0) as value
FROM orders 
WHERE (status IS NULL OR status != 'test')
  AND total_amount > 0
  AND customer_email NOT LIKE '%test%'
  AND customer_email NOT LIKE '%example%'
  AND LENGTH(customer_email) > 1;

-- 5. Recent LIVE Orders (last 10)
SELECT 
  id,
  readable_order_id,
  customer_email,
  total_amount,
  status,
  created_at
FROM orders 
WHERE (status IS NULL OR status != 'test')
  AND total_amount > 0
  AND customer_email NOT LIKE '%test%'
  AND customer_email NOT LIKE '%example%'
  AND LENGTH(customer_email) > 1
ORDER BY created_at DESC
LIMIT 10;

-- 6. Summary Statistics
SELECT 
  'Summary' as category,
  COUNT(*) FILTER (WHERE total_amount > 0 AND (status IS NULL OR status != 'test')) as live_orders,
  COUNT(*) FILTER (WHERE total_amount = 0 OR status = 'test') as test_orders,
  COUNT(*) as total_orders
FROM orders;