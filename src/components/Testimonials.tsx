import React, { useState, useEffect } from 'react';
import { Star, Quote, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const heroTestimonial = {
    name: "Sarah Mitchell",
    location: "London",
    rating: 5,
    text: "I've been wearing my LVN Clothing hoodie everywhere - to church, coffee shops, even to my daughter's university. People stop me to ask about the beautiful design and the message. It's more than clothing, it's a way to share my faith through fashion.",
    product: "Hoodie",
    verified: true
  };

  const testimonials = [
    {
      id: 1,
      name: "James Mitchell",
      location: "Birmingham",
      rating: 5,
      text: "Finally, Christian streetwear I can wear with pride. The t-shirt fits perfectly and the message is powerful. Been stopped twice this week by people asking about the Kingdom message.",
      product: "T-Shirt",
      verified: true
    },
    {
      id: 2,
      name: "Emma Collins",
      location: "Leeds",
      rating: 5,
      text: "Bought the Faith Bundle as a gift for my dad. He loves it and wears something from it every day! The quality is exceptional and the message speaks to his heart.",
      product: "Faith Bundle",
      verified: true
    },
    {
      id: 3,
      name: "David Wilson",
      location: "Liverpool",
      rating: 5,
      text: "Quality clothing that actually represents something eternal. The cap fits great and the embroidery is beautiful. Will definitely order again to share with my small group.",
      product: "Cap",
      verified: true
    },
    {
      id: 4,
      name: "Lisa Roberts",
      location: "Newcastle",
      rating: 5,
      text: "The mug has become my daily coffee companion. Love starting my day with a reminder of God's Kingdom spreading through everything. Perfect size and the print hasn't faded after months of washing.",
      product: "Mug",
      verified: true
    },
    {
      id: 5,
      name: "Robert Clarke",
      location: "Manchester",
      rating: 5,
      text: "Excellent quality and fast delivery. Proud to herald the Kingdom with every purchase. The designs are beautiful and meaningful - wear them everywhere.",
      product: "Accessories",
      verified: true
    },
    {
      id: 6,
      name: "Sarah O'Connor",
      location: "Belfast, Northern Ireland",
      rating: 5,
      text: "Delighted with my LVN Clothing gear. The hoodie is warm and comfortable, perfect for our Belfast weather. Great to see faith being shared through fashion across the UK.",
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
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Testimonial */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto relative border-l-4 border-lvn-maroon">
            <Quote className="w-12 h-12 text-lvn-maroon opacity-50 absolute top-6 right-6" />
            
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-5 h-5 text-yellow-400 fill-current" 
                    />
                  ))}
                </div>
                {heroTestimonial.verified && (
                  <div className="ml-3 flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified Customer
                  </div>
                )}
              </div>
              
              <p className="text-lg text-gray-700 mb-6 leading-relaxed italic">
                "{heroTestimonial.text}"
              </p>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{heroTestimonial.name}</h4>
                  <p className="text-sm text-gray-600">{heroTestimonial.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Purchased: <span className="font-medium">{heroTestimonial.product}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Community Says
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real people, real faith, real impact. Join thousands who are heralding the Kingdom through fashion.
          </p>
        </div>
        
        {/* Mobile Carousel with Navigation */}
        <div className="relative">
          <div className="overflow-x-auto pb-4 lg:overflow-visible scrollbar-hide">
            <div className="flex gap-6 min-w-max lg:grid lg:grid-cols-3 xl:grid-cols-6 lg:min-w-0">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id} 
                  className={`flex-shrink-0 w-80 lg:w-auto bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 relative ${
                    index === currentIndex ? 'ring-2 ring-lvn-maroon lg:ring-0' : ''
                  }`}
                >
                  <Quote className="w-8 h-8 text-lvn-maroon opacity-50 absolute top-4 right-4" />
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    {testimonial.verified && (
                      <div className="ml-2 flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500">
                      Purchased: <span className="font-medium">{testimonial.product}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows for Mobile */}
          <div className="flex justify-center items-center space-x-4 mt-6 lg:hidden">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-lvn-maroon text-white hover:bg-lvn-maroon-dark transition-colors shadow-md"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-lvn-maroon' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-lvn-maroon text-white hover:bg-lvn-maroon-dark transition-colors shadow-md"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;