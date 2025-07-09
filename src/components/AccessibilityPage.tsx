import React from 'react';
import { ArrowLeft, Eye, Ear, Hand, Brain, Monitor, Keyboard, Mouse, Smartphone, Mail, CheckCircle, AlertTriangle, Info, Settings } from 'lucide-react';

interface AccessibilityPageProps {
  onBack: () => void;
}

const AccessibilityPage = ({ onBack }: AccessibilityPageProps) => {
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
              <Eye className="w-6 h-6 text-[#009fe3]" />
              <h1 className="text-2xl font-bold text-gray-900">Accessibility Statement</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Accessibility Statement
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-semibold">
                Last updated: January 1, 2025
              </p>
            </div>
            <p className="text-lg text-gray-600">
              Back Reform is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
            </p>
          </div>

          {/* Our Commitment */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-[#009fe3]" />
              Our Commitment to Accessibility
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-green-800 mb-4 text-sm">
                At Back Reform, we believe that everyone should have equal access to information and functionality on our website. We are committed to providing an inclusive experience that allows all users to successfully access our Reform UK merchandise and information.
              </p>
              <div className="bg-green-100 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Our accessibility goals include:</h4>
                <ul className="space-y-1 text-green-800 text-sm">
                  <li>• Ensuring our website is perceivable by all users</li>
                  <li>• Making all functionality operable through various input methods</li>
                  <li>• Providing understandable content and navigation</li>
                  <li>• Building robust compatibility with assistive technologies</li>
                  <li>• Continuously improving accessibility based on user feedback</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Accessibility Standards */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Accessibility Standards</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-800 mb-4 text-sm">
                Our website aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. These guidelines explain how to make web content more accessible to people with disabilities.
              </p>
              <div className="space-y-3">
                <div className="bg-blue-100 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-900 mb-2">WCAG 2.1 Level AA Compliance</h4>
                  <p className="text-blue-800 text-sm">
                    We follow the internationally recognized Web Content Accessibility Guidelines to ensure our website meets accessibility standards for users with various disabilities.
                  </p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-900 mb-2">UK Accessibility Regulations</h4>
                  <p className="text-blue-800 text-sm">
                    We comply with the UK's Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018, which are based on WCAG 2.1 Level AA standards.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Accessibility Features */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Accessibility Features</h3>
            
            {/* Visual Accessibility */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Eye className="w-4 h-4 mr-2 text-[#009fe3]" />
                Visual Accessibility
              </h4>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="bg-purple-100 rounded-lg p-3">
                    <h5 className="font-semibold text-purple-900 mb-2">Color and Contrast</h5>
                    <ul className="space-y-1 text-purple-800 text-sm">
                      <li>• High contrast color schemes for better readability</li>
                      <li>• Information is not conveyed by color alone</li>
                      <li>• Text meets WCAG contrast ratio requirements</li>
                      <li>• Focus indicators are clearly visible</li>
                    </ul>
                  </div>
                  <div className="bg-purple-100 rounded-lg p-3">
                    <h5 className="font-semibold text-purple-900 mb-2">Text and Typography</h5>
                    <ul className="space-y-1 text-purple-800 text-sm">
                      <li>• Scalable text that can be enlarged up to 200%</li>
                      <li>• Clear, readable fonts throughout the website</li>
                      <li>• Proper heading structure for screen readers</li>
                      <li>• Descriptive link text and button labels</li>
                    </ul>
                  </div>
                  <div className="bg-purple-100 rounded-lg p-3">
                    <h5 className="font-semibold text-purple-900 mb-2">Images and Media</h5>
                    <ul className="space-y-1 text-purple-800 text-sm">
                      <li>• Alternative text for all meaningful images</li>
                      <li>• Decorative images are properly marked</li>
                      <li>• Product images include detailed descriptions</li>
                      <li>• Video content includes captions when applicable</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Motor and Mobility */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Hand className="w-4 h-4 mr-2 text-[#009fe3]" />
                Motor and Mobility Accessibility
              </h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="bg-green-100 rounded-lg p-3">
                    <h5 className="font-semibold text-green-900 mb-2">Keyboard Navigation</h5>
                    <ul className="space-y-1 text-green-800 text-sm">
                      <li>• Full keyboard accessibility for all interactive elements</li>
                      <li>• Logical tab order throughout the website</li>
                      <li>• Skip links to main content areas</li>
                      <li>• No keyboard traps that prevent navigation</li>
                    </ul>
                  </div>
                  <div className="bg-green-100 rounded-lg p-3">
                    <h5 className="font-semibold text-green-900 mb-2">Mouse and Touch</h5>
                    <ul className="space-y-1 text-green-800 text-sm">
                      <li>• Large click targets for easier interaction</li>
                      <li>• Sufficient spacing between interactive elements</li>
                      <li>• Touch-friendly design for mobile devices</li>
                      <li>• No time-sensitive actions that cannot be extended</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Cognitive Accessibility */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Brain className="w-4 h-4 mr-2 text-[#009fe3]" />
                Cognitive Accessibility
              </h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="bg-yellow-100 rounded-lg p-3">
                    <h5 className="font-semibold text-yellow-900 mb-2">Clear Navigation</h5>
                    <ul className="space-y-1 text-yellow-800 text-sm">
                      <li>• Consistent navigation structure across all pages</li>
                      <li>• Clear page titles and headings</li>
                      <li>• Breadcrumb navigation for orientation</li>
                      <li>• Search functionality with helpful suggestions</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-100 rounded-lg p-3">
                    <h5 className="font-semibold text-yellow-900 mb-2">Content Structure</h5>
                    <ul className="space-y-1 text-yellow-800 text-sm">
                      <li>• Simple, clear language throughout the website</li>
                      <li>• Logical content organization and flow</li>
                      <li>• Error messages that are easy to understand</li>
                      <li>• Form labels and instructions are clear</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Hearing Accessibility */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Ear className="w-4 h-4 mr-2 text-[#009fe3]" />
                Hearing Accessibility
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="bg-blue-100 rounded-lg p-3">
                  <h5 className="font-semibold text-blue-900 mb-2">Audio and Video Content</h5>
                  <ul className="space-y-1 text-blue-800 text-sm">
                    <li>• Captions provided for video content</li>
                    <li>• Transcripts available for audio content</li>
                    <li>• Visual indicators for audio alerts</li>
                    <li>• No auto-playing audio that cannot be controlled</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Assistive Technology Support */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Monitor className="w-5 h-5 mr-2 text-[#009fe3]" />
              Assistive Technology Support
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4 text-sm">
                Our website is designed to work with a variety of assistive technologies:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Keyboard className="w-4 h-4 mr-2 text-[#009fe3]" />
                    Screen Readers
                  </h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• JAWS (Windows)</li>
                    <li>• NVDA (Windows)</li>
                    <li>• VoiceOver (macOS/iOS)</li>
                    <li>• TalkBack (Android)</li>
                  </ul>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Mouse className="w-4 h-4 mr-2 text-[#009fe3]" />
                    Input Devices
                  </h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Switch navigation</li>
                    <li>• Voice control software</li>
                    <li>• Eye-tracking devices</li>
                    <li>• Alternative keyboards</li>
                  </ul>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-[#009fe3]" />
                    Visual Aids
                  </h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Screen magnification software</li>
                    <li>• High contrast mode</li>
                    <li>• Browser zoom functionality</li>
                    <li>• Custom CSS stylesheets</li>
                  </ul>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Smartphone className="w-4 h-4 mr-2 text-[#009fe3]" />
                    Mobile Accessibility
                  </h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• iOS accessibility features</li>
                    <li>• Android accessibility services</li>
                    <li>• Voice commands</li>
                    <li>• Gesture navigation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Browser and Device Compatibility */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Browser and Device Compatibility</h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800 mb-3 text-sm">
                Our website is tested and optimized for accessibility across various browsers and devices:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-purple-900 mb-2">Desktop Browsers</h4>
                  <ul className="space-y-1 text-purple-800 text-sm">
                    <li>• Chrome (latest 2 versions)</li>
                    <li>• Firefox (latest 2 versions)</li>
                    <li>• Safari (latest 2 versions)</li>
                    <li>• Edge (latest 2 versions)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900 mb-2">Mobile Browsers</h4>
                  <ul className="space-y-1 text-purple-800 text-sm">
                    <li>• Safari on iOS</li>
                    <li>• Chrome on Android</li>
                    <li>• Samsung Internet</li>
                    <li>• Firefox Mobile</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900 mb-2">Operating Systems</h4>
                  <ul className="space-y-1 text-purple-800 text-sm">
                    <li>• Windows 10/11</li>
                    <li>• macOS (latest 2 versions)</li>
                    <li>• iOS (latest 2 versions)</li>
                    <li>• Android (latest 2 versions)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Known Issues */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-[#009fe3]" />
              Known Accessibility Issues
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 mb-3 text-sm">
                We are continuously working to improve accessibility. Currently known issues include:
              </p>
              <div className="space-y-3">
                <div className="bg-orange-100 rounded-lg p-3">
                  <h4 className="font-semibold text-orange-900 mb-2">Third-Party Content</h4>
                  <p className="text-orange-800 text-sm">
                    Some third-party embedded content (such as payment processors or social media widgets) may not fully meet accessibility standards. We are working with these providers to improve accessibility.
                  </p>
                </div>
                <div className="bg-orange-100 rounded-lg p-3">
                  <h4 className="font-semibold text-orange-900 mb-2">Complex Interactive Elements</h4>
                  <p className="text-orange-800 text-sm">
                    Some advanced interactive features may require additional keyboard shortcuts or alternative access methods. We provide alternative ways to access this functionality.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-start space-x-2">
                <Info className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-orange-800 text-sm">
                  We are actively working to resolve these issues and will update this page as improvements are made.
                </p>
              </div>
            </div>
          </div>

          {/* How to Use Our Website */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-[#009fe3]" />
              How to Use Our Website Accessibly
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="space-y-4">
                <div className="bg-blue-100 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Keyboard Navigation Tips</h4>
                  <ul className="space-y-1 text-blue-800 text-sm">
                    <li>• Use <kbd className="bg-blue-200 px-1 rounded">Tab</kbd> to move forward through interactive elements</li>
                    <li>• Use <kbd className="bg-blue-200 px-1 rounded">Shift + Tab</kbd> to move backward</li>
                    <li>• Use <kbd className="bg-blue-200 px-1 rounded">Enter</kbd> or <kbd className="bg-blue-200 px-1 rounded">Space</kbd> to activate buttons and links</li>
                    <li>• Use arrow keys to navigate within menus and lists</li>
                    <li>• Press <kbd className="bg-blue-200 px-1 rounded">Esc</kbd> to close modal dialogs</li>
                  </ul>
                </div>
                
                <div className="bg-blue-100 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Screen Reader Tips</h4>
                  <ul className="space-y-1 text-blue-800 text-sm">
                    <li>• Use heading navigation to quickly move between sections</li>
                    <li>• Use landmark navigation to jump to main content areas</li>
                    <li>• Form fields have descriptive labels and instructions</li>
                    <li>• Error messages are announced when they appear</li>
                  </ul>
                </div>
                
                <div className="bg-blue-100 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Visual Customization</h4>
                  <ul className="space-y-1 text-blue-800 text-sm">
                    <li>• Use your browser's zoom feature to enlarge text and images</li>
                    <li>• Enable high contrast mode in your operating system</li>
                    <li>• Adjust your browser's font size settings</li>
                    <li>• Use custom CSS to override our styles if needed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback and Contact */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-[#009fe3]" />
              Accessibility Feedback
            </h3>
            <div className="bg-[#009fe3]/5 border border-[#009fe3]/20 rounded-lg p-6">
              <p className="text-gray-700 mb-4 text-sm">
                We welcome your feedback on the accessibility of our website. If you encounter any accessibility barriers or have suggestions for improvement, please let us know:
              </p>
              
              <div className="space-y-3">
                <div className="bg-white border border-[#009fe3]/20 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Methods</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>
                      <strong>Email:</strong> 
                      <a href="mailto:support@backreform.co.uk" className="text-[#009fe3] font-semibold hover:underline ml-1">
                        support@backreform.co.uk
                      </a>
                    </li>
                    <li>
                      <strong>General Support:</strong> 
                      <a href="mailto:support@backreform.co.uk" className="text-[#009fe3] font-semibold hover:underline ml-1">
                        support@backreform.co.uk
                      </a>
                    </li>
                    <li><strong>Phone:</strong> <a href="https://wa.me/447405853303" target="_blank" rel="noopener noreferrer" className="text-[#009fe3] font-semibold hover:underline ml-1">WhatsApp Support</a></li>
                  </ul>
                </div>
                
                <div className="bg-white border border-[#009fe3]/20 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">When Contacting Us, Please Include:</h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• The specific page or feature you're having trouble with</li>
                    <li>• The assistive technology you're using (if applicable)</li>
                    <li>• Your browser and operating system</li>
                    <li>• A description of the accessibility barrier you encountered</li>
                    <li>• Any suggestions you have for improvement</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-gray-700 mt-4 text-sm">
                We aim to respond to accessibility feedback within 2 business days and will work with you to resolve any issues as quickly as possible.
              </p>
            </div>
          </div>

          {/* Ongoing Improvements */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ongoing Accessibility Improvements</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 mb-3 text-sm">
                Accessibility is an ongoing commitment. We regularly:
              </p>
              <ul className="space-y-1 text-green-800 text-sm">
                <li>• Conduct accessibility audits and testing</li>
                <li>• Train our development team on accessibility best practices</li>
                <li>• Test our website with real users who have disabilities</li>
                <li>• Monitor and implement new accessibility standards</li>
                <li>• Review and update our accessibility statement</li>
                <li>• Incorporate accessibility considerations into all new features</li>
              </ul>
            </div>
          </div>

          {/* Legal Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Legal Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 mb-3 text-sm">
                This accessibility statement applies to the Back Reform website (www.backreform.co.uk). It was prepared in accordance with the UK's Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018.
              </p>
              <p className="text-gray-700 mb-3 text-sm">
                This statement was last reviewed and updated on January 1, 2025. We review and update this statement regularly to ensure it remains accurate and up-to-date.
              </p>
              <p className="text-gray-700 text-sm">
                If you are not satisfied with our response to your accessibility feedback, you can contact the Equality and Human Rights Commission (EHRC) or, in Northern Ireland, the Equality Commission for Northern Ireland (ECNI).
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

export default AccessibilityPage;