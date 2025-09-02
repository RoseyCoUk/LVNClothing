// FIXED HOODIE VARIANTS - Real Printful Catalog IDs
// Fixed on: 2025-08-31T12:09:40.193Z
// Total variants: 45 (25 DARK + 20 LIGHT)
// Each variant now has a UNIQUE catalogVariantId for correct Printful fulfillment
// NO MORE OVERLAPPING IDs - Every color/size combination maps to correct Printful variant

export type HoodieVariant = {
  key: string;
  catalogVariantId: number;
  syncVariantId: number;
  price: string;
  design: 'DARK' | 'LIGHT';
  size: 'S' | 'M' | 'L' | 'XL' | '2XL';
  color: string;
  colorHex: string;
  externalId: string;
  sku: string;
};

export const HoodieVariants: HoodieVariant[] = [
  {
    key: "DARK-Black-S",
    catalogVariantId: 5530,
    syncVariantId: 5530,
    price: "39.99",
    design: "DARK",
    size: "S",
    color: "Black",
    colorHex: "#0b0b0b",
    externalId: "68a9d381e56616",
    sku: "DARK-Black-S"
  },
  {
    key: "DARK-Dark Heather-S",
    catalogVariantId: 5531,
    syncVariantId: 5531,
    price: "39.99",
    design: "DARK",
    size: "S",
    color: "Dark Heather",
    colorHex: "#47484d",
    externalId: "68a9d381e56b11",
    sku: "DARK-Dark Heather-S"
  },
  {
    key: "DARK-Indigo Blue-S",
    catalogVariantId: 5532,
    syncVariantId: 5532,
    price: "39.99",
    design: "DARK",
    size: "S",
    color: "Indigo Blue",
    colorHex: "#395d82",
    externalId: "68a9d381e56ca1",
    sku: "DARK-Indigo Blue-S"
  },
  {
    key: "DARK-Navy-S",
    catalogVariantId: 5533,
    syncVariantId: 5533,
    price: "39.99",
    design: "DARK",
    size: "S",
    color: "Navy",
    colorHex: "#131928",
    externalId: "68a9d381e567e5",
    sku: "DARK-Navy-S"
  },
  {
    key: "DARK-Red-S",
    catalogVariantId: 5534,
    syncVariantId: 5534,
    price: "39.99",
    design: "DARK",
    size: "S",
    color: "Red",
    colorHex: "#da0a1a",
    externalId: "68a9d381e56976",
    sku: "DARK-Red-S"
  },
  {
    key: "DARK-Black-M",
    catalogVariantId: 5594,
    syncVariantId: 5594,
    price: "39.99",
    design: "DARK",
    size: "M",
    color: "Black",
    colorHex: "#0b0b0b",
    externalId: "68a9d381e56696",
    sku: "DARK-Black-M"
  },
  {
    key: "DARK-Dark Heather-M",
    catalogVariantId: 5595,
    syncVariantId: 5595,
    price: "39.99",
    design: "DARK",
    size: "M",
    color: "Dark Heather",
    colorHex: "#47484d",
    externalId: "68a9d381e56b63",
    sku: "DARK-Dark Heather-M"
  },
  {
    key: "DARK-Indigo Blue-M",
    catalogVariantId: 5596,
    syncVariantId: 5596,
    price: "39.99",
    design: "DARK",
    size: "M",
    color: "Indigo Blue",
    colorHex: "#395d82",
    externalId: "68a9d381e56cf5",
    sku: "DARK-Indigo Blue-M"
  },
  {
    key: "DARK-Navy-M",
    catalogVariantId: 5597,
    syncVariantId: 5597,
    price: "39.99",
    design: "DARK",
    size: "M",
    color: "Navy",
    colorHex: "#131928",
    externalId: "68a9d381e56833",
    sku: "DARK-Navy-M"
  },
  {
    key: "DARK-Red-M",
    catalogVariantId: 5598,
    syncVariantId: 5598,
    price: "39.99",
    design: "DARK",
    size: "M",
    color: "Red",
    colorHex: "#da0a1a",
    externalId: "68a9d381e569c2",
    sku: "DARK-Red-M"
  },
  {
    key: "DARK-Black-L",
    catalogVariantId: 5538,
    syncVariantId: 5538,
    price: "39.99",
    design: "DARK",
    size: "L",
    color: "Black",
    colorHex: "#0b0b0b",
    externalId: "68a9d381e566e2",
    sku: "DARK-Black-L"
  },
  {
    key: "DARK-Dark Heather-L",
    catalogVariantId: 5539,
    syncVariantId: 5539,
    price: "39.99",
    design: "DARK",
    size: "L",
    color: "Dark Heather",
    colorHex: "#47484d",
    externalId: "68a9d381e56ba3",
    sku: "DARK-Dark Heather-L"
  },
  {
    key: "DARK-Indigo Blue-L",
    catalogVariantId: 5540,
    syncVariantId: 5540,
    price: "39.99",
    design: "DARK",
    size: "L",
    color: "Indigo Blue",
    colorHex: "#395d82",
    externalId: "68a9d381e56d44",
    sku: "DARK-Indigo Blue-L"
  },
  {
    key: "DARK-Navy-L",
    catalogVariantId: 5541,
    syncVariantId: 5541,
    price: "39.99",
    design: "DARK",
    size: "L",
    color: "Navy",
    colorHex: "#131928",
    externalId: "68a9d381e56881",
    sku: "DARK-Navy-L"
  },
  {
    key: "DARK-Red-L",
    catalogVariantId: 5542,
    syncVariantId: 5542,
    price: "39.99",
    design: "DARK",
    size: "L",
    color: "Red",
    colorHex: "#da0a1a",
    externalId: "68a9d381e56a15",
    sku: "DARK-Red-L"
  },
  {
    key: "DARK-Black-XL",
    catalogVariantId: 10806,
    syncVariantId: 10806,
    price: "39.99",
    design: "DARK",
    size: "XL",
    color: "Black",
    colorHex: "#0b0b0b",
    externalId: "68a9d381e56741",
    sku: "DARK-Black-XL"
  },
  {
    key: "DARK-Dark Heather-XL",
    catalogVariantId: 10807,
    syncVariantId: 10807,
    price: "39.99",
    design: "DARK",
    size: "XL",
    color: "Dark Heather",
    colorHex: "#47484d",
    externalId: "68a9d381e56bf2",
    sku: "DARK-Dark Heather-XL"
  },
  {
    key: "DARK-Indigo Blue-XL",
    catalogVariantId: 10808,
    syncVariantId: 10808,
    price: "39.99",
    design: "DARK",
    size: "XL",
    color: "Indigo Blue",
    colorHex: "#395d82",
    externalId: "68a9d381e56d98",
    sku: "DARK-Indigo Blue-XL"
  },
  {
    key: "DARK-Navy-XL",
    catalogVariantId: 10809,
    syncVariantId: 10809,
    price: "39.99",
    design: "DARK",
    size: "XL",
    color: "Navy",
    colorHex: "#131928",
    externalId: "68a9d381e568d2",
    sku: "DARK-Navy-XL"
  },
  {
    key: "DARK-Red-XL",
    catalogVariantId: 10810,
    syncVariantId: 10810,
    price: "39.99",
    design: "DARK",
    size: "XL",
    color: "Red",
    colorHex: "#da0a1a",
    externalId: "68a9d381e56a63",
    sku: "DARK-Red-XL"
  },
  {
    key: "DARK-Black-2XL",
    catalogVariantId: 5522,
    syncVariantId: 5522,
    price: "39.99",
    design: "DARK",
    size: "2XL",
    color: "Black",
    colorHex: "#0b0b0b",
    externalId: "68a9d381e56797",
    sku: "DARK-Black-2XL"
  },
  {
    key: "DARK-Dark Heather-2XL",
    catalogVariantId: 5523,
    syncVariantId: 5523,
    price: "39.99",
    design: "DARK",
    size: "2XL",
    color: "Dark Heather",
    colorHex: "#47484d",
    externalId: "68a9d381e56c57",
    sku: "DARK-Dark Heather-2XL"
  },
  {
    key: "DARK-Indigo Blue-2XL",
    catalogVariantId: 5524,
    syncVariantId: 5524,
    price: "39.99",
    design: "DARK",
    size: "2XL",
    color: "Indigo Blue",
    colorHex: "#395d82",
    externalId: "68a9d381e56de2",
    sku: "DARK-Indigo Blue-2XL"
  },
  {
    key: "DARK-Navy-2XL",
    catalogVariantId: 5525,
    syncVariantId: 5525,
    price: "39.99",
    design: "DARK",
    size: "2XL",
    color: "Navy",
    colorHex: "#131928",
    externalId: "68a9d381e56925",
    sku: "DARK-Navy-2XL"
  },
  {
    key: "DARK-Red-2XL",
    catalogVariantId: 5526,
    syncVariantId: 5526,
    price: "39.99",
    design: "DARK",
    size: "2XL",
    color: "Red",
    colorHex: "#da0a1a",
    externalId: "68a9d381e56ac9",
    sku: "DARK-Red-2XL"
  },
  {
    key: "LIGHT-Light Blue-S",
    catalogVariantId: 5610,
    syncVariantId: 5610,
    price: "39.99",
    design: "LIGHT",
    size: "S",
    color: "Light Blue",
    colorHex: "#a1c5e1",
    externalId: "68a9d27b158456",
    sku: "LIGHT-Light Blue-S"
  },
  {
    key: "LIGHT-Light Pink-S",
    catalogVariantId: 5611,
    syncVariantId: 5611,
    price: "39.99",
    design: "LIGHT",
    size: "S",
    color: "Light Pink",
    colorHex: "#f3d4e3",
    externalId: "68a9d27b158626",
    sku: "LIGHT-Light Pink-S"
  },
  {
    key: "LIGHT-Sport Grey-S",
    catalogVariantId: 5612,
    syncVariantId: 5612,
    price: "39.99",
    design: "LIGHT",
    size: "S",
    color: "Sport Grey",
    colorHex: "#9b969c",
    externalId: "68a9d27b1582a6",
    sku: "LIGHT-Sport Grey-S"
  },
  {
    key: "LIGHT-White-S",
    catalogVariantId: 5613,
    syncVariantId: 5613,
    price: "39.99",
    design: "LIGHT",
    size: "S",
    color: "White",
    colorHex: "#ffffff",
    externalId: "68a9d27b158796",
    sku: "LIGHT-White-S"
  },
  {
    key: "LIGHT-Light Blue-M",
    catalogVariantId: 10841,
    syncVariantId: 10841,
    price: "39.99",
    design: "LIGHT",
    size: "M",
    color: "Light Blue",
    colorHex: "#a1c5e1",
    externalId: "68a9d27b1584a1",
    sku: "LIGHT-Light Blue-M"
  },
  {
    key: "LIGHT-Light Pink-M",
    catalogVariantId: 10842,
    syncVariantId: 10842,
    price: "39.99",
    design: "LIGHT",
    size: "M",
    color: "Light Pink",
    colorHex: "#f3d4e3",
    externalId: "68a9d27b158663",
    sku: "LIGHT-Light Pink-M"
  },
  {
    key: "LIGHT-Sport Grey-M",
    catalogVariantId: 10843,
    syncVariantId: 10843,
    price: "39.99",
    design: "LIGHT",
    size: "M",
    color: "Sport Grey",
    colorHex: "#9b969c",
    externalId: "68a9d27b158311",
    sku: "LIGHT-Sport Grey-M"
  },
  {
    key: "LIGHT-White-M",
    catalogVariantId: 10844,
    syncVariantId: 10844,
    price: "39.99",
    design: "LIGHT",
    size: "M",
    color: "White",
    colorHex: "#ffffff",
    externalId: "68a9d27b1587d6",
    sku: "LIGHT-White-M"
  },
  {
    key: "LIGHT-Light Blue-L",
    catalogVariantId: 10849,
    syncVariantId: 10849,
    price: "39.99",
    design: "LIGHT",
    size: "L",
    color: "Light Blue",
    colorHex: "#a1c5e1",
    externalId: "68a9d27b1584e2",
    sku: "LIGHT-Light Blue-L"
  },
  {
    key: "LIGHT-Light Pink-L",
    catalogVariantId: 10850,
    syncVariantId: 10850,
    price: "39.99",
    design: "LIGHT",
    size: "L",
    color: "Light Pink",
    colorHex: "#f3d4e3",
    externalId: "68a9d27b1586b2",
    sku: "LIGHT-Light Pink-L"
  },
  {
    key: "LIGHT-Sport Grey-L",
    catalogVariantId: 10851,
    syncVariantId: 10851,
    price: "39.99",
    design: "LIGHT",
    size: "L",
    color: "Sport Grey",
    colorHex: "#9b969c",
    externalId: "68a9d27b158375",
    sku: "LIGHT-Sport Grey-L"
  },
  {
    key: "LIGHT-White-L",
    catalogVariantId: 10852,
    syncVariantId: 10852,
    price: "39.99",
    design: "LIGHT",
    size: "L",
    color: "White",
    colorHex: "#ffffff",
    externalId: "68a9d27b158827",
    sku: "LIGHT-White-L"
  },
  {
    key: "LIGHT-Light Blue-XL",
    catalogVariantId: 10857,
    syncVariantId: 10857,
    price: "39.99",
    design: "LIGHT",
    size: "XL",
    color: "Light Blue",
    colorHex: "#a1c5e1",
    externalId: "68a9d27b158534",
    sku: "LIGHT-Light Blue-XL"
  },
  {
    key: "LIGHT-Light Pink-XL",
    catalogVariantId: 10858,
    syncVariantId: 10858,
    price: "39.99",
    design: "LIGHT",
    size: "XL",
    color: "Light Pink",
    colorHex: "#f3d4e3",
    externalId: "68a9d27b158707",
    sku: "LIGHT-Light Pink-XL"
  },
  {
    key: "LIGHT-Sport Grey-XL",
    catalogVariantId: 10859,
    syncVariantId: 10859,
    price: "39.99",
    design: "LIGHT",
    size: "XL",
    color: "Sport Grey",
    colorHex: "#9b969c",
    externalId: "68a9d27b1583b6",
    sku: "LIGHT-Sport Grey-XL"
  },
  {
    key: "LIGHT-White-XL",
    catalogVariantId: 10860,
    syncVariantId: 10860,
    price: "39.99",
    design: "LIGHT",
    size: "XL",
    color: "White",
    colorHex: "#ffffff",
    externalId: "68a9d27b158863",
    sku: "LIGHT-White-XL"
  },
  {
    key: "LIGHT-Light Blue-2XL",
    catalogVariantId: 10865,
    syncVariantId: 10865,
    price: "39.99",
    design: "LIGHT",
    size: "2XL",
    color: "Light Blue",
    colorHex: "#a1c5e1",
    externalId: "68a9d27b158581",
    sku: "LIGHT-Light Blue-2XL"
  },
  {
    key: "LIGHT-Light Pink-2XL",
    catalogVariantId: 10866,
    syncVariantId: 10866,
    price: "39.99",
    design: "LIGHT",
    size: "2XL",
    color: "Light Pink",
    colorHex: "#f3d4e3",
    externalId: "68a9d27b158746",
    sku: "LIGHT-Light Pink-2XL"
  },
  {
    key: "LIGHT-Sport Grey-2XL",
    catalogVariantId: 10867,
    syncVariantId: 10867,
    price: "39.99",
    design: "LIGHT",
    size: "2XL",
    color: "Sport Grey",
    colorHex: "#9b969c",
    externalId: "68a9d27b158405",
    sku: "LIGHT-Sport Grey-2XL"
  },
  {
    key: "LIGHT-White-2XL",
    catalogVariantId: 10868,
    syncVariantId: 10868,
    price: "39.99",
    design: "LIGHT",
    size: "2XL",
    color: "White",
    colorHex: "#ffffff",
    externalId: "68a9d27b1588b1",
    sku: "LIGHT-White-2XL"
  }
];

