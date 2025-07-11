import React, { useState } from 'react';
import { ArrowLeft, Ruler, Info, Users } from 'lucide-react';

interface SizeGuidePageProps {
  onBack: () => void;
}

const SizeGuidePage = ({ onBack }: SizeGuidePageProps) => {
  const [activeTab, setActiveTab] = useState<'hoodie' | 'tshirt'>('hoodie');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-[#009fe3] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <Ruler className="w-6 h-6 text-[#009fe3]" />
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
              Reform UK Size Guide
            </h2>
            <p className="text-lg text-gray-600">
              Find your perfect fit with our comprehensive sizing information
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Important Note</h3>
                <p className="text-blue-800">
                  Measurements shown in the chart reflect the size of the clothing, not the wearer.
                </p>
              </div>
            </div>
          </div>

          {/* Product Type Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('hoodie')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'hoodie' ? 'border-[#009fe3] text-[#009fe3]' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Hoodie
              </button>
              <button
                onClick={() => setActiveTab('tshirt')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'tshirt' ? 'border-[#009fe3] text-[#009fe3]' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                T-Shirt
              </button>
            </nav>
          </div>

          {/* Hoodie Size Chart */}
          {activeTab === 'hoodie' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Size Chart Image */}
              <div className="text-center">
                <img 
                  src="/hoodiesize.png" 
                  alt="Hoodie Size Chart" 
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
              </div>

              {/* Size Chart Table */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Hoodie Measurements</h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Length (A):</strong> high point on shoulder hem to bottom hem on the back.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Width (B):</strong> side to side just below the sleeves (when placed flat).
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-2 px-3 font-semibold text-gray-900">Size</th>
                        <th className="text-center py-2 px-3 font-semibold text-gray-900">Length (A)<br/>cm</th>
                        <th className="text-center py-2 px-3 font-semibold text-gray-900">Width (B)<br/>cm</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">S</td>
                        <td className="py-2 px-3 text-center">66</td>
                        <td className="py-2 px-3 text-center">50</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">M</td>
                        <td className="py-2 px-3 text-center">70</td>
                        <td className="py-2 px-3 text-center">54</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">L</td>
                        <td className="py-2 px-3 text-center">72</td>
                        <td className="py-2 px-3 text-center">57</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">XL</td>
                        <td className="py-2 px-3 text-center">74</td>
                        <td className="py-2 px-3 text-center">60</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">XXL</td>
                        <td className="py-2 px-3 text-center">76</td>
                        <td className="py-2 px-3 text-center">64</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* T-Shirt Size Chart */}
          {activeTab === 'tshirt' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Size Chart Image */}
              <div className="text-center">
                <img 
                  src="/tshirtsize.png" 
                  alt="T-Shirt Size Chart" 
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
              </div>

              {/* Size Chart Table */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">T-Shirt Measurements</h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Length (A):</strong> high point on shoulder hem to bottom hem on the back.
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Width (B):</strong> side to side just below the sleeves (when placed flat).
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>All measurements in centimetres.</strong>
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-2 px-3 font-semibold text-gray-900">Size</th>
                        <th className="text-center py-2 px-3 font-semibold text-gray-900">Length (A)<br/>cm</th>
                        <th className="text-center py-2 px-3 font-semibold text-gray-900">Width (B)<br/>cm</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">S</td>
                        <td className="py-2 px-3 text-center">69.5</td>
                        <td className="py-2 px-3 text-center">48.5</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">M</td>
                        <td className="py-2 px-3 text-center">72</td>
                        <td className="py-2 px-3 text-center">53.5</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">L</td>
                        <td className="py-2 px-3 text-center">74.5</td>
                        <td className="py-2 px-3 text-center">56</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">XL</td>
                        <td className="py-2 px-3 text-center">77</td>
                        <td className="py-2 px-3 text-center">61</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">XXL</td>
                        <td className="py-2 px-3 text-center">78.5</td>
                        <td className="py-2 px-3 text-center">66</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#009fe3] rounded-full flex items-center justify-center mx-auto mb-4">
                <Ruler className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accurate Measurements</h3>
              <p className="text-gray-600">
                All measurements are taken from the actual garment to ensure the most accurate sizing information.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#009fe3] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fit Guidance</h3>
              <p className="text-gray-600">
                Our clothing is designed for a comfortable, relaxed fit. If you prefer a tighter fit, consider sizing down.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              If you have any questions about sizing, please don't hesitate to contact our support team.
            </p>
            <button
              onClick={onBack}
              className="bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuidePage;