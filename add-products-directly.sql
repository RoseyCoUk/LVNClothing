-- Direct insert of test products with real Printful IDs
-- This bypasses the migration system to ensure products exist

INSERT INTO public.products (
    id,
    name,
    description,
    price,
    image_url,
    slug,
    category,
    tags,
    reviews,
    rating,
    in_stock,
    stock_count,
    created_at,
    updated_at,
    printful_product_id,
    printful_cost,
    retail_price,
    is_available
) VALUES 
(
    gen_random_uuid(),
    'Reform UK Sticker',
    'High-quality Reform UK sticker with our logo and branding',
    2.99,
    'https://files.cdn.printful.com/files/0c1/0c1f25b661edfe4404afa3bd271e2039_preview.png',
    'reform-uk-sticker',
    'Stickers',
    ARRAY['sticker', 'reform', 'uk', 'branding'],
    0,
    0,
    true,
    100,
    NOW(),
    NOW(),
    '390637627',
    1.50,
    2.99,
    true
),
(
    gen_random_uuid(),
    'Reform UK Mug',
    'Ceramic mug featuring Reform UK branding',
    12.99,
    'https://files.cdn.printful.com/files/f75/f75fb5d7303c416ff7380d21521a17ff_preview.png',
    'reform-uk-mug',
    'Mugs',
    ARRAY['mug', 'ceramic', 'reform', 'uk', 'drinkware'],
    0,
    0,
    true,
    50,
    NOW(),
    NOW(),
    '390637302',
    6.50,
    12.99,
    true
),
(
    gen_random_uuid(),
    'Reform UK T-Shirt',
    'Comfortable cotton t-shirt with Reform UK design',
    24.99,
    'https://files.cdn.printful.com/files/example-tshirt.png',
    'reform-uk-tshirt',
    'Clothing',
    ARRAY['tshirt', 'cotton', 'reform', 'uk', 'clothing'],
    0,
    0,
    true,
    75,
    NOW(),
    NOW(),
    '390637999',
    12.50,
    24.99,
    true
);

-- Verify the products were inserted
SELECT 
    id,
    name,
    printful_product_id,
    category,
    price,
    is_available
FROM public.products 
WHERE printful_product_id IS NOT NULL
ORDER BY created_at DESC;
