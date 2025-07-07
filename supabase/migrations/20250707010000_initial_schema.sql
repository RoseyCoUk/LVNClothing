-- Initial schema migration
-- Migration: 20250707010000_initial_schema.sql

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_session_id TEXT UNIQUE NOT NULL,
    customer_email TEXT NOT NULL,
    items JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    variant TEXT,
    description TEXT,
    price_pence INTEGER NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table with foreign key to orders
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES orders(stripe_session_id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL, -- Price in pence
    total_price INTEGER GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed products table with Reform UK merchandise
INSERT INTO products (name, variant, description, price_pence, category) VALUES
-- Badges
('Reform UK Badge Set', 'Main Collection', 'Set of 5 Reform UK badges', 500, 'badges'),
('Reform UK Badge', 'Individual', 'Single Reform UK badge', 150, 'badges'),

-- Stickers
('Reform UK Stickers', 'Main Collection', 'Set of 6 Reform UK stickers', 300, 'stickers'),
('Reform UK Sticker', 'Individual', 'Single Reform UK sticker', 100, 'stickers'),

-- Accessories
('Reform UK Water Bottle', 'White', 'Reusable water bottle with Reform UK branding', 1500, 'accessories'),
('Reform UK Mug', 'White', 'Ceramic mug with Reform UK logo', 800, 'accessories'),
('Reform UK Mouse Pad', 'White', 'Computer mouse pad with Reform UK design', 600, 'accessories'),
('Reform UK Tote Bag', 'Black', 'Reusable tote bag with Reform UK branding', 1200, 'accessories'),

-- Apparel - Men
('Reform UK T-Shirt', 'Men - White', 'Cotton t-shirt with Reform UK logo', 2000, 'apparel'),
('Reform UK T-Shirt', 'Men - Black', 'Cotton t-shirt with Reform UK logo', 2000, 'apparel'),
('Reform UK T-Shirt', 'Men - Blue', 'Cotton t-shirt with Reform UK logo', 2000, 'apparel'),
('Reform UK T-Shirt', 'Men - Red', 'Cotton t-shirt with Reform UK logo', 2000, 'apparel'),
('Reform UK T-Shirt', 'Men - Charcoal', 'Cotton t-shirt with Reform UK logo', 2000, 'apparel'),
('Reform UK T-Shirt', 'Men - Light Grey', 'Cotton t-shirt with Reform UK logo', 2000, 'apparel'),
('Reform UK T-Shirt', 'Men - Ash Grey', 'Cotton t-shirt with Reform UK logo', 2000, 'apparel'),

('Reform UK Hoodie', 'Men - White', 'Cotton hoodie with Reform UK logo', 3500, 'apparel'),
('Reform UK Hoodie', 'Men - Black', 'Cotton hoodie with Reform UK logo', 3500, 'apparel'),
('Reform UK Hoodie', 'Men - Blue', 'Cotton hoodie with Reform UK logo', 3500, 'apparel'),
('Reform UK Hoodie', 'Men - Red', 'Cotton hoodie with Reform UK logo', 3500, 'apparel'),
('Reform UK Hoodie', 'Men - Charcoal', 'Cotton hoodie with Reform UK logo', 3500, 'apparel'),
('Reform UK Hoodie', 'Men - Light Grey', 'Cotton hoodie with Reform UK logo', 3500, 'apparel'),
('Reform UK Hoodie', 'Men - Ash Grey', 'Cotton hoodie with Reform UK logo', 3500, 'apparel'),

-- Apparel - Women
('Reform UK T-Shirt', 'Women - White', 'Cotton t-shirt with Reform UK logo', 2000, 'apparel'),
('Reform UK T-Shirt', 'Women - Black', 'Cotton t-shirt with Reform UK logo', 2000, 'apparel'),
('Reform UK T-Shirt', 'Women - Blue', 'Cotton t-shirt with Reform UK logo', 2000, 'apparel'),
('Reform UK T-Shirt', 'Women - Red', 'Cotton t-shirt with Reform UK logo', 2000, 'apparel'),
('Reform UK T-Shirt', 'Women - Charcoal', 'Cotton t-shirt with Reform UK logo', 2000, 'apparel'),
('Reform UK T-Shirt', 'Women - Light Grey', 'Cotton t-shirt with Reform UK logo', 2000, 'apparel'),
('Reform UK T-Shirt', 'Women - Ash Grey', 'Cotton t-shirt with Reform UK logo', 2000, 'apparel'),

('Reform UK Hoodie', 'Women - White', 'Cotton hoodie with Reform UK logo', 3500, 'apparel'),
('Reform UK Hoodie', 'Women - Black', 'Cotton hoodie with Reform UK logo', 3500, 'apparel'),
('Reform UK Hoodie', 'Women - Blue', 'Cotton hoodie with Reform UK logo', 3500, 'apparel'),
('Reform UK Hoodie', 'Women - Red', 'Cotton hoodie with Reform UK logo', 3500, 'apparel'),
('Reform UK Hoodie', 'Women - Charcoal', 'Cotton hoodie with Reform UK logo', 3500, 'apparel'),
('Reform UK Hoodie', 'Women - Light Grey', 'Cotton hoodie with Reform UK logo', 3500, 'apparel'),
('Reform UK Hoodie', 'Women - Ash Grey', 'Cotton hoodie with Reform UK logo', 3500, 'apparel'),

-- Caps
('Reform UK Cap', 'Black', 'Baseball cap with Reform UK logo', 1500, 'apparel'),
('Reform UK Cap', 'Blue', 'Baseball cap with Reform UK logo', 1500, 'apparel'),
('Reform UK Cap', 'Charcoal', 'Baseball cap with Reform UK logo', 1500, 'apparel'),
('Reform UK Cap', 'Navy', 'Baseball cap with Reform UK logo', 1500, 'apparel'),
('Reform UK Cap', 'Red', 'Baseball cap with Reform UK logo', 1500, 'apparel'),
('Reform UK Cap', 'White', 'Baseball cap with Reform UK logo', 1500, 'apparel'),

-- Bundles
('Starter Bundle', 'Reform UK Starter Pack', 'T-shirt, cap, and stickers bundle', 4500, 'bundles'),
('Champion Bundle', 'Reform UK Champion Pack', 'Hoodie, t-shirt, cap, and badges bundle', 7500, 'bundles'),
('Activist Bundle', 'Reform UK Activist Pack', 'Complete merchandise collection', 12000, 'bundles');

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY; 