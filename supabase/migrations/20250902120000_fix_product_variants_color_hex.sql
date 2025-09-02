-- Fix product_variants color_hex values with correct Printful values
-- Based on PRINTFUL_PRODUCT_VARIANTS_LIST.md

-- Cap colors
UPDATE product_variants 
SET color_hex = '#181717' 
WHERE color = 'Black' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND p.name ILIKE '%cap%'
);

UPDATE product_variants 
SET color_hex = '#39353a' 
WHERE color = 'Dark Grey' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND p.name ILIKE '%cap%'
);

UPDATE product_variants 
SET color_hex = '#b49771' 
WHERE color = 'Khaki' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND p.name ILIKE '%cap%'
);

UPDATE product_variants 
SET color_hex = '#b5cbda' 
WHERE color = 'Light Blue' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND p.name ILIKE '%cap%'
);

UPDATE product_variants 
SET color_hex = '#182031' 
WHERE color = 'Navy' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND p.name ILIKE '%cap%'
);

UPDATE product_variants 
SET color_hex = '#fab2ba' 
WHERE color = 'Pink' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND p.name ILIKE '%cap%'
);

UPDATE product_variants 
SET color_hex = '#d6bdad' 
WHERE color = 'Stone' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND p.name ILIKE '%cap%'
);

UPDATE product_variants 
SET color_hex = '#ffffff' 
WHERE color = 'White' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND p.name ILIKE '%cap%'
);

-- T-shirt DARK colors
UPDATE product_variants 
SET color_hex = '#5f5849' 
WHERE color = 'Army' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%dark%')
);

UPDATE product_variants 
SET color_hex = '#52514f' 
WHERE color = 'Asphalt' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%dark%')
);

UPDATE product_variants 
SET color_hex = '#c85313' 
WHERE color = 'Autumn' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%dark%')
);

UPDATE product_variants 
SET color_hex = '#0c0c0c' 
WHERE color = 'Black' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%dark%')
);

UPDATE product_variants 
SET color_hex = '#0b0b0b' 
WHERE color = 'Black Heather' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%dark%')
);

UPDATE product_variants 
SET color_hex = '#3E3C3D' 
WHERE color = 'Dark Grey Heather' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%dark%')
);

UPDATE product_variants 
SET color_hex = '#447085' 
WHERE color = 'Heather Deep Teal' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%dark%')
);

UPDATE product_variants 
SET color_hex = '#bf6e6e' 
WHERE color = 'Mauve' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%dark%')
);

UPDATE product_variants 
SET color_hex = '#212642' 
WHERE color = 'Navy' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%dark%')
);

UPDATE product_variants 
SET color_hex = '#5b642f' 
WHERE color = 'Olive' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%dark%')
);

UPDATE product_variants 
SET color_hex = '#d0071e' 
WHERE color = 'Red' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%dark%')
);

UPDATE product_variants 
SET color_hex = '#668ea7' 
WHERE color = 'Steel Blue' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%dark%')
);

-- T-shirt LIGHT colors
UPDATE product_variants 
SET color_hex = '#f0f1ea' 
WHERE color = 'Ash' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%light%')
);

UPDATE product_variants 
SET color_hex = '#cececc' 
WHERE color = 'Athletic Heather' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%light%')
);

UPDATE product_variants 
SET color_hex = '#e5d9c9' 
WHERE color = 'Heather Dust' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%light%')
);

UPDATE product_variants 
SET color_hex = '#f3c2b2' 
WHERE color = 'Heather Prism Peach' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%light%')
);

UPDATE product_variants 
SET color_hex = '#eda027' 
WHERE color = 'Mustard' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%light%')
);

UPDATE product_variants 
SET color_hex = '#fdbfc7' 
WHERE color = 'Pink' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%light%')
);

UPDATE product_variants 
SET color_hex = '#ffffff' 
WHERE color = 'White' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%light%')
);

UPDATE product_variants 
SET color_hex = '#ffd667' 
WHERE color = 'Yellow' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%t-shirt%' AND p.name ILIKE '%light%')
);

-- Hoodie DARK colors
UPDATE product_variants 
SET color_hex = '#0b0b0b' 
WHERE color = 'Black' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%hoodie%' AND p.name ILIKE '%dark%')
);

UPDATE product_variants 
SET color_hex = '#47484d' 
WHERE color = 'Dark Heather' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%hoodie%' AND p.name ILIKE '%dark%')
);

UPDATE product_variants 
SET color_hex = '#395d82' 
WHERE color = 'Indigo Blue' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%hoodie%' AND p.name ILIKE '%dark%')
);

UPDATE product_variants 
SET color_hex = '#131928' 
WHERE color = 'Navy' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%hoodie%' AND p.name ILIKE '%dark%')
);

UPDATE product_variants 
SET color_hex = '#da0a1a' 
WHERE color = 'Red' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%hoodie%' AND p.name ILIKE '%dark%')
);

-- Hoodie LIGHT colors
UPDATE product_variants 
SET color_hex = '#a1c5e1' 
WHERE color = 'Light Blue' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%hoodie%' AND p.name ILIKE '%light%')
);

UPDATE product_variants 
SET color_hex = '#f3d4e3' 
WHERE color = 'Light Pink' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%hoodie%' AND p.name ILIKE '%light%')
);

UPDATE product_variants 
SET color_hex = '#9b969c' 
WHERE color = 'Sport Grey' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%hoodie%' AND p.name ILIKE '%light%')
);

UPDATE product_variants 
SET color_hex = '#ffffff' 
WHERE color = 'White' AND EXISTS (
  SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND (p.name ILIKE '%hoodie%' AND p.name ILIKE '%light%')
);

-- Log the changes
SELECT 'Migration completed: Updated color_hex values for all product variants with correct Printful colors' as status;