import React from 'react';
import { ArrowLeft, FileText, Scale, Shield, AlertTriangle, Globe, CreditCard, Package, Mail, Users } from 'lucide-react';

interface TermsOfServicePageProps {
  onBack: () => void;
}

const TermsOfServicePage = ({ onBack }: TermsOfServicePageProps) => {
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
              <FileText className="w-6 h-6 text-[#009fe3]" />
              <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-semibold">
                Last updated: January 1, 2025
              </p>
            </div>
            <p className="text-lg text-gray-600">
              Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Back Reform website (the "Service") operated by Back Reform ("us", "we", or "our").
            </p>
          </div>

          {/* Introduction */}
          <div className="mb-8">
            <p className="text-gray-700 mb-4">
              Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.
            </p>
            <p className="text-gray-700 mb-4">
              By accessing or using our Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
            </p>
          </div>

          {/* Acceptance of Terms */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Scale className="w-5 h-5 mr-2 text-[#009fe3]" />
              Acceptance of Terms
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. Additionally, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
              </p>
            </div>
          </div>

          {/* Use License */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Use License</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4 text-sm">
                Permission is granted to temporarily download one copy of the materials on Back Reform's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  modify or copy the materials
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  use the materials for any commercial purpose or for any public display
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  attempt to reverse engineer any software contained on the website
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  remove any copyright or other proprietary notations from the materials
                </li>
              </ul>
              <p className="text-gray-700 mt-4 text-sm">
                This license shall automatically terminate if you violate any of these restrictions and may be terminated by Back Reform at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
              </p>
            </div>
          </div>

          {/* User Accounts */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-[#009fe3]" />
              User Accounts
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 mb-3 text-sm">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
              <p className="text-green-800 mb-3 text-sm">
                You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
              <p className="text-green-800 text-sm">
                You may not use as a username the name of another person or entity or that is not lawfully available for use, a name or trademark that is subject to any rights of another person or entity other than you without appropriate authorization.
              </p>
            </div>
          </div>

          {/* Purchases and Payment Terms */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-[#009fe3]" />
              Purchases and Payment Terms
            </h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800 mb-3 text-sm">
                If you wish to purchase any product or service made available through the Service, you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, your billing address, and your shipping information.
              </p>
              <p className="text-purple-800 mb-3 text-sm">
                You represent and warrant that: (i) you have the legal right to use any credit card(s) or other payment method(s) in connection with any Purchase; and that (ii) the information you supply to us is true, correct and complete.
              </p>
              <p className="text-purple-800 mb-3 text-sm">
                By submitting such information, you grant us the right to provide the information to third parties for purposes of facilitating the completion of Purchases.
              </p>
              <p className="text-purple-800 text-sm">
                We reserve the right to refuse or cancel your order at any time for certain reasons including but not limited to: product or service availability, errors in the description or price of the product or service, error in your order or other reasons.
              </p>
            </div>
          </div>

          {/* Shipping and Delivery */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-[#009fe3]" />
              Shipping and Delivery
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="mb-4">
                We currently ship only within the United Kingdom. Shipping costs and delivery times vary depending on your location and the shipping method selected.
              </p>
              <p className="mb-4">
                Free shipping is available on orders over £50. Standard delivery costs £3.99 and typically takes 3-5 business days, while express delivery costs £5.99 and takes 2-3 business days.
              </p>
              <p className="text-yellow-800 text-sm">
                Risk of loss and title for items purchased from our website pass to you upon delivery of the items to the carrier. You are responsible for filing any claims with carriers for damaged and/or lost shipments.
              </p>
            </div>
          </div>

          {/* Prohibited Uses */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Prohibited Uses</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 mb-3 text-sm">
                You may not use our Service:
              </p>
              <ul className="space-y-2 text-red-800 text-sm">
                <li>• For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>• To violate any international, federal, provincial or state regulations, rules, laws, or local ordinances</li>
                <li>• To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>• To submit false or misleading information</li>
                <li>• To upload or transmit viruses or any other type of malicious code</li>
                <li>• To collect or track the personal information of others</li>
                <li>• To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                <li>• For any obscene or immoral purpose</li>
                <li>• To interfere with or circumvent the security features of the Service</li>
              </ul>
            </div>
          </div>

          {/* Intellectual Property Rights */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Intellectual Property Rights</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 mb-3 text-sm">
                The Service and its original content, features and functionality are and will remain the exclusive property of Back Reform and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
              </p>
              <p className="text-blue-800 text-sm">
                All Reform UK logos, designs, and branding materials are the intellectual property of Reform UK and are used under license.
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-[#009fe3]" />
              Disclaimer
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 mb-3 text-sm">
                The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company:
              </p>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>• excludes all representations and warranties relating to this website and its contents</li>
                <li>• excludes all liability for damages arising out of or in connection with your use of this website</li>
              </ul>
            </div>
          </div>

          {/* Limitations */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Limitations</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                In no event shall Back Reform or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Back Reform's website, even if Back Reform or a Back Reform authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
              </p>
            </div>
          </div>

          {/* Accuracy of Materials */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Accuracy of Materials</h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800 text-sm">
                The materials appearing on Back Reform's website could include technical, typographical, or photographic errors. Back Reform does not warrant that any of the materials on its website are accurate, complete, or current. Back Reform may make changes to the materials contained on its website at any time without notice. However, Back Reform does not make any commitment to update the materials.
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-[#009fe3]" />
              Links
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 mb-3 text-sm">
                Back Reform has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Back Reform of the site. Use of any such linked website is at the user's own risk.
              </p>
              <p className="text-green-800 text-sm">
                We may provide links to third-party websites or services that we do not own or control. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
              </p>
            </div>
          </div>

          {/* Modifications */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Modifications</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 mb-3 text-sm">
                Back Reform may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
              <p className="text-blue-800 text-sm">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </div>
          </div>

          {/* Termination */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Termination</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 mb-3 text-sm">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p className="text-red-800 mb-3 text-sm">
                Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, you may simply discontinue using the Service.
              </p>
              <p className="text-red-800 text-sm">
                All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
              </p>
            </div>
          </div>

          {/* Governing Law */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Scale className="w-5 h-5 mr-2 text-[#009fe3]" />
              Governing Law
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                These Terms shall be interpreted and governed by the laws of the United Kingdom, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-[#009fe3]" />
              Contact Information
            </h3>
            <div className="bg-[#009fe3]/5 border border-[#009fe3]/20 rounded-lg p-4">
              <p className="text-gray-700 mb-2 text-sm">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <p className="text-gray-700 text-sm">
                By email: 
                <a href="mailto:support@backreform.co.uk" className="text-[#009fe3] font-semibold hover:underline ml-1">
                  support@backreform.co.uk
                </a>
              </p>
              <p className="text-gray-700 text-sm mt-2">
                By visiting our contact page on this website
              </p>
            </div>
          </div>

          <div className="text-center">
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

export default TermsOfServicePage;