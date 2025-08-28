import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface HeroProps {
  onShopClick: () => void;
  onStoryClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onShopClick, onStoryClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Trigger animations after component mounts (faster on mobile)
    const isMobile = window.innerWidth < 768;
    const delay = prefersReducedMotion ? 0 : (isMobile ? 50 : 100);
    const timer = setTimeout(() => setIsLoaded(true), delay);
    
    return () => {
      clearTimeout(timer);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [prefersReducedMotion]);

  return (
    <section 
      className="relative min-h-screen bg-lvnBg flex items-center justify-center overflow-hidden"
      role="banner"
      aria-labelledby="hero-heading"
    >
      {/* Background with LVN Logo Watermark */}
      <div className="absolute inset-0 z-10">
        {/* Giant LVN logo watermark - optimized for performance */}
        <div className="absolute inset-0 opacity-6">
          <div className="flex items-center justify-center h-full transform -translate-y-24">
            <img 
              src="/Leaven Logo.png" 
              alt="LVN Logo Background" 
              className="w-[20rem] h-[20rem] md:w-[28rem] md:h-[28rem] object-contain"
              loading="eager"
              decoding="async"
              style={{ 
                willChange: prefersReducedMotion ? 'auto' : 'opacity',
                transform: 'translateZ(0)' // Force hardware acceleration
              }}
            />
          </div>
        </div>
        
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-lvnBg/50 to-lvnBg/80"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-40 text-center px-6 max-w-5xl mx-auto py-20">
        
        {/* Verse (Matthew 13:33) - Optimized animations */}
        <div className={`mb-12 ${
          prefersReducedMotion 
            ? (isLoaded ? 'opacity-100' : 'opacity-0')
            : `transition-all duration-${window.innerWidth < 768 ? '800' : '1200'} ease-out delay-${window.innerWidth < 768 ? '200' : '500'} ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`
        }`}>
          <div className="italic text-xl md:text-2xl lg:text-3xl text-[#800000] leading-relaxed mb-6">
            "The kingdom of heaven is like leaven that a woman took and hid in three measures of flour, till it was all leavened."
          </div>
          
          {/* Subtle maroon underline */}
          <div className="w-32 h-0.5 bg-[#800000] mx-auto mb-4"></div>
          
          <p id="hero-heading" className="text-2xl text-lvn-maroon font-bold mb-4">Matthew 13:33</p>
          

        </div>



        {/* CTA Buttons - Optimized animations */}
        <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 ${
          prefersReducedMotion 
            ? (isLoaded ? 'opacity-100' : 'opacity-0')
            : `transition-all duration-${window.innerWidth < 768 ? '600' : '800'} ease-out delay-${window.innerWidth < 768 ? '400' : '900'} ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`
        }`}>
          <button 
            onClick={onShopClick}
            className={`group bg-[#800000] text-white font-semibold py-4 px-8 md:px-10 rounded-xl text-base md:text-lg min-w-[200px] md:min-w-[240px] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#800000]/50 ${
              prefersReducedMotion ? 'hover:bg-[#600000]' : 'hover:bg-[#600000] hover:scale-105 hover:shadow-xl'
            }`}
            style={{ willChange: 'transform, box-shadow' }}
            aria-label="Shop our collection of premium Christian streetwear"
          >
            Shop Collection
          </button>
          
          <button 
            onClick={onStoryClick || (() => window.location.href = '/about')}
            className={`group bg-transparent border-2 border-black text-black font-semibold py-4 px-8 md:px-10 rounded-xl text-base md:text-lg min-w-[200px] md:min-w-[240px] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-black/50 ${
              prefersReducedMotion ? 'hover:bg-[#800000] hover:border-[#800000] hover:text-white' : 'hover:bg-[#800000] hover:border-[#800000] hover:text-white hover:scale-105 hover:shadow-xl'
            }`}
            style={{ willChange: 'transform, box-shadow' }}
            aria-label="Learn about LVN Clothing's mission and story"
          >
            Discover Our Story
          </button>
        </div>

        {/* Kingdom Mission Statement - Below buttons */}
        <div className={`mb-20 transition-all duration-1000 ease-out delay-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <p className="italic text-lg text-black/70 max-w-3xl mx-auto leading-relaxed">
            Just as leaven spreads slowly but irresistibly, so Christ's Kingdom expands until it permeates 
            every corner of creation. Through clothing, we herald that Kingdom.
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center transition-all duration-1000 ease-out delay-1100 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <button 
          onClick={onShopClick}
          className="group flex flex-col items-center space-y-2 text-black/70 hover:text-[#800000] transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-[#800000]/30 rounded-lg p-2"
          aria-label="Scroll down to explore our clothing collection"
        >
          <ChevronDown className={`w-6 h-6 ${prefersReducedMotion ? '' : 'animate-pulse'}`} aria-hidden="true" />
          <span className="text-sm font-medium">Explore Collection</span>
        </button>
      </div>

      {/* Optional placeholder for future split-hero product image */}
      <div className="hidden lg:block absolute right-0 top-0 w-1/2 h-full bg-transparent">
        {/* Future product/lifestyle image will go here */}
      </div>
    </section>
  );
};

export default Hero;