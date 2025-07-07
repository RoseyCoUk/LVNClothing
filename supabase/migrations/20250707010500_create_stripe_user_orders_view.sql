-- Create stripe_user_orders view with readable_order_id
-- Migration: 20250707010500_create_stripe_user_orders_view.sql

-- Create a secure view for user order history
CREATE VIEW stripe_user_orders WITH (security_invoker) AS
SELECT 
    o.id,
    o.stripe_session_id as order_id,
    o.readable_order_id,
    o.customer_email,
    o.created_at as order_date,
    o.items,
    'completed' as order_status,
    'paid' as payment_status,
    COALESCE(SUM(oi.total_price), 0) as amount_total,
    COALESCE(SUM(oi.total_price), 0) as amount_subtotal,
    'gbp' as currency
FROM orders o
LEFT JOIN order_items oi ON o.stripe_session_id = oi.order_id
GROUP BY o.id, o.stripe_session_id, o.readable_order_id, o.customer_email, o.created_at, o.items;

-- Grant permissions
GRANT SELECT ON stripe_user_orders TO authenticated;
GRANT SELECT ON stripe_user_orders TO anon; 