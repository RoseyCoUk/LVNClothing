-- Views, policies, and indexes migration
-- Migration: 20250707010100_views_policies_indexes.sql

-- Create views for easier data access
CREATE VIEW order_details AS
SELECT 
    o.id as order_id,
    o.stripe_session_id,
    o.customer_email,
    o.items as order_items_json,
    o.created_at as order_date,
    COUNT(oi.id) as total_items,
    SUM(oi.total_price) as order_total_pence,
    ROUND(SUM(oi.total_price) / 100.0, 2) as order_total_gbp
FROM orders o
LEFT JOIN order_items oi ON o.stripe_session_id = oi.order_id
GROUP BY o.id, o.stripe_session_id, o.customer_email, o.items, o.created_at;

-- Create view for products with GBP prices
CREATE VIEW products_with_gbp AS
SELECT 
    id,
    name,
    variant,
    description,
    price_pence,
    ROUND(price_pence / 100.0, 2) as price_gbp,
    category,
    created_at,
    updated_at
FROM products;

-- Create view for product categories
CREATE VIEW product_categories AS
SELECT 
    category,
    COUNT(*) as product_count,
    MIN(price_pence) as min_price_pence,
    MAX(price_pence) as max_price_pence,
    ROUND(MIN(price_pence) / 100.0, 2) as min_price_gbp,
    ROUND(MAX(price_pence) / 100.0, 2) as max_price_gbp
FROM products
GROUP BY category
ORDER BY category;

-- Create RLS policies for orders table
CREATE POLICY "Enable read access for all users" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for service role" ON orders
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Enable delete access for service role" ON orders
    FOR DELETE USING (auth.role() = 'service_role');

-- Create RLS policies for order_items table
CREATE POLICY "Enable read access for all users" ON order_items
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for service role" ON order_items
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Enable delete access for service role" ON order_items
    FOR DELETE USING (auth.role() = 'service_role');

-- Create RLS policies for products table
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for service role" ON products
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update access for service role" ON products
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Enable delete access for service role" ON products
    FOR DELETE USING (auth.role() = 'service_role');

-- Create indexes for better performance
-- Orders table indexes
CREATE INDEX idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Order items table indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_name ON order_items(product_name);
CREATE INDEX idx_order_items_created_at ON order_items(created_at);

-- Products table indexes
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price_pence ON products(price_pence);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Composite indexes for common query patterns
CREATE INDEX idx_products_category_price ON products(category, price_pence);
CREATE INDEX idx_order_items_order_created ON order_items(order_id, created_at);
CREATE INDEX idx_orders_email_created ON orders(customer_email, created_at); 