import React from 'react';
import { ArrowLeft, Ruler, Info, Users } from 'lucide-react';

interface SizeGuidePageProps {
  onBack: () => void;
}

const SizeGuidePage = ({ onBack }: SizeGuidePageProps) => {
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
              Reform UK Merchandise Size Guide
            </h2>
            <p className="text-lg text-gray-600">
              Find your perfect fit with our comprehensive sizing information
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Coming Soon</h3>
                <p className="text-blue-800">
                  We're currently preparing detailed size charts and fitting guides for all our Reform UK merchandise. 
                  This page will include comprehensive measurements for hoodies, t-shirts, caps, and all other apparel items.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#009fe3] rounded-full flex items-center justify-center mx-auto mb-4">
                <Ruler className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accurate Measurements</h3>
              <p className="text-gray-600">
                Detailed size charts with chest, waist, and length measurements for all clothing items.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#009fe3] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fit Guidance</h3>
              <p className="text-gray-600">
                Helpful tips and customer feedback to help you choose the right size for your body type.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              In the meantime, if you have any questions about sizing, please don't hesitate to contact our support team.
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