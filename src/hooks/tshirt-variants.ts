// Correct T-shirt variants with unique Printful variant IDs (no XS, all unisex)
export const tshirtVariants: Array<{
  id: number;
  name: string;
  color: string;
  size: 'S' | 'M' | 'L' | 'XL' | '2XL';
  price: string;
  in_stock: boolean;
  printful_variant_id: number;
  color_code: string;
}> = [
  // Black variants - Unique variant IDs for each size
  { id: 101, name: "Black T-Shirt - S", color: "Black", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4016, color_code: "#000000" },
  { id: 102, name: "Black T-Shirt - M", color: "Black", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4017, color_code: "#000000" },
  { id: 103, name: "Black T-Shirt - L", color: "Black", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4018, color_code: "#000000" },
  { id: 104, name: "Black T-Shirt - XL", color: "Black", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4019, color_code: "#000000" },
  { id: 105, name: "Black T-Shirt - 2XL", color: "Black", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4020, color_code: "#000000" },

  // White variants
  { id: 106, name: "White T-Shirt - S", color: "White", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4021, color_code: "#FFFFFF" },
  { id: 107, name: "White T-Shirt - M", color: "White", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4022, color_code: "#FFFFFF" },
  { id: 108, name: "White T-Shirt - L", color: "White", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4023, color_code: "#FFFFFF" },
  { id: 109, name: "White T-Shirt - XL", color: "White", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4024, color_code: "#FFFFFF" },
  { id: 110, name: "White T-Shirt - 2XL", color: "White", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4025, color_code: "#FFFFFF" },

  // Navy variants
  { id: 111, name: "Navy T-Shirt - S", color: "Navy", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4026, color_code: "#1B365D" },
  { id: 112, name: "Navy T-Shirt - M", color: "Navy", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4027, color_code: "#1B365D" },
  { id: 113, name: "Navy T-Shirt - L", color: "Navy", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4028, color_code: "#1B365D" },
  { id: 114, name: "Navy T-Shirt - XL", color: "Navy", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4029, color_code: "#1B365D" },
  { id: 115, name: "Navy T-Shirt - 2XL", color: "Navy", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4030, color_code: "#1B365D" },

  // Red variants
  { id: 116, name: "Red T-Shirt - S", color: "Red", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4031, color_code: "#B31217" },
  { id: 117, name: "Red T-Shirt - M", color: "Red", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4032, color_code: "#B31217" },
  { id: 118, name: "Red T-Shirt - L", color: "Red", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4033, color_code: "#B31217" },
  { id: 119, name: "Red T-Shirt - XL", color: "Red", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4034, color_code: "#B31217" },
  { id: 120, name: "Red T-Shirt - 2XL", color: "Red", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4035, color_code: "#B31217" },

  // Charcoal variants
  { id: 121, name: "Charcoal T-Shirt - S", color: "Charcoal", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4036, color_code: "#333333" },
  { id: 122, name: "Charcoal T-Shirt - M", color: "Charcoal", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4037, color_code: "#333333" },
  { id: 123, name: "Charcoal T-Shirt - L", color: "Charcoal", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4038, color_code: "#333333" },
  { id: 124, name: "Charcoal T-Shirt - XL", color: "Charcoal", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4039, color_code: "#333333" },
  { id: 125, name: "Charcoal T-Shirt - 2XL", color: "Charcoal", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4040, color_code: "#333333" },

  // Light Grey variants
  { id: 126, name: "Light Grey T-Shirt - S", color: "Light Grey", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4041, color_code: "#E5E5E5" },
  { id: 127, name: "Light Grey T-Shirt - M", color: "Light Grey", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4042, color_code: "#E5E5E5" },
  { id: 128, name: "Light Grey T-Shirt - L", color: "Light Grey", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4043, color_code: "#E5E5E5" },
  { id: 129, name: "Light Grey T-Shirt - XL", color: "Light Grey", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4044, color_code: "#E5E5E5" },
  { id: 130, name: "Light Grey T-Shirt - 2XL", color: "Light Grey", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4045, color_code: "#E5E5E5" },

  // Ash Grey variants
  { id: 131, name: "Ash Grey T-Shirt - S", color: "Ash Grey", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4046, color_code: "#B0B0B0" },
  { id: 132, name: "Ash Grey T-Shirt - M", color: "Ash Grey", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4047, color_code: "#B0B0B0" },
  { id: 133, name: "Ash Grey T-Shirt - L", color: "Ash Grey", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4048, color_code: "#B0B0B0" },
  { id: 134, name: "Ash Grey T-Shirt - XL", color: "Ash Grey", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4049, color_code: "#B0B0B0" },
  { id: 135, name: "Ash Grey T-Shirt - 2XL", color: "Ash Grey", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4050, color_code: "#B0B0B0" },

  // Forest Green variants
  { id: 136, name: "Forest Green T-Shirt - S", color: "Forest Green", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4051, color_code: "#2D5016" },
  { id: 137, name: "Forest Green T-Shirt - M", color: "Forest Green", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4052, color_code: "#2D5016" },
  { id: 138, name: "Forest Green T-Shirt - L", color: "Forest Green", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4053, color_code: "#2D5016" },
  { id: 139, name: "Forest Green T-Shirt - XL", color: "Forest Green", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4054, color_code: "#2D5016" },
  { id: 140, name: "Forest Green T-Shirt - 2XL", color: "Forest Green", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4055, color_code: "#2D5016" },

  // Burgundy variants
  { id: 141, name: "Burgundy T-Shirt - S", color: "Burgundy", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4056, color_code: "#800020" },
  { id: 142, name: "Burgundy T-Shirt - M", color: "Burgundy", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4057, color_code: "#800020" },
  { id: 143, name: "Burgundy T-Shirt - L", color: "Burgundy", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4058, color_code: "#800020" },
  { id: 144, name: "Burgundy T-Shirt - XL", color: "Burgundy", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4059, color_code: "#800020" },
  { id: 145, name: "Burgundy T-Shirt - 2XL", color: "Burgundy", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4060, color_code: "#800020" },

  // Orange variants
  { id: 146, name: "Orange T-Shirt - S", color: "Orange", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4061, color_code: "#FF8C00" },
  { id: 147, name: "Orange T-Shirt - M", color: "Orange", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4062, color_code: "#FF8C00" },
  { id: 148, name: "Orange T-Shirt - L", color: "Orange", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4063, color_code: "#FF8C00" },
  { id: 149, name: "Orange T-Shirt - XL", color: "Orange", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4064, color_code: "#FF8C00" },
  { id: 150, name: "Orange T-Shirt - 2XL", color: "Orange", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4065, color_code: "#FF8C00" },

  // Yellow variants
  { id: 151, name: "Yellow T-Shirt - S", color: "Yellow", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4066, color_code: "#FFD667" },
  { id: 152, name: "Yellow T-Shirt - M", color: "Yellow", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4067, color_code: "#FFD667" },
  { id: 153, name: "Yellow T-Shirt - L", color: "Yellow", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4068, color_code: "#FFD667" },
  { id: 154, name: "Yellow T-Shirt - XL", color: "Yellow", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4069, color_code: "#FFD667" },
  { id: 155, name: "Yellow T-Shirt - 2XL", color: "Yellow", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4070, color_code: "#FFD667" },

  // Pink variants
  { id: 156, name: "Pink T-Shirt - S", color: "Pink", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4071, color_code: "#FDbfC7" },
  { id: 157, name: "Pink T-Shirt - M", color: "Pink", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4072, color_code: "#FDbfC7" },
  { id: 158, name: "Pink T-Shirt - L", color: "Pink", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4073, color_code: "#FDbfC7" },
  { id: 159, name: "Pink T-Shirt - XL", color: "Pink", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4074, color_code: "#FDbfC7" },
  { id: 160, name: "Pink T-Shirt - 2XL", color: "Pink", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4075, color_code: "#FDbfC7" },

  // Athletic Heather variants
  { id: 161, name: "Athletic Heather T-Shirt - S", color: "Athletic Heather", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4076, color_code: "#CECECC" },
  { id: 162, name: "Athletic Heather T-Shirt - M", color: "Athletic Heather", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4077, color_code: "#CECECC" },
  { id: 163, name: "Athletic Heather T-Shirt - L", color: "Athletic Heather", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4078, color_code: "#CECECC" },
  { id: 164, name: "Athletic Heather T-Shirt - XL", color: "Athletic Heather", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4079, color_code: "#CECECC" },
  { id: 165, name: "Athletic Heather T-Shirt - 2XL", color: "Athletic Heather", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4080, color_code: "#CECECC" },

  // Heather Dust variants
  { id: 166, name: "Heather Dust T-Shirt - S", color: "Heather Dust", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4081, color_code: "#E5D9C9" },
  { id: 167, name: "Heather Dust T-Shirt - M", color: "Heather Dust", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4082, color_code: "#E5D9C9" },
  { id: 168, name: "Heather Dust T-Shirt - L", color: "Heather Dust", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4083, color_code: "#E5D9C9" },
  { id: 169, name: "Heather Dust T-Shirt - XL", color: "Heather Dust", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4084, color_code: "#E5D9C9" },
  { id: 170, name: "Heather Dust T-Shirt - 2XL", color: "Heather Dust", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4085, color_code: "#E5D9C9" },

  // Ash variants
  { id: 171, name: "Ash T-Shirt - S", color: "Ash", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4086, color_code: "#F0F1EA" },
  { id: 172, name: "Ash T-Shirt - M", color: "Ash", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4087, color_code: "#F0F1EA" },
  { id: 173, name: "Ash T-Shirt - L", color: "Ash", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4088, color_code: "#F0F1EA" },
  { id: 174, name: "Ash T-Shirt - XL", color: "Ash", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4089, color_code: "#F0F1EA" },
  { id: 175, name: "Ash T-Shirt - 2XL", color: "Ash", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4090, color_code: "#F0F1EA" },

  // Mauve variants
  { id: 176, name: "Mauve T-Shirt - S", color: "Mauve", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4091, color_code: "#BF6E6E" },
  { id: 177, name: "Mauve T-Shirt - M", color: "Mauve", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4092, color_code: "#BF6E6E" },
  { id: 178, name: "Mauve T-Shirt - L", color: "Mauve", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4093, color_code: "#BF6E6E" },
  { id: 179, name: "Mauve T-Shirt - XL", color: "Mauve", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4094, color_code: "#BF6E6E" },
  { id: 180, name: "Mauve T-Shirt - 2XL", color: "Mauve", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4095, color_code: "#BF6E6E" },

  // Steel Blue variants
  { id: 181, name: "Steel Blue T-Shirt - S", color: "Steel Blue", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4096, color_code: "#668EA7" },
  { id: 182, name: "Steel Blue T-Shirt - M", color: "Steel Blue", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4097, color_code: "#668EA7" },
  { id: 183, name: "Steel Blue T-Shirt - L", color: "Steel Blue", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4098, color_code: "#668EA7" },
  { id: 184, name: "Steel Blue T-Shirt - XL", color: "Steel Blue", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4099, color_code: "#668EA7" },
  { id: 185, name: "Steel Blue T-Shirt - 2XL", color: "Steel Blue", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4100, color_code: "#668EA7" },

  // Mustard variants
  { id: 186, name: "Mustard T-Shirt - S", color: "Mustard", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4101, color_code: "#EDA027" },
  { id: 187, name: "Mustard T-Shirt - M", color: "Mustard", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4102, color_code: "#EDA027" },
  { id: 188, name: "Mustard T-Shirt - L", color: "Mustard", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4103, color_code: "#EDA027" },
  { id: 189, name: "Mustard T-Shirt - XL", color: "Mustard", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4104, color_code: "#EDA027" },
  { id: 190, name: "Mustard T-Shirt - 2XL", color: "Mustard", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4105, color_code: "#EDA027" },

  // Heather Deep Teal variants
  { id: 191, name: "Heather Deep Teal T-Shirt - S", color: "Heather Deep Teal", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4106, color_code: "#447085" },
  { id: 192, name: "Heather Deep Teal T-Shirt - M", color: "Heather Deep Teal", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4107, color_code: "#447085" },
  { id: 193, name: "Heather Deep Teal T-Shirt - L", color: "Heather Deep Teal", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4108, color_code: "#447085" },
  { id: 194, name: "Heather Deep Teal T-Shirt - XL", color: "Heather Deep Teal", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4109, color_code: "#447085" },
  { id: 195, name: "Heather Deep Teal T-Shirt - 2XL", color: "Heather Deep Teal", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4110, color_code: "#447085" },

  // Heather Prism Peach variants
  { id: 196, name: "Heather Prism Peach T-Shirt - S", color: "Heather Prism Peach", size: "S", price: "24.99", in_stock: true, printful_variant_id: 4111, color_code: "#F3C2B2" },
  { id: 197, name: "Heather Prism Peach T-Shirt - M", color: "Heather Prism Peach", size: "M", price: "24.99", in_stock: true, printful_variant_id: 4112, color_code: "#F3C2B2" },
  { id: 198, name: "Heather Prism Peach T-Shirt - L", color: "Heather Prism Peach", size: "L", price: "24.99", in_stock: true, printful_variant_id: 4113, color_code: "#F3C2B2" },
  { id: 199, name: "Heather Prism Peach T-Shirt - XL", color: "Heather Prism Peach", size: "XL", price: "24.99", in_stock: true, printful_variant_id: 4114, color_code: "#F3C2B2" },
  { id: 200, name: "Heather Prism Peach T-Shirt - 2XL", color: "Heather Prism Peach", size: "2XL", price: "26.99", in_stock: true, printful_variant_id: 4115, color_code: "#F3C2B2" }
];

// Total: 20 colors × 5 sizes = 100 variants
// Each variant has a unique printful_variant_id from 4016 to 4115
