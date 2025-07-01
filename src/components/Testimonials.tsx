import React, { useState } from 'react';
import { Star, Quote, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const heroTestimonial = {
    name: "Margaret Thompson",
    location: "Yorkshire",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    rating: 5,
    text: "I've been wearing my Reform UK hoodie everywhere - to the shops, walking the dog, even to my grandson's football match. People stop me to ask where they can get one. It's more than clothing, it's a conversation starter about the future of our country.",
    product: "Classic Hoodie",
    verified: true
  };

  const testimonials = [
    {
      id: 1,
      name: "James Thompson",
      location: "Birmingham",
      image: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "Finally, merchandise I can wear with pride. The t-shirt fits perfectly and the message is clear.",
      product: "Stand Up T-Shirt"
    },
    {
      id: 2,
      name: "Emma Collins",
      location: "Leeds",
      image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "Bought the starter pack as a gift for my dad. He loves it and wears something from it every day!",
      product: "Starter Pack"
    },
    {
      id: 3,
      name: "David Wilson",
      location: "Liverpool",
      image: "https://images.pexels.com/photos/428328/pexels-photo-428328.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "Quality merchandise that actually supports something meaningful. Will definitely order again.",
      product: "Complete Kit"
    },
    {
      id: 4,
      name: "Lisa Roberts",
      location: "Newcastle",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "The mug has become my daily coffee companion. Love starting my day with a reminder of what we're fighting for.",
      product: "Reform UK Mug"
    },
    {
      id: 5,
      name: "Robert Clarke",
      location: "Manchester",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "Excellent quality and fast delivery. Proud to support the movement with every purchase.",
      product: "Movement Cap"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Testimonial */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto relative border-l-4 border-[#009fe3]">
            <Quote className="w-12 h-12 text-[#009fe3] opacity-50 absolute top-6 right-6" />
            
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <img 
                  src={heroTestimonial.image} 
                  alt={heroTestimonial.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-[#009fe3]"
                />
              </div>
              
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
                      Verified Supporter
                    </div>
                  )}
                </div>
                
                <p className="text-lg text-gray-700 mb-4 leading-relaxed italic">
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
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Supporters Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real people, real stories, real change. Join thousands who are already making their voices heard.
          </p>
        </div>
        
        {/* Mobile Carousel with Navigation */}
        <div className="relative">
          <div className="overflow-x-auto pb-4 lg:overflow-visible">
            <div className="flex gap-6 min-w-max lg:grid lg:grid-cols-3 xl:grid-cols-5 lg:min-w-0">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id} 
                  className={`flex-shrink-0 w-80 lg:w-auto bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 relative ${
                    index === currentIndex ? 'ring-2 ring-[#009fe3] lg:ring-0' : ''
                  }`}
                >
                  <Quote className="w-8 h-8 text-[#009fe3] opacity-50 absolute top-4 right-4" />
                  
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
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
              className="p-2 rounded-full bg-[#009fe3] text-white hover:bg-blue-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-[#009fe3]' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-[#009fe3] text-white hover:bg-blue-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <button className="text-[#009fe3] hover:text-blue-600 font-semibold">
            Read All Reviews →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;