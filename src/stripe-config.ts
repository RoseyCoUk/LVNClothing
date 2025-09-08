export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  mode: 'payment' | 'subscription';
}

export const products: Product[] = [
  {
    id: 'prod_ScXtYM04OKRYTe',
    priceId: 'price_1RhIoA6AAjJ6M3ikWtMdB6qK', // 5 Badges price ID
    name: 'LVN Clothing Badge Set',
    description: 'A collection of LVN Clothing badges, perfect for jackets, bags, or lanyards. Herald the Kingdom wherever you go.',
    price: 9.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScXtYM04OKRYTe',
    priceId: 'price_1RhIoA6AAjJ6M3ikaYpQ260I', // 10 Badges price ID
    name: 'LVN Clothing Badge Set (10 Pack)',
    description: 'A collection of 10 LVN Clothing badges, perfect for jackets, bags, or lanyards.',
    price: 15.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScXtYM04OKRYTe',
    priceId: 'price_1RhIoA6AAjJ6M3ik3piP0HUx', // 25 Badges price ID
    name: 'LVN Clothing Badge Set (25 Pack)',
    description: 'A collection of 25 LVN Clothing badges, perfect for jackets, bags, or lanyards.',
    price: 35.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScXtYM04OKRYTe',
    priceId: 'price_1RhIoA6AAjJ6M3ikOSoZ3Ys9', // 50 Badges price ID
    name: 'LVN Clothing Badge Set (50 Pack)',
    description: 'A collection of 50 LVN Clothing badges, perfect for jackets, bags, or lanyards.',
    price: 64.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd8pcDfjJwPCo1',
    priceId: 'price_1RhsXRGDbOGEgNLwiiZNVuie',
    name: 'Faith Bundle',
    description: 'The ultimate LVN Clothing faith pack: hoodie, T-shirt, cap, tote bag, water bottle, mug, and mouse pad.',
    price: 127.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd8nP9NMpObNeO',
    priceId: 'price_1RhsW8GDbOGEgNLwahSqdPDz',
    name: 'Kingdom Bundle',
    description: 'Step up your faith with a hoodie, tote bag, water bottle, and mouse pad. The perfect set for Kingdom heralds.',
    price: 89.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd8mNV0mlpBltk',
    priceId: 'price_1RhsUsGDbOGEgNLw2LAVZoGb',
    name: 'Starter Bundle',
    description: 'Perfect for newcomers to the faith journey. Includes essential items to herald the Kingdom.',
    price: 49.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9AwiyuVBssZa',
    priceId: 'price_1Rhss7GDbOGEgNLwqe7IKpHb',
    name: 'LVN Clothing Water Bottle',
    description: 'Stay hydrated on the go with this reusable LVN Clothing water bottle. BPA-free, leak-proof, and featuring the Kingdom message.',
    price: 24.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd99GUmSKvRrh8',
    priceId: 'price_1RhsrKGDbOGEgNLwdgEGRO0q',
    name: 'LVN Clothing Tote Bag',
    description: 'Eco-friendly and spacious, this LVN Clothing tote bag is perfect for shopping, events, or daily use. Features sturdy handles and faith-inspired design.',
    price: 24.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd98NBw7BN3UeY',
    priceId: 'price_1RhsqJGDbOGEgNLwrGCcL3x3',
    name: 'LVN Clothing Cap',
    description: 'Stay cool and herald the Kingdom with this adjustable, high-quality cap. Embroidered logo and durable construction for all-day comfort.',
    price: 19.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd94WiqjrSQHZ8',
    priceId: 'price_1RhslxGDbOGEgNLwjiLtrGkD',
    name: 'LVN Clothing T-Shirt',
    description: 'A classic, comfortable tee with the LVN Clothing logo. Made from 100% cotton for everyday wear and faith expression.',
    price: 24.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd8zogtUd2cTOt',
    priceId: 'price_1Rhsh5GDbOGEgNLwpqIVX80W',
    name: 'LVN Clothing Hoodie',
    description: 'Show your faith in style and comfort with this premium LVN Clothing hoodie. Features a soft fleece lining, adjustable drawstring hood, and Kingdom-inspired design.',
    price: 39.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9NmoMTiInOFT',
    priceId: 'price_1Rht4SGDbOGEgNLwq1R3UDQS',
    name: 'LVN Clothing Badges (5 Pack)',
    description: 'A collection of LVN Clothing badges, perfect for jackets, bags, or lanyards. Herald the Kingdom wherever you go.',
    price: 9.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9NmoMTiInOFT',
    priceId: 'price_1Rht63GDbOGEgNLwUssokbE7',
    name: 'LVN Clothing Badges (10 Pack)',
    description: 'A collection of 10 LVN Clothing badges, perfect for jackets, bags, or lanyards. Herald the Kingdom wherever you go.',
    price: 15.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9NmoMTiInOFT',
    priceId: 'price_1Rht63GDbOGEgNLwUssokbE7',
    name: 'LVN Clothing Badges (25 Pack)',
    description: 'A collection of 25 LVN Clothing badges, perfect for jackets, bags, or lanyards. Herald the Kingdom wherever you go.',
    price: 35.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9NmoMTiInOFT',
    priceId: 'price_1Rht63GDbOGEgNLwUssokbE7',
    name: 'LVN Clothing Badges (50 Pack)',
    description: 'A collection of 50 LVN Clothing badges, perfect for jackets, bags, or lanyards. Herald the Kingdom wherever you go.',
    price: 64.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9NmoMTiInOFT',
    priceId: 'price_1Rht63GDbOGEgNLwUssokbE7',
    name: 'LVN Clothing Mug',
    description: 'Start your day with faith! This ceramic mug features the Kingdom message and is perfect for coffee, tea, or any hot beverage.',
    price: 9.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9NmoMTiInOFT',
    priceId: 'price_1Rht63GDbOGEgNLwUssokbE7',
    name: 'LVN Clothing Mouse Pad',
    description: 'Show your faith even while working! This high-quality mouse pad features the Kingdom message and provides smooth mouse movement.',
    price: 14.99,
    mode: 'payment'
  }
];

export function getProductByPriceId(priceId: string): Product | undefined {
  return products.find(product => product.priceId === priceId);
}

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}

// Stripe configuration for Reform UK
export const STRIPE_CONFIG = {
  // Your Stripe publishable key (public key)
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE',
  
  // Stripe configuration options
  options: {
    mode: import.meta.env.VITE_STRIPE_MODE || 'test', // Use 'live' for production
    currency: import.meta.env.VITE_STRIPE_CURRENCY || 'gbp',
    country: import.meta.env.VITE_STRIPE_COUNTRY || 'GB',
    // Add any additional Stripe configuration options here
  }
};

// Export individual values for convenience
export const STRIPE_PUBLISHABLE_KEY = STRIPE_CONFIG.publishableKey;
export const STRIPE_CURRENCY = STRIPE_CONFIG.options.currency;
export const STRIPE_COUNTRY = STRIPE_CONFIG.options.country;