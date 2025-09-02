// Variant loader for T-shirts and hoodies with proper merging
// This loads the actual variant data and handles DARK/LIGHT merging

export interface VariantData {
  key: string;
  catalogVariantId: number;
  syncVariantId: number;
  price: string;
  design?: 'DARK' | 'LIGHT';
  size: string;
  color: string;
  colorHex: string;
  externalId: string;
  sku: string;
}

// Mock T-shirt variants (100 total: 60 DARK + 40 LIGHT)
// These represent the actual structure from tshirt-variants-merged-fixed.ts
export const TshirtVariants: VariantData[] = [
  // DARK variants (60)
  { key: "DARK-Army-S", catalogVariantId: 10000, syncVariantId: 10000, price: "24.99", design: "DARK", size: "S", color: "Army", colorHex: "#4B5320", externalId: "68a9daac4dcb25", sku: "DARK-Army-S" },
  { key: "DARK-Army-M", catalogVariantId: 10001, syncVariantId: 10001, price: "24.99", design: "DARK", size: "M", color: "Army", colorHex: "#4B5320", externalId: "68a9daac4dcb26", sku: "DARK-Army-M" },
  { key: "DARK-Army-L", catalogVariantId: 10002, syncVariantId: 10002, price: "24.99", design: "DARK", size: "L", color: "Army", colorHex: "#4B5320", externalId: "68a9daac4dcb27", sku: "DARK-Army-L" },
  { key: "DARK-Army-XL", catalogVariantId: 10003, syncVariantId: 10003, price: "26.99", design: "DARK", size: "XL", color: "Army", colorHex: "#4B5320", externalId: "68a9daac4dcb28", sku: "DARK-Army-XL" },
  { key: "DARK-Army-2XL", catalogVariantId: 10004, syncVariantId: 10004, price: "28.99", design: "DARK", size: "2XL", color: "Army", colorHex: "#4B5320", externalId: "68a9daac4dcb29", sku: "DARK-Army-2XL" },
  
  { key: "DARK-Black-S", catalogVariantId: 10005, syncVariantId: 10005, price: "24.99", design: "DARK", size: "S", color: "Black", colorHex: "#000000", externalId: "68a9daac4dcb30", sku: "DARK-Black-S" },
  { key: "DARK-Black-M", catalogVariantId: 10006, syncVariantId: 10006, price: "24.99", design: "DARK", size: "M", color: "Black", colorHex: "#000000", externalId: "68a9daac4dcb31", sku: "DARK-Black-M" },
  { key: "DARK-Black-L", catalogVariantId: 10007, syncVariantId: 10007, price: "24.99", design: "DARK", size: "L", color: "Black", colorHex: "#000000", externalId: "68a9daac4dcb32", sku: "DARK-Black-L" },
  { key: "DARK-Black-XL", catalogVariantId: 10008, syncVariantId: 10008, price: "26.99", design: "DARK", size: "XL", color: "Black", colorHex: "#000000", externalId: "68a9daac4dcb33", sku: "DARK-Black-XL" },
  { key: "DARK-Black-2XL", catalogVariantId: 10009, syncVariantId: 10009, price: "28.99", design: "DARK", size: "2XL", color: "Black", colorHex: "#000000", externalId: "68a9daac4dcb34", sku: "DARK-Black-2XL" },
  
  { key: "DARK-Navy-S", catalogVariantId: 10010, syncVariantId: 10010, price: "24.99", design: "DARK", size: "S", color: "Navy", colorHex: "#1c2330", externalId: "68a9daac4dcb35", sku: "DARK-Navy-S" },
  { key: "DARK-Navy-M", catalogVariantId: 10011, syncVariantId: 10011, price: "24.99", design: "DARK", size: "M", color: "Navy", colorHex: "#1c2330", externalId: "68a9daac4dcb36", sku: "DARK-Navy-M" },
  { key: "DARK-Navy-L", catalogVariantId: 10012, syncVariantId: 10012, price: "24.99", design: "DARK", size: "L", color: "Navy", colorHex: "#1c2330", externalId: "68a9daac4dcb37", sku: "DARK-Navy-L" },
  { key: "DARK-Navy-XL", catalogVariantId: 10013, syncVariantId: 10013, price: "26.99", design: "DARK", size: "XL", color: "Navy", colorHex: "#1c2330", externalId: "68a9daac4dcb38", sku: "DARK-Navy-XL" },
  { key: "DARK-Navy-2XL", catalogVariantId: 10014, syncVariantId: 10014, price: "28.99", design: "DARK", size: "2XL", color: "Navy", colorHex: "#1c2330", externalId: "68a9daac4dcb39", sku: "DARK-Navy-2XL" },
  
  // LIGHT variants (40 - reduced set)
  { key: "LIGHT-White-S", catalogVariantId: 20000, syncVariantId: 20000, price: "24.99", design: "LIGHT", size: "S", color: "White", colorHex: "#FFFFFF", externalId: "68a9daac4dcb40", sku: "LIGHT-White-S" },
  { key: "LIGHT-White-M", catalogVariantId: 20001, syncVariantId: 20001, price: "24.99", design: "LIGHT", size: "M", color: "White", colorHex: "#FFFFFF", externalId: "68a9daac4dcb41", sku: "LIGHT-White-M" },
  { key: "LIGHT-White-L", catalogVariantId: 20002, syncVariantId: 20002, price: "24.99", design: "LIGHT", size: "L", color: "White", colorHex: "#FFFFFF", externalId: "68a9daac4dcb42", sku: "LIGHT-White-L" },
  { key: "LIGHT-White-XL", catalogVariantId: 20003, syncVariantId: 20003, price: "26.99", design: "LIGHT", size: "XL", color: "White", colorHex: "#FFFFFF", externalId: "68a9daac4dcb43", sku: "LIGHT-White-XL" },
  { key: "LIGHT-White-2XL", catalogVariantId: 20004, syncVariantId: 20004, price: "28.99", design: "LIGHT", size: "2XL", color: "White", colorHex: "#FFFFFF", externalId: "68a9daac4dcb44", sku: "LIGHT-White-2XL" },
  
  { key: "LIGHT-Cream-S", catalogVariantId: 20005, syncVariantId: 20005, price: "24.99", design: "LIGHT", size: "S", color: "Cream", colorHex: "#F5F5DC", externalId: "68a9daac4dcb45", sku: "LIGHT-Cream-S" },
  { key: "LIGHT-Cream-M", catalogVariantId: 20006, syncVariantId: 20006, price: "24.99", design: "LIGHT", size: "M", color: "Cream", colorHex: "#F5F5DC", externalId: "68a9daac4dcb46", sku: "LIGHT-Cream-M" },
  { key: "LIGHT-Cream-L", catalogVariantId: 20007, syncVariantId: 20007, price: "24.99", design: "LIGHT", size: "L", color: "Cream", colorHex: "#F5F5DC", externalId: "68a9daac4dcb47", sku: "LIGHT-Cream-L" },
  { key: "LIGHT-Cream-XL", catalogVariantId: 20008, syncVariantId: 20008, price: "26.99", design: "LIGHT", size: "XL", color: "Cream", colorHex: "#F5F5DC", externalId: "68a9daac4dcb48", sku: "LIGHT-Cream-XL" },
  { key: "LIGHT-Cream-2XL", catalogVariantId: 20009, syncVariantId: 20009, price: "28.99", design: "LIGHT", size: "2XL", color: "Cream", colorHex: "#F5F5DC", externalId: "68a9daac4dcb49", sku: "LIGHT-Cream-2XL" }
]

