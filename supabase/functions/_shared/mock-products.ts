// Mock products based on the frontend usePrintfulProducts.ts
// This represents the exact 10 products we need in the database

export const mockProducts = [
  {
    id: 1,
    name: "Reform UK T-Shirt",
    description: "Premium cotton t-shirt with Reform UK branding",
    category: 'tshirt',
    variants: [], // Will be populated by loadVariantsForProduct function
    isUnisex: true,
    hasDarkLightVariants: true,
    image: "/tshirt/ReformTShirtBlack1.webp",
    brand: "Reform UK",
    model: "Premium Cotton",
    currency: "GBP",
    is_discontinued: false,
    avg_fulfillment_time: 4.5,
    origin_country: "UK"
  },
  {
    id: 2,
    name: "Reform UK Hoodie", 
    description: "Premium cotton hoodie with Reform UK branding",
    category: 'hoodie',
    variants: [], // Will be populated by loadVariantsForProduct function
    isUnisex: true,
    hasDarkLightVariants: true,
    image: "/hoodie/ReformHoodieBlack1.webp",
    brand: "Reform UK",
    model: "Premium Cotton",
    currency: "GBP",
    is_discontinued: false,
    avg_fulfillment_time: 4.5,
    origin_country: "UK"
  },
  {
    id: 3,
    name: "Reform UK Cap",
    description: "Adjustable cap with Reform UK logo",
    category: 'cap',
    variants: [
      {
        id: 301,
        name: "Black Cap - One Size",
        color: "Black",
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 6004,
        color_code: "#000000",
        image: "/Cap/ReformCapBlack1.webp"
      },
      {
        id: 302,
        name: "White Cap - One Size", 
        color: "White",
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 6000,
        color_code: "#ffffff",
        image: "/Cap/ReformCapWhite1.webp"
      },
      {
        id: 303,
        name: "Light Blue Cap - One Size",
        color: "Light Blue",
        size: "One Size", 
        price: "19.99",
        in_stock: true,
        printful_variant_id: 6001,
        color_code: "#a6b9c6",
        image: "/Cap/ReformCapBlue1.webp"
      },
      {
        id: 304,
        name: "Charcoal Cap - One Size",
        color: "Charcoal",
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 6002,
        color_code: "#393639",
        image: "/Cap/ReformCapCharcoal1.webp"
      },
      {
        id: 305,
        name: "Navy Cap - One Size",
        color: "Navy", 
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 6003,
        color_code: "#1c2330",
        image: "/Cap/ReformCapNavy1.webp"
      },
      {
        id: 306,
        name: "Red Cap - One Size",
        color: "Red",
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 6005,
        color_code: "#8e0a1f", 
        image: "/Cap/ReformCapRed1.webp"
      }
    ],
    isUnisex: true,
    hasDarkLightVariants: false,
    image: "/Cap/ReformCapBlack1.webp",
    brand: "Reform UK",
    model: "Adjustable Cap",
    currency: "GBP",
    is_discontinued: false,
    avg_fulfillment_time: 4.5,
    origin_country: "UK"
  },
  {
    id: 4,
    name: "Reform UK Mug",
    description: "Ceramic mug with Reform UK logo", 
    category: 'mug',
    variants: [
      {
        id: 401,
        name: "White Mug - One Size",
        color: "White",
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 10000,
        color_code: "#FFFFFF",
        image: "/MugMouse/ReformMug1.webp"
      }
    ],
    isUnisex: true,
    hasDarkLightVariants: false,
    image: "/MugMouse/ReformMug1.webp",
    brand: "Reform UK", 
    model: "Ceramic Mug",
    currency: "GBP",
    is_discontinued: false,
    avg_fulfillment_time: 4.5,
    origin_country: "UK"
  },
  {
    id: 5,
    name: "Reform UK Tote Bag",
    description: "Eco-friendly canvas tote bag with Reform UK branding",
    category: 'tote',
    variants: [
      {
        id: 501,
        name: "Black Tote Bag - One Size",
        color: "Black",
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 11000,
        color_code: "#000000",
        image: "/StickerToteWater/ReformToteBagBlack1.webp"
      },
      {
        id: 502,
        name: "Natural Tote Bag - One Size", 
        color: "Natural",
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 11001,
        color_code: "#F5F5DC",
        image: "/StickerToteWater/ReformToteBagNatural1.webp"
      }
    ],
    isUnisex: true,
    hasDarkLightVariants: false,
    image: "/StickerToteWater/ReformToteBagBlack1.webp",
    brand: "Reform UK",
    model: "Canvas Tote",
    currency: "GBP",
    is_discontinued: false,
    avg_fulfillment_time: 4.5,
    origin_country: "UK"
  },
  {
    id: 6,
    name: "Reform UK Water Bottle",
    description: "Stainless steel water bottle with Reform UK logo",
    category: 'water-bottle',
    variants: [
      {
        id: 601,
        name: "White Water Bottle - One Size",
        color: "White",
        size: "One Size", 
        price: "29.99",
        in_stock: true,
        printful_variant_id: 12000,
        color_code: "#FFFFFF",
        image: "/StickerToteWater/ReformWaterBottleWhite1.webp"
      },
      {
        id: 602,
        name: "Black Water Bottle - One Size",
        color: "Black",
        size: "One Size",
        price: "29.99",
        in_stock: true,
        printful_variant_id: 12001,
        color_code: "#000000",
        image: "/StickerToteWater/ReformWaterBottleBlack1.webp"
      }
    ],
    isUnisex: true,
    hasDarkLightVariants: false,
    image: "/StickerToteWater/ReformWaterBottleWhite1.webp",
    brand: "Reform UK",
    model: "Stainless Steel",
    currency: "GBP", 
    is_discontinued: false,
    avg_fulfillment_time: 4.5,
    origin_country: "UK"
  },
  {
    id: 7,
    name: "Reform UK Mouse Pad",
    description: "High-quality mouse pad with Reform UK branding",
    category: 'mouse-pad',
    variants: [
      {
        id: 701,
        name: "White Mouse Pad - One Size",
        color: "White",
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 13000,
        color_code: "#FFFFFF", 
        image: "/MugMouse/ReformMousePadWhite1.webp"
      },
      {
        id: 702,
        name: "Black Mouse Pad - One Size",
        color: "Black", 
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 13001,
        color_code: "#000000",
        image: "/MugMouse/ReformMousePadBlack1.webp"
      }
    ],
    isUnisex: true,
    hasDarkLightVariants: false,
    image: "/MugMouse/ReformMousePadWhite1.webp",
    brand: "Reform UK",
    model: "Premium Mouse Pad",
    currency: "GBP",
    is_discontinued: false,
    avg_fulfillment_time: 4.5,
    origin_country: "UK"
  }
]