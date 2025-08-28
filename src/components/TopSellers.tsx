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
    if (['mug','keychain','tote','bottle','pad','mouse'].some(type => cat.includes(type) || tags.includes(type))) return 'gear';
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

  // Generate structured data for SEO
  const generateProductStructuredData = (products: Product[]) => {
    const itemListElement = products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "@id": `https://lvnclothing.com/product/${product.slug}`,
        "name": product.name,
        "description": product.description,
        "image": product.image_url,
        "brand": {
          "@type": "Brand",
          "name": "LVN Clothing"
        },
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "GBP",
          "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "LVN Clothing"
          }
        },
        "category": product.category,
        "aggregateRating": product.reviews ? {
          "@type": "AggregateRating",
          "ratingValue": "5",
          "reviewCount": product.reviews,
          "bestRating": "5",
          "worstRating": "1"
        } : undefined
      }
    }));

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "LVN Clothing Featured Collection",
      "description": "Premium Christian streetwear inspired by Matthew 13:33",
      "numberOfItems": products.length,
      "itemListElement": itemListElement
    };
  };

  // Inject structured data
  useEffect(() => {
    if (products.length > 0) {
      const structuredData = generateProductStructuredData([...apparelProducts, ...gearProducts]);
      
      // Remove existing structured data
      const existingScript = document.getElementById('featured-products-structured-data');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.id = 'featured-products-structured-data';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [products, apparelProducts, gearProducts]);

  if (loading) {
    return (
      <section id="featured-products" className="py-16 bg-lvnBg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lvn-maroon mx-auto"></div>
            <p className="mt-4 text-lvn-black/70">Loading featured products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="featured-products" className="py-16 bg-lvnBg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-none p-4">
              <p className="text-red-800">Error: {error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-products" className="py-16 bg-lvnBg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-lvn-black mb-4">
            Featured Collection
          </h2>
          <p className="text-lg text-lvn-black/70 max-w-2xl mx-auto scripture-quote">
            "Shelter. Strength. Style."
          </p>
          <p className="text-lvn-maroon font-medium mt-2">Matthew 13:33 Inspired Apparel</p>
        </div>
        
        {/* Apparel Section */}
        {apparelProducts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-lvn-black mb-6 text-center">Premium Clothing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {apparelProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
        
        {/* Gear Section */}
        {gearProducts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-lvn-black mb-6 text-center">Accessories & Lifestyle</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gearProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
        
        {/* View All Button */}
        <div className="text-center">
          <button
            onClick={onViewAllClick}
            className="btn-lvn-primary inline-flex items-center space-x-2 text-lg"
          >
            <span>View Full Collection</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-lvn-black/60 mt-3">
            Free UK shipping on orders over £60
          </p>
        </div>
      </div>
    </section>
  );
};

export default TopSellers;