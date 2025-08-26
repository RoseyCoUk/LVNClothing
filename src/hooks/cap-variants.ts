// Cap variants with unique Printful variant IDs (one size fits most)
export const capVariants = [
  // White Cap - One Size
  { id: 301, name: "White Cap - One Size", color: "White", size: "One Size", price: "19.99", in_stock: true, printful_variant_id: 6000, color_code: "#ffffff" },
  
  // Light Blue Cap - One Size
  { id: 302, name: "Light Blue Cap - One Size", color: "Light Blue", size: "One Size", price: "19.99", in_stock: true, printful_variant_id: 6001, color_code: "#a6b9c6" },
  
  // Charcoal Cap - One Size
  { id: 303, name: "Charcoal Cap - One Size", color: "Charcoal", size: "One Size", price: "19.99", in_stock: true, printful_variant_id: 6002, color_code: "#393639" },
  
  // Navy Cap - One Size
  { id: 304, name: "Navy Cap - One Size", color: "Navy", size: "One Size", price: "19.99", in_stock: true, printful_variant_id: 6003, color_code: "#1c2330" },
  
  // Black Cap - One Size
  { id: 305, name: "Black Cap - One Size", color: "Black", size: "One Size", price: "19.99", in_stock: true, printful_variant_id: 6004, color_code: "#000000" },
  
  // Red Cap - One Size
  { id: 306, name: "Red Cap - One Size", color: "Red", size: "One Size", price: "19.99", in_stock: true, printful_variant_id: 6005, color_code: "#8e0a1f" }
];

// Total: 6 colors × 1 size = 6 variants
// Each variant has a unique printful_variant_id from 6000 to 6005

// Helper functions
export const getCapVariantsByColor = (color: string) => {
  return capVariants.filter(variant => variant.color === color);
};

export const getCapVariant = (color: string) => {
  return capVariants.find(variant => variant.color === color);
};

export const getCapColors = () => {
  return [...new Set(capVariants.map(variant => variant.color))];
};

export const getCapSizes = () => {
  return [...new Set(capVariants.map(variant => variant.size))];
};
