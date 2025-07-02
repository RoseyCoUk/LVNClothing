import React from 'react';
import { ArrowLeft, RotateCcw, Shield, CheckCircle, Clock } from 'lucide-react';

interface ReturnsExchangesPageProps {
  onBack: () => void;
}

const ReturnsExchangesPage = ({ onBack }: ReturnsExchangesPageProps) => {
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
              <RotateCcw className="w-6 h-6 text-[#009fe3]" />
              <h1 className="text-2xl font-bold text-gray-900">Returns & Exchanges</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Returns & Exchanges Policy
            </h2>
            <p className="text-lg text-gray-600">
              We want you to be completely satisfied with your Reform UK merchandise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">30-Day Returns</h3>
              <p className="text-sm text-gray-600">Return items within 30 days of purchase</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Process</h3>
              <p className="text-sm text-gray-600">Simple return and exchange procedure</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
              <p className="text-sm text-gray-600">We stand behind our products</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Complete Returns Policy Coming Soon</h3>
            <p className="text-blue-800">
              We're finalizing our comprehensive returns and exchanges policy. This page will include 
              detailed information about return conditions, the return process, refund timeframes, 
              and how to initiate returns or exchanges for your Reform UK merchandise.
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              For immediate assistance with returns or exchanges, please contact our support team.
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

export default ReturnsExchangesPage;