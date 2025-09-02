#!/usr/bin/env node

/**
 * PR-02: Script to remove wishlist and share buttons from all product pages
 * This script will:
 * 1. Remove Heart and Share2 imports
 * 2. Remove isWishlisted state
 * 3. Remove wishlist and share button components
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const PRODUCTS_DIR = join(process.cwd(), 'src/components/products');

// Product files to update
const productFiles = [
  'TShirtPage.tsx',
  'HoodiePage.tsx',
  'CapPage.tsx',
  'ToteBagPage.tsx',
  'WaterBottlePage.tsx',
  'MugPage.tsx',
  'MousePadPage.tsx',
  'DynamicProductPage.tsx',
  'ActivistBundlePage.tsx',
  'ChampionBundlePage.tsx',
  'StarterBundlePage.tsx'
];

function removeWishlistShare(filePath: string) {
  console.log(`Processing: ${filePath}`);
  
  let content = readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // 1. Remove Heart and Share2 from imports
  content = content.replace(/,?\s*Heart\s*,?/g, '');
  content = content.replace(/,?\s*Share2\s*,?/g, '');
  
  // Clean up double commas that might result
  content = content.replace(/,\s*,/g, ',');
  content = content.replace(/{\s*,/g, '{');
  content = content.replace(/,\s*}/g, '}');
  
  // 2. Remove isWishlisted state
  content = content.replace(/const \[isWishlisted, setIsWishlisted\] = useState\(false\);?\n?\s*/g, '');
  
  // 3. Remove wishlist and share button section
  // This regex looks for the flex container with wishlist and share buttons
  const wishlistShareRegex = /<div className="flex space-x-3">[\s\S]*?<button[\s\S]*?(?:Heart|Wishlisted|Add to Wishlist)[\s\S]*?<\/button>[\s\S]*?<button[\s\S]*?Share2[\s\S]*?<\/button>[\s\S]*?<\/div>/g;
  
  content = content.replace(wishlistShareRegex, '');
  
  // Alternative patterns to catch variations
  // Remove individual wishlist button
  content = content.replace(/<button[\s\S]*?onClick=\{[^}]*setIsWishlisted[^}]*\}[\s\S]*?<\/button>/g, '');
  
  // Remove individual share button with Share2 icon
  content = content.replace(/<button[^>]*>[\s\S]*?<Share2[^>]*\/>[\s\S]*?<\/button>/g, '');
  
  if (content !== originalContent) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
  }
}

// Process all product files
console.log('🔧 PR-02: Removing wishlist and share buttons from product pages...\n');

for (const file of productFiles) {
  const filePath = join(PRODUCTS_DIR, file);
  try {
    removeWishlistShare(filePath);
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error);
  }
}

console.log('\n✨ Wishlist and share button removal complete!');