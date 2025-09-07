import React, { useState, useEffect } from 'react';
import { TshirtVariants } from '../hooks/tshirt-variants-merged-fixed';
import { HoodieVariants } from '../hooks/hoodie-variants-merged-fixed';
import { CapVariants, findCapVariantByColor } from '../hooks/cap-variants';
import { MugVariants } from '../hooks/mug-variants';
import { TotebagVariants } from '../hooks/totebag-variants';
import { WaterbottleVariants } from '../hooks/waterbottle-variants';
import { MousepadVariants } from '../hooks/mousepad-variants';

export default function VariantTestPageSimple() {
  const [selectedProduct, setSelectedProduct] = useState('hoodie');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [showAllVariants, setShowAllVariants] = useState(false);
  
  // Helper functions to find variants
  const findTshirtVariant = (size: string, color: string) => {
    return TshirtVariants.find(v => v.size === size && v.color === color);
  };
  
  const findHoodieVariant = (size: string, color: string) => {
    return HoodieVariants.find(v => v.size === size && v.color === color);
  };

  const products = {
    tshirt: { 
      name: 'T-Shirt', 
      variants: TshirtVariants,
      colors: [...new Set(TshirtVariants.map(v => v.color))].sort(),
      sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
      findVariant: (size: string, color: string) => {
        const adjustedSize = size === 'XXL' ? '2XL' : size;
        const variant = findTshirtVariant(adjustedSize, color);
        console.log(`Looking for T-shirt: ${color} / ${adjustedSize}`, variant);
        return variant;
      }
    },
    hoodie: { 
      name: 'Hoodie', 
      variants: HoodieVariants,
      colors: [...new Set(HoodieVariants.map(v => v.color))].sort(),
      sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
      findVariant: (size: string, color: string) => {
        const adjustedSize = size === 'XXL' ? '2XL' : size;
        const variant = findHoodieVariant(adjustedSize, color);
        console.log(`Looking for Hoodie: ${color} / ${adjustedSize}`, variant);
        return variant;
      }
    },
    cap: { 
      name: 'Cap', 
      variants: CapVariants,
      colors: [...new Set(CapVariants.map(v => v.color))].sort(),
      sizes: ['One Size'],
      findVariant: (_size: string, color: string) => {
        const variant = findCapVariantByColor(color);
        console.log(`Looking for Cap: ${color}`, variant);
        return variant;
      }
    },
    mug: { 
      name: 'Mug', 
      variants: MugVariants,
      colors: [...new Set(MugVariants.map(v => v.color))].sort(),
      sizes: ['11 oz'],
      findVariant: (_size: string, color: string) => {
        const variant = MugVariants.find(v => v.color === color);
        console.log(`Looking for Mug: ${color}`, variant);
        return variant;
      }
    },
    totebag: { 
      name: 'Tote Bag', 
      variants: TotebagVariants,
      colors: [...new Set(TotebagVariants.map(v => v.color || 'Natural'))].sort(),
      sizes: ['One Size'],
      findVariant: () => TotebagVariants[0]
    },
    waterbottle: { 
      name: 'Water Bottle', 
      variants: WaterbottleVariants,
      colors: ['White'],
      sizes: ['One Size'],
      findVariant: () => WaterbottleVariants[0]
    },
    mousepad: { 
      name: 'Mouse Pad', 
      variants: MousepadVariants,
      colors: ['White'],
      sizes: ['One Size'],
      findVariant: () => MousepadVariants[0]
    }
  };

  const currentProduct = products[selectedProduct as keyof typeof products];

  useEffect(() => {
    if (currentProduct) {
      setSelectedColor(currentProduct.colors[0] || '');
      setSelectedSize(currentProduct.sizes[0] || '');
    }
  }, [selectedProduct]);

  const getCurrentVariant = () => {
    if (!currentProduct || !selectedSize || !selectedColor) return null;
    return currentProduct.findVariant(selectedSize, selectedColor);
  };

  const testPrintfulShipping = async (variantId: string | number) => {
    const testUrl = `https://api.printful.com/shipping/rates`;
    const testPayload = {
      recipient: {
        name: 'Test User',
        address1: '123 Test St',
        city: 'London',
        country_code: 'GB',
        zip: 'SW1A 1AA'
      },
      items: [{
        variant_id: variantId,
        quantity: 1
      }]
    };
    
    console.log('Direct Printful test with variant ID:', variantId);
    console.log('Test payload:', testPayload);
    
    alert(`To test shipping directly:\n\n1. Use Postman or curl\n2. POST to: ${testUrl}\n3. Headers: Authorization: Bearer YOUR_PRINTFUL_TOKEN\n4. Body: ${JSON.stringify(testPayload, null, 2)}`);
  };

  const variant = getCurrentVariant();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-red-600">
          🔍 Simple Variant ID Diagnostic Tool
        </h1>
        
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-8">
          <p className="text-yellow-800 font-semibold">
            ⚠️ Simplified test page - Check console for debug logs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Select Product & Variant</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Type</label>
                <select 
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {Object.entries(products).map(([key, product]) => (
                    <option key={key} value={key}>{product.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Color ({currentProduct?.colors.length} options)
                </label>
                <select 
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {currentProduct?.colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Size</label>
                <select 
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {currentProduct?.sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              {variant && (
                <button
                  onClick={() => testPrintfulShipping(variant.catalogVariantId || variant.externalId)}
                  className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
                >
                  📋 Copy Test Info for Manual Testing
                </button>
              )}
            </div>
          </div>

          {/* Variant Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Variant Information</h2>
            
            {variant ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Variant Found</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Product:</span>
                      <span>{currentProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">UI Selection:</span>
                      <span>{selectedColor} / {selectedSize}</span>
                    </div>
                    <div className="flex justify-between bg-yellow-50 p-1 rounded">
                      <span className="font-medium">Data Size:</span>
                      <span className="font-mono font-bold">{variant.size}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h3 className="font-semibold text-blue-800 mb-2">🆔 Critical IDs for Printful</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border-2 border-blue-400">
                      <div className="text-xs text-gray-600">Catalog Variant ID (Use this for shipping):</div>
                      <div className="font-mono text-2xl font-bold text-blue-600">
                        {variant.catalogVariantId || 'NOT SET ❌'}
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded">
                      <div className="text-xs text-gray-600">Sync/External ID:</div>
                      <div className="font-mono text-sm break-all">
                        {variant.externalId || 'NOT SET ❌'}
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded">
                      <div className="text-xs text-gray-600">SKU:</div>
                      <div className="font-mono">
                        {variant.sku || 'NOT SET'}
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded">
                      <div className="text-xs text-gray-600">Price:</div>
                      <div className="font-mono text-lg font-bold">
                        £{variant.price || '0.00'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <h3 className="font-semibold text-purple-800 mb-2">🚀 What Gets Sent to Printful</h3>
                  
                  <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                    <pre>{JSON.stringify({
                      shipping_quote_request: {
                        printful_variant_id: variant.catalogVariantId || variant.externalId,
                        quantity: 1
                      },
                      expected_shipping: "£4.99 for hoodies, £3.29 for t-shirts"
                    }, null, 2)}</pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <h3 className="font-semibold text-red-800">❌ No Variant Found</h3>
                <p className="text-sm text-red-600 mt-2">
                  No variant exists for {selectedColor} / {selectedSize}
                </p>
                <p className="text-xs text-red-500 mt-2">
                  Note: XXL sizes are stored as "2XL" in the data
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Variant Analysis */}
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">📊 Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div>Total {currentProduct?.name} Variants: <span className="font-bold">{currentProduct?.variants.length}</span></div>
              <div>With Catalog ID: <span className="font-bold text-green-600">
                {currentProduct?.variants.filter(v => v.catalogVariantId).length}
              </span></div>
              <div>Missing Catalog ID: <span className="font-bold text-red-600">
                {currentProduct?.variants.filter(v => !v.catalogVariantId).length}
              </span></div>
              <div>Unique Colors: <span className="font-bold">{currentProduct?.colors.length}</span></div>
              <div>Unique Sizes: <span className="font-bold">{currentProduct?.sizes.length}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">🔍 Common Issues</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start">
                <span className="text-yellow-500 mr-2">⚠️</span>
                <span>XXL in UI maps to "2XL" in variant data</span>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-500 mr-2">⚠️</span>
                <span>Catalog ID must be used for shipping quotes</span>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-500 mr-2">⚠️</span>
                <span>Hoodies should cost £4.99 shipping</span>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-500 mr-2">⚠️</span>
                <span>T-shirts should cost £3.29 shipping</span>
              </div>
            </div>
          </div>
        </div>

        {/* All Variants Table */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              All {currentProduct?.name} Variants ({currentProduct?.variants.length} total)
            </h2>
            <button
              onClick={() => setShowAllVariants(!showAllVariants)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {showAllVariants ? 'Show Less' : 'Show All'}
            </button>
          </div>
          
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Color</th>
                  <th className="px-4 py-2 text-left">Size</th>
                  <th className="px-4 py-2 text-left bg-blue-100">Catalog ID</th>
                  <th className="px-4 py-2 text-left">Sync ID</th>
                  <th className="px-4 py-2 text-left">SKU</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {(showAllVariants ? currentProduct?.variants : currentProduct?.variants.slice(0, 10))?.map((v: any, idx: number) => (
                  <tr 
                    key={idx} 
                    className={`border-b hover:bg-gray-50 ${!v.catalogVariantId ? 'bg-red-50' : ''} ${
                      v.color === selectedColor && v.size === (selectedSize === 'XXL' ? '2XL' : selectedSize) ? 'bg-blue-100 font-bold' : ''
                    }`}
                  >
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{v.color}</td>
                    <td className="px-4 py-2">
                      {v.size}
                      {v.size === '2XL' && <span className="text-xs text-gray-500 ml-1">(XXL)</span>}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs bg-blue-50 font-bold">
                      {v.catalogVariantId || <span className="text-red-600 font-bold">MISSING ❌</span>}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs" title={v.externalId}>
                      {v.externalId ? `${v.externalId.substring(0, 10)}...` : '❌'}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">{v.sku || '-'}</td>
                    <td className="px-4 py-2">£{v.price || '0.00'}</td>
                    <td className="px-4 py-2">
                      {v.catalogVariantId ? 
                        <span className="text-green-600">✅</span> : 
                        <span className="text-red-600 font-bold">⚠️</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!showAllVariants && currentProduct?.variants.length > 10 && (
              <div className="text-center py-2 text-sm text-gray-500">
                Showing 10 of {currentProduct.variants.length} variants
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}