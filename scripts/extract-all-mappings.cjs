#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function extractMappings(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /catalogVariantId:\s*(\d+),[\s\S]*?syncVariantId:\s*(\d+)/g;
  let match;
  const mappings = {};
  while ((match = regex.exec(content)) !== null) {
    mappings[match[2]] = match[1];
  }
  return mappings;
}

// Extract from all variant files
const files = [
  'src/hooks/tshirt-variants.ts',
  'src/hooks/hoodie-variants.ts',
  'src/hooks/cap-variants.ts',
  'src/hooks/mug-variants.ts',
  'src/hooks/totebag-variants.ts',
  'src/hooks/waterbottle-variants.ts',
  'src/hooks/mousepad-variants.ts'
];

const allMappings = {};

files.forEach(file => {
  try {
    const mappings = extractMappings(file);
    Object.assign(allMappings, mappings);
    console.log(`✓ Extracted ${Object.keys(mappings).length} mappings from ${file}`);
  } catch (err) {
    console.log(`✗ Skipped ${file}: ${err.message}`);
  }
});

console.log(`\n📊 Total mappings: ${Object.keys(allMappings).length}`);

// Generate the TypeScript code
console.log('\n// Add this to the shipping-quotes edge function:');
console.log('const SYNC_TO_CATALOG_MAPPINGS: Record<string, number> = {');
Object.entries(allMappings).forEach(([sync, catalog]) => {
  console.log(`  "${sync}": ${catalog},`);
});
console.log('};');

// Save to file
fs.writeFileSync('variant-mappings.json', JSON.stringify(allMappings, null, 2));
console.log('\n✅ Mappings saved to variant-mappings.json');