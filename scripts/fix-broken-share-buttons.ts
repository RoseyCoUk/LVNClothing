#!/usr/bin/env node

/**
 * PR-02: Script to fix broken share button remnants
 */

import { readFileSync, writeFileSync } from 'fs';
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
  'DynamicProductPage.tsx'
];

function fixBrokenShareButtons(filePath: string) {
  console.log(`Processing: ${filePath}`);
  
  let content = readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Pattern to remove broken share button remnants
  // This matches the button with the broken className tag
  const brokenButtonPattern = /<button className="border-2 border-gray-300[^>]*>\s*<className="w-4 h-4" \/>\s*<\/button>/g;
  
  content = content.replace(brokenButtonPattern, '');
  
  // Also clean up any remaining <className= tags
  content = content.replace(/<className="[^"]*" \/>/g, '');
  
  // Clean up empty divs that might be left behind
  content = content.replace(/<div className="flex space-x-3">\s*<\/div>/g, '');
  
  if (content !== originalContent) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  No broken buttons found: ${filePath}`);
    return false;
  }
}

// Process all product files
console.log('🔧 PR-02: Fixing broken share button remnants...\n');

let fixedCount = 0;
for (const file of productFiles) {
  const filePath = join(PRODUCTS_DIR, file);
  try {
    if (fixBrokenShareButtons(filePath)) {
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error);
  }
}

console.log(`\n✨ Fixed ${fixedCount} files with broken share buttons.`);