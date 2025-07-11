import React from 'react';
import { 
  Shield, 
  Heart, 
  Flag, 
  Users, 
  Target, 
  Handshake, 
  ArrowRight, 
  Quote,
  CheckCircle,
  Star,
  Package,
  Truck,
  CreditCard,
  TrendingUp,
  DollarSign,
  MapPin,
  Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();
  const scrollToShop = () => {
    // Navigate to the shop page
    navigate('/shop');
  };

  const scrollToEmailSignup = () => {
    const emailSection = document.getElementById('email-signup');
    if (emailSection) {
      emailSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-[#009fe3] text-white overflow-hidden">
        {/* Background Image with Low Opacity */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-800/70 to-[#009fe3]/80"></div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <Flag className="w-16 h-16 mx-auto mb-4 text-[#009fe3]" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              About Reform UK Merch
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              It's not just clothing. It's a cause.
            </p>
            <button 
              onClick={scrollToShop}
              className="bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Why We Created This Store
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-12">
              This isn't just about t-shirts and mugs. Reform UK merchandise is a way for everyday citizens to show what they stand for—real change, honest politics, and a better Britain. Every item supports the movement, raises awareness, and funds Reform UK's grassroots campaigns across the country.
            </p>
            
            {/* Supporting Icons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#009fe3] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white fill-current" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Back the Mission</h3>
                <p className="text-gray-600">Sales help fund awareness, outreach, and materials that support Reform UK's message.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[#009fe3] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flag className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Printed in the UK</h3>
                <p className="text-gray-600">Proudly manufactured in Britain, supporting local businesses and workers</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[#009fe3] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Built by Supporters</h3>
                <p className="text-gray-600">Created and managed by dedicated volunteers and Reform UK supporters</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            {/* Reform Blue Divider Line */}
            <div className="w-24 h-1 bg-[#009fe3] mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every piece of merchandise reflects the principles that drive Reform UK forward
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Real Change */}
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-[#009fe3] to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real Change</h3>
              <p className="text-gray-700 leading-relaxed">
                We believe in action, not lip service. Our merchandise represents a commitment to genuine political reform and meaningful change for Britain's future.
              </p>
            </div>
            
            {/* Power to the People */}
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-[#009fe3] to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Power to the People</h3>
              <p className="text-gray-700 leading-relaxed">
                This merch helps spread the message, street by street. Every person wearing Reform UK gear is a walking ambassador for democratic change and citizen empowerment.
              </p>
            </div>
            
            {/* Transparent & Ethical */}
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-[#009fe3] to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Transparent & Ethical</h3>
              <p className="text-gray-700 leading-relaxed">
                No gimmicks. No greed. Just purpose-driven gear. We're completely transparent about where your money goes and how it supports the movement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supporter Testimonial Block */}
      <section className="py-16 bg-gradient-to-r from-[#009fe3] to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Quote className="w-16 h-16 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Real Supporters, Real Impact
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Main Testimonial */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100" 
                    alt="Sarah Mitchell"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">Sarah Mitchell</h4>
                    <p className="text-blue-100 text-sm">Manchester Supporter</p>
                  </div>
                </div>
                <p className="text-blue-100 italic leading-relaxed">
                  "I wear it because it sparks conversations. That's where change begins. When people ask about my Reform UK hoodie, it opens the door to real discussions about Britain's future."
                </p>
              </div>
              
              {/* Secondary Testimonial */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100" 
                    alt="David Thompson"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">David Thompson</h4>
                    <p className="text-blue-100 text-sm">Birmingham Volunteer</p>
                  </div>
                </div>
                <p className="text-blue-100 italic leading-relaxed">
                  "Every item I've bought has been excellent quality. But more importantly, I know my purchase is directly funding the grassroots movement we desperately need."
                </p>
              </div>
            </div>
            
            {/* Enhanced Stats with Icons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 text-center">
              <div className="flex flex-col items-center">
                <Package className="w-8 h-8 mb-2 opacity-80" />
                <div className="text-3xl font-bold mb-2">15,000+</div>
                <div className="text-blue-100 text-sm">Items Sold</div>
              </div>
              <div className="flex flex-col items-center">
                <DollarSign className="w-8 h-8 mb-2 opacity-80" />
                <div className="text-3xl font-bold mb-2">£180k+</div>
                <div className="text-blue-100 text-sm">Raised for Reform</div>
              </div>
              <div className="flex flex-col items-center">
                <MapPin className="w-8 h-8 mb-2 opacity-80" />
                <div className="text-3xl font-bold mb-2">650+</div>
                <div className="text-blue-100 text-sm">Cities Reached</div>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-8 h-8 mb-2 opacity-80 fill-current" />
                <div className="text-3xl font-bold mb-2">98%</div>
                <div className="text-blue-100 text-sm">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Quality Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Quality You Can Trust
            </h2>
            {/* Enhanced Summary Line */}
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Every item we ship reflects the care, integrity, and professionalism behind Reform UK.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Premium Materials</h3>
              <p className="text-sm text-gray-600">High-quality fabrics and materials that last</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600 fill-current" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">5-Star Reviews</h3>
              <p className="text-sm text-gray-600">Consistently rated excellent by supporters</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Careful Packaging</h3>
              <p className="text-sm text-gray-600">Every order packed with care and attention</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Satisfaction Guarantee</h3>
              <p className="text-sm text-gray-600">Not happy? We'll make it right</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Block */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-[#009fe3] text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Wear the Change?
            </h2>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Every item is a statement. Every order supports the mission. Join thousands of supporters who are already making their voices heard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button 
                onClick={scrollToShop}
                className="bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
              >
                <span>View the Shop</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={scrollToEmailSignup}
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 inline-flex items-center space-x-2"
              >
                <Users className="w-5 h-5" />
                <span>Join the Movement</span>
              </button>

              {/* TODO: Implement Gift Merch to a Friend functionality in the future */}
              {/*
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 inline-flex items-center space-x-2">
                <Gift className="w-5 h-5" />
                <span>Gift Merch to a Friend</span>
              </button>
              */}
            </div>
            

          </div>
        </div>
      </section>


    </div>
  );
};

export default AboutPage;