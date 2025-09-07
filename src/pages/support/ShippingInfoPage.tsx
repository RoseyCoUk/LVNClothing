import React from 'react';
import { ArrowLeft, Truck, Clock, MapPin, Package } from 'lucide-react';

interface ShippingInfoPageProps {
  onBack: () => void;
}

const ShippingInfoPage = ({ onBack }: ShippingInfoPageProps) => {
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
              <Truck className="w-6 h-6 text-[#009fe3]" />
              <h1 className="text-2xl font-bold text-gray-900">Shipping Information</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shipping & Delivery Information
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about getting your Reform UK merchandise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">UK Shipping</h3>
              <p className="text-sm text-gray-600">Calculated at checkout</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Processing</h3>
              <p className="text-sm text-gray-600">Ships within 48 hours</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">UK Only</h3>
              <p className="text-sm text-gray-600">Currently shipping within UK</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Packaging</h3>
              <p className="text-sm text-gray-600">Carefully packed items</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Shipping Options & Rates</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h4 className="font-medium text-gray-900">Standard Delivery</h4>
                  <p className="text-sm text-gray-600">3-5 business days</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">Calculated at checkout</p>
                  <p className="text-xs text-blue-600">Based on location and items</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h4 className="font-medium text-gray-900">Express Delivery</h4>
                  <p className="text-sm text-gray-600">2-3 business days</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">Calculated at checkout</p>
                  <p className="text-xs text-blue-600">Priority shipping available</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <h4 className="font-medium text-blue-900">Bulk Shipping</h4>
                  <p className="text-sm text-blue-700">Best rates for multiple items</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-900">Optimized</p>
                  <p className="text-xs text-blue-600">Combined shipping</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Processing & Delivery Information</h3>
            <div className="text-blue-800 space-y-2">
              <p><strong>Processing Time:</strong> All orders are processed and shipped within 48 hours of purchase.</p>
              <p><strong>Tracking:</strong> You'll receive a tracking email once your order has been dispatched.</p>
              <p><strong>Business Days:</strong> Delivery times are based on business days (Monday-Friday, excluding bank holidays).</p>
              <p><strong>International Shipping:</strong> Currently available for UK addresses only. International shipping coming soon.</p>
            </div>
          </div>

          <div className="mt-8 text-center">
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

export default ShippingInfoPage;