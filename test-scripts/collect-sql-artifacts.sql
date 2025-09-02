-- SQL Artifacts Collection
-- Date: 2025-08-31

-- 1. Verify unique constraint exists
SELECT 
    con.conname as constraint_name,
    con.contype as constraint_type,
    pg_get_constraintdef(con.oid) as definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'orders'
AND con.conname = 'unique_payment_intent';

-- 2. Verify new tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('webhook_events', 'fulfillments', 'idempotency_keys')
ORDER BY table_name;

-- 3. Check table columns
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('webhook_events', 'fulfillments', 'idempotency_keys')
ORDER BY table_name, ordinal_position;

-- 4. Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('orders', 'webhook_events', 'fulfillments', 'idempotency_keys')
AND (indexname LIKE '%stripe_payment_intent%' OR indexname LIKE '%event%' OR indexname LIKE '%key%')
ORDER BY tablename, indexname;

-- 5. Check RLS policies
SELECT 
    tablename,
    policyname,
    permissive,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('webhook_events', 'fulfillments', 'idempotency_keys')
ORDER BY tablename, policyname;