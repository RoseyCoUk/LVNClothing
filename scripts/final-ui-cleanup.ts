#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productPages = [
  'HoodiePage.tsx',
  'CapPage.tsx',
  'MousePadPage.tsx',
  'MugPage.tsx',
  'ToteBagPage.tsx',
  'WaterBottlePage.tsx'
];

productPages.forEach(fileName => {
  const filePath = path.join(__dirname, '../src/components/products', fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${fileName}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Remove Heart and Share2 from imports
  if (content.includes('Heart') || content.includes('Share2')) {
    // Handle multi-line imports
    content = content.replace(
      /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/s,
      (match, imports) => {
        const importList = imports
          .split(',')
          .map(i => i.trim())
          .filter(i => i && i !== 'Heart' && i !== 'Share2');
        
        return `import {\n  ${importList.join(',\n  ')}\n} from 'lucide-react'`;
      }
    );
    
    // Remove isWishlisted state
    content = content.replace(
      /const\s+\[isWishlisted,\s+setIsWishlisted\]\s*=\s*useState\([^)]+\);?\s*\n/g,
      ''
    );
    
    // Remove wishlist and share button container
    // This pattern matches the div containing both buttons
    content = content.replace(
      /<div className="flex space-x-3">[\s\S]*?<button[^>]*onClick=\{[^}]*setIsWishlisted[^}]*\}[^>]*>[\s\S]*?<\/button>[\s\S]*?<button[^>]*>[\s\S]*?<Share2[^>]*\/?>[\s\S]*?<\/button>[\s\S]*?<\/div>/g,
      ''
    );
    
    // Also remove if they appear in a different structure
    content = content.replace(
      /<button[^>]*onClick=\{[^}]*setIsWishlisted[^}]*\}[^>]*>[\s\S]*?<Heart[^>]*\/?>[\s\S]*?<\/button>/g,
      ''
    );
    
    content = content.replace(
      /<button[^>]*>[\s\S]*?<Share2[^>]*\/?>[\s\S]*?<\/button>/g,
      ''
    );
    
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Cleaned up ${fileName}`);
  } else {
    console.log(`⏭️  No changes needed for ${fileName}`);
  }
});

console.log('UI cleanup complete!');