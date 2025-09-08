import React, { useState } from 'react';
import { ArrowLeft, Ruler, Info, Users } from 'lucide-react';

interface SizeGuidePageProps {
  onBack: () => void;
}

const SizeGuidePage = ({ onBack }: SizeGuidePageProps) => {
  const [activeTab, setActiveTab] = useState<'hoodie' | 'tshirt'>('tshirt');
  const [unitType, setUnitType] = useState<'inches' | 'cm'>('inches');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-[lvn-maroon] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <Ruler className="w-6 h-6 text-[lvn-maroon]" />
              <h1 className="text-2xl font-bold text-gray-900">Size Guide</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              LVN Clothing Size Guide
            </h2>
            <p className="text-lg text-gray-600">
              Find your perfect fit with our comprehensive sizing information
            </p>
          </div>

          {/* Product Tabs */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('tshirt')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'tshirt'
                  ? 'bg-[lvn-maroon] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              T-Shirts
            </button>
            <button
              onClick={() => setActiveTab('hoodie')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'hoodie'
                  ? 'bg-[lvn-maroon] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hoodies
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg border border-gray-300">
              <button
                onClick={() => setUnitType('inches')}
                className={`px-4 py-2 rounded-l-lg ${
                  unitType === 'inches'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Inches
              </button>
              <button
                onClick={() => setUnitType('cm')}
                className={`px-4 py-2 rounded-r-lg ${
                  unitType === 'cm'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Centimeters
              </button>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="bg-lvn-maroon/10 border border-lvn-maroon/20 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-lvn-maroon-dark flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Pro Tip!</h3>
                <p className="text-lvn-maroon">
                  Measure one of your products at home and compare with the measurements you see in this guide.
                  Product measurements may vary by up to 2" (5 cm).
                </p>
              </div>
            </div>
          </div>

          {/* T-Shirt Content */}
          {activeTab === 'tshirt' && (
            <div className="space-y-8">
              {/* Size Guide Image */}
              <div className="text-center">
                <img
                  src="/tshirt-size-guide.png"
                  alt="T-Shirt Size Guide"
                  className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                />
              </div>

              {/* Product Description */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">Unisex T-Shirt Details</h3>
                <p className="text-gray-700 mb-4">
                  The Unisex Staple T-Shirt feels soft and light with just the right amount of stretch. 
                  It's comfortable and flattering for all. We can't compliment this shirt enough–it's one 
                  of our crowd favorites, and it's sure to be your next favorite too!
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Solid colors are 100% Airlume combed and ring-spun cotton</li>
                  <li>• Ash color is 99% combed and ring-spun cotton, 1% polyester</li>
                  <li>• Heather colors are 52% combed and ring-spun cotton, 48% polyester</li>
                  <li>• Athletic and Black Heather are 90% combed and ring-spun cotton, 10% polyester</li>
                  <li>• Fabric weight: 4.2 oz./yd.² (142 g/m²)</li>
                  <li>• Pre-shrunk fabric</li>
                  <li>• Side-seamed construction</li>
                  <li>• Tear-away label</li>
                  <li>• Shoulder-to-shoulder taping</li>
                </ul>
              </div>

              {/* Women's Sizing Note */}
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <Users className="w-6 h-6 text-pink-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-pink-900 mb-2">Women's Fit Recommendation</h3>
                    <p className="text-pink-800">
                      It is recommended women size down one size for a better fit.
                    </p>
                  </div>
                </div>
              </div>

              {/* Measurements Explanation */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">How to Measure</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">A - Length</h4>
                    <p className="text-gray-600">
                      Place the end of the tape beside the collar at the top of the tee (Highest Point Shoulder). 
                      Pull the tape measure to the bottom of the shirt.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">B - Width</h4>
                    <p className="text-gray-600">
                      Place the end of the tape at the seam under the sleeve and pull the tape measure 
                      across the shirt to the seam under the opposite sleeve.
                    </p>
                  </div>
                </div>
              </div>

              {/* Size Chart */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="border border-gray-300 px-4 py-3 text-left">Size</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">
                        Length {unitType === 'inches' ? '(in)' : '(cm)'}
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center">
                        Width {unitType === 'inches' ? '(in)' : '(cm)'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitType === 'inches' ? (
                      <>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">S</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">28</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">18</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">M</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">29</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">20</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">L</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">30</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">22</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">XL</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">31</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">24</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">2XL</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">32</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">26</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">S</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">71</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">45.7</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">M</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">73.7</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">50.8</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">L</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">76.2</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">56</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">XL</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">78.7</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">61</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">2XL</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">81.3</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">66</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Hoodie Content */}
          {activeTab === 'hoodie' && (
            <div className="space-y-8">
              {/* Size Guide Image */}
              <div className="text-center">
                <img
                  src="/hoodie-size-guide.png"
                  alt="Hoodie Size Guide"
                  className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                />
              </div>

              {/* Product Description */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">Unisex Hoodie Details</h3>
                <p className="text-gray-700 mb-4">
                  With a large front pouch pocket and drawstrings in a matching color, this Unisex Heavy Blend Hoodie 
                  is a sure crowd-favorite. It's soft, stylish, and perfect for cooler evenings.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 50% pre-shrunk cotton, 50% polyester</li>
                  <li>• Heather Sport Dark Navy is 40% cotton, 60% polyester</li>
                  <li>• Fabric weight: 8.0 oz./yd.² (271.25 g/m²)</li>
                  <li>• Air-jet spun yarn with a soft feel and reduced pilling</li>
                  <li>• Double-lined hood with matching drawcord</li>
                  <li>• Quarter-turned body to avoid crease down the middle</li>
                  <li>• 1 × 1 athletic rib-knit cuffs and waistband with spandex</li>
                  <li>• Front pouch pocket</li>
                  <li>• Double-needle stitched collar, shoulders, armholes, cuffs, and hem</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3 italic">
                  Note: Due to the fabric properties, the White color variant may appear off-white rather than bright white.
                </p>
              </div>

              {/* Women's Sizing Note */}
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <Users className="w-6 h-6 text-pink-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-pink-900 mb-2">Women's Fit Recommendation</h3>
                    <p className="text-pink-800">
                      It is recommended women size down one size for a better fit.
                    </p>
                  </div>
                </div>
              </div>

              {/* Measurements Explanation */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">How to Measure</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">A - Length</h4>
                    <p className="text-gray-600">
                      Place the end of a measuring tape beside the collar at the top of the garment (high point shoulder). 
                      Pull the tape to the bottom of the item.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">B - Width</h4>
                    <p className="text-gray-600">
                      Place the end of a measuring tape at one side of the chest area and pull the tape across 
                      to the other side of the product.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">C - Sleeve Length</h4>
                    <p className="text-gray-600">
                      Place the end of a measuring tape at the center back of the collar, then pull the tape along 
                      the top seam of the sleeve. When you get to the shoulder hold the tape in place at the shoulder 
                      and continue to pull down the sleeve until you reach the hem of the sleeve.
                    </p>
                  </div>
                </div>
              </div>

              {/* Size Chart */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="border border-gray-300 px-4 py-3 text-left">Size</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">
                        Length {unitType === 'inches' ? '(in)' : '(cm)'}
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center">
                        Width {unitType === 'inches' ? '(in)' : '(cm)'}
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center">
                        Sleeve {unitType === 'inches' ? '(in)' : '(cm)'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitType === 'inches' ? (
                      <>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">S</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">27</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">20</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">33 ½</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">M</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">28</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">22</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">34 ½</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">L</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">29</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">24</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">35 ½</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">XL</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">30</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">26</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">36 ½</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">2XL</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">31</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">28</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">37 ½</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">S</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">68.6</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">50.8</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">85</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">M</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">71</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">56</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">87.6</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">L</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">73.7</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">61</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">90.2</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">XL</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">76.2</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">66</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">92.7</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-semibold">2XL</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">78.7</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">71</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">95.3</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Contact Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Still unsure about sizing?
              </h3>
              <p className="text-gray-600 mb-4">
                Our customer service team is here to help you find your perfect fit.
              </p>
              <button
                onClick={() => window.location.href = 'mailto:support@backreform.co.uk'}
                className="bg-[lvn-maroon] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#008acc] transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuidePage;