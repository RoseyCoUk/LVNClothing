/**
 * Color utility functions for sorting and manipulating colors
 */

interface ColorOption {
  name: string;
  hex: string;
  border?: boolean;
}

/**
 * Convert hex color to RGB values
 * @param hex - Hex color string (e.g., "#FF0000" or "FF0000")
 * @returns RGB values as object {r, g, b}
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle 3-character hex codes
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  if (hex.length !== 6) {
    return null;
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Calculate the luminance of a color using the relative luminance formula
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Luminance value (0-1, where 0 is black and 1 is white)
 */
export function calculateLuminance(r: number, g: number, b: number): number {
  // Convert RGB to linear RGB
  const toLinear = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928 
      ? normalized / 12.92 
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };
  
  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);
  
  // Calculate relative luminance using ITU-R BT.709 coefficients
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate brightness using a simpler perceived brightness formula
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Brightness value (0-255, where 0 is darkest and 255 is brightest)
 */
export function calculateBrightness(r: number, g: number, b: number): number {
  // Using the perceived brightness formula: 0.299*R + 0.587*G + 0.114*B
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}

/**
 * Get brightness value from hex color
 * @param hex - Hex color string
 * @returns Brightness value (0-255) or 0 if invalid
 */
export function getBrightnessFromHex(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  return calculateBrightness(rgb.r, rgb.g, rgb.b);
}

/**
 * Sort color options from darkest to lightest
 * @param colors - Array of color options
 * @returns Sorted array of color options (darkest to lightest)
 */
export function sortColorsByBrightness(colors: ColorOption[]): ColorOption[] {
  return [...colors].sort((a, b) => {
    const brightnessA = getBrightnessFromHex(a.hex);
    const brightnessB = getBrightnessFromHex(b.hex);
    return brightnessA - brightnessB; // Sort ascending (dark to light)
  });
}

/**
 * Determine if a color is light (needs dark text/icons)
 * @param hex - Hex color string
 * @returns True if the color is light, false if dark
 */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  
  const brightness = calculateBrightness(rgb.r, rgb.g, rgb.b);
  return brightness > 128; // Threshold for light vs dark
}