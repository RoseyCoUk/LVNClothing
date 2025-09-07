import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TshirtVariants } from '../hooks/tshirt-variants-merged-fixed';
import { HoodieVariants } from '../hooks/hoodie-variants-merged-fixed';
import { CapVariants, findCapVariantByColor } from '../hooks/cap-variants';
import { MugVariants } from '../hooks/mug-variants';
import { TotebagVariants } from '../hooks/totebag-variants';
import { WaterbottleVariants } from '../hooks/waterbottle-variants';
import { MousepadVariants } from '../hooks/mousepad-variants';

export default function VariantTestPage() {
  const [selectedProduct, setSelectedProduct] = useState('tshirt');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [shippingQuote, setShippingQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
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
      colors: [...new Set(TshirtVariants.map(v => v.color))],
      sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
      findVariant: (size: string, color: string) => {
        const adjustedSize = size === 'XXL' ? '2XL' : size;
        return findTshirtVariant(adjustedSize, color);
      }
    },
    hoodie: { 
      name: 'Hoodie', 
      variants: HoodieVariants,
      colors: [...new Set(HoodieVariants.map(v => v.color))],
      sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
      findVariant: (size: string, color: string) => {
        const adjustedSize = size === 'XXL' ? '2XL' : size;
        return findHoodieVariant(adjustedSize, color);
      }
    },
    cap: { 
      name: 'Cap', 
      variants: CapVariants,
      colors: [...new Set(CapVariants.map(v => v.color))],
      sizes: ['One Size'],
      findVariant: (_size: string, color: string) => findCapVariantByColor(color)
    },
    mug: { 
      name: 'Mug', 
      variants: MugVariants,
      colors: [...new Set(MugVariants.map(v => v.color))],
      sizes: ['11 oz'],
      findVariant: (_size: string, color: string) => MugVariants.find(v => v.color === color)
    },
    totebag: { 
      name: 'Tote Bag', 
      variants: TotebagVariants,
      colors: [...new Set(TotebagVariants.map(v => v.color || 'Natural'))],
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

  const testShippingQuote = async () => {
    const variant = getCurrentVariant();
    if (!variant) {
      console.error('No variant found');
      return;
    }

    setLoading(true);
    setShippingQuote(null);

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out after 10 seconds')), 10000)
    );

    try {
      console.log('Testing shipping for variant:', variant);
      const variantId = variant.catalogVariantId || variant.externalId;
      
      const fetchPromise = supabase.functions.invoke('shipping-quotes', {
        body: {
          recipient: {
            name: 'Test User',
            address1: '123 Test St',
            city: 'London',
            country_code: 'GB',
            zip: 'SW1A 1AA'
          },
          items: [{
            printful_variant_id: variantId,
            quantity: 1
          }]
        }
      });

      // Race between the actual request and the timeout
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      console.log('Shipping quote response:', data, error);
      
      if (error) {
        throw new Error(error.message || 'Failed to get shipping quote');
      }
      
      setShippingQuote(data || { error: 'No data returned' });
    } catch (error: any) {
      console.error('Shipping quote error:', error);
      setShippingQuote({ error: error.message || 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const variant = getCurrentVariant();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-red-600">
          🔍 Variant ID Diagnostic Tool
        </h1>
        
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-8">
          <p className="text-yellow-800 font-semibold">
            ⚠️ This is a TEST PAGE for debugging variant IDs. Do not use for production!
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
                <label className="block text-sm font-medium mb-2">Color</label>
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

              <button
                onClick={testShippingQuote}
                disabled={!variant || loading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Shipping Quote'}
              </button>
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
                      <span className="font-medium">Selected:</span>
                      <span>{selectedColor} / {selectedSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Actual Size in Data:</span>
                      <span className="font-mono">{variant.size}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h3 className="font-semibold text-blue-800 mb-2">🆔 Variant IDs</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Catalog Variant ID:</span>
                      <div className="font-mono bg-white p-2 rounded mt-1 break-all">
                        {variant.catalogVariantId || 'NOT SET ❌'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Sync/External ID:</span>
                      <div className="font-mono bg-white p-2 rounded mt-1 break-all">
                        {variant.externalId || 'NOT SET ❌'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">SKU:</span>
                      <div className="font-mono bg-white p-2 rounded mt-1">
                        {variant.sku || 'NOT SET'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Price:</span>
                      <div className="font-mono bg-white p-2 rounded mt-1">
                        £{variant.price || '0.00'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <h3 className="font-semibold text-purple-800 mb-2">📦 What Gets Sent to Printful</h3>
                  
                  <div className="bg-white p-3 rounded font-mono text-xs overflow-x-auto">
                    <pre>{JSON.stringify({
                      printful_variant_id: variant.catalogVariantId || variant.externalId,
                      quantity: 1,
                      sku: variant.sku
                    }, null, 2)}</pre>
                  </div>
                </div>

                {shippingQuote && (
                  <div className={`border rounded p-3 ${shippingQuote.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <h3 className={`font-semibold mb-2 ${shippingQuote.error ? 'text-red-800' : 'text-green-800'}`}>
                      🚚 Shipping Quote Test
                    </h3>
                    
                    {shippingQuote.error ? (
                      <div className="text-red-600 text-sm">{shippingQuote.error}</div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        {shippingQuote.options?.map((option: any, idx: number) => (
                          <div key={idx} className="flex justify-between">
                            <span>{option.name}</span>
                            <span className="font-bold">£{option.rate}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <h3 className="font-semibold text-red-800">❌ No Variant Found</h3>
                <p className="text-sm text-red-600 mt-2">
                  No variant exists for {selectedColor} / {selectedSize}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* All Variants Table */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">All {currentProduct?.name} Variants ({currentProduct?.variants.length} total)</h2>
          
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Color</th>
                  <th className="px-4 py-2 text-left">Size</th>
                  <th className="px-4 py-2 text-left">Catalog ID</th>
                  <th className="px-4 py-2 text-left">Sync ID</th>
                  <th className="px-4 py-2 text-left">SKU</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentProduct?.variants.map((v: any, idx: number) => (
                  <tr key={idx} className={`border-b hover:bg-gray-50 ${!v.catalogVariantId ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-2">{v.color}</td>
                    <td className="px-4 py-2">{v.size}</td>
                    <td className="px-4 py-2 font-mono text-xs">
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
          </div>
        </div>
      </div>
    </div>
  );
}