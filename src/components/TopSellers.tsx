import { ArrowRight } from 'lucide-react';
import ProductCard from './ui/ProductCard';
import BundleCard from './ui/BundleCard';
import { Product } from '../lib/api';
import { useMergedProducts, MergedProduct } from '../hooks/useMergedProducts';
import { useBundlePricing } from '../hooks/useBundlePricing';
import { useCart } from '../contexts/CartContext';
import { BUNDLES } from '../lib/bundle-pricing';

interface TopSellersProps {
  onViewAllClick?: () => void;
}

const TopSellers = ({ onViewAllClick }: TopSellersProps) => {
  // Use merged products hook for consistent product display
  const { mergedProducts, isLoading: loading, error } = useMergedProducts();
  
  // Use bundle pricing hook
  const { bundlePricing, loading: bundleLoading } = useBundlePricing();
  const { addToCart } = useCart();

  // Helper function to categorize products (consistent with ShopPage)
  const getCategoryForProduct = (product: MergedProduct | Product) => {
    // Handle merged products
    if ('baseProduct' in product) {
      const cat = product.category?.toLowerCase() || '';
      const name = product.name.toLowerCase() || '';
      if (name.includes('hoodie') || name.includes('t-shirt') || name.includes('tshirt') || name.includes('cap') || name.includes('hat')) return 'apparel';
      if (name.includes('mug') || name.includes('keychain') || name.includes('tote') || name.includes('bottle') || name.includes('pad') || name.includes('mouse')) return 'gear';
      if (cat.includes('apparel')) return 'apparel';
      return 'gear'; // Default to gear if not matched
    }
    
    // Handle regular products (fallback)
    const cat = product.category?.toLowerCase() || '';
    const tags = ('tags' in product ? (product.tags || []).map((t: string) => t.toLowerCase()) : []);
    if (cat.includes('bundle') || tags.includes('bundle')) return 'bundles';
    if (cat.includes('apparel') || tags.includes('apparel') || ['t-shirt','tshirt','hoodie','cap','hat'].some(type => cat.includes(type) || tags.includes(type))) return 'apparel';
    if (cat.includes('gear') || tags.includes('gear')) return 'gear';
    // Fallbacks for known gear types
    if (['mug','keychain','tote','bottle','pad','mouse'].some(type => cat.includes(type) || tags.includes(type))) return 'gear';
    return 'gear'; // Default to gear if not matched
  };

  // Helper function to convert MergedProduct to Product format for ProductCard
  const convertToProductFormat = (mergedProduct: MergedProduct): Product => {
    // Generate slug that matches existing route patterns
    const generateSlug = (productName: string, categoryKey: string) => {
      // Handle known merged products to match existing routes
      if (categoryKey === 'tshirt') return 'reform-uk-tshirt';
      if (categoryKey === 'hoodie') return 'reform-uk-hoodie';
      
      // For individual products, use the base product's slug if available
      if (categoryKey.startsWith('individual-') && mergedProduct.baseProduct?.slug) {
        const slug = mergedProduct.baseProduct.slug;
        // If it's not a UUID, use it
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug)) {
          return slug;
        }
      }
      
      // Generate slug from product name as fallback
      return productName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    };

    // Calculate proper price from variants (avoid $0 issue)
    const calculatePrice = () => {
      const validPrices = mergedProduct.variants
        .map(v => v.price)
        .filter(p => p && p > 0);
      
      if (validPrices.length === 0) {
        // Fallback to baseProduct price if available
        const basePrice = mergedProduct.baseProduct?.price_pence;
        return basePrice || 1999; // £19.99 as last resort fallback
      }
      
      return Math.round(Math.min(...validPrices) * 100);
    };

    // Get proper rating from base product or fallback
    const getRating = () => {
      return mergedProduct.baseProduct?.rating || 5.0;
    };

    // Get proper review count from base product or calculate from variants
    const getReviews = () => {
      const baseReviews = mergedProduct.baseProduct?.reviews;
      if (baseReviews && baseReviews > 0) return baseReviews;
      return Math.max(mergedProduct.variants.length * 8, 50); // At least 50 reviews
    };

    return {
      id: mergedProduct.id,
      name: mergedProduct.name,
      variant: null,
      description: mergedProduct.description,
      category: mergedProduct.category,
      price_pence: calculatePrice(),
      image_url: mergedProduct.image_url,
      slug: generateSlug(mergedProduct.name, mergedProduct.id),
      dateAdded: mergedProduct.baseProduct?.dateAdded || new Date().toISOString(),
      created_at: mergedProduct.baseProduct?.created_at || new Date().toISOString(),
      updated_at: mergedProduct.baseProduct?.updated_at || new Date().toISOString(),
      rating: getRating(),
      reviews: getReviews(),
      tags: mergedProduct.baseProduct?.tags || [],
      // Preserve variants for cart functionality
      variants: mergedProduct.variants
    } as Product & { variants: typeof mergedProduct.variants };
  };

  // Convert merged products to product format for display
  const products = mergedProducts.map(convertToProductFormat);

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

        {/* Bundles Section */}
        {!bundleLoading && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Value Bundles - Save Big!</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(['starter', 'champion', 'activist'] as const).map((bundleKey) => (
                <BundleCard
                  key={bundleKey}
                  bundleKey={bundleKey}
                  price={bundlePricing[bundleKey].price}
                  originalPrice={bundlePricing[bundleKey].originalPrice}
                  onAddToCart={() => {
                    // Add bundle items to cart
                    const bundle = BUNDLES[bundleKey];
                    bundle.products.forEach(product => {
                      // Add default variant for each product in bundle
                      addToCart({
                        id: `bundle-${bundleKey}-${product.productId}`,
                        name: product.name,
                        price: 0, // Price handled at bundle level
                        image: '',
                        category: 'bundle',
                        quantity: 1
                      });
                    });
                  }}
                />
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