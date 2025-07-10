import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  Clock, 
  Shield, 
  Users, 
  Package, 
  RotateCcw, 
  Globe, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  ChevronDown,
  ChevronUp,
  Truck,
  CreditCard,
  Heart
} from 'lucide-react';
import { FAQS } from './faqs';
import FAQAccordion from './FAQAccordion';
import { useNavigate } from 'react-router-dom';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fullName && formData.email && formData.message) {
      setIsSubmitted(true);
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        subject: '',
        message: ''
      });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Where's my order?",
      answer: "Orders usually ship in 1–2 business days. Check your inbox for a tracking email with your order details. If you can't find it, please contact us with your order number and we'll help track it down."
    },
    {
      question: "Can I return an item?",
      answer: "Yes! We offer easy returns within 30 days of purchase. Items must be unworn and in original condition. Visit our Returns Policy page for full details or contact us to start a return."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently we only ship within the UK, but we're working on expanding internationally soon. Sign up for our newsletter to be notified when international shipping becomes available."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Got a question? We're here to help. Our supporter-run team is committed to providing excellent service and transparent communication.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              {!isSubmitted ? (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a message</h2>
                    <p className="text-gray-600">We'll get back to you within 1–2 business days</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent transition-colors"
                        placeholder="Enter your email address"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent transition-colors"
                      >
                        <option value="">Select a topic (optional)</option>
                        <option value="order-question">Order Question</option>
                        <option value="product-issue">Product Issue</option>
                        <option value="general-inquiry">General Inquiry</option>
                        <option value="returns">Returns & Exchanges</option>
                        <option value="wholesale">Wholesale Inquiry</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent transition-colors resize-vertical"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Message Sent!</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Thanks for getting in touch! We'll reply within 1–2 business days. Check your inbox for a confirmation email.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-[#009fe3] hover:text-blue-600 font-semibold underline"
                  >
                    Send another message
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Direct Contact Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Get in Touch</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-[#009fe3] mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <a href="mailto:support@backreform.co.uk" className="text-gray-600 hover:text-[#009fe3] transition-colors">
                      support@backreform.co.uk
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-[#009fe3] mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <a href="https://wa.me/447405853303" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#009fe3] transition-colors">
                      WhatsApp Support
                    </a>
                    <p className="text-sm text-gray-500">Mon-Fri, 9am-5pm GMT</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#009fe3] mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">
                      Reform UK HQ<br />
                      London, United Kingdom
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="font-medium text-gray-900 mb-3">Follow Us</p>
                <div className="flex space-x-3">
                  <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#009fe3] transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#009fe3] transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#009fe3] transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#009fe3] transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/track-order')}
                  className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Package className="w-4 h-4" />
                  <span>Track My Order</span>
                </button>
                
                <button className="w-full border-2 border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3] font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>Start a Return</span>
                </button>
              </div>
            </div>

            {/* Support Hours */}
            <div className="bg-gradient-to-br from-[#009fe3] to-blue-600 text-white rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-5 h-5" />
                <h3 className="text-lg font-bold">Support Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
              <p className="text-xs text-blue-100 mt-3">
                All times are GMT. We aim to respond to all emails within 24 hours during business days.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Before You Contact Us
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Check out these common questions – you might find your answer right here!
              </p>
            </div>
            <FAQAccordion faqs={FAQS} limit={5} showViewAllLink={true} viewAllHref="/faq" />
          </div>
        </div>
      </div>


    </div>
  );
};

export default ContactPage;