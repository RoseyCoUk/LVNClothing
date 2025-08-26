import React from 'react';
import { Heart, Shield, Users, BookOpen, Sparkles } from 'lucide-react';

const MovementSection = () => {
  const scrollToEmailSignup = () => {
    const emailSection = document.getElementById('email-signup');
    if (emailSection) {
      emailSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-lvn-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="mb-12 lg:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-lvn-black mb-6">
              Kingdom Leaven
            </h2>
            <p className="text-lg text-lvn-black/70 mb-6 leading-relaxed">
              Just as leaven works silently to transform dough, LVN Clothing spreads 
              the Kingdom message through every piece we wear. Each garment carries 
              the Gospel, transforming culture one interaction at a time.
            </p>
            <div className="scripture-quote text-lvn-maroon text-lg mb-8">
              "The kingdom of heaven is like leaven that a woman took and hid in three measures of flour, till it was all leavened."
              <span className="block text-sm font-medium mt-1">— Matthew 13:33</span>
            </div>
            
            {/* Trust Icons Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-lvn-maroon rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-lvn-white" />
                </div>
                <h3 className="font-semibold text-lvn-black mb-1">Cultural Transformation</h3>
                <p className="text-sm text-lvn-black/70">Spreading the Kingdom</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-lvn-maroon rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-lvn-white" />
                </div>
                <h3 className="font-semibold text-lvn-black mb-1">Faith Community</h3>
                <p className="text-sm text-lvn-black/70">United in Christ</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-lvn-maroon rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-lvn-white" />
                </div>
                <h3 className="font-semibold text-lvn-black mb-1">Gospel Witness</h3>
                <p className="text-sm text-lvn-black/70">Every piece tells a story</p>
              </div>
            </div>
            
            <button 
              onClick={scrollToEmailSignup}
              className="btn-lvn-primary"
            >
              Join the Kingdom Movement
            </button>
          </div>
          
          {/* Right Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-lvn-maroon to-lvn-black rounded-none p-8 text-lvn-white">
              <div className="text-center mb-6">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <h3 className="text-2xl font-bold mb-2">Christus Victor</h3>
                <p className="text-lvn-white/80">Kingdom. Leaven. Victory.</p>
              </div>
              
              <div className="bg-lvn-white bg-opacity-20 rounded-none p-4 backdrop-blur-sm">
                <p className="text-sm italic text-center">
                  "Through clothing, we herald that Kingdom, pointing to the unstoppable growth 
                  of Christ's reign on Earth."
                </p>
                <p className="text-sm font-semibold text-center mt-2">— LVN Clothing Mission</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MovementSection;