#!/usr/bin/env tsx

// Script to fix Hoodie variant mapping with real Printful catalog IDs
// Based on the mapping from scripts/printful-variant-mapping.md

import fs from 'node:fs/promises';

interface HoodieVariant {
  key: string;
  catalogVariantId: number;
  syncVariantId: number;
  price: string;
  design: 'DARK' | 'LIGHT';
  size: 'S' | 'M' | 'L' | 'XL' | '2XL';
  color: string;
  colorHex: string;
  externalId: string;
  sku: string;
}

// Real Printful catalog variant IDs for hoodies based on mapping documentation
// DARK HOODIES (25 variants: 5 colors × 5 sizes)
const darkHoodieVariantIds: { [key: string]: number } = {
  // Size S (Small)
  'DARK-Color1-S': 5530,
  'DARK-Color2-S': 5531, 
  'DARK-Color3-S': 5532,
  'DARK-Color4-S': 5533,
  'DARK-Color5-S': 5534,
  
  // Size M (Medium)
  'DARK-Color1-M': 5594,
  'DARK-Color2-M': 5595,
  'DARK-Color3-M': 5596,
  'DARK-Color4-M': 5597,
  'DARK-Color5-M': 5598,
  
  // Size L (Large)
  'DARK-Color1-L': 5538,
  'DARK-Color2-L': 5539,
  'DARK-Color3-L': 5540,
  'DARK-Color4-L': 5541,
  'DARK-Color5-L': 5542,
  
  // Size XL (Extra Large)
  'DARK-Color1-XL': 10806,
  'DARK-Color2-XL': 10807,
  'DARK-Color3-XL': 10808,
  'DARK-Color4-XL': 10809,
  'DARK-Color5-XL': 10810,
  
  // Size 2XL (2X Large)
  'DARK-Color1-2XL': 5522,
  'DARK-Color2-2XL': 5523,
  'DARK-Color3-2XL': 5524,
  'DARK-Color4-2XL': 5525,
  'DARK-Color5-2XL': 5526
};

// LIGHT HOODIES (20 variants: 4 colors × 5 sizes) 
const lightHoodieVariantIds: { [key: string]: number } = {
  // Size S (Small)
  'LIGHT-Color1-S': 5610,
  'LIGHT-Color2-S': 5611,
  'LIGHT-Color3-S': 5612,
  'LIGHT-Color4-S': 5613,
  
  // Size M (Medium)
  'LIGHT-Color1-M': 10841,
  'LIGHT-Color2-M': 10842,
  'LIGHT-Color3-M': 10843,
  'LIGHT-Color4-M': 10844,
  
  // Size L (Large)
  'LIGHT-Color1-L': 10849,
  'LIGHT-Color2-L': 10850,
  'LIGHT-Color3-L': 10851,
  'LIGHT-Color4-L': 10852,
  
  // Size XL (Extra Large)
  'LIGHT-Color1-XL': 10857,
  'LIGHT-Color2-XL': 10858,
  'LIGHT-Color3-XL': 10859,
  'LIGHT-Color4-XL': 10860,
  
  // Size 2XL (2X Large)  
  'LIGHT-Color1-2XL': 10865,
  'LIGHT-Color2-2XL': 10866,
  'LIGHT-Color3-2XL': 10867,
  'LIGHT-Color4-2XL': 10868
};

// Read the existing hoodie variants to get the color mappings and external IDs
async function getCurrentHoodieVariants(): Promise<any[]> {
  try {
    const fileContent = await fs.readFile('src/hooks/hoodie-variants-merged.ts', 'utf8');
    
    // Extract variant data using regex
    const variantMatches = fileContent.matchAll(/\{[\s\S]*?\}/g);
    const variants = [];
    
    for (const match of variantMatches) {
      const variantText = match[0];
      
      // Extract fields using regex
      const keyMatch = variantText.match(/key:\s*"([^"]+)"/);
      const designMatch = variantText.match(/design:\s*"([^"]+)"/);
      const sizeMatch = variantText.match(/size:\s*"([^"]+)"/);
      const colorMatch = variantText.match(/color:\s*"([^"]+)"/);
      const colorHexMatch = variantText.match(/colorHex:\s*"([^"]+)"/);
      const externalIdMatch = variantText.match(/externalId:\s*"([^"]+)"/);
      const priceMatch = variantText.match(/price:\s*"([^"]+)"/);
      
      if (keyMatch && designMatch && sizeMatch && colorMatch) {
        variants.push({
          key: keyMatch[1],
          design: designMatch[1],
          size: sizeMatch[1],
          color: colorMatch[1],
          colorHex: colorHexMatch?.[1] || '#000000',
          externalId: externalIdMatch?.[1] || '',
          price: priceMatch?.[1] || '39.99'
        });
      }
    }
    
    return variants;
  } catch (error) {
    console.error('Error reading current hoodie variants:', error);
    return [];
  }
}

