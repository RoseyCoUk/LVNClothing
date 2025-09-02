-- Test data for verifying PDP/PLP fixes

-- Insert test products
INSERT INTO products (id, name, description, price, slug, category, image_url) VALUES 
('11111111-1111-1111-1111-111111111111', 'Reform UK T-Shirt', 'Premium cotton t-shirt with Reform UK branding', 19.99, 'reform-uk-t-shirt', 'apparel', 'https://example.com/tshirt.jpg'),
('22222222-2222-2222-2222-222222222222', 'Reform UK Hoodie', 'Comfortable hoodie perfect for rallies', 34.99, 'reform-uk-hoodie', 'apparel', 'https://example.com/hoodie.jpg'),
('33333333-3333-3333-3333-333333333333', 'Reform UK Mug', 'Start your morning with Reform spirit', 12.99, 'reform-uk-mug', 'gear', 'https://example.com/mug.jpg')
ON CONFLICT (id) DO NOTHING;

-- Insert test product variants
INSERT INTO product_variants (id, product_id, printful_variant_id, name, value, color, size, price, in_stock, is_available) VALUES 
-- T-Shirt variants
('v1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '14276', 'Black T-Shirt Small', 'Black-S', 'Black', 'S', 19.99, true, true),
('v1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', '14277', 'Black T-Shirt Medium', 'Black-M', 'Black', 'M', 19.99, true, true),
('v1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', '14265', 'White T-Shirt Small', 'White-S', 'White', 'S', 19.99, true, true),
('v1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', '14266', 'White T-Shirt Medium', 'White-M', 'White', 'M', 19.99, true, true),
-- Hoodie variants  
('v2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', '10569', 'Black Hoodie Small', 'Black-S', 'Black', 'S', 34.99, true, true),
('v2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '10570', 'Black Hoodie Medium', 'Black-M', 'Black', 'M', 34.99, true, true),
('v2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', '10587', 'Navy Hoodie Small', 'Navy-S', 'Navy', 'S', 34.99, true, true),
-- Mug variant (no color/size variations)
('v3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', '19634', 'White Mug', 'White', 'White', null, 12.99, true, true)
ON CONFLICT (id) DO NOTHING;

-- Insert test product images with color variants
INSERT INTO product_images (id, product_id, image_url, image_order, is_primary, variant_type, color) VALUES 
-- T-Shirt images
('i1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'https://files.cdn.printful.com/products/71/7132_1581412293.jpg', 0, true, 'color', 'Black'),
('i1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'https://files.cdn.printful.com/products/71/7132_1581412294.jpg', 1, false, 'color', 'Black'),
('i1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'https://files.cdn.printful.com/products/71/7134_1581412295.jpg', 0, false, 'color', 'White'),
('i1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'https://files.cdn.printful.com/products/71/7134_1581412296.jpg', 1, false, 'color', 'White'),
-- Hoodie images
('i2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'https://files.cdn.printful.com/products/146/14686_1574431297.jpg', 0, true, 'color', 'Black'),
('i2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'https://files.cdn.printful.com/products/146/14686_1574431298.jpg', 1, false, 'color', 'Black'),
('i2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'https://files.cdn.printful.com/products/146/14687_1574431299.jpg', 0, false, 'color', 'Navy'),
-- Mug images (general product)
('i3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'https://files.cdn.printful.com/products/29/2915_1581846299.jpg', 0, true, 'product', null)
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT 'Products:' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'Product Variants:', COUNT(*) FROM product_variants  
UNION ALL
SELECT 'Product Images:', COUNT(*) FROM product_images;