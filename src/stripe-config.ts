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
    name: 'Reform UK Badge Set',
    description: 'A collection of Reform UK badges, perfect for jackets, bags, or lanyards. Show your support wherever you go.',
    price: 9.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScXtYM04OKRYTe',
    priceId: 'price_1RhIoA6AAjJ6M3ikaYpQ260I', // 10 Badges price ID
    name: 'Reform UK Badge Set (10 Pack)',
    description: 'A collection of 10 Reform UK badges, perfect for jackets, bags, or lanyards.',
    price: 15.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScXtYM04OKRYTe',
    priceId: 'price_1RhIoA6AAjJ6M3ik3piP0HUx', // 25 Badges price ID
    name: 'Reform UK Badge Set (25 Pack)',
    description: 'A collection of 25 Reform UK badges, perfect for jackets, bags, or lanyards.',
    price: 35.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScXtYM04OKRYTe',
    priceId: 'price_1RhIoA6AAjJ6M3ikOSoZ3Ys9', // 50 Badges price ID
    name: 'Reform UK Badge Set (50 Pack)',
    description: 'A collection of 50 Reform UK badges, perfect for jackets, bags, or lanyards.',
    price: 64.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd8pcDfjJwPCo1',
    priceId: 'price_1RhsXRGDbOGEgNLwiiZNVuie',
    name: 'Activist Bundle',
    description: 'The ultimate Reform UK supporter pack: hoodie, T-shirt, cap, tote bag, water bottle, mug, and mouse pad.',
    price: 127.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd8nP9NMpObNeO',
    priceId: 'price_1RhsW8GDbOGEgNLwahSqdPDz',
    name: 'Champion Bundle',
    description: 'Step up your support with a hoodie, tote bag, water bottle, and mouse pad. The perfect set for active campaigners.',
    price: 89.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd8mNV0mlpBltk',
    priceId: 'price_1RhsUsGDbOGEgNLw2LAVZoGb',
    name: 'Starter Bundle',
    description: 'Perfect for newcomers to the Reform movement. Includes essential items to show your support.',
    price: 49.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9AwiyuVBssZa',
    priceId: 'price_1Rhss7GDbOGEgNLwqe7IKpHb',
    name: 'Reform UK Water Bottle',
    description: 'Stay hydrated on the go with this reusable Reform UK water bottle. BPA-free, leak-proof, and featuring the official logo.',
    price: 24.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd99GUmSKvRrh8',
    priceId: 'price_1RhsrKGDbOGEgNLwdgEGRO0q',
    name: 'Reform UK Tote Bag',
    description: 'Eco-friendly and spacious, this Reform UK tote bag is perfect for shopping, events, or daily use. Features sturdy handles and a bold printed design.',
    price: 24.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd98NBw7BN3UeY',
    priceId: 'price_1RhsqJGDbOGEgNLwrGCcL3x3',
    name: 'Reform UK Cap',
    description: 'Stay cool and represent Reform UK with this adjustable, high-quality cap. Embroidered logo and durable construction for all-day comfort.',
    price: 19.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd94WiqjrSQHZ8',
    priceId: 'price_1RhslxGDbOGEgNLwjiLtrGkD',
    name: 'Reform UK T-Shirt',
    description: 'A classic, comfortable tee with the Reform UK logo. Made from 100% cotton for everyday wear and statement-making support.',
    price: 24.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd8zogtUd2cTOt',
    priceId: 'price_1Rhsh5GDbOGEgNLwpqIVX80W',
    name: 'Reform UK Hoodie',
    description: 'Show your support in style and comfort with this premium Reform UK hoodie. Features a soft fleece lining, adjustable drawstring hood, and bold Reform UK branding.',
    price: 39.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9NmoMTiInOFT',
    priceId: 'price_1Rht4SGDbOGEgNLwq1R3UDQS',
    name: 'Reform UK Badges (5 Pack)',
    description: 'A collection of Reform UK badges, perfect for jackets, bags, or lanyards. Show your support wherever you go.',
    price: 9.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9NmoMTiInOFT',
    priceId: 'price_1Rht63GDbOGEgNLwUssokbE7',
    name: 'Reform UK Badges (10 Pack)',
    description: 'A collection of 10 Reform UK badges, perfect for jackets, bags, or lanyards. Show your support wherever you go.',
    price: 15.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9NmoMTiInOFT',
    priceId: 'price_1Rht63GDbOGEgNLwUssokbE7',
    name: 'Reform UK Badges (25 Pack)',
    description: 'A collection of 25 Reform UK badges, perfect for jackets, bags, or lanyards. Show your support wherever you go.',
    price: 35.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9NmoMTiInOFT',
    priceId: 'price_1Rht63GDbOGEgNLwUssokbE7',
    name: 'Reform UK Badges (50 Pack)',
    description: 'A collection of 50 Reform UK badges, perfect for jackets, bags, or lanyards. Show your support wherever you go.',
    price: 64.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9NmoMTiInOFT',
    priceId: 'price_1Rht63GDbOGEgNLwUssokbE7',
    name: 'Reform UK Mug',
    description: 'Start your day with Reform UK! This ceramic mug features the official logo and is perfect for coffee, tea, or any hot beverage.',
    price: 9.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9NmoMTiInOFT',
    priceId: 'price_1Rht63GDbOGEgNLwUssokbE7',
    name: 'Reform UK Mouse Pad',
    description: 'Show your support even while working! This high-quality mouse pad features the Reform UK logo and provides smooth mouse movement.',
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
  publishableKey: 'pk_test_51RgXVNGDbOGEgNLwnC3APRDyN0bPWtx7CzyCTo22KGECzovkaY1baKJiNlCLdjjqsZUbarFVMEii5aAhyjSorcIV00vV0IB8hG',
  
  // Stripe configuration options
  options: {
    mode: 'test', // Use 'live' for production
    currency: 'gbp',
    country: 'GB',
    // Add any additional Stripe configuration options here
  }
};

// Export individual values for convenience
export const STRIPE_PUBLISHABLE_KEY = STRIPE_CONFIG.publishableKey;
export const STRIPE_CURRENCY = STRIPE_CONFIG.options.currency;
export const STRIPE_COUNTRY = STRIPE_CONFIG.options.country;