-- Create a view to display products with GBP prices
CREATE VIEW products_with_gbp AS
SELECT 
  id,
  name,
  variant,
  description,
  price_pence,
  (price_pence / 100.0) as price_gbp,
  created_at,
  updated_at
FROM products
ORDER BY name, variant;

-- Grant access to the view
GRANT SELECT ON products_with_gbp TO authenticated;
GRANT SELECT ON products_with_gbp TO anon;
GRANT SELECT ON products_with_gbp TO service_role;

-- Create a view for product categories
CREATE VIEW product_categories AS
SELECT 
  CASE 
    WHEN name LIKE '%Badge%' THEN 'Badges'
    WHEN name LIKE '%Sticker%' THEN 'Stickers'
    WHEN name LIKE '%Bundle%' THEN 'Bundles'
    WHEN name IN ('Reform UK Cap', 'Reform UK T-Shirt', 'Reform UK Hoodie') THEN 'Apparel'
    ELSE 'Accessories'
  END as category,
  COUNT(*) as product_count,
  MIN(price_pence / 100.0) as min_price_gbp,
  MAX(price_pence / 100.0) as max_price_gbp
FROM products
GROUP BY 
  CASE 
    WHEN name LIKE '%Badge%' THEN 'Badges'
    WHEN name LIKE '%Sticker%' THEN 'Stickers'
    WHEN name LIKE '%Bundle%' THEN 'Bundles'
    WHEN name IN ('Reform UK Cap', 'Reform UK T-Shirt', 'Reform UK Hoodie') THEN 'Apparel'
    ELSE 'Accessories'
  END
ORDER BY category;

-- Grant access to the categories view
GRANT SELECT ON product_categories TO authenticated;
GRANT SELECT ON product_categories TO anon;
GRANT SELECT ON product_categories TO service_role; 