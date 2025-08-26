// Mouse Pad variants with unique Printful variant IDs (one size fits all)
export const mousepadVariants = [
  // White Mouse Pad - One Size
  { id: 601, name: "White Mouse Pad - One Size", color: "White", size: 'One Size', price: "14.99", in_stock: true, printful_variant_id: 9000, color_code: "#ffffff" }
];

// Total: 1 color × 1 size = 1 variant
// Each variant has a unique printful_variant_id from 9000 to 9000

// Helper functions
export const getMousePadVariantsByColor = (color: string) => {
  return mousepadVariants.filter(variant => variant.color === color);
};

export const getMousePadVariant = (color: string) => {
  return mousepadVariants.find(variant => variant.color === color);
};

export const getMousePadColors = () => {
  return [...new Set(mousepadVariants.map(variant => variant.color))];
};

export const getMousePadSizes = () => {
  return [...new Set(mousepadVariants.map(variant => variant.size))];
};
