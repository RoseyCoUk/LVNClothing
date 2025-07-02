import React from 'react';
import { Users, Heart, Flag, Shield, Package, CreditCard } from 'lucide-react';

const MovementSection = () => {
  const scrollToEmailSignup = () => {
    const emailSection = document.getElementById('email-signup');
    if (emailSection) {
      emailSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="mb-12 lg:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              More Than Just Merchandise
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              When you wear Reform UK merchandise, you're not just making a fashion statement – 
              you're joining a movement of people who believe in real change for Britain. Every 
              purchase directly supports our mission to give voice to the forgotten majority.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Together, we're building a better future for our communities, our economy, and our democracy.
            </p>
            
            {/* Trust Icons Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#009fe3] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Flag className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Made in the UK</h3>
                <p className="text-sm text-gray-600">Supporting local business</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#009fe3] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">50K+ Supporters</h3>
                <p className="text-sm text-gray-600">Nationwide movement</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#009fe3] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Secure Checkout</h3>
                <p className="text-sm text-gray-600">Safe & protected</p>
              </div>
            </div>
            
            <button 
              onClick={scrollToEmailSignup}
              className="bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Join the Movement
            </button>
          </div>
          
          {/* Right Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-[#009fe3] to-blue-600 rounded-2xl p-8 text-white">
              <div className="text-center mb-6">
                <Flag className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <h3 className="text-2xl font-bold mb-2">Stand Together</h3>
                <p className="text-blue-100">Your voice. Your choice. Your Britain.</p>
              </div>
              
              <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm italic text-center">
                  "Reform UK merchandise isn't just clothing – it's a badge of hope for everyone 
                  who believes Britain can do better."
                </p>
                <p className="text-sm font-semibold text-center mt-2">— Nigel Farage, Party Leader</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MovementSection;