-- Create a view to easily query orders with their items
CREATE VIEW order_details AS
SELECT 
  o.id as order_id,
  o.stripe_session_id,
  o.customer_email,
  o.created_at as order_date,
  oi.id as item_id,
  oi.product_name,
  oi.quantity,
  oi.unit_price,
  oi.total_price,
  -- Convert pennies to pounds for display
  (oi.unit_price / 100.0) as unit_price_gbp,
  (oi.total_price / 100.0) as total_price_gbp
FROM orders o
LEFT JOIN order_items oi ON o.stripe_session_id = oi.order_id
ORDER BY o.created_at DESC, oi.product_name;

-- Grant access to the view
GRANT SELECT ON order_details TO authenticated;
GRANT SELECT ON order_details TO service_role; 