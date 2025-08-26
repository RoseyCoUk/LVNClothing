// Mug variants with unique Printful variant IDs (one size fits all)
export const mugVariants = [
  // White Mug - One Size
  { id: 701, name: "White Mug - One Size", color: "White", size: 'One Size', price: "9.99", in_stock: true, printful_variant_id: 10000, color_code: "#ffffff" }
];

// Total: 1 color × 1 size = 1 variant
// Each variant has a unique printful_variant_id from 10000 to 10000

// Helper functions
export const getMugVariantsByColor = (color: string) => {
  return mugVariants.filter(variant => variant.color === color);
};

export const getMugVariant = (color: string) => {
  return mugVariants.find(variant => variant.color === color);
};

export const getMugColors = () => {
  return [...new Set(mugVariants.map(variant => variant.color))];
};

export const getMugSizes = () => {
  return [...new Set(mugVariants.map(variant => variant.size))];
};
