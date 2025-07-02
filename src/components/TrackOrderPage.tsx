import React, { useState } from 'react';
import { ArrowLeft, Package, Search, Truck, CheckCircle, Clock } from 'lucide-react';

interface TrackOrderPageProps {
  onBack: () => void;
}

const TrackOrderPage = ({ onBack }: TrackOrderPageProps) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // This would integrate with actual tracking system
    console.log('Tracking order:', orderNumber, email);
  };

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
              <Package className="w-6 h-6 text-[#009fe3]" />
              <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Track Your Reform UK Order
            </h2>
            <p className="text-lg text-gray-600">
              Enter your order details to see the latest shipping updates
            </p>
          </div>

          {/* Tracking Form */}
          <form onSubmit={handleTrackOrder} className="max-w-md mx-auto mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="RUK-123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Track Order</span>
              </button>
            </div>
          </form>

          {/* Tracking Status Example */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Tracking Status Example</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Order Confirmed</p>
                  <p className="text-sm text-gray-600">Your order has been received and is being processed</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Order Shipped</p>
                  <p className="text-sm text-gray-600">Your order is on its way to you</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Out for Delivery</p>
                  <p className="text-sm text-gray-600">Your order will be delivered today</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-600">Delivered</p>
                  <p className="text-sm text-gray-500">Your order has been delivered</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Order Tracking System Coming Soon</h3>
            <p className="text-blue-800">
              We're implementing a comprehensive order tracking system that will provide real-time 
              updates on your Reform UK merchandise orders. This will include detailed tracking 
              information, delivery estimates, and notification preferences.
            </p>
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

export default TrackOrderPage;