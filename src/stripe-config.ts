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
    id: 'prod_SbkxrgVbUEI3WA',
    priceId: 'price_1RgXRkFJg5cU61Wla3cNcSaE',
    name: 'Activist Bundle',
    description: 'The ultimate Reform UK supporter pack: hoodie, T-shirt, cap, tote bag, water bottle, mug, mouse pad, stickers, and badge set.',
    price: 199.99,
    mode: 'payment'
  },
  {
    id: 'prod_SbkxbofJx7pXla',
    priceId: 'price_1RgXRFFJg5cU61WlSbBv5kS8',
    name: 'Champion Bundle',
    description: 'Step up your support with a hoodie, cap, tote bag, and water bottle. The perfect set for active campaigners.',
    price: 139.99,
    mode: 'payment'
  },
  {
    id: 'prod_SbkvIN1vLCPAvC',
    priceId: 'price_1RgXQ3FJg5cU61WlXkyfNBVd',
    name: 'Starter Bundle',
    description: 'Kickstart your Reform UK collection with a T-shirt and tote bag—ideal for new supporters.',
    price: 34.99,
    mode: 'payment'
  },
  {
    id: 'prod_SbktKQUHo30fKV',
    priceId: 'price_1RgXO9FJg5cU61WlospNv7xa', // 10 pack
    name: 'Reform UK Stickers (10 Pack)',
    description: 'Set of weatherproof Reform UK stickers. Perfect for laptops, water bottles, cars, and more.',
    price: 9.99,
    mode: 'payment'
  },
  {
    id: 'prod_SbktKQUHo30fKV_25',
    priceId: 'price_1RhE7YFJg5cU61WlnSf4FSP4', // 25 pack
    name: 'Reform UK Stickers (25 Pack)',
    description: 'Set of 25 weatherproof Reform UK stickers. Perfect for laptops, water bottles, cars, and more.',
    price: 19.99,
    mode: 'payment'
  },
  {
    id: 'prod_SbktKQUHo30fKV_50',
    priceId: 'price_1RhE7mFJg5cU61WlUR34bEIZ', // 50 pack
    name: 'Reform UK Stickers (50 Pack)',
    description: 'Set of 50 weatherproof Reform UK stickers. Perfect for laptops, water bottles, cars, and more.',
    price: 34.99,
    mode: 'payment'
  },
  {
    id: 'prod_SbktKQUHo30fKV_100',
    priceId: 'price_1RhE81FJg5cU61WlIBZkgK2d', // 100 pack
    name: 'Reform UK Stickers (100 Pack)',
    description: 'Set of 100 weatherproof Reform UK stickers. Perfect for laptops, water bottles, cars, and more.',
    price: 59.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sbkof9dwS5zSSm',
    priceId: 'price_1RgXIpFJg5cU61WlXPXptulv',
    name: 'Reform UK Mouse Pad',
    description: 'Upgrade your workspace with a smooth, durable Reform UK mouse pad. Non-slip base and high-quality print for everyday use.',
    price: 14.99,
    mode: 'payment'
  },
  {
    id: 'prod_SbknNgx48tCq1O',
    priceId: 'price_1RgXHSFJg5cU61Wl0rmObyrH',
    name: 'Reform UK Mug',
    description: 'Enjoy your favorite hot drink in this ceramic Reform UK mug. Dishwasher and microwave safe with a vibrant logo print.',
    price: 19.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sbkmra8VcN7GWM',
    priceId: 'price_1RgXGqFJg5cU61Wlrevf8XiX',
    name: 'Reform UK Water Bottle',
    description: 'Stay hydrated on the go with this reusable Reform UK water bottle. BPA-free, leak-proof, and featuring the official logo.',
    price: 24.99,
    mode: 'payment'
  },
  {
    id: 'prod_Sbkmg8par1Xbtk',
    priceId: 'price_1RgXGTFJg5cU61WlsbgPrVvk',
    name: 'Reform UK Tote Bag',
    description: 'Eco-friendly and spacious, this Reform UK tote bag is perfect for shopping, events, or daily use. Features sturdy handles and a bold printed design.',
    price: 19.99,
    mode: 'payment'
  },
  {
    id: 'prod_SbklLbgz6JcmlT',
    priceId: 'price_1RgXG3FJg5cU61Wl5POUKwFs',
    name: 'Reform UK Cap',
    description: 'Stay cool and represent Reform UK with this adjustable, high-quality cap. Embroidered logo and durable construction for all-day comfort.',
    price: 19.99,
    mode: 'payment'
  },
  {
    id: 'prod_SbklFNHsNDuSDH',
    priceId: 'price_1RgXFZFJg5cU61Wl0raeYVBN',
    name: 'Reform UK T-Shirt',
    description: 'A classic, comfortable tee with the Reform UK logo. Made from 100% cotton for everyday wear and statement-making support.',
    price: 24.99,
    mode: 'payment'
  },
  {
    id: 'prod_SbkgnTJ7PGycVE',
    priceId: 'price_1RgXAlFJg5cU61Wl3C0w9uy3',
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