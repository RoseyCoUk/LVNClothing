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
    description: 'The ultimate Reform UK supporter pack: hoodie, T-shirt, cap, tote bag, water bottle, mug, mouse pad, stickers, and badge set.',
    price: 199.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd8nP9NMpObNeO',
    priceId: 'price_1RhsW8GDbOGEgNLwahSqdPDz',
    name: 'Champion Bundle',
    description: 'Step up your support with a hoodie, cap, tote bag, and water bottle. The perfect set for active campaigners.',
    price: 99.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd8mNV0mlpBltk',
    priceId: 'price_1RhsUsGDbOGEgNLw2LAVZoGb',
    name: 'Starter Bundle',
    description: 'Kickstart your Reform UK collection with a T-shirt and tote bag—ideal for new supporters.',
    price: 34.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9IYb41z4zmJw',
    priceId: 'price_1Rht03GDbOGEgNLwJ1ubNAti',
    name: 'Reform UK Stickers (10 Pack)',
    description: 'Set of weatherproof Reform UK stickers. Perfect for laptops, water bottles, cars, and more.',
    price: 9.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9IYb41z4zmJw',
    priceId: 'price_1Rht18GDbOGEgNLwcGW40rtg',
    name: 'Reform UK Stickers (25 Pack)',
    description: 'Set of 25 weatherproof Reform UK stickers. Perfect for laptops, water bottles, cars, and more.',
    price: 19.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9IYb41z4zmJw',
    priceId: 'price_1Rht1hGDbOGEgNLwfhp9VAdB',
    name: 'Reform UK Stickers (50 Pack)',
    description: 'Set of 50 weatherproof Reform UK stickers. Perfect for laptops, water bottles, cars, and more.',
    price: 34.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9IYb41z4zmJw',
    priceId: 'price_1Rht23GDbOGEgNLw5XD5xTaX',
    name: 'Reform UK Stickers (100 Pack)',
    description: 'Set of 100 weatherproof Reform UK stickers. Perfect for laptops, water bottles, cars, and more.',
    price: 59.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9GL7Wa6YBMJU',
    priceId: 'price_1RhsxfGDbOGEgNLwpTGkkVou',
    name: 'Reform UK Mouse Pad',
    description: 'Upgrade your workspace with a smooth, durable Reform UK mouse pad. Non-slip base and high-quality print for everyday use.',
    price: 14.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9EhUHhgszITY',
    priceId: 'price_1Rhsw7GDbOGEgNLwYH6kMu8R',
    name: 'Reform UK Mug',
    description: 'Enjoy your favorite hot drink in this ceramic Reform UK mug. Dishwasher and microwave safe with a vibrant logo print.',
    price: 19.99,
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
    price: 19.99,
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
    price: 49.99,
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
    description: 'A collection of 10 Reform UK badges, perfect for jackets, bags, or lanyards.',
    price: 15.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9NmoMTiInOFT',
    priceId: 'price_1Rht6PGDbOGEgNLwE2FyT2Kz',
    name: 'Reform UK Badges (25 Pack)',
    description: 'A collection of 25 Reform UK badges, perfect for jackets, bags, or lanyards.',
    price: 35.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sd9NmoMTiInOFT',
    priceId: 'price_1Rht6eGDbOGEgNLws1wlMSGh',
    name: 'Reform UK Badges (50 Pack)',
    description: 'A collection of 50 Reform UK badges, perfect for jackets, bags, or lanyards.',
    price: 64.99,
    mode: 'payment'
  }
];

export function getProductByPriceId(priceId: string): Product | undefined {
  return products.find(product => product.priceId === priceId);
}

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}