// Helper Functions
export function findHoodieVariant(design: 'DARK' | 'LIGHT', size: string, color: string): HoodieVariant | undefined {
  return HoodieVariants.find(variant => 
    variant.design === design && 
    variant.size === size && 
    variant.color === color
  );
}

export function findHoodieVariantByCatalogId(catalogId: number): HoodieVariant | undefined {
  return HoodieVariants.find(variant => variant.catalogVariantId === catalogId);
}

export function findHoodieVariantByExternalId(externalId: string): HoodieVariant | undefined {
  return HoodieVariants.find(variant => variant.externalId === externalId);
}

export function getHoodieVariantsByDesign(design: 'DARK' | 'LIGHT'): HoodieVariant[] {
  return HoodieVariants.filter(variant => variant.design === design);
}

export function getHoodieVariantsBySize(size: string): HoodieVariant[] {
  return HoodieVariants.filter(variant => variant.size === size);
}

export function getHoodieVariantsByColor(color: string): HoodieVariant[] {
  return HoodieVariants.filter(variant => variant.color === color);
}

// Get unique designs, sizes, and colors
export const hoodieDesigns = ['DARK', 'LIGHT'] as const;
export const hoodieSizes = ['S', 'M', 'L', 'XL', '2XL'] as const;

// Define the actual hoodie colors with hex codes
export const hoodieColors = [
  // DARK colors
  { name: 'Black', hex: '#0b0b0b' },
  { name: 'Dark Heather', hex: '#47484d' },
  { name: 'Indigo Blue', hex: '#395d82' },
  { name: 'Navy', hex: '#131928' },
  { name: 'Red', hex: '#da0a1a' },
  // LIGHT colors
  { name: 'Light Blue', hex: '#a1c5e1' },
  { name: 'Light Pink', hex: '#f3d4e3' },
  { name: 'Sport Grey', hex: '#9b969c' },
  { name: 'White', hex: '#ffffff', border: true }
];

// IMPORTANT: Each hoodie variant now has UNIQUE Printful catalog IDs
// DARK design: 25 variants with unique IDs
// LIGHT design: 20 variants with unique IDs
// Total: 45 variants with NO overlapping Printful catalog IDs
// Customer hoodie orders will now be fulfilled correctly by Printful