#!/usr/bin/env node

/**
 * PR-02: Script to improve product page tab styling
 * This script will:
 * 1. Update tab styling to be more modern and polished
 * 2. Add better hover states and transitions
 * 3. Improve active state visibility
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

function improveTabStyling(filePath: string) {
  console.log(`Processing: ${filePath}`);
  
  let content = readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Old tab styling pattern
  const oldTabStyle = `py-4 px-1 border-b-2 font-medium text-sm transition-colors`;
  const oldActiveStyle = `activeTab === tab 
                        ? 'border-[#009fe3] text-[#009fe3]' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'`;
  
  // New improved tab styling
  const newTabStyle = `py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200 relative`;
  const newActiveStyle = `activeTab === tab 
                        ? 'border-[#009fe3] text-[#009fe3] bg-blue-50/50' 
                        : 'border-transparent text-gray-600 hover:text-[#009fe3] hover:bg-gray-50'`;
  
  // Replace tab button className
  content = content.replace(
    /className=\{`py-4 px-1 border-b-2 font-medium text-sm transition-colors \$\{[\s\S]*?\}`\}/g,
    `className={\`${newTabStyle} \${
                      ${newActiveStyle}
                    }\`}`
  );
  
  // Also update the nav container to have better spacing
  content = content.replace(
    /<nav className="flex space-x-8">/g,
    '<nav className="flex space-x-2">'
  );
  
  // Update border styling for better visual hierarchy
  content = content.replace(
    /<div className="border-b border-gray-200">/g,
    '<div className="border-b-2 border-gray-100">'
  );
  
  if (content !== originalContent) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
    return false;
  }
}

// Process all product files
console.log('🔧 PR-02: Improving tab styling on product pages...\n');

let updatedCount = 0;
for (const file of productFiles) {
  const filePath = join(PRODUCTS_DIR, file);
  try {
    if (improveTabStyling(filePath)) {
      updatedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error);
  }
}

console.log(`\n✨ Tab styling improvement complete! Updated ${updatedCount} files.`);