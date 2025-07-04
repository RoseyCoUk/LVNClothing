import React, { useState } from 'react';
import { Star, Eye, Clock, ArrowRight } from 'lucide-react';
// useCart is no longer needed on this page, but we'll leave the import in case you use it elsewhere.
import { useCart } from '../contexts/CartContext';

interface TopSellersProps {
  onProductClick: (productId: number) => void;
  onViewAllClick?: () => void;
}

const TopSellers = ({ onProductClick, onViewAllClick }: TopSellersProps) => {

  // --- Product data is updated with image and hoverImage properties ---
  const apparelProducts = [
    {
      id: 1,
      name: "Reform UK Hoodie",
      price: 34.99,
      image: "Hoodie/Men/ReformMenHoodieBlack1.webp",
      hoverImage: "Hoodie/Men/ReformMenHoodieBlack2.webp",
      rating: 5,
      shipping: "Ships in 48H"
    },
    {
      id: 2,
      name: "Reform UK T-Shirt",
      price: 19.99,
      image: "Tshirt/Men/ReformMenTshirtWhite1.webp",
      hoverImage: "Tshirt/Men/ReformMenTshirtWhite2.webp",
      rating: 5,
      shipping: "Ships in 48H"
    },
    {
      id: 3,
      name: "Reform UK Cap",
      price: 48.99,
      image: "Cap/ReformCapBlue1.webp",
      hoverImage: "Cap/ReformCapBlack2.webp",
      rating: 5,
      shipping: "Ships in 48H"
    }
  ];

  const gearProducts = [
    {
      id: 6,
      name: "Reform UK Mug",
      price: 12.99,
      image: "MugMouse/ReformMug1.webp",
      hoverImage: "MugMouse/ReformMug5.webp",
      rating: 4,
      shipping: "Ships in 48H"
    },
    {
      id: 8,
      name: "Reform UK Stickers",
      price: 9.99,
      image: "StickerToteWater/ReformStickersMain2.webp",
      hoverImage: "StickerToteWater/ReformStickersMain3.webp",
      rating: 5,
      shipping: "Ships in 48H"
    },
    {
      id: 9,
      name: "Reform UK Badge Set",
      price: 9.99,
      image: "Badge/ReformBadgeSetMain3.webp",
      hoverImage: "Badge/ReformBadgeSetMain5.webp",
      rating: 5,
      shipping: "Ships in 48H"
    }
  ];

  // State to track which product card is being hovered over
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  const ProductCard = ({ product }: { product: typeof apparelProducts[0] }) => (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 group cursor-pointer flex flex-col"
      onClick={() => onProductClick(product.id)}
      onMouseEnter={() => setHoveredProduct(product.id)}
      onMouseLeave={() => setHoveredProduct(null)}
    >
      <div className="relative overflow-hidden rounded-t-lg aspect-square">
        {/* --- FIX: Image source changes on hover --- */}
        <img
          src={hoveredProduct === product.id ? product.hoverImage : product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-2">({product.rating}.0)</span>
        </div>

        <div className="flex-grow"></div>

        <div className="flex items-center justify-between mb-4 mt-2">
            <span className="text-lg font-bold text-[#009fe3]">£{product.price.toFixed(2)}</span>
            <div className="text-xs text-green-600 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                <span>{product.shipping}</span>
            </div>
        </div>

        {/* --- FIX: Replaced "Add to Cart" with "View Options" button --- */}
        <button
          onClick={() => onProductClick(product.id)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Eye className="w-4 h-4" />
          <span>View Options</span>
        </button>
      </div>
    </div>
  );

  return (
    <section id="top-sellers" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop Official Reform UK Merch
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Support the movement. Every purchase powers the mission.
          </p>
        </div>
        
        {/* Apparel Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Top Selling Apparel</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {apparelProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Gear & Goods Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Top Selling Gear & Goods</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gearProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <button 
            onClick={onViewAllClick}
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <span>View All Merch</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopSellers;