// Water Bottle variants with unique Printful variant IDs (one size fits all)
export const waterbottleVariants = [
  // White Water Bottle - One Size
  { id: 501, name: "White Water Bottle - One Size", color: "White", size: 'One Size', price: "24.99", in_stock: true, printful_variant_id: 8000, color_code: "#ffffff" }
];

// Total: 1 color × 1 size = 1 variant
// Each variant has a unique printful_variant_id from 8000 to 8000

// Helper functions
export const getWaterBottleVariantsByColor = (color: string) => {
  return waterbottleVariants.filter(variant => variant.color === color);
};

export const getWaterBottleVariant = (color: string) => {
  return waterbottleVariants.find(variant => variant.color === color);
};

export const getWaterBottleColors = () => {
  return [...new Set(waterbottleVariants.map(variant => variant.color))];
};

export const getWaterBottleSizes = () => {
  return [...new Set(waterbottleVariants.map(variant => variant.size))];
};
