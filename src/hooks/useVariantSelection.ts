import { useState, useCallback, useMemo } from 'react';
import type { PrintfulVariant } from '../types/printful';

export interface VariantSelection {
  color: string;
  size: string;
  variant: PrintfulVariant | null;
}

export interface UseVariantSelectionReturn {
  selection: VariantSelection;
  availableColors: string[];
  availableSizes: string[];
  selectedVariant: PrintfulVariant | null;
  setColor: (color: string) => void;
  setSize: (size: string) => void;
  isVariantAvailable: (color: string, size: string) => boolean;
  getVariantPrice: (color: string, size: string) => string | null;
  resetSelection: () => void;
}

export const useVariantSelection = (
  variants: PrintfulVariant[],
  initialColor?: string,
  initialSize?: string
): UseVariantSelectionReturn => {
  const [selection, setSelection] = useState<VariantSelection>({
    color: initialColor || '',
    size: initialSize || '',
    variant: null,
  });

  // Get unique available colors and sizes
  const availableColors = useMemo(() => {
    const colors = [...new Set(variants.map(v => v.color))];
    return colors.sort((a, b) => {
      // Sort dark colors first, then light colors
      const aIsDark = isDarkColor(a);
      const bIsDark = isDarkColor(b);
      if (aIsDark && !bIsDark) return -1;
      if (!aIsDark && bIsDark) return 1;
      return a.localeCompare(b);
    });
  }, [variants]);

  const availableSizes = useMemo(() => {
    const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
    return sizes.sort((a, b) => {
      const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
      return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
    });
  }, [variants]);

  // Find the currently selected variant
  const selectedVariant = useMemo(() => {
    if (!selection.color || !selection.size) return null;
    return variants.find(
      v => v.color === selection.color && v.size === selection.size
    ) || null;
  }, [variants, selection.color, selection.size]);

  // Update selection when selectedVariant changes
  useMemo(() => {
    setSelection(prev => ({
      ...prev,
      variant: selectedVariant,
    }));
  }, [selectedVariant]);

  // Set color and find best available size
  const setColor = useCallback((color: string) => {
    setSelection(prev => {
      // If current size is not available for new color, find best alternative
      let newSize = prev.size;
      if (prev.size && !isVariantAvailable(color, prev.size)) {
        newSize = availableSizes[0] || '';
      }
      
      return {
        color,
        size: newSize,
        variant: null, // Will be updated by useMemo
      };
    });
  }, [availableSizes]);

  // Set size
  const setSize = useCallback((size: string) => {
    setSelection(prev => ({
      ...prev,
      size,
      variant: null, // Will be updated by useMemo
    }));
  }, []);

  // Check if a specific color/size combination is available
  const isVariantAvailable = useCallback((color: string, size: string) => {
    return variants.some(v => v.color === color && v.size === size && v.in_stock);
  }, [variants]);

  // Get price for a specific color/size combination
  const getVariantPrice = useCallback((color: string, size: string) => {
    const variant = variants.find(v => v.color === color && v.size === size);
    return variant?.price || null;
  }, [variants]);

  // Reset selection to first available variant
  const resetSelection = useCallback(() => {
    if (availableColors.length > 0 && availableSizes.length > 0) {
      setSelection({
        color: availableColors[0],
        size: availableSizes[0],
        variant: null, // Will be updated by useMemo
      });
    }
  }, [availableColors, availableSizes]);

  // Initialize selection if not set
  useMemo(() => {
    if (!selection.color && availableColors.length > 0) {
      setColor(availableColors[0]);
    }
    if (!selection.size && availableSizes.length > 0) {
      setSize(availableSizes[0]);
    }
  }, [availableColors, availableSizes, selection.color, selection.size, setColor, setSize]);

  return {
    selection,
    availableColors,
    availableSizes,
    selectedVariant,
    setColor,
    setSize,
    isVariantAvailable,
    getVariantPrice,
    resetSelection,
  };
};

// Helper function to determine if a color is dark
const isDarkColor = (color: string): boolean => {
  const darkColors = ['black', 'charcoal', 'navy', 'dark', 'brown', 'burgundy'];
  return darkColors.some(darkColor => 
    color.toLowerCase().includes(darkColor)
  );
};
