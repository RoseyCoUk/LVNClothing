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
    id: 'prod_ScXuloowrz4FVk',
    priceId: 'price_1RhIp36AAjJ6M3ikraHGlvUt',
    name: 'Activist Bundle',
    description: 'The ultimate Reform UK supporter pack: hoodie, T-shirt, cap, tote bag, water bottle, mug, mouse pad, stickers, and badge set.',
    price: 199.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScXvVATO8FKCvG',
    priceId: 'price_1RhIph6AAjJ6M3ikoGC9C5UC',
    name: 'Champion Bundle',
    description: 'Step up your support with a hoodie, cap, tote bag, and water bottle. The perfect set for active campaigners.',
    price: 99.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScXwG3hpBhqNZW',
    priceId: 'price_1RhIqZ6AAjJ6M3ik16hsTCQ6',
    name: 'Starter Bundle',
    description: 'Kickstart your Reform UK collection with a T-shirt and tote bag—ideal for new supporters.',
    price: 34.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScXxJfx11oIwsJ',
    priceId: 'price_1RhIrb6AAjJ6M3ikBUvagpUD', // 10 pack
    name: 'Reform UK Stickers (10 Pack)',
    description: 'Set of weatherproof Reform UK stickers. Perfect for laptops, water bottles, cars, and more.',
    price: 9.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScXxJfx11oIwsJ',
    priceId: 'price_1RhIs16AAjJ6M3iknOlvCig1', // 25 pack
    name: 'Reform UK Stickers (25 Pack)',
    description: 'Set of 25 weatherproof Reform UK stickers. Perfect for laptops, water bottles, cars, and more.',
    price: 19.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScXxJfx11oIwsJ',
    priceId: 'price_1RhIsO6AAjJ6M3ikaOVjG5ty', // 50 pack
    name: 'Reform UK Stickers (50 Pack)',
    description: 'Set of 50 weatherproof Reform UK stickers. Perfect for laptops, water bottles, cars, and more.',
    price: 34.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScXxJfx11oIwsJ',
    priceId: 'price_1RhItI6AAjJ6M3ikXLolNq5e', // 100 pack
    name: 'Reform UK Stickers (100 Pack)',
    description: 'Set of 100 weatherproof Reform UK stickers. Perfect for laptops, water bottles, cars, and more.',
    price: 59.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScY2YhK8VvZTsQ',
    priceId: 'price_1RhIwH6AAjJ6M3ikuyhu48AJ',
    name: 'Reform UK Mouse Pad',
    description: 'Upgrade your workspace with a smooth, durable Reform UK mouse pad. Non-slip base and high-quality print for everyday use.',
    price: 14.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScY5Xu0sznr4Oz',
    priceId: 'price_1RhIzP6AAjJ6M3ikomGUEQ8D',
    name: 'Reform UK Mug',
    description: 'Enjoy your favorite hot drink in this ceramic Reform UK mug. Dishwasher and microwave safe with a vibrant logo print.',
    price: 19.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScY7ZvgrA59quk',
    priceId: 'price_1RhJ1j6AAjJ6M3ikrqKOkvC3',
    name: 'Reform UK Water Bottle',
    description: 'Stay hydrated on the go with this reusable Reform UK water bottle. BPA-free, leak-proof, and featuring the official logo.',
    price: 24.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScYAsyOsOsBLk0',
    priceId: 'price_1RhJ4I6AAjJ6M3ikTF2cpqKv',
    name: 'Reform UK Tote Bag',
    description: 'Eco-friendly and spacious, this Reform UK tote bag is perfect for shopping, events, or daily use. Features sturdy handles and a bold printed design.',
    price: 19.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScYBkdFJcV0wbo',
    priceId: 'price_1RhJ576AAjJ6M3iklCrTfgiC',
    name: 'Reform UK Cap',
    description: 'Stay cool and represent Reform UK with this adjustable, high-quality cap. Embroidered logo and durable construction for all-day comfort.',
    price: 19.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScYFIqKqy6EwHE',
    priceId: 'price_1RhJ906AAjJ6M3ikIvZqpFTn',
    name: 'Reform UK T-Shirt',
    description: 'A classic, comfortable tee with the Reform UK logo. Made from 100% cotton for everyday wear and statement-making support.',
    price: 24.99,
    mode: 'payment'
  },
  {
    id: 'prod_ScYIIZ9DhL3XEQ',
    priceId: 'price_1RhJBT6AAjJ6M3ikQfCpKWMu',
    name: 'Reform UK Hoodie',
    description: 'Show your support in style and comfort with this premium Reform UK hoodie. Features a soft fleece lining, adjustable drawstring hood, and bold Reform UK branding.',
    price: 49.99,
    mode: 'payment'
  }
];

export function getProductByPriceId(priceId: string): Product | undefined {
  return products.find(product => product.priceId === priceId);
}

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}