-- Seed Reform UK product data
-- Migration: 20250707010200_seed_products.sql

INSERT INTO products (name, variant, description, price_pence) VALUES
-- Badges
('Reform Badge', '5 Badges', 'Default', 999),
('Reform Badge', '10 Badges', '', 1599),
('Reform Badge', '25 Badges', '', 3599),
('Reform Badge', '50 Badges', '', 6499),

-- Stickers
('Reform UK Stickers', '10 Stickers', 'Default', 999),
('Reform UK Stickers', '25 Stickers', '', 1999),
('Reform UK Stickers', '50 Stickers', '', 3499),
('Reform UK Stickers', '100 Stickers', '', 5999),

-- Accessories
('Reform UK Mouse Pad', NULL, '', 1499),
('Reform UK Mug', NULL, '', 1999),
('Reform UK Water Bottle', NULL, '', 2499),
('Reform UK Tote Bag', NULL, '', 1999),

-- Apparel
('Reform UK Cap', NULL, '', 1999),
('Reform UK T-Shirt', NULL, '', 2499),
('Reform UK Hoodie', NULL, '', 4999),

-- Bundles
('Activist Bundle', NULL, '', 16999),
('Champion Bundle', NULL, '', 9999),
('Starter Bundle', NULL, '', 3499)
ON CONFLICT DO NOTHING; 