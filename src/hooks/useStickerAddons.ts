import { useState, useCallback, useMemo } from 'react';
import type { StickerAddon } from '../types/printful';

export interface StickerSelection {
  sticker: StickerAddon;
  quantity: number;
}

export interface UseStickerAddonsReturn {
  selectedStickers: StickerSelection[];
  addSticker: (sticker: StickerAddon, quantity?: number) => void;
  removeSticker: (stickerId: string) => void;
  updateStickerQuantity: (stickerId: string, quantity: number) => void;
  clearStickers: () => void;
  getStickerQuantity: (stickerId: string) => number;
  getTotalStickerPrice: () => number;
  getTotalStickerCount: () => number;
  isStickerSelected: (stickerId: string) => boolean;
}

export const useStickerAddons = (initialStickers: StickerSelection[] = []) => {
  const [selectedStickers, setSelectedStickers] = useState<StickerSelection[]>(initialStickers);

  const addSticker = useCallback((sticker: StickerAddon, quantity: number = 1) => {
    setSelectedStickers(prev => {
      const existing = prev.find(s => s.sticker.id === sticker.id);
      if (existing) {
        return prev.map(s =>
          s.sticker.id === sticker.id
            ? { ...s, quantity: s.quantity + quantity }
            : s
        );
      } else {
        return [...prev, { sticker, quantity }];
      }
    });
  }, []);

  const removeSticker = useCallback((stickerId: string) => {
    setSelectedStickers(prev => prev.filter(s => s.sticker.id !== stickerId));
  }, []);

  const updateStickerQuantity = useCallback((stickerId: string, quantity: number) => {
    if (quantity <= 0) {
      removeSticker(stickerId);
      return;
    }

    setSelectedStickers(prev =>
      prev.map(s =>
        s.sticker.id === stickerId
          ? { ...s, quantity }
          : s
      )
    );
  }, [removeSticker]);

  const clearStickers = useCallback(() => {
    setSelectedStickers([]);
  }, []);

  const getStickerQuantity = useCallback((stickerId: string) => {
    const selected = selectedStickers.find(s => s.sticker.id === stickerId);
    return selected ? selected.quantity : 0;
  }, [selectedStickers]);

  const getTotalStickerPrice = useCallback(() => {
    return selectedStickers.reduce((total, item) => {
      return total + (item.sticker.price * item.quantity);
    }, 0);
  }, [selectedStickers]);

  const getTotalStickerCount = useCallback(() => {
    return selectedStickers.reduce((total, item) => total + item.quantity, 0);
  }, [selectedStickers]);

  const isStickerSelected = useCallback((stickerId: string) => {
    return selectedStickers.some(s => s.sticker.id === stickerId);
  }, [selectedStickers]);

  // Memoized values
  const totalPrice = useMemo(() => getTotalStickerPrice(), [getTotalStickerPrice]);
  const totalCount = useMemo(() => getTotalStickerCount(), [getTotalStickerCount]);

  return {
    selectedStickers,
    addSticker,
    removeSticker,
    updateStickerQuantity,
    clearStickers,
    getStickerQuantity,
    getTotalStickerPrice: () => totalPrice,
    getTotalStickerCount: () => totalCount,
    isStickerSelected,
  };
};

// Helper function to get available stickers for a specific product category
export const getAvailableStickers = (productCategory: string): StickerAddon[] => {
  const allStickers: StickerAddon[] = [
    {
      id: 'sticker-set-1',
      name: 'LVN Clothing Sticker Set',
      description: 'High-quality vinyl stickers featuring LVN Clothing branding',
      price: 4.99,
      image: '/StickerToteWater/ReformStickersMain1.webp',
      printful_variant_id: 1001,
      availableFor: ['tshirt', 'hoodie', 'cap', 'tote']
    },
    {
      id: 'sticker-set-2',
      name: 'Activist Sticker Pack',
      description: 'Additional stickers for maximum impact',
      price: 3.99,
      image: '/StickerToteWater/ReformStickersMain2.webp',
      printful_variant_id: 1002,
      availableFor: ['tshirt', 'hoodie', 'cap', 'tote']
    },
    {
      id: 'sticker-set-3',
      name: 'Premium Vinyl Stickers',
      description: 'Weather-resistant stickers for outdoor use',
      price: 5.99,
      image: '/StickerToteWater/ReformStickersMain3.webp',
      printful_variant_id: 1003,
      availableFor: ['tshirt', 'hoodie', 'cap', 'tote']
    },
    {
      id: 'sticker-set-4',
      name: 'Mini Sticker Collection',
      description: 'Small stickers for laptops, phones, and accessories',
      price: 2.99,
      image: '/StickerToteWater/ReformStickersMain4.webp',
      printful_variant_id: 1004,
      availableFor: ['tshirt', 'hoodie', 'cap', 'tote']
    }
  ];

  return allStickers.filter(sticker => 
    sticker.availableFor.includes(productCategory as any)
  );
};

// Helper function to create sticker cart items
export const createStickerCartItems = (selectedStickers: StickerSelection[]) => {
  return selectedStickers.map(item => ({
    id: `sticker-${item.sticker.id}`,
    name: `${item.sticker.name} (Add-on)`,
    price: item.sticker.price,
    image: item.sticker.image,
    quantity: item.quantity,
    printful_variant_id: item.sticker.printful_variant_id
  }));
};
