import React from 'react';
import { ArrowLeft, RotateCcw, Shield, CheckCircle, Clock, AlertTriangle, Package, Mail } from 'lucide-react';

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
              className="flex items-center space-x-2 text-gray-600 hover:text-[lvn-maroon] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <RotateCcw className="w-6 h-6 text-[lvn-maroon]" />
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
              At LVN Clothing, we aim to provide exceptional customer service while maintaining fairness and transparency. Please carefully review our Refund & Return Policy to ensure you understand the conditions and procedures before initiating a return or exchange.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">5-Day Returns</h3>
              <p className="text-sm text-gray-600">Return items within 5 days of receipt</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-lvn-maroon/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-lvn-maroon-dark" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Original Condition</h3>
              <p className="text-sm text-gray-600">Items must be unused with all tags</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
              <p className="text-sm text-gray-600">We stand behind our products</p>
            </div>
          </div>

          {/* Condition of Returns */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-[lvn-maroon]" />
              Condition of Returns
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Returns are accepted only if the item is in its original condition, unused, undamaged, and includes all original packaging, tags, and accessories. We reserve the right to decline returns if the item shows any signs of wear, damage, alteration, or does not meet the conditions outlined below.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Returns will NOT be accepted under the following circumstances:
                </h4>
                <ul className="space-y-2 text-red-800 text-sm">
                  <li>• The item shows any signs of wear, such as stains, creases, or discolouration</li>
                  <li>• The item has animal hair or any other debris on it</li>
                  <li>• Non-returnable tags have been removed</li>
                  <li>• The item has been altered, washed, or laundered</li>
                  <li>• The item is missing original packaging, tags, or accessories</li>
                  <li>• Returns are initiated more than 5 days after the item has been received</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cryptocurrency Payments */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cryptocurrency Payments</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-medium">
                Orders paid with cryptocurrency are non-refundable under any circumstances. This includes returns, exchanges, or cancellations.
              </p>
            </div>
          </div>

          {/* Refunds & Store Credit */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Refunds & Store Credit</h3>
            <div className="space-y-4">
              <div className="bg-lvn-maroon/10 border border-lvn-maroon/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">For the Original Purchaser:</h4>
                <p className="text-lvn-maroon text-sm">
                  Refunds will be processed to the original payment method once we receive and inspect the returned item. The item must meet the required conditions of being unused and returned with all original packaging and tags.
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">For Gift Recipients:</h4>
                <p className="text-green-800 text-sm">
                  If you are the recipient of a gift and do not have access to the original payment method used for the purchase, we will offer store credit equal to the value of the returned item. This store credit can be redeemed for future purchases on our website, provided the returned item meets all return conditions.
                </p>
              </div>
            </div>
          </div>

          {/* Exchanges */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Exchanges</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                We aim to accommodate exchanges promptly, ensuring a seamless experience for our customers. Exchanges will only be honoured in the following circumstances:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  The wrong size was delivered
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  An incorrect product was sent
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  The item arrived damaged or defective
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  The item was not sealed upon receipt
                </li>
              </ul>
            </div>
          </div>

          {/* How to Initiate a Return */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-[lvn-maroon]" />
              How to Initiate a Return
            </h3>
            <div className="bg-[lvn-maroon]/5 border border-[lvn-maroon]/20 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                To initiate a return, please contact our LVN Clothing Support Team at{' '}
                <a href="mailto:support@backreform.co.uk" className="text-[lvn-maroon] font-semibold hover:underline">
                  support@backreform.co.uk
                </a>{' '}
                to request a Return Authorisation. This will ensure your request is escalated to the relevant department for swift processing.
              </p>
              
              <h4 className="font-semibold text-gray-900 mb-3">To expedite your request, please include the following details in your email:</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-[lvn-maroon] rounded-full mr-3"></div>
                  Order Number
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-[lvn-maroon] rounded-full mr-3"></div>
                  Full Name
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-[lvn-maroon] rounded-full mr-3"></div>
                  Brief Reason for the Return
                </li>
              </ul>
              
              <p className="text-gray-700 mt-4 text-sm">
                Once our customer service team receives your request, they will coordinate with the relevant departments to inspect the returned item. After the process is complete, we will notify you of the outcome and advise whether a refund, store credit, or exchange will be provided.
              </p>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Notes</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  Original shipping charges are non-refundable
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  The cost of return shipping will be the responsibility of the customer and will depend on your local postal service
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={onBack}
              className="bg-[lvn-maroon] hover:bg-lvn-maroon-dark text-white font-bold py-3 px-6 rounded-lg transition-colors"
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