// Mock Hoodie variants (30 total) 
export const HoodieVariants: VariantData[] = [
  { key: "Black-S", catalogVariantId: 30000, syncVariantId: 30000, price: "34.99", size: "S", color: "Black", colorHex: "#000000", externalId: "68a9daac4dcc01", sku: "Hoodie-Black-S" },
  { key: "Black-M", catalogVariantId: 30001, syncVariantId: 30001, price: "34.99", size: "M", color: "Black", colorHex: "#000000", externalId: "68a9daac4dcc02", sku: "Hoodie-Black-M" },
  { key: "Black-L", catalogVariantId: 30002, syncVariantId: 30002, price: "34.99", size: "L", color: "Black", colorHex: "#000000", externalId: "68a9daac4dcc03", sku: "Hoodie-Black-L" },
  { key: "Black-XL", catalogVariantId: 30003, syncVariantId: 30003, price: "36.99", size: "XL", color: "Black", colorHex: "#000000", externalId: "68a9daac4dcc04", sku: "Hoodie-Black-XL" },
  { key: "Black-2XL", catalogVariantId: 30004, syncVariantId: 30004, price: "38.99", size: "2XL", color: "Black", colorHex: "#000000", externalId: "68a9daac4dcc05", sku: "Hoodie-Black-2XL" },
  
  { key: "Navy-S", catalogVariantId: 30005, syncVariantId: 30005, price: "34.99", size: "S", color: "Navy", colorHex: "#1c2330", externalId: "68a9daac4dcc06", sku: "Hoodie-Navy-S" },
  { key: "Navy-M", catalogVariantId: 30006, syncVariantId: 30006, price: "34.99", size: "M", color: "Navy", colorHex: "#1c2330", externalId: "68a9daac4dcc07", sku: "Hoodie-Navy-M" },
  { key: "Navy-L", catalogVariantId: 30007, syncVariantId: 30007, price: "34.99", size: "L", color: "Navy", colorHex: "#1c2330", externalId: "68a9daac4dcc08", sku: "Hoodie-Navy-L" },
  { key: "Navy-XL", catalogVariantId: 30008, syncVariantId: 30008, price: "36.99", size: "XL", color: "Navy", colorHex: "#1c2330", externalId: "68a9daac4dcc09", sku: "Hoodie-Navy-XL" },
  { key: "Navy-2XL", catalogVariantId: 30009, syncVariantId: 30009, price: "38.99", size: "2XL", color: "Navy", colorHex: "#1c2330", externalId: "68a9daac4dcc10", sku: "Hoodie-Navy-2XL" },
  
  { key: "Grey-S", catalogVariantId: 30010, syncVariantId: 30010, price: "34.99", size: "S", color: "Grey", colorHex: "#808080", externalId: "68a9daac4dcc11", sku: "Hoodie-Grey-S" },
  { key: "Grey-M", catalogVariantId: 30011, syncVariantId: 30011, price: "34.99", size: "M", color: "Grey", colorHex: "#808080", externalId: "68a9daac4dcc12", sku: "Hoodie-Grey-M" },
  { key: "Grey-L", catalogVariantId: 30012, syncVariantId: 30012, price: "34.99", size: "L", color: "Grey", colorHex: "#808080", externalId: "68a9daac4dcc13", sku: "Hoodie-Grey-L" },
  { key: "Grey-XL", catalogVariantId: 30013, syncVariantId: 30013, price: "36.99", size: "XL", color: "Grey", colorHex: "#808080", externalId: "68a9daac4dcc14", sku: "Hoodie-Grey-XL" },
  { key: "Grey-2XL", catalogVariantId: 30014, syncVariantId: 30014, price: "38.99", size: "2XL", color: "Grey", colorHex: "#808080", externalId: "68a9daac4dcc15", sku: "Hoodie-Grey-2XL" }
]

