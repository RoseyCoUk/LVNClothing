import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { getProducts, Product } from '../lib/api';

interface TopSellersProps {
  onViewAllClick?: () => void;
}

const TopSellers = ({ onViewAllClick }: TopSellersProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Helper function to categorize products (same as ShopPage)
  const getCategoryForProduct = (product: Product) => {
    const cat = product.category?.toLowerCase() || '';
    const tags = (product.tags || []).map((t: string) => t.toLowerCase());
    if (cat.includes('bundle') || tags.includes('bundle')) return 'bundles';
    if (cat.includes('apparel') || tags.includes('apparel') || ['t-shirt','tshirt','hoodie','cap','hat'].some(type => cat.includes(type) || tags.includes(type))) return 'apparel';
    if (cat.includes('gear') || tags.includes('gear')) return 'gear';
    // Fallbacks for known gear types
    if (['mug','keychain','tote','bottle','pad','mouse','sticker'].some(type => cat.includes(type) || tags.includes(type))) return 'gear';
    return 'gear'; // Default to gear if not matched
  };

  // Get top selling apparel products (first 3)
  const apparelProducts = products
    .filter(product => getCategoryForProduct(product) === 'apparel')
    .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    .slice(0, 3);

  // Get top selling gear products (first 3)
  const gearProducts = products
    .filter(product => getCategoryForProduct(product) === 'gear')
    .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    .slice(0, 3);

  if (loading) {
    return (
      <section id="top-sellers" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading top sellers...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="top-sellers" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">Error: {error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
        {apparelProducts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Top Selling Apparel</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {apparelProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Gear & Goods Section */}
        {gearProducts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Top Selling Gear & Goods</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gearProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

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