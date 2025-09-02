-- Verify migration was successful

-- 1. Check for unique constraint on orders.stripe_payment_intent_id
SELECT 
    con.conname as constraint_name,
    con.contype,
    pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'orders'
AND con.conname = 'unique_payment_intent';

-- 2. Check if new tables exist
SELECT table_name, 
       CASE WHEN table_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM (
    SELECT 'webhook_events' as expected_table
    UNION ALL SELECT 'fulfillments'
    UNION ALL SELECT 'idempotency_keys'
) expected
LEFT JOIN information_schema.tables actual 
    ON actual.table_name = expected.expected_table
    AND actual.table_schema = 'public';

-- 3. Check indexes on stripe_payment_intent_id
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'orders'
AND indexdef LIKE '%stripe_payment_intent_id%';

-- 4. Check columns in webhook_events table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'webhook_events'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('webhook_events', 'fulfillments', 'idempotency_keys')
ORDER BY tablename, policyname;