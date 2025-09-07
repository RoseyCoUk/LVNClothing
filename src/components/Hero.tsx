import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface HeroProps {
  onShopClick: () => void;
}

const Hero = ({ onShopClick }: HeroProps) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // Simulate video loading time
    const timer = setTimeout(() => {
      setVideoLoaded(true);
      
      // Keep placeholder visible for a brief moment to ensure smooth transition
      setTimeout(() => {
        setShowPlaceholder(false);
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleVideoError = () => {
    setVideoError(true);
    setVideoLoaded(false);
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Placeholder Image - loads instantly */}
      <div 
        className={`absolute inset-0 z-10 transition-opacity duration-1000 ${
          showPlaceholder ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <img 
          src="/Screenshot 2025-06-30 024021.png" 
          alt="Hero Background" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Vimeo Background Video - Full Width */}
      {!videoError && (
        <div 
          className={`absolute inset-0 z-20 transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <iframe
            src="https://player.vimeo.com/video/1097368184?background=1&autoplay=1&muted=1&loop=0&title=0&byline=0&portrait=0&controls=0&playsinline=1"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: '100vw',
              height: '56.25vw', // 16:9 aspect ratio
              minHeight: '100vh',
              minWidth: '177.78vh', // 16:9 aspect ratio
            }}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="LVN Clothing Hero Video"
            onError={handleVideoError}
            onLoad={() => setVideoLoaded(true)}
          />
        </div>
      )}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/40 z-30"></div>

      {/* Hero Content */}
      <div className="relative z-40 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-xl md:text-2xl italic text-gray-200 mb-4 max-w-3xl mx-auto drop-shadow-lg leading-relaxed">
            "The kingdom of heaven is like leaven that a woman took and hid in three measures of flour, till it was all leavened."
          </p>
          <p className="text-lg md:text-xl text-lvn-maroon font-semibold drop-shadow-lg">
            – Matthew 13:33
          </p>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
          <span className="text-lvn-maroon">Faith That Spreads.</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-lg">
          Just as leaven spreads slowly but irresistibly, so Christ's Kingdom expands until it permeates every corner of creation. Through clothing, we herald that Kingdom.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button 
            onClick={onShopClick}
            className="bg-lvn-maroon hover:bg-lvn-maroon-dark text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl backdrop-blur-sm"
          >
            Shop Collection
          </button>
        </div>

        {/* Trust Badge */}
        <div className="bg-black/40 backdrop-blur-md border border-white/30 rounded-lg px-6 py-3 inline-flex items-center space-x-3 mb-8 shadow-xl">
          <Heart className="w-5 h-5 text-red-400 fill-current" />
          <span className="text-white font-semibold">Faith That Spreads.</span>
        </div>
        
        <div className="text-gray-200">
          <p className="text-sm drop-shadow-lg">🇬🇧 Proudly printed in the UK • Best shipping rates</p>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-40">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center drop-shadow-lg">
          <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
        </div>
      </div>

      {/* Loading indicator (optional) */}
      {!videoLoaded && (
        <div className="absolute bottom-4 right-4 z-50">
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 text-white text-xs">
            Loading video...
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;