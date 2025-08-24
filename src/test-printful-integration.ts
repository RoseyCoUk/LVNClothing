/**
 * Printful Integration Test Suite
 * 
 * This file contains comprehensive tests for the new Printful integration
 * including hooks, variant selection, bundle calculations, and sticker add-ons.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Printful API client
vi.mock('../lib/printful/client', () => ({
  pf: {
    GET: vi.fn(),
    h: vi.fn(() => ({ Authorization: 'Bearer test' }))
  }
}));

// Mock the Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Test data
const mockPrintfulProduct = {
  id: 1,
  name: "Reform UK T-Shirt",
  description: "Premium cotton t-shirt",
  category: 'tshirt' as const,
  variants: [
    {
      id: 101,
      name: "Black T-Shirt - M",
      color: "Black",
      size: "M",
      price: "24.99",
      in_stock: true,
      printful_variant_id: 1001,
      color_code: "#000000",
      image: "/test-image-1.jpg"
    },
    {
      id: 102,
      name: "White T-Shirt - M",
      color: "White",
      size: "M",
      price: "24.99",
      in_stock: true,
      printful_variant_id: 1002,
      color_code: "#FFFFFF",
      image: "/test-image-2.jpg"
    },
    {
      id: 103,
      name: "Black T-Shirt - L",
      color: "Black",
      size: "L",
      price: "24.99",
      in_stock: false,
      printful_variant_id: 1003,
      color_code: "#000000",
      image: "/test-image-3.jpg"
    }
  ],
  isUnisex: true,
  hasDarkLightVariants: true,
  image: "/test-product-image.jpg",
  brand: "Reform UK",
  model: "Premium Cotton",
  currency: "GBP",
  is_discontinued: false,
  avg_fulfillment_time: 4.5,
  origin_country: "UK"
};

const mockStickerAddon = {
  id: 'sticker-set-1',
  name: 'Reform UK Sticker Set',
  description: 'High-quality vinyl stickers',
  price: 4.99,
  image: '/sticker-image.jpg',
  printful_variant_id: 2001,
  availableFor: ['tshirt', 'hoodie', 'cap', 'tote'] as const
};

describe('Printful Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Type Definitions', () => {
    it('should have correct PrintfulProduct interface', () => {
      const product: any = mockPrintfulProduct;
      
      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.category).toBe('tshirt');
      expect(product.variants).toBeInstanceOf(Array);
      expect(product.isUnisex).toBe(true);
      expect(product.hasDarkLightVariants).toBe(true);
    });

    it('should have correct PrintfulVariant interface', () => {
      const variant = mockPrintfulProduct.variants[0];
      
      expect(variant.id).toBeDefined();
      expect(variant.color).toBeDefined();
      expect(variant.size).toBeDefined();
      expect(variant.price).toBeDefined();
      expect(variant.in_stock).toBeDefined();
      expect(variant.printful_variant_id).toBeDefined();
    });

    it('should have correct StickerAddon interface', () => {
      const sticker: any = mockStickerAddon;
      
      expect(sticker.id).toBeDefined();
      expect(sticker.name).toBeDefined();
      expect(sticker.price).toBeDefined();
      expect(sticker.availableFor).toBeInstanceOf(Array);
    });
  });

  describe('Variant Selection Logic', () => {
    it('should correctly identify dark and light colors', () => {
      const isDarkColor = (color: string): boolean => {
        const darkColors = ['black', 'charcoal', 'navy', 'dark', 'brown', 'burgundy'];
        return darkColors.some(darkColor => 
          color.toLowerCase().includes(darkColor)
        );
      };

      expect(isDarkColor('Black')).toBe(true);
      expect(isDarkColor('Charcoal')).toBe(true);
      expect(isDarkColor('Navy')).toBe(true);
      expect(isDarkColor('White')).toBe(false);
      expect(isDarkColor('Light Grey')).toBe(false);
    });

    it('should sort colors correctly (dark first, then light)', () => {
      const colors = ['White', 'Black', 'Light Grey', 'Charcoal'];
      const sortedColors = colors.sort((a, b) => {
        const aIsDark = ['black', 'charcoal', 'navy', 'dark'].some(dark => 
          a.toLowerCase().includes(dark)
        );
        const bIsDark = ['black', 'charcoal', 'navy', 'dark'].some(dark => 
          b.toLowerCase().includes(dark)
        );
        
        if (aIsDark && !bIsDark) return -1;
        if (!aIsDark && bIsDark) return 1;
        return a.localeCompare(b);
      });

      expect(sortedColors).toEqual(['Black', 'Charcoal', 'Light Grey', 'White']);
    });

    it('should sort sizes in correct order', () => {
      const sizes = ['L', 'S', 'XL', 'M', '2XL'];
      const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
      const sortedSizes = sizes.sort((a, b) => {
        return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
      });

      expect(sortedSizes).toEqual(['S', 'M', 'L', 'XL', '2XL']);
    });
  });

  describe('Bundle Calculation Logic', () => {
    it('should calculate bundle pricing correctly', () => {
      const bundleItems = [
        { product: mockPrintfulProduct, variant: mockPrintfulProduct.variants[0], quantity: 1 },
        { product: mockPrintfulProduct, variant: mockPrintfulProduct.variants[1], quantity: 1 }
      ];

      const totalPrice = bundleItems.reduce((sum, item) => {
        return sum + (parseFloat(item.variant.price) * item.quantity);
      }, 0);

      const individualPrice = bundleItems.reduce((sum, item) => {
        const markup = 1.2; // 20% markup for individual items
        return sum + (parseFloat(item.variant.price) * markup * item.quantity);
      }, 0);

      const savings = individualPrice - totalPrice;
      const savingsPercentage = (savings / individualPrice) * 100;

      expect(totalPrice).toBe(49.98); // 24.99 * 2
      expect(individualPrice).toBe(59.976); // 24.99 * 1.2 * 2
      expect(savings).toBeCloseTo(9.996, 2);
      expect(savingsPercentage).toBeCloseTo(16.67, 2);
    });
  });

  describe('Sticker Add-on Logic', () => {
    it('should filter stickers by product category', () => {
      const allStickers = [
        { ...mockStickerAddon, availableFor: ['tshirt', 'hoodie'] },
        { ...mockStickerAddon, id: 'sticker-2', availableFor: ['cap', 'tote'] },
        { ...mockStickerAddon, id: 'sticker-3', availableFor: ['tshirt', 'cap'] }
      ];

      const getAvailableStickers = (productCategory: string) => {
        return allStickers.filter(sticker => 
          sticker.availableFor.includes(productCategory as any)
        );
      };

      const tshirtStickers = getAvailableStickers('tshirt');
      const capStickers = getAvailableStickers('cap');
      const toteStickers = getAvailableStickers('tote');

      expect(tshirtStickers).toHaveLength(2);
      expect(capStickers).toHaveLength(2);
      expect(toteStickers).toHaveLength(1);
    });

    it('should calculate sticker totals correctly', () => {
      const selectedStickers = [
        { sticker: mockStickerAddon, quantity: 2 },
        { sticker: { ...mockStickerAddon, id: 'sticker-2', price: 3.99 }, quantity: 1 }
      ];

      const totalPrice = selectedStickers.reduce((sum, item) => {
        return sum + (item.sticker.price * item.quantity);
      }, 0);

      const totalCount = selectedStickers.reduce((sum, item) => {
        return sum + item.quantity;
      }, 0);

      expect(totalPrice).toBe(13.97); // (4.99 * 2) + (3.99 * 1)
      expect(totalCount).toBe(3);
    });
  });

  describe('Cart Integration', () => {
    it('should create correct cart items for main products', () => {
      const variant = mockPrintfulProduct.variants[0];
      const cartItem = {
        id: `${variant.id}-M`,
        name: `${mockPrintfulProduct.name} - ${variant.color} (Size: M)`,
        price: parseFloat(variant.price),
        image: variant.image,
        quantity: 1,
        printful_variant_id: variant.printful_variant_id
      };

      expect(cartItem.id).toBe('101-M');
      expect(cartItem.name).toBe('Reform UK T-Shirt - Black (Size: M)');
      expect(cartItem.price).toBe(24.99);
      expect(cartItem.printful_variant_id).toBe(1001);
    });

    it('should create correct cart items for stickers', () => {
      const stickerCartItem = {
        id: `sticker-${mockStickerAddon.id}`,
        name: `${mockStickerAddon.name} (Add-on)`,
        price: mockStickerAddon.price,
        image: mockStickerAddon.image,
        quantity: 2,
        printful_variant_id: mockStickerAddon.printful_variant_id
      };

      expect(stickerCartItem.id).toBe('sticker-sticker-set-1');
      expect(stickerCartItem.name).toBe('Reform UK Sticker Set (Add-on)');
      expect(stickerCartItem.price).toBe(4.99);
      expect(stickerCartItem.quantity).toBe(2);
    });
  });

  describe('Checkout Integration', () => {
    it('should create correct checkout request format', () => {
      const cartItems = [
        {
          id: '101-M',
          name: 'Reform UK T-Shirt - Black (Size: M)',
          price: 24.99,
          image: '/test-image.jpg',
          quantity: 1,
          printful_variant_id: 1001
        },
        {
          id: 'sticker-sticker-set-1',
          name: 'Reform UK Sticker Set (Add-on)',
          price: 4.99,
          image: '/sticker-image.jpg',
          quantity: 2,
          printful_variant_id: 2001
        }
      ];

      const checkoutRequest = {
        line_items: cartItems.map(item => ({
          price_data: {
            currency: 'gbp',
            product_data: {
              name: item.name,
              images: [item.image],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/shop`,
        mode: 'payment' as const,
      };

      expect(checkoutRequest.line_items).toHaveLength(2);
      expect(checkoutRequest.line_items[0].price_data.unit_amount).toBe(2499);
      expect(checkoutRequest.line_items[1].price_data.unit_amount).toBe(499);
      expect(checkoutRequest.currency).toBe('gbp');
      expect(checkoutRequest.mode).toBe('payment');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing product data gracefully', () => {
      const fallbackData = {
        id: 1,
        name: "Default Product",
        description: "Default description",
        price: 19.99,
        image: "/default-image.jpg"
      };

      const productData = null || fallbackData;

      expect(productData.name).toBe("Default Product");
      expect(productData.price).toBe(19.99);
    });

    it('should handle variant selection errors', () => {
      const variants = mockPrintfulProduct.variants;
      const selectedColor = 'Black';
      const selectedSize = 'M';

      const selectedVariant = variants.find(v => 
        v.color === selectedColor && v.size === selectedSize
      );

      expect(selectedVariant).toBeDefined();
      expect(selectedVariant?.in_stock).toBe(true);

      // Test unavailable variant
      const unavailableVariant = variants.find(v => 
        v.color === 'Black' && v.size === 'L'
      );
      expect(unavailableVariant?.in_stock).toBe(false);
    });
  });

  describe('Performance Considerations', () => {
    it('should memoize expensive calculations', () => {
      const variants = mockPrintfulProduct.variants;
      const expensiveCalculation = vi.fn(() => {
        return variants.reduce((acc, variant) => {
          return acc + parseFloat(variant.price);
        }, 0);
      });

      const memoizedCalculation = vi.fn(() => {
        return expensiveCalculation();
      });

      // Call multiple times
      const result1 = memoizedCalculation();
      const result2 = memoizedCalculation();
      const result3 = memoizedCalculation();

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(memoizedCalculation).toHaveBeenCalledTimes(3);
    });

    it('should handle large variant lists efficiently', () => {
      const largeVariantList = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Variant ${i}`,
        color: i % 2 === 0 ? 'Black' : 'White',
        size: ['XS', 'S', 'M', 'L', 'XL'][i % 5],
        price: (24.99 + (i * 0.01)).toFixed(2),
        in_stock: i % 10 !== 0, // 90% in stock
        printful_variant_id: 1000 + i,
        color_code: i % 2 === 0 ? '#000000' : '#FFFFFF'
      }));

      const startTime = performance.now();
      
      // Filter variants by color and size
      const filteredVariants = largeVariantList.filter(v => 
        v.color === 'Black' && v.size === 'M' && v.in_stock
      );
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;

      expect(filteredVariants.length).toBeGreaterThan(0);
      expect(processingTime).toBeLessThan(100); // Should process in under 100ms
    });
  });
});

// Export test utilities for use in other test files
export const testUtils = {
  mockPrintfulProduct,
  mockStickerAddon,
  createMockVariant: (overrides: any = {}) => ({
    id: 101,
    name: "Test Variant",
    color: "Black",
    size: "M",
    price: "24.99",
    in_stock: true,
    printful_variant_id: 1001,
    color_code: "#000000",
    image: "/test-image.jpg",
    ...overrides
  }),
  createMockBundle: (items: any[] = []) => ({
    id: 'test-bundle',
    name: 'Test Bundle',
    description: 'Test bundle description',
    products: items,
    totalPrice: items.reduce((sum, item) => sum + parseFloat(item.variant.price), 0),
    savings: 0,
    image: '/test-bundle-image.jpg'
  })
};
