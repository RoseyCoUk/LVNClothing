import React from 'react';

interface HeroProps {
  onShopClick: () => void;
}

const Hero = ({ onShopClick }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-lvn-off-white">
      {/* Large Background Logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <img 
          src="/images/Leaven Logo.png" 
          alt="LVN Logo Background" 
          className="w-96 h-96 object-contain"
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Hero Verse */}
        <div className="mb-12">
          <p className="text-xl md:text-2xl italic text-lvn-maroon mb-4 max-w-3xl mx-auto leading-relaxed">
            "The kingdom of heaven is like leaven that a woman took and hid in three measures of flour, till it was all leavened."
          </p>
          <p className="text-lg md:text-xl text-lvn-maroon font-semibold">
            – Matthew 13:33
          </p>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-lvn-maroon mb-8 leading-tight">
          Faith That Spreads.
        </h1>

        {/* Sub-tagline */}
        <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
          Just as leaven spreads slowly but irresistibly, so Christ's Kingdom expands until it permeates every corner of creation. Through clothing, we herald that Kingdom.
        </p>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={onShopClick}
            className="bg-lvn-maroon hover:bg-lvn-maroon-dark text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Shop Collection
          </button>
          <button 
            onClick={() => window.scrollTo({ top: document.getElementById('about')?.offsetTop, behavior: 'smooth' })}
            className="bg-white border-2 border-lvn-maroon text-lvn-maroon hover:bg-lvn-maroon hover:text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Discover Our Story
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;