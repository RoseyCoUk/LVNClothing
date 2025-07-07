-- Create products table for Reform UK Merch
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  variant TEXT,
  description TEXT,
  price_pence INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_variant ON products(variant);
CREATE INDEX idx_products_price ON products(price_pence);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to products
CREATE POLICY "Public can view products" ON products
  FOR SELECT USING (true);

-- Create policy to allow service role to manage products
CREATE POLICY "Service role can manage products" ON products
  FOR ALL USING (true);

-- Seed product data
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
('Starter Bundle', NULL, '', 3499);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 