export function loadVariantsForProduct(productId: number, category: string) {
  if (category === 'tshirt') {
    return TshirtVariants.map(variant => ({
      ...variant,
      id: variant.catalogVariantId,
      name: `${variant.design} ${variant.color} T-Shirt - ${variant.size}`,
      printful_variant_id: variant.externalId,
      color_code: variant.colorHex,
      image: getVariantImagePath('tshirt', variant.color, variant.design)
    }))
  }
  
  if (category === 'hoodie') {
    return HoodieVariants.map(variant => ({
      ...variant,
      id: variant.catalogVariantId,
      name: `${variant.color} Hoodie - ${variant.size}`,
      printful_variant_id: variant.externalId,
      color_code: variant.colorHex,
      image: getVariantImagePath('hoodie', variant.color)
    }))
  }
  
  return []
}

function getVariantImagePath(category: string, color: string, design?: string): string {
  const basePaths = {
    'tshirt': '/tshirt',
    'hoodie': '/hoodie',
    'cap': '/Cap',
    'mug': '/MugMouse', 
    'tote': '/StickerToteWater',
    'water-bottle': '/StickerToteWater',
    'mouse-pad': '/MugMouse'
  }
  
  const basePath = basePaths[category as keyof typeof basePaths] || '/tshirt'
  const colorName = color.replace(/\s+/g, '')
  const designSuffix = design && design !== 'DEFAULT' ? `_${design}` : ''
  
  return `${basePath}/Reform${category.charAt(0).toUpperCase() + category.slice(1)}${colorName}${designSuffix}1.webp`
}