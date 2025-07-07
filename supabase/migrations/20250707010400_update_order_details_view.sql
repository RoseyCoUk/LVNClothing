-- Update order_details view to include readable_order_id
-- Migration: 20250707010400_update_order_details_view.sql

-- Drop the existing view
DROP VIEW IF EXISTS order_details;

-- Recreate the view with readable_order_id
CREATE VIEW order_details AS
SELECT 
    o.id as order_id,
    o.stripe_session_id,
    o.readable_order_id,
    o.customer_email,
    o.items as order_items_json,
    o.created_at as order_date,
    COUNT(oi.id) as total_items,
    SUM(oi.total_price) as order_total_pence,
    ROUND(SUM(oi.total_price) / 100.0, 2) as order_total_gbp
FROM orders o
LEFT JOIN order_items oi ON o.stripe_session_id = oi.order_id
GROUP BY o.id, o.stripe_session_id, o.readable_order_id, o.customer_email, o.items, o.created_at; 