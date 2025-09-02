import React from 'react';
import { ArrowLeft, Cookie, Settings, Eye, Shield, Globe, Info, AlertTriangle, CheckCircle, Mail } from 'lucide-react';

interface CookiePolicyPageProps {
  onBack: () => void;
}

const CookiePolicyPage = ({ onBack }: CookiePolicyPageProps) => {
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
              <Cookie className="w-6 h-6 text-[#009fe3]" />
              <h1 className="text-2xl font-bold text-gray-900">Cookie Policy</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cookie Policy
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-semibold">
                Last updated: January 1, 2025
              </p>
            </div>
            <p className="text-lg text-gray-600">
              This Cookie Policy explains how Back Reform ("we", "us", or "our") uses cookies and similar technologies when you visit our website www.backreform.co.uk (the "Service").
            </p>
          </div>

          {/* What Are Cookies */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Cookie className="w-5 h-5 mr-2 text-[#009fe3]" />
              What Are Cookies?
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-800 mb-4 text-sm">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
              </p>
              <p className="text-blue-800 mb-4 text-sm">
                Cookies allow websites to recognize your device and store some information about your preferences or past actions. This helps us provide you with a better, more personalized experience when you browse our website.
              </p>
              <div className="bg-blue-100 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Key Points About Cookies:</h4>
                <ul className="space-y-1 text-blue-800 text-sm">
                  <li>• They don't contain personal information that can identify you directly</li>
                  <li>• They help us understand how you use our website</li>
                  <li>• They improve your browsing experience</li>
                  <li>• You can control and manage them through your browser settings</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Cookies */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-[#009fe3]" />
              How We Use Cookies
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-green-800 mb-4 text-sm">
                We use cookies for several important purposes to enhance your experience on our website:
              </p>
              <div className="space-y-4">
                <div className="bg-green-100 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Essential Website Functionality
                  </h4>
                  <p className="text-green-800 text-sm">
                    To ensure our website works properly, remember your shopping cart contents, and maintain your login session.
                  </p>
                </div>
                <div className="bg-green-100 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Analytics and Performance
                  </h4>
                  <p className="text-green-800 text-sm">
                    To understand how visitors interact with our website, which pages are most popular, and how we can improve our service.
                  </p>
                </div>
                <div className="bg-green-100 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Personalization
                  </h4>
                  <p className="text-green-800 text-sm">
                    To remember your preferences, such as language settings, and provide you with a more personalized experience.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Types of Cookies We Use */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h3>
            
            {/* Strictly Necessary Cookies */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-red-500" />
                Strictly Necessary Cookies
              </h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 mb-3 text-sm">
                  These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility.
                </p>
                <div className="bg-red-100 rounded-lg p-3">
                  <h5 className="font-semibold text-red-900 mb-2">Examples include:</h5>
                  <ul className="space-y-1 text-red-800 text-sm">
                    <li>• Session cookies that keep you logged in</li>
                    <li>• Shopping cart functionality</li>
                    <li>• Security cookies to prevent fraud</li>
                    <li>• Load balancing cookies</li>
                  </ul>
                </div>
                <div className="mt-3 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-800 text-sm">
                    <strong>Note:</strong> These cookies cannot be disabled as they are essential for the website to work.
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Cookies */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Eye className="w-4 h-4 mr-2 text-blue-500" />
                Performance and Analytics Cookies
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 mb-3 text-sm">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
                <div className="bg-blue-100 rounded-lg p-3">
                  <h5 className="font-semibold text-blue-900 mb-2">What they do:</h5>
                  <ul className="space-y-1 text-blue-800 text-sm">
                    <li>• Count the number of visitors to our website</li>
                    <li>• See which pages are most and least popular</li>
                    <li>• Track how visitors move around the website</li>
                    <li>• Help us improve website performance</li>
                  </ul>
                </div>
                <div className="mt-3">
                  <p className="text-blue-800 text-sm">
                    <strong>Third-party services:</strong> We use Google Analytics to collect this information. You can opt-out of Google Analytics by installing the Google Analytics opt-out browser add-on.
                  </p>
                </div>
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2 text-green-500" />
                Functional Cookies
              </h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 mb-3 text-sm">
                  These cookies enable enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.
                </p>
                <div className="bg-green-100 rounded-lg p-3">
                  <h5 className="font-semibold text-green-900 mb-2">Examples include:</h5>
                  <ul className="space-y-1 text-green-800 text-sm">
                    <li>• Remembering your preferences and settings</li>
                    <li>• Providing enhanced features like live chat</li>
                    <li>• Remembering information you've entered in forms</li>
                    <li>• Personalizing content based on your interests</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Globe className="w-4 h-4 mr-2 text-purple-500" />
                Marketing and Advertising Cookies
              </h4>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-800 mb-3 text-sm">
                  These cookies are used to deliver advertisements more relevant to you and your interests. They also help limit the number of times you see an advertisement and measure the effectiveness of advertising campaigns.
                </p>
                <div className="bg-purple-100 rounded-lg p-3">
                  <h5 className="font-semibold text-purple-900 mb-2">What they do:</h5>
                  <ul className="space-y-1 text-purple-800 text-sm">
                    <li>• Track your browsing habits across websites</li>
                    <li>• Build a profile of your interests</li>
                    <li>• Show you relevant advertisements</li>
                    <li>• Measure advertising campaign effectiveness</li>
                  </ul>
                </div>
                <div className="mt-3">
                  <p className="text-purple-800 text-sm">
                    <strong>Note:</strong> We may work with advertising partners who use these cookies to show you Reform UK advertisements on other websites.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Third-Party Cookies */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-[#009fe3]" />
              Third-Party Cookies
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800 mb-4 text-sm">
                Some cookies on our website are set by third-party services that appear on our pages. We don't control these cookies, and you should check the relevant third party's website for more information.
              </p>
              <div className="space-y-3">
                <div className="bg-yellow-100 rounded-lg p-3">
                  <h4 className="font-semibold text-yellow-900 mb-2">Google Analytics</h4>
                  <p className="text-yellow-800 text-sm">
                    We use Google Analytics to analyze website traffic and usage patterns. Google Analytics uses cookies to collect information about how you use our website.
                  </p>
                </div>
                <div className="bg-yellow-100 rounded-lg p-3">
                  <h4 className="font-semibold text-yellow-900 mb-2">Social Media Platforms</h4>
                  <p className="text-yellow-800 text-sm">
                    If we embed content from social media platforms (like Facebook, Twitter, or Instagram), these platforms may set their own cookies.
                  </p>
                </div>
                <div className="bg-yellow-100 rounded-lg p-3">
                  <h4 className="font-semibold text-yellow-900 mb-2">Payment Processors</h4>
                  <p className="text-yellow-800 text-sm">
                    Our payment processing partners may use cookies to ensure secure transactions and prevent fraud.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Managing Your Cookie Preferences */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-[#009fe3]" />
              Managing Your Cookie Preferences
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4 text-sm">
                You have several options for managing cookies on our website:
              </p>
              
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Browser Settings</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    Most web browsers allow you to control cookies through their settings preferences. You can:
                  </p>
                  <ul className="space-y-1 text-gray-700 text-sm ml-4">
                    <li>• Block all cookies</li>
                    <li>• Block third-party cookies only</li>
                    <li>• Delete cookies when you close your browser</li>
                    <li>• Get notified when a website tries to set a cookie</li>
                  </ul>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Browser-Specific Instructions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-800">Chrome:</p>
                      <p className="text-gray-600">Settings → Privacy and Security → Cookies</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Firefox:</p>
                      <p className="text-gray-600">Options → Privacy & Security → Cookies</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Safari:</p>
                      <p className="text-gray-600">Preferences → Privacy → Cookies</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Edge:</p>
                      <p className="text-gray-600">Settings → Cookies and Site Permissions</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Opt-Out Tools</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    You can also use these tools to opt out of specific tracking:
                  </p>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#009fe3] hover:underline">Google Analytics Opt-out Browser Add-on</a></li>
                    <li>• <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-[#009fe3] hover:underline">Your Online Choices (EU)</a></li>
                    <li>• <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-[#009fe3] hover:underline">Network Advertising Initiative Opt-out</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-1">Important Note</h4>
                    <p className="text-orange-800 text-sm">
                      Disabling certain cookies may affect the functionality of our website. Some features may not work properly if you block essential cookies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cookie Consent */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cookie Consent</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 mb-3 text-sm">
                When you first visit our website, you'll see a cookie banner asking for your consent to use non-essential cookies. You can:
              </p>
              <ul className="space-y-1 text-blue-800 text-sm">
                <li>• Accept all cookies</li>
                <li>• Reject non-essential cookies</li>
                <li>• Customize your cookie preferences</li>
                <li>• Change your preferences at any time</li>
              </ul>
              <p className="text-blue-800 mt-3 text-sm">
                Your consent choices are stored in a cookie so we can remember your preferences for future visits.
              </p>
            </div>
          </div>

          {/* Updates to This Policy */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Updates to This Cookie Policy</h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800 mb-2 text-sm">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
              </p>
              <p className="text-purple-800 mb-2 text-sm">
                When we make changes, we will update the "Last updated" date at the top of this policy and notify you through our website or other appropriate means.
              </p>
              <p className="text-purple-800 text-sm">
                We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
              </p>
            </div>
          </div>

          {/* More Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-[#009fe3]" />
              More Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 mb-3 text-sm">
                For more information about cookies and how they work, you can visit:
              </p>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>• <a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-[#009fe3] hover:underline">All About Cookies</a></li>
                <li>• <a href="https://ico.org.uk/for-the-public/online/cookies/" target="_blank" rel="noopener noreferrer" className="text-[#009fe3] hover:underline">ICO Guidance on Cookies</a></li>
                <li>• <a href="https://www.cookiepedia.co.uk/" target="_blank" rel="noopener noreferrer" className="text-[#009fe3] hover:underline">Cookiepedia</a></li>
              </ul>
            </div>
          </div>

          {/* Contact Us */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-[#009fe3]" />
              Contact Us
            </h3>
            <div className="bg-[#009fe3]/5 border border-[#009fe3]/20 rounded-lg p-4">
              <p className="text-gray-700 mb-2 text-sm">
                If you have any questions about this Cookie Policy or our use of cookies, please contact us:
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

export default CookiePolicyPage;