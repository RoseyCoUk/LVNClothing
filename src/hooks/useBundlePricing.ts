import { useState, useEffect, useMemo } from 'react';
import { usePrintfulProducts } from './usePrintfulProducts';
import { 
  getBundlePrice, 
  getBundlePriceFromMock, 
  getProductPrice,
  type BundleKey,
  type BundlePricing 
} from '../lib/bundle-pricing';

export interface UseBundlePricingReturn {
  bundlePricing: Record<BundleKey, BundlePricing>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useBundlePricing = (): UseBundlePricingReturn => {
  const { products: printfulProducts, loading: printfulLoading, error: printfulError, refetch: refetchPrintful } = usePrintfulProducts();
  
  // Initialize with fallback pricing immediately
  const [bundlePricing, setBundlePricing] = useState<Record<BundleKey, BundlePricing>>(() => ({
    starter: getBundlePriceFromMock('starter'),
    champion: getBundlePriceFromMock('champion'),
    activist: getBundlePriceFromMock('activist')
  }));
  
  const [loading, setLoading] = useState(false); // Start with false since we have fallback data
  const [error, setError] = useState<string | null>(null);

  // Calculate bundle pricing
  const calculateBundlePricing = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have Printful products and no errors
      if (printfulProducts.length > 0 && !printfulError) {
        try {
          // Use live Printful pricing
          const pricing = await Promise.all([
            getBundlePrice('starter', (productId) => getProductPrice(productId, printfulProducts)),
            getBundlePrice('champion', (productId) => getProductPrice(productId, printfulProducts)),
            getBundlePrice('activist', (productId) => getProductPrice(productId, printfulProducts))
          ]);

          setBundlePricing({
            starter: pricing[0],
            champion: pricing[1],
            activist: pricing[2]
          });
        } catch (apiError) {
          console.warn('Printful API failed, using fallback pricing:', apiError);
          // Use mock pricing when API fails
          setBundlePricing({
            starter: getBundlePriceFromMock('starter'),
            champion: getBundlePriceFromMock('champion'),
            activist: getBundlePriceFromMock('activist')
          });
        }
      } else {
        // Use mock pricing as fallback when no Printful data
        setBundlePricing({
          starter: getBundlePriceFromMock('starter'),
          champion: getBundlePriceFromMock('champion'),
          activist: getBundlePriceFromMock('activist')
        });
      }
    } catch (err) {
      console.error('Error calculating bundle pricing:', err);
      setError('Failed to calculate bundle pricing');
      
      // Always fallback to mock pricing on any error
      setBundlePricing({
        starter: getBundlePriceFromMock('starter'),
        champion: getBundlePriceFromMock('champion'),
        activist: getBundlePriceFromMock('activist')
      });
    } finally {
      setLoading(false);
    }
  };

  // Refetch function
  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      await refetchPrintful();
      await calculateBundlePricing();
    } catch (error) {
      console.error('Error refetching bundle pricing:', error);
      setError('Failed to refresh pricing');
      // Ensure we still have fallback pricing
      setBundlePricing({
        starter: getBundlePriceFromMock('starter'),
        champion: getBundlePriceFromMock('champion'),
        activist: getBundlePriceFromMock('activist')
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate pricing when Printful products change
  useEffect(() => {
    if (!printfulLoading) {
      calculateBundlePricing();
    }
  }, [printfulProducts, printfulLoading, printfulError]);

  // Memoized bundle pricing to prevent unnecessary recalculations
  const memoizedBundlePricing = useMemo(() => bundlePricing, [bundlePricing]);

  return {
    bundlePricing: memoizedBundlePricing,
    loading: loading || printfulLoading,
    error: error || printfulError,
    refetch
  };
};
