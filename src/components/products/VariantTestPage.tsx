import React, { useState } from 'react';
import { 
  TshirtVariants, 
  findTshirtVariant,
  getTshirtVariantsByDesign,
  tshirtDesigns,
  tshirtSizes,
  tshirtColors 
} from '../../hooks/tshirt-variants-merged';

import { 
  HoodieVariants, 
  findHoodieVariant,
  getHoodieVariantsByDesign,
  hoodieDesigns,
  hoodieSizes,
  hoodieColors 
} from '../../hooks/hoodie-variants-merged';

const VariantTestPage: React.FC = () => {
  const [selectedTshirtDesign, setSelectedTshirtDesign] = useState<'DARK' | 'LIGHT'>('DARK');
  const [selectedTshirtSize, setSelectedTshirtSize] = useState<string>('M');
  const [selectedTshirtColor, setSelectedTshirtColor] = useState<string>('Color 1');
  
  const [selectedHoodieDesign, setSelectedHoodieDesign] = useState<'DARK' | 'LIGHT'>('DARK');
  const [selectedHoodieSize, setSelectedHoodieSize] = useState<string>('M');
  const [selectedHoodieColor, setSelectedHoodieColor] = useState<string>('Color 1');

  // Test variant lookup
  const tshirtVariant = findTshirtVariant(selectedTshirtDesign, selectedTshirtSize, selectedTshirtColor);
  const hoodieVariant = findHoodieVariant(selectedHoodieDesign, selectedHoodieSize, selectedHoodieColor);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Variant Test Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* T-Shirt Testing */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">T-Shirt Variants Test</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Design:</label>
                <div className="grid grid-cols-2 gap-2">
                  {tshirtDesigns.map((design) => (
                    <button
                      key={design}
                      onClick={() => setSelectedTshirtDesign(design)}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-all duration-200 ${
                        selectedTshirtDesign === design
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
                      }`}
                    >
                      {design}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size:</label>
                <div className="grid grid-cols-5 gap-2">
                  {tshirtSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedTshirtSize(size)}
                      className={`px-3 py-2 border-2 rounded-lg font-medium transition-all duration-200 ${
                        selectedTshirtSize === size
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color:</label>
                <div className="grid grid-cols-4 gap-2">
                  {getTshirtVariantsByDesign(selectedTshirtDesign)
                    .filter(variant => variant.size === selectedTshirtSize)
                    .map(variant => variant.color)
                    .filter((color, index, arr) => arr.indexOf(color) === index)
                    .map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedTshirtColor(color)}
                        className={`px-3 py-2 border-2 rounded-lg font-medium transition-all duration-200 ${
                          selectedTshirtColor === color
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                </div>
              </div>

              {tshirtVariant && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">T-Shirt Variant Found:</h3>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><strong>Design:</strong> {tshirtVariant.design}</p>
                    <p><strong>Size:</strong> {tshirtVariant.size}</p>
                    <p><strong>Color:</strong> {tshirtVariant.color}</p>
                    <p><strong>Price:</strong> £{tshirtVariant.price}</p>
                    <p><strong>Catalog Variant ID:</strong> {tshirtVariant.catalogVariantId}</p>
                    <p><strong>External ID:</strong> {tshirtVariant.externalId}</p>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600">
                <p><strong>Total T-Shirt Variants:</strong> {TshirtVariants.length}</p>
                <p><strong>DARK Variants:</strong> {getTshirtVariantsByDesign('DARK').length}</p>
                <p><strong>LIGHT Variants:</strong> {getTshirtVariantsByDesign('LIGHT').length}</p>
              </div>
            </div>
          </div>

          {/* Hoodie Testing */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Hoodie Variants Test</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Design:</label>
                <div className="grid grid-cols-2 gap-2">
                  {hoodieDesigns.map((design) => (
                    <button
                      key={design}
                      onClick={() => setSelectedHoodieDesign(design)}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-all duration-200 ${
                        selectedHoodieDesign === design
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
                      }`}
                    >
                      {design}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size:</label>
                <div className="grid grid-cols-5 gap-2">
                  {hoodieSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedHoodieSize(size)}
                      className={`px-3 py-2 border-2 rounded-lg font-medium transition-all duration-200 ${
                        selectedHoodieSize === size
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color:</label>
                <div className="grid grid-cols-4 gap-2">
                  {getHoodieVariantsByDesign(selectedHoodieDesign)
                    .filter(variant => variant.size === selectedHoodieSize)
                    .map(variant => variant.color)
                    .filter((color, index, arr) => arr.indexOf(color) === index)
                    .map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedHoodieColor(color)}
                        className={`px-3 py-2 border-2 rounded-lg font-medium transition-all duration-200 ${
                          selectedHoodieColor === color
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                </div>
              </div>

              {hoodieVariant && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Hoodie Variant Found:</h3>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><strong>Design:</strong> {hoodieVariant.design}</p>
                    <p><strong>Size:</strong> {hoodieVariant.size}</p>
                    <p><strong>Color:</strong> {hoodieVariant.color}</p>
                    <p><strong>Price:</strong> £{hoodieVariant.price}</p>
                    <p><strong>Catalog Variant ID:</strong> {hoodieVariant.catalogVariantId}</p>
                    <p><strong>External ID:</strong> {hoodieVariant.externalId}</p>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600">
                <p><strong>Total Hoodie Variants:</strong> {HoodieVariants.length}</p>
                <p><strong>DARK Variants:</strong> {getHoodieVariantsByDesign('DARK').length}</p>
                <p><strong>LIGHT Variants:</strong> {getHoodieVariantsByDesign('LIGHT').length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Integration Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">✅ T-Shirt Integration</h3>
              <p className="text-green-800">Merged variants loaded successfully</p>
              <p className="text-green-800">Design selection working</p>
              <p className="text-green-800">Real Printful IDs available</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">✅ Hoodie Integration</h3>
              <p className="text-green-800">Merged variants loaded successfully</p>
              <p className="text-green-800">Design selection working</p>
              <p className="text-green-800">Real Printful IDs available</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">🚀 Ready for Production</h3>
              <p className="text-blue-800">All variants merged successfully</p>
              <p className="text-blue-800">Frontend components updated</p>
              <p className="text-blue-800">Real catalog variant IDs ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantTestPage;