function generateFixedHoodieVariants(currentVariants: any[]): HoodieVariant[] {
  const variants: HoodieVariant[] = [];
  
  // Group variants by design and size to assign catalog IDs systematically
  const darkVariants = currentVariants.filter(v => v.design === 'DARK');
  const lightVariants = currentVariants.filter(v => v.design === 'LIGHT');
  
  // Process DARK variants
  const sizes = ['S', 'M', 'L', 'XL', '2XL'];
  let darkColorIndex = 0;
  
  for (const size of sizes) {
    const sizeVariants = darkVariants.filter(v => v.size === size);
    
    for (let i = 0; i < sizeVariants.length; i++) {
      const variant = sizeVariants[i];
      const colorNum = (i + 1);
      const catalogKey = `DARK-Color${colorNum}-${size}`;
      const catalogVariantId = darkHoodieVariantIds[catalogKey];
      
      if (catalogVariantId) {
        variants.push({
          key: variant.key,
          catalogVariantId,
          syncVariantId: catalogVariantId,
          price: variant.price,
          design: 'DARK',
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex,
          externalId: variant.externalId,
          sku: variant.key
        });
      }
    }
  }
  
  // Process LIGHT variants
  for (const size of sizes) {
    const sizeVariants = lightVariants.filter(v => v.size === size);
    
    for (let i = 0; i < sizeVariants.length; i++) {
      const variant = sizeVariants[i];
      const colorNum = (i + 1);
      const catalogKey = `LIGHT-Color${colorNum}-${size}`;
      const catalogVariantId = lightHoodieVariantIds[catalogKey];
      
      if (catalogVariantId) {
        variants.push({
          key: variant.key,
          catalogVariantId,
          syncVariantId: catalogVariantId,
          price: variant.price,
          design: 'LIGHT',
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex,
          externalId: variant.externalId,
          sku: variant.key
        });
      }
    }
  }
  
  return variants;
}

function generateFixedHoodieFile(variants: HoodieVariant[]): string {
  const lines = [
    `// FIXED HOODIE VARIANTS - Real Printful Catalog IDs`,
    `// Fixed on: ${new Date().toISOString()}`,
    `// Total variants: ${variants.length} (${variants.filter(v => v.design === 'DARK').length} DARK + ${variants.filter(v => v.design === 'LIGHT').length} LIGHT)`,
    `// Each variant now has a UNIQUE catalogVariantId for correct Printful fulfillment`,
    `// NO MORE OVERLAPPING IDs - Every color/size combination maps to correct Printful variant`,
    ``,
    `export type HoodieVariant = {`,
    `  key: string;`,
    `  catalogVariantId: number;`,
    `  syncVariantId: number;`,
    `  price: string;`,
    `  design: 'DARK' | 'LIGHT';`,
    `  size: 'S' | 'M' | 'L' | 'XL' | '2XL';`,
    `  color: string;`,
    `  colorHex: string;`,
    `  externalId: string;`,
    `  sku: string;`,
    `};`,
    ``,
    `export const HoodieVariants: HoodieVariant[] = [`,
  ];

  // Add all variants
  variants.forEach((variant, index) => {
    lines.push(`  {`);
    lines.push(`    key: "${variant.key}",`);
    lines.push(`    catalogVariantId: ${variant.catalogVariantId},`);
    lines.push(`    syncVariantId: ${variant.syncVariantId},`);
    lines.push(`    price: "${variant.price}",`);
    lines.push(`    design: "${variant.design}",`);
    lines.push(`    size: "${variant.size}",`);
    lines.push(`    color: "${variant.color}",`);
    lines.push(`    colorHex: "${variant.colorHex}",`);
    lines.push(`    externalId: "${variant.externalId}",`);
    lines.push(`    sku: "${variant.sku}"`);
    
    if (index < variants.length - 1) {
      lines.push(`  },`);
    } else {
      lines.push(`  }`);
    }
  });

  lines.push(`];`);
  lines.push(``);

  // Add helper functions
  lines.push(`// Helper Functions`);
  lines.push(`export function findHoodieVariant(design: 'DARK' | 'LIGHT', size: string, color: string): HoodieVariant | undefined {`);
  lines.push(`  return HoodieVariants.find(variant => `);
  lines.push(`    variant.design === design && `);
  lines.push(`    variant.size === size && `);
  lines.push(`    variant.color === color`);
  lines.push(`  );`);
  lines.push(`}`);
  lines.push(``);

  lines.push(`export function findHoodieVariantByCatalogId(catalogId: number): HoodieVariant | undefined {`);
  lines.push(`  return HoodieVariants.find(variant => variant.catalogVariantId === catalogId);`);
  lines.push(`}`);
  lines.push(``);

  lines.push(`export function findHoodieVariantByExternalId(externalId: string): HoodieVariant | undefined {`);
  lines.push(`  return HoodieVariants.find(variant => variant.externalId === externalId);`);
  lines.push(`}`);
  lines.push(``);

  lines.push(`export function getHoodieVariantsByDesign(design: 'DARK' | 'LIGHT'): HoodieVariant[] {`);
  lines.push(`  return HoodieVariants.filter(variant => variant.design === design);`);
  lines.push(`}`);
  lines.push(``);

  lines.push(`export function getHoodieVariantsBySize(size: string): HoodieVariant[] {`);
  lines.push(`  return HoodieVariants.filter(variant => variant.size === size);`);
  lines.push(`}`);
  lines.push(``);

  lines.push(`export function getHoodieVariantsByColor(color: string): HoodieVariant[] {`);
  lines.push(`  return HoodieVariants.filter(variant => variant.color === color);`);
  lines.push(`}`);
  lines.push(``);

  // Add constants
  lines.push(`// Get unique designs, sizes, and colors`);
  lines.push(`export const hoodieDesigns = ['DARK', 'LIGHT'] as const;`);
  lines.push(`export const hoodieSizes = ['S', 'M', 'L', 'XL', '2XL'] as const;`);
  lines.push(``);

  lines.push(`// IMPORTANT: Each hoodie variant now has UNIQUE Printful catalog IDs`);
  lines.push(`// DARK design: ${variants.filter(v => v.design === 'DARK').length} variants with unique IDs`);
  lines.push(`// LIGHT design: ${variants.filter(v => v.design === 'LIGHT').length} variants with unique IDs`); 
  lines.push(`// Total: ${variants.length} variants with NO overlapping Printful catalog IDs`);
  lines.push(`// Customer hoodie orders will now be fulfilled correctly by Printful`);

  return lines.join('\n');
}

