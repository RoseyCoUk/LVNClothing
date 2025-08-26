// Tote Bag variants with unique Printful variant IDs (one size fits all)
export const totebagVariants = [
  // Black Tote Bag - One Size
  { id: 401, name: "Black Tote Bag - One Size", color: "Black", size: 'One Size', price: "24.99", in_stock: true, printful_variant_id: 7000, color_code: "#000000" }
];

// Total: 1 color × 1 size = 1 variant
// Each variant has a unique printful_variant_id from 7000 to 7000

// Helper functions
export const getToteBagVariantsByColor = (color: string) => {
  return totebagVariants.filter(variant => variant.color === color);
};

export const getToteBagVariant = (color: string) => {
  return totebagVariants.find(variant => variant.color === color);
};

export const getToteBagColors = () => {
  return [...new Set(totebagVariants.map(variant => variant.color))];
};

export const getToteBagSizes = () => {
  return [...new Set(totebagVariants.map(variant => variant.size))];
};
