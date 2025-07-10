-- Add bundle products to the products table
INSERT INTO products (id, name, description, price_pence, category, tags, image_url, slug, rating, reviews, created_at, updated_at) VALUES
(
  'prod_ScXwG3hpBhqNZW',
  'Starter Bundle',
  'Perfect for newcomers to the Reform UK movement. This starter bundle includes our signature T-shirt and a practical tote bag, giving you everything you need to show your support and carry your essentials in style.',
  3499,
  'bundles',
  ARRAY['bundle', 'starter', 'tshirt', 'totebag'],
  'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=600',
  'starter-bundle',
  4.8,
  127,
  NOW(),
  NOW()
),
(
  'prod_ScXvVATO8FKCvG',
  'Champion Bundle',
  'For dedicated supporters of Reform UK. This comprehensive bundle includes a premium hoodie, cap, tote bag, and water bottle - everything you need to show your commitment to the movement in style and comfort.',
  9999,
  'bundles',
  ARRAY['bundle', 'champion', 'hoodie', 'cap', 'totebag', 'waterbottle'],
  'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600',
  'champion-bundle',
  4.9,
  89,
  NOW(),
  NOW()
),
(
  'prod_ScXuloowrz4FVk',
  'Activist Bundle',
  'The ultimate bundle for dedicated Reform UK activists. This comprehensive collection includes everything you need to show your commitment to the movement - from clothing and accessories to practical items for daily use.',
  16999,
  'bundles',
  ARRAY['bundle', 'activist', 'hoodie', 'tshirt', 'cap', 'totebag', 'waterbottle', 'mug', 'stickers', 'mousepad', 'badges'],
  'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=600',
  'activist-bundle',
  4.9,
  156,
  NOW(),
  NOW()
); 