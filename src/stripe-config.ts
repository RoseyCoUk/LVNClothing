export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
}

export const products: Product[] = [
  {
    id: 'prod_ScJcQ8ipTKmWu9',
    priceId: 'price_1Rh4zOFJg5cU61Wl7LSOaVrW',
    name: 'Reform UK Badge Set',
    description: 'A collection of Reform UK badges, perfect for jackets, bags, or lanyards.',
    price: 9.99
  },
  {
    id: 'prod_SbkxrgVbUEI3WA',
    priceId: 'price_1RgXRkFJg5cU61Wla3cNcSaE',
    name: 'Activist Bundle',
    description: 'The ultimate Reform UK supporter pack: hoodie, T-shirt, cap, tote bag, water bottle, mug, mouse pad, stickers, and badge set.',
    price: 199.99
  },
  {
    id: 'prod_SbkxbofJx7pXla',
    priceId: 'price_1RgXRFFJg5cU61WlSbBv5kS8',
    name: 'Champion Bundle',
    description: 'Includes: Hoodie, Cap, Tote Bag, Water Bottle.',
    price: 139.99
  },
  {
    id: 'prod_SbkvIN1vLCPAvC',
    priceId: 'price_1RgXQ3FJg5cU61WlXkyfNBVd',
    name: 'Starter Bundle',
    description: 'Includes: T-shirt and Tote Bag.',
    price: 34.99
  },
  {
    id: 'prod_SbktKQUHo30fKV',
    priceId: 'price_1RgXO9FJg5cU61WlospNv7xa',
    name: 'Reform UK Stickers',
    description: 'A collection of Reform UK badges.',
    price: 9.99
  },
  {
    id: 'prod_Sbkof9dwS5zSSm',
    priceId: 'price_1RgXIpFJg5cU61WlXPXptulv',
    name: 'Reform UK Mouse Pad',
    description: 'Non-slip base, high-quality print.',
    price: 14.99
  },
  {
    id: 'prod_SbknNgx48tCq1O',
    priceId: 'price_1RgXHSFJg5cU61Wl0rmObyrH',
    name: 'Reform UK Mug',
    description: 'Dishwasher and microwave safe.',
    price: 19.99
  },
  {
    id: 'prod_Sbkmra8VcN7GWM',
    priceId: 'price_1RgXGqFJg5cU61Wlrevf8XiX',
    name: 'Reform UK Water Bottle',
    description: 'Reusable, leak-proof, BPA-free.',
    price: 24.99
  },
  {
    id: 'prod_Sbkmg8par1Xbtk',
    priceId: 'price_1RgXGTFJg5cU61WlsbgPrVvk',
    name: 'Reform UK Tote Bag',
    description: 'Eco-friendly, sturdy handles.',
    price: 19.99
  },
  {
    id: 'prod_SbklLbgz6JcmlT',
    priceId: 'price_1RgXG3FJg5cU61Wl5POUKwFs',
    name: 'Reform UK Cap',
    description: 'Adjustable, embroidered logo.',
    price: 19.99
  },
  {
    id: 'prod_SbklFNHsNDuSDH',
    priceId: 'price_1RgXFZFJg5cU61Wl0raeYVBN',
    name: 'Reform UK T-Shirt',
    description: '100% cotton, logo printed.',
    price: 19.99
  },
  {
    id: 'prod_SbkgnTJ7PGycVE',
    priceId: 'price_1RgXAlFJg5cU61Wl3C0w9uy3',
    name: 'Reform UK Hoodie',
    description: 'Fleece-lined, adjustable hood.',
    price: 49.99
  }
];

export function getProductByPriceId(priceId: string): Product | undefined {
  return products.find(product => product.priceId === priceId);
}

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}