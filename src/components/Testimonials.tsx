import React, { useState, useEffect } from 'react';
import { Star, Quote, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const heroTestimonial = {
    name: "Sarah Mitchell",
    location: "Yorkshire",
    rating: 5,
    text: "I've been wearing my LVN hoodie everywhere - it's not just clothing, it's a reminder that I'm under His protection. The quality is amazing and the message speaks to my heart.",
    product: "Hoodie",
    verified: true
  };

  const testimonials = [
    {
      id: 1,
      name: "Michael Johnson",
      location: "Birmingham",
      rating: 5,
      text: "Finally, clothing I can wear with pride that reflects my faith. The t-shirt fits perfectly and the Psalm 91 message is exactly what I need daily.",
      product: "T-Shirt",
      verified: true
    },
    {
      id: 2,
      name: "Emma Collins",
      location: "Leeds",
      rating: 5,
      text: "Bought the collection for my youth group. They love it and the quality is spot on. Great way to remind them of His protection.",
      product: "Collection",
      verified: true
    },
    {
      id: 3,
      name: "David Wilson",
      location: "Liverpool",
      rating: 5,
      text: "Quality clothing that actually means something. The cap fits great and serves as a daily reminder of where my strength comes from.",
      product: "Cap",
      verified: true
    },
    {
      id: 4,
      name: "Lisa Roberts",
      location: "Newcastle",
      rating: 5,
      text: "The apparel has become my daily reminder of His promises. Perfect size and the quality hasn't faded after months of wear.",
      product: "Apparel",
      verified: true
    },
    {
      id: 5,
      name: "Robert Clarke",
      location: "Manchester",
      rating: 5,
      text: "Excellent quality and fast delivery. Proud to wear clothing that proclaims my faith. The community aspect is amazing.",
      product: "Collection",
      verified: true
    },
    {
      id: 6,
      name: "Sarah O'Connor",
      location: "Belfast, Northern Ireland",
      rating: 5,
      text: "Delighted with my LVN gear. The hoodie is warm and comfortable, and the Psalm 91 message brings me peace every day.",
      product: "Hoodie",
      verified: true
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance carousel on mobile
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.innerWidth < 1024) { // Only auto-advance on mobile
        nextSlide();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-lvn-off-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-lvn-black mb-4">
            What Our Community Says
          </h2>
          <p className="text-lg text-lvn-black/70 scripture-quote">
            "He who dwells in the shelter of the Most High"
          </p>
          <p className="text-sm text-lvn-maroon font-medium mt-2">Psalm 91:1</p>
        </div>

        {/* Hero Testimonial */}
        <div className="mb-16">
          <div className="bg-lvn-white rounded-none shadow-lg p-8 max-w-4xl mx-auto relative border-l-4 border-lvn-maroon">
            <Quote className="w-12 h-12 text-lvn-maroon opacity-50 absolute top-6 right-6" />
            
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="flex items-center space-x-1 mr-4">
                  {[...Array(heroTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="flex items-center space-x-2 text-sm text-lvn-maroon">
                  <Shield className="w-4 h-4" />
                  <span>Verified Purchase</span>
                </div>
              </div>
              
              <p className="text-lg text-lvn-black/80 mb-6 leading-relaxed italic">
                "{heroTestimonial.text}"
              </p>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lvn-black">{heroTestimonial.name}</p>
                  <p className="text-sm text-lvn-black/60">{heroTestimonial.location}</p>
                  <p className="text-sm text-lvn-maroon font-medium">{heroTestimonial.product}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-lvn-white rounded-none shadow-md p-6 max-w-md mx-auto border border-lvn-black/10">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center space-x-1 mr-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-lvn-maroon">
                        <Shield className="w-3 h-3" />
                        <span>Verified</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-lvn-black/80 mb-4 leading-relaxed italic">
                      "{testimonial.text}"
                    </p>
                    
                    <div>
                      <p className="font-semibold text-lvn-black text-sm">{testimonial.name}</p>
                      <p className="text-xs text-lvn-black/60">{testimonial.location}</p>
                      <p className="text-xs text-lvn-maroon font-medium">{testimonial.product}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-lvn-white border border-lvn-black/20 rounded-none p-2 hover:bg-lvn-off-white transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 text-lvn-black" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-lvn-white border border-lvn-black/20 rounded-none p-2 hover:bg-lvn-off-white transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 text-lvn-black" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-lvn-maroon' : 'bg-lvn-black/20'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Message */}
        <div className="text-center mt-12">
          <div className="bg-lvn-maroon text-lvn-white py-4 px-6 inline-block rounded-none">
            <p className="text-sm font-semibold">
              Join thousands of believers who trust LVN Clothing
            </p>
            <p className="text-xs opacity-90 mt-1">
              Free UK shipping • Premium quality • Faith-inspired design
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;