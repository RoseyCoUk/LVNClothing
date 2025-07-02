import React from 'react';
import { ArrowLeft, Shield, Eye, Cookie, Database, Globe, Users, Mail, AlertTriangle } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

const PrivacyPolicyPage = ({ onBack }: PrivacyPolicyPageProps) => {
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
              <Shield className="w-6 h-6 text-[#009fe3]" />
              <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-semibold">
                Effective date: July 4, 2025
              </p>
            </div>
            <p className="text-lg text-gray-600">
              Back Reform ("us", "we", or "our") operates the www.backreform.co.uk website (the "Service").
            </p>
          </div>

          {/* Introduction */}
          <div className="mb-8">
            <p className="text-gray-700 mb-4">
              This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
            <p className="text-gray-700 mb-4">
              We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy. Unless otherwise defined in this Privacy Policy, terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, accessible from www.topg.com
            </p>
          </div>

          {/* Information Collection And Use */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-[#009fe3]" />
              Information Collection And Use
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700">
                We collect several different types of information for various purposes to provide and improve our Service to you.
              </p>
            </div>
          </div>

          {/* Types of Data Collected */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Types of Data Collected</h3>
            
            {/* Personal Data */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2 text-[#009fe3]" />
                Personal Data
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 mb-3">
                  While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:
                </p>
                <ul className="space-y-1 text-blue-800 text-sm">
                  <li>• Email address</li>
                  <li>• First name and last name</li>
                  <li>• Phone number</li>
                  <li>• Address, State, Province, ZIP/Postal code, City</li>
                  <li>• Cookies and Usage Data</li>
                </ul>
              </div>
            </div>

            {/* Usage Data */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Eye className="w-4 h-4 mr-2 text-[#009fe3]" />
                Usage Data
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 text-sm">
                  We may also collect information how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
                </p>
              </div>
            </div>

            {/* Tracking & Cookies Data */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Cookie className="w-4 h-4 mr-2 text-[#009fe3]" />
                Tracking & Cookies Data
              </h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 mb-3 text-sm">
                  We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.
                </p>
                <p className="text-yellow-800 mb-3 text-sm">
                  Cookies are files with small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device. Tracking technologies also used are beacons, tags, and scripts to collect and track information and to improve and analyze our Service.
                </p>
                <p className="text-yellow-800 mb-3 text-sm">
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
                </p>
                <div className="mt-4">
                  <h5 className="font-semibold text-yellow-900 mb-2">Examples of Cookies we use:</h5>
                  <ul className="space-y-1 text-yellow-800 text-sm">
                    <li>• <strong>Session Cookies:</strong> We use Session Cookies to operate our Service</li>
                    <li>• <strong>Preference Cookies:</strong> We use Preference Cookies to remember your preferences and various settings</li>
                    <li>• <strong>Security Cookies:</strong> We use Security Cookies for security purposes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Use of Data */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Use of Data</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 mb-3 text-sm">
                Back Reform uses the collected data for various purposes:
              </p>
              <ul className="space-y-1 text-green-800 text-sm">
                <li>• To provide and maintain the Service</li>
                <li>• To notify you about changes to our Service</li>
                <li>• To allow you to participate in interactive features of our Service when you choose to do so</li>
                <li>• To provide customer care and support</li>
                <li>• To provide analysis or valuable information so that we can improve the Service</li>
                <li>• To monitor the usage of the Service</li>
                <li>• To detect, prevent and address technical issues</li>
                <li>• For targeted advertisements and marketing purposes</li>
              </ul>
            </div>
          </div>

          {/* Transfer Of Data */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-[#009fe3]" />
              Transfer Of Data
            </h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800 mb-3 text-sm">
                Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
              </p>
              <p className="text-purple-800 mb-3 text-sm">
                If you are located outside Romania and choose to provide information to us, please note that we transfer the data, including Personal Data, to Romania and process it there.
              </p>
              <p className="text-purple-800 mb-3 text-sm">
                Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
              </p>
              <p className="text-purple-800 text-sm">
                Back Reform UK will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy and no transfer of your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of your data and other personal information.
              </p>
            </div>
          </div>

          {/* Disclosure Of Data */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Disclosure Of Data</h3>
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Legal Requirements</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 mb-3 text-sm">
                  Back Reform may disclose your Personal Data in the good faith belief that such action is necessary to:
                </p>
                <ul className="space-y-1 text-red-800 text-sm">
                  <li>• To comply with a legal obligation</li>
                  <li>• To protect and defend the rights or property of Back Reform</li>
                  <li>• To prevent or investigate possible wrongdoing in connection with the Service</li>
                  <li>• To protect the personal safety of users of the Service or the public</li>
                  <li>• To protect against legal liability</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Security Of Data */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-[#009fe3]" />
              Security Of Data
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
            </div>
          </div>

          {/* Service Providers */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Service Providers</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 mb-3 text-sm">
                We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used.
              </p>
              <p className="text-blue-800 text-sm">
                These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
              </p>
            </div>
          </div>

          {/* Analytics */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Analytics</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 mb-3 text-sm">
                We may use third-party Service Providers to monitor and analyze the use of our Service.
              </p>
              <div className="mt-4">
                <h4 className="font-semibold text-green-900 mb-2">Google Analytics</h4>
                <p className="text-green-800 mb-2 text-sm">
                  Google Analytics is a web analytics service offered by Google that tracks and reports website traffic. Google uses the data collected to track and monitor the use of our Service. This data is shared with other Google services. Google may use the collected data to contextualize and personalize the ads of its own advertising network.
                </p>
                <p className="text-green-800 mb-2 text-sm">
                  You can opt-out of having made your activity on the Service available to Google Analytics by installing the Google Analytics opt-out browser add-on. The add-on prevents the Google Analytics JavaScript (ga.js, analytics.js, and dc.js) from sharing information with Google Analytics about visits activity.
                </p>
                <p className="text-green-800 text-sm">
                  For more information on the privacy practices of Google, please visit the Google Privacy & Terms web page: 
                  <a href="https://policies.google.com/privacy?hl=en" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline ml-1">
                    https://policies.google.com/privacy?hl=en
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Links To Other Sites */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Links To Other Sites</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 mb-2 text-sm">
                Our Service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
              </p>
              <p className="text-yellow-800 text-sm">
                We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
              </p>
            </div>
          </div>

          {/* Children's Privacy */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Children's Privacy</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 mb-2 text-sm">
                    Our Service does not address anyone under the age of 18 ("Children").
                  </p>
                  <p className="text-red-800 mb-2 text-sm">
                    We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Children has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Changes To This Privacy Policy */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Changes To This Privacy Policy</h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800 mb-2 text-sm">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
              </p>
              <p className="text-purple-800 mb-2 text-sm">
                We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "effective date" at the top of this Privacy Policy.
              </p>
              <p className="text-purple-800 text-sm">
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
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
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <p className="text-gray-700 text-sm">
                By email: 
                <a href="mailto:support@backreform.co.uk" className="text-[#009fe3] font-semibold hover:underline ml-1">
                  support@backreform.co.uk
                </a>
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

export default PrivacyPolicyPage;