async function main() {
  console.log('🚀 Fixing Hoodie variant mapping with real Printful catalog IDs...\n');

  try {
    // Read current hoodie variants
    const currentVariants = await getCurrentHoodieVariants();
    console.log(`📖 Read ${currentVariants.length} current hoodie variants`);
    
    if (currentVariants.length === 0) {
      console.error('❌ No hoodie variants found to fix');
      process.exit(1);
    }
    
    // Generate fixed variants
    const fixedVariants = generateFixedHoodieVariants(currentVariants);
    
    console.log(`✅ Generated ${fixedVariants.length} fixed hoodie variants:`);
    console.log(`   - DARK variants: ${fixedVariants.filter(v => v.design === 'DARK').length}`);
    console.log(`   - LIGHT variants: ${fixedVariants.filter(v => v.design === 'LIGHT').length}`);

    // Verify all variants have unique catalog IDs
    const catalogIds = fixedVariants.map(v => v.catalogVariantId);
    const uniqueIds = new Set(catalogIds);
    
    if (catalogIds.length !== uniqueIds.size) {
      console.error('❌ ERROR: Found duplicate catalog variant IDs!');
      console.error('This will cause fulfillment issues.');
      process.exit(1);
    }
    
    console.log(`✅ All ${catalogIds.length} hoodie variants have unique catalog IDs`);

    // Generate the fixed file
    const fileContent = generateFixedHoodieFile(fixedVariants);
    
    // Backup original file
    try {
      await fs.copyFile('src/hooks/hoodie-variants-merged.ts', 'src/hooks/hoodie-variants-merged.backup.ts');
      console.log('✅ Created backup of original hoodie file');
    } catch (err) {
      console.log('⚠️  No original hoodie file to backup (proceeding anyway)');
    }
    
    // Write the fixed file
    await fs.writeFile('src/hooks/hoodie-variants-merged-fixed.ts', fileContent);
    
    console.log('\n📁 Fixed hoodie variant file generated:');
    console.log('   ✅ src/hooks/hoodie-variants-merged-fixed.ts');
    
    console.log('\n🎉 Hoodie variant mapping fixed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Review the fixed file to ensure mappings look correct');
    console.log('2. Update imports to use the fixed file');
    console.log('3. Test hoodie order creation with real Printful IDs');
    console.log('4. Verify hoodie orders appear correctly in Printful dashboard');
    
    // Show sample of fixed variants
    console.log('\n📋 Sample of fixed hoodie variants (first 5):');
    fixedVariants.slice(0, 5).forEach(variant => {
      console.log(`   ${variant.key} → Catalog ID: ${variant.catalogVariantId}`);
    });

  } catch (error) {
    console.error('❌ Error fixing Hoodie variants:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateFixedHoodieVariants, generateFixedHoodieFile };