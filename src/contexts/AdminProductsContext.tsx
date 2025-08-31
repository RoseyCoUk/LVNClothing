import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { adminProductsAPI, ProductOverride, ProductImage, Bundle, BundleItem, BundleImage, BundleReview, BundleDetails, PrintfulSyncStatus, ImageUploadResult } from '../lib/admin-products-api';

// Context state interface
interface AdminProductsState {
  // Products
  products: any[]; // Will be Product[] once we define the interface
  productsLoading: boolean;
  productsError: string | null;
  
  // Product Overrides
  productOverrides: ProductOverride[];
  productOverridesLoading: boolean;
  productOverridesError: string | null;
  
  // Product Images
  productImages: Record<string, ProductImage[]>; // productId -> images[]
  productImagesLoading: Record<string, boolean>;
  productImagesError: Record<string, string | null>;
  
  // Bundles
  bundles: Bundle[];
  bundlesLoading: boolean;
  bundlesError: string | null;
  
  // Bundle Items
  bundleItems: Record<string, BundleItem[]>; // bundleId -> items[]
  bundleItemsLoading: Record<string, boolean>;
  bundleItemsError: Record<string, string | null>;
  
  // Bundle Images
  bundleImages: Record<string, BundleImage[]>; // bundleId -> images[]
  bundleImagesLoading: Record<string, boolean>;
  bundleImagesError: Record<string, string | null>;
  
  // Bundle Reviews
  bundleReviews: Record<string, BundleReview[]>; // bundleId -> reviews[]
  bundleReviewsLoading: Record<string, boolean>;
  bundleReviewsError: Record<string, string | null>;
  
  // Printful Sync Status
  printfulSyncStatus: PrintfulSyncStatus[];
  printfulSyncStatusLoading: boolean;
  printfulSyncStatusError: string | null;
  
  // Real-time sync status
  syncStatus: {
    lastSync: string | null;
    isSyncing: boolean;
    syncProgress: number;
    syncErrors: string[];
  };

  // Real-time sync monitoring
  realTimeSyncStatus: {
    isConnected: boolean;
    connectionHealth: 'excellent' | 'good' | 'poor' | 'disconnected';
    lastSync: string | null;
    lastSyncStatus: 'success' | 'failed' | 'pending' | 'unknown';
    errorCount: number;
    warningCount: number;
    inventoryChanges: number;
    dataConflicts: number;
  };
}

  // Context actions interface
interface AdminProductsActions {
  // Products
  fetchProducts: () => Promise<void>;
  createProduct: (product: any) => Promise<any>;
  updateProduct: (id: string, updates: any) => Promise<any>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Product Overrides
  fetchProductOverrides: (printfulProductId?: string) => Promise<void>;
  createProductOverride: (override: Omit<ProductOverride, 'id' | 'created_at' | 'updated_at'>) => Promise<ProductOverride>;
  updateProductOverride: (id: string, updates: Partial<ProductOverride>) => Promise<ProductOverride>;
  deleteProductOverride: (id: string) => Promise<void>;
  bulkUpdateProductOverrides: (overrides: Array<{ id: string; updates: Partial<ProductOverride> }>) => Promise<void>;
  bulkDeleteProductOverrides: (ids: string[]) => Promise<void>;
  
  // Product Images
  fetchProductImages: (productId: string) => Promise<void>;
  createProductImage: (image: Omit<ProductImage, 'id' | 'created_at'>) => Promise<ProductImage>;
  updateProductImage: (id: string, updates: Partial<ProductImage>) => Promise<ProductImage>;
  deleteProductImage: (id: string) => Promise<void>;
  reorderProductImages: (productId: string, imageIds: string[]) => Promise<void>;
  
  // Bundles
  fetchBundles: (includeItems?: boolean) => Promise<void>;
  getBundleDetails: (bundleId: string) => Promise<BundleDetails | null>;
  getBundleSavings: (bundleId: string) => Promise<any>;
  createBundle: (bundle: Omit<Bundle, 'id' | 'created_at' | 'updated_at'>, items?: Omit<BundleItem, 'id' | 'bundle_id' | 'created_at'>[]) => Promise<Bundle>;
  updateBundle: (id: string, updates: Partial<Bundle>) => Promise<Bundle>;
  deleteBundle: (id: string) => Promise<void>;
  
  // Bundle Items
  fetchBundleItems: (bundleId: string) => Promise<void>;
  addBundleItem: (item: Omit<BundleItem, 'id' | 'created_at'>) => Promise<BundleItem>;
  updateBundleItem: (id: string, updates: Partial<BundleItem>) => Promise<BundleItem>;
  removeBundleItem: (id: string) => Promise<void>;
  
  // Bundle Images
  fetchBundleImages: (bundleId: string) => Promise<void>;
  addBundleImage: (image: Omit<BundleImage, 'id' | 'created_at'>) => Promise<BundleImage>;
  updateBundleImage: (id: string, updates: Partial<BundleImage>) => Promise<BundleImage>;
  deleteBundleImage: (id: string) => Promise<void>;
  
  // Bundle Reviews
  fetchBundleReviews: (bundleId: string) => Promise<void>;
  addBundleReview: (review: Omit<BundleReview, 'id' | 'created_at'>) => Promise<BundleReview>;
  updateBundleReview: (id: string, updates: Partial<BundleReview>) => Promise<BundleReview>;
  deleteBundleReview: (id: string) => Promise<void>;
  
  // Image Upload/Download
  uploadImage: (file: File, bucket: 'product-images' | 'admin-assets', path: string) => Promise<ImageUploadResult>;
  deleteImage: (bucket: 'product-images' | 'admin-assets', path: string) => Promise<void>;
  getImageUrl: (bucket: 'product-images' | 'admin-assets', path: string) => Promise<string>;
  
  // Printful Sync
  fetchPrintfulSyncStatus: (productId?: string) => Promise<void>;
  triggerPrintfulSync: (productId: string) => Promise<void>;
  
  // Real-time Sync Monitoring
  getPrintfulSyncStatus: () => Promise<any>;
  getSyncErrors: () => Promise<any[]>;
  getInventoryChanges: () => Promise<any[]>;
  getDataConflicts: () => Promise<any[]>;
  resolveDataConflict: (conflictId: string, resolution: string) => Promise<void>;
  markErrorResolved: (errorId: string) => Promise<void>;
  markInventoryChangeProcessed: (changeId: string) => Promise<void>;
  
  // Utility functions
  clearErrors: () => void;
  refreshAll: () => Promise<void>;
}

// Combined context type
interface AdminProductsContextType extends AdminProductsState, AdminProductsActions {}

// Create context
const AdminProductsContext = createContext<AdminProductsContextType | undefined>(undefined);

// Hook to use the context
export const useAdminProducts = () => {
  const context = useContext(AdminProductsContext);
  if (!context) {
    throw new Error('useAdminProducts must be used within an AdminProductsProvider');
  }
  return context;
};

// Provider props
interface AdminProductsProviderProps {
  children: ReactNode;
}

// Provider component
export const AdminProductsProvider: React.FC<AdminProductsProviderProps> = ({ children }) => {
  // State
  const [state, setState] = useState<AdminProductsState>({
    products: [],
    productsLoading: false,
    productsError: null,
    
    productOverrides: [],
    productOverridesLoading: false,
    productOverridesError: null,
    
    productImages: {},
    productImagesLoading: {},
    productImagesError: {},
    
    bundles: [],
    bundlesLoading: false,
    bundlesError: null,
    
    bundleItems: {},
    bundleItemsLoading: {},
    bundleItemsError: {},
    
    bundleImages: {},
    bundleImagesLoading: {},
    bundleImagesError: {},
    
    bundleReviews: {},
    bundleReviewsLoading: {},
    bundleReviewsError: {},
    
    printfulSyncStatus: [],
    printfulSyncStatusLoading: false,
    printfulSyncStatusError: null,
    
    syncStatus: {
      lastSync: null,
      isSyncing: false,
      syncProgress: 0,
      syncErrors: []
    },

    // Real-time sync monitoring state
    realTimeSyncStatus: {
      isConnected: false,
      connectionHealth: 'disconnected' as const,
      lastSync: null,
      lastSyncStatus: 'unknown' as const,
      errorCount: 0,
      warningCount: 0,
      inventoryChanges: 0,
      dataConflicts: 0
    }
  });

  // Helper function to update state
  const updateState = useCallback((updates: Partial<AdminProductsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Helper function to update nested state
  const updateNestedState = useCallback(<K extends keyof AdminProductsState>(
    key: K,
    updates: Partial<AdminProductsState[K]>
  ) => {
    setState(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }));
  }, []);

  // Product Overrides Actions
  const fetchProductOverrides = useCallback(async (printfulProductId?: string) => {
    updateState({ productOverridesLoading: true, productOverridesError: null });
    
    try {
      const data = await adminProductsAPI.getProductOverrides(printfulProductId);
      updateState({ productOverrides: data, productOverridesLoading: false });
    } catch (error) {
      updateState({ 
        productOverridesError: error instanceof Error ? error.message : 'Failed to fetch product overrides',
        productOverridesLoading: false 
      });
    }
  }, [updateState]);

  const createProductOverride = useCallback(async (override: Omit<ProductOverride, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = await adminProductsAPI.createProductOverride(override);
      updateState(prev => ({
        productOverrides: [data, ...prev.productOverrides]
      }));
      return data;
    } catch (error) {
      throw error;
    }
  }, [updateState]);

  const updateProductOverride = useCallback(async (id: string, updates: Partial<ProductOverride>) => {
    try {
      const data = await adminProductsAPI.updateProductOverride(id, updates);
      updateState(prev => ({
        productOverrides: prev.productOverrides.map(override => 
          override.id === id ? data : override
        )
      }));
      return data;
    } catch (error) {
      throw error;
    }
  }, [updateState]);

  const deleteProductOverride = useCallback(async (id: string) => {
    try {
      await adminProductsAPI.deleteProductOverride(id);
      updateState(prev => ({
        productOverrides: prev.productOverrides.filter(override => override.id !== id)
      }));
    } catch (error) {
      throw error;
    }
  }, [updateState]);

  const bulkUpdateProductOverrides = useCallback(async (overrides: Array<{ id: string; updates: Partial<ProductOverride> }>) => {
    try {
      await adminProductsAPI.bulkUpdateProductOverrides(overrides);
      // Refresh the list to get updated data
      await fetchProductOverrides();
    } catch (error) {
      throw error;
    }
  }, [fetchProductOverrides]);

  const bulkDeleteProductOverrides = useCallback(async (ids: string[]) => {
    try {
      await adminProductsAPI.bulkDeleteProductOverrides(ids);
      updateState(prev => ({
        productOverrides: prev.productOverrides.filter(override => !ids.includes(override.id))
      }));
    } catch (error) {
      throw error;
    }
  }, [updateState]);

  // Products Actions
  const fetchProducts = useCallback(async () => {
    updateState({ productsLoading: true, productsError: null });
    
    try {
      const data = await adminProductsAPI.getProducts();
      updateState({ products: data, productsLoading: false });
    } catch (error) {
      updateState({ 
        productsError: error instanceof Error ? error.message : 'Failed to fetch products',
        productsLoading: false 
      });
    }
  }, [updateState]);

  const createProduct = useCallback(async (product: any) => {
    try {
      const data = await adminProductsAPI.createProduct(product);
      updateState(prev => ({
        products: [data, ...prev.products]
      }));
      return data;
    } catch (error) {
      throw error;
    }
  }, [updateState]);

  const updateProduct = useCallback(async (id: string, updates: any) => {
    try {
      const data = await adminProductsAPI.updateProduct(id, updates);
      updateState(prev => ({
        products: prev.products.map(product => 
          product.id === id ? data : product
        )
      }));
      return data;
    } catch (error) {
      throw error;
    }
  }, [updateState]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await adminProductsAPI.deleteProduct(id);
      updateState(prev => ({
        products: prev.products.filter(product => product.id !== id)
      }));
    } catch (error) {
      throw error;
    }
  }, [updateState]);

  // Product Images Actions
  const fetchProductImages = useCallback(async (productId: string) => {
    console.log(`🔍 [Context] fetchProductImages called for product: ${productId}`);
    updateNestedState('productImagesLoading', { [productId]: true });
    updateNestedState('productImagesError', { [productId]: null });
    
    try {
      const data = await adminProductsAPI.getProductImages(productId);
      console.log(`✅ [Context] fetchProductImages success for product: ${productId}`, data);
      updateNestedState('productImages', { [productId]: data });
      updateNestedState('productImagesLoading', { [productId]: false });
      console.log(`🔄 [Context] State updated for product: ${productId}`);
    } catch (error) {
      console.error(`❌ [Context] fetchProductImages error for product: ${productId}`, error);
      updateNestedState('productImagesError', { 
        [productId]: error instanceof Error ? error.message : 'Failed to fetch product images' 
      });
      updateNestedState('productImagesLoading', { [productId]: false });
    }
  }, [updateNestedState]);

  const createProductImage = useCallback(async (image: Omit<ProductImage, 'id' | 'created_at'>) => {
    try {
      const data = await adminProductsAPI.createProductImage(image);
      updateNestedState('productImages', prev => ({
        ...prev,
        [image.product_id]: [...(prev[image.product_id] || []), data]
      }));
      return data;
    } catch (error) {
      throw error;
    }
  }, [updateNestedState]);

  const updateProductImage = useCallback(async (id: string, updates: Partial<ProductImage>) => {
    try {
      const data = await adminProductsAPI.updateProductImage(id, updates);
      updateNestedState('productImages', prev => ({
        ...prev,
        [data.product_id]: prev[data.product_id]?.map(img => 
          img.id === id ? data : img
        ) || []
      }));
      return data;
    } catch (error) {
      throw error;
    }
  }, [updateNestedState]);

  const deleteProductImage = useCallback(async (id: string) => {
    try {
      await adminProductsAPI.deleteProductImage(id);
      // Find which product this image belongs to and remove it
      updateNestedState('productImages', prev => {
        const newImages = { ...prev };
        Object.keys(newImages).forEach(productId => {
          newImages[productId] = newImages[productId].filter(img => img.id !== id);
        });
        return newImages;
      });
    } catch (error) {
      throw error;
    }
  }, [updateNestedState]);

  const reorderProductImages = useCallback(async (productId: string, imageIds: string[]) => {
    try {
      await adminProductsAPI.reorderProductImages(productId, imageIds);
      // Refresh the images for this product
      await fetchProductImages(productId);
    } catch (error) {
      throw error;
    }
  }, [fetchProductImages]);

  // Bundles Actions
  const fetchBundles = useCallback(async (includeItems: boolean = false) => {
    updateState({ bundlesLoading: true, bundlesError: null });
    
    try {
      const data = await adminProductsAPI.getBundles(includeItems);
      updateState({ bundles: data, bundlesLoading: false });
    } catch (error) {
      updateState({ 
        bundlesError: error instanceof Error ? error.message : 'Failed to fetch bundles',
        bundlesLoading: false 
      });
    }
  }, [updateState]);

  const createBundle = useCallback(async (bundle: Omit<Bundle, 'id' | 'created_at' | 'updated_at'>, items?: Omit<BundleItem, 'id' | 'bundle_id' | 'created_at'>[]) => {
    try {
      const data = await adminProductsAPI.createBundle(bundle, items);
      updateState(prev => ({
        bundles: [data, ...prev.bundles]
      }));
      return data;
    } catch (error) {
      throw error;
    }
  }, [updateState]);

  const updateBundle = useCallback(async (id: string, updates: Partial<Bundle>) => {
    try {
      const data = await adminProductsAPI.updateBundle(id, updates);
      updateState(prev => ({
        bundles: prev.bundles.map(bundle => 
          bundle.id === id ? data : bundle
        )
      }));
      return data;
    } catch (error) {
      throw error;
    }
  }, [updateState]);

  const deleteBundle = useCallback(async (id: string) => {
    try {
      await adminProductsAPI.deleteBundle(id);
      updateState(prev => ({
        bundles: prev.bundles.filter(bundle => bundle.id !== id)
      }));
      // Also remove bundle items
      updateNestedState('bundleItems', { [id]: [] });
    } catch (error) {
      throw error;
    }
  }, [updateState, updateNestedState]);

  const getBundleDetails = useCallback(async (bundleId: string) => {
    try {
      return await adminProductsAPI.getBundleDetails(bundleId);
    } catch (error) {
      throw error;
    }
  }, []);

  const getBundleSavings = useCallback(async (bundleId: string) => {
    try {
      return await adminProductsAPI.getBundleSavings(bundleId);
    } catch (error) {
      throw error;
    }
  }, []);

  // Bundle Items Actions
  const fetchBundleItems = useCallback(async (bundleId: string) => {
    updateNestedState('bundleItemsLoading', { [bundleId]: true });
    updateNestedState('bundleItemsError', { [bundleId]: null });
    
    try {
      const data = await adminProductsAPI.getBundleItems(bundleId);
      updateNestedState('bundleItems', { [bundleId]: data });
      updateNestedState('bundleItemsLoading', { [bundleId]: false });
    } catch (error) {
      updateNestedState('bundleItemsError', { 
        [bundleId]: error instanceof Error ? error.message : 'Failed to fetch bundle items' 
      });
      updateNestedState('bundleItemsLoading', { [bundleId]: false });
    }
  }, [updateNestedState]);

  const addBundleItem = useCallback(async (item: Omit<BundleItem, 'id' | 'created_at'>) => {
    try {
      const data = await adminProductsAPI.addBundleItem(item);
      updateNestedState('bundleItems', prev => ({
        ...prev,
        [item.bundle_id]: [...(prev[item.bundle_id] || []), data]
      }));
      return data;
    } catch (error) {
      throw error;
    }
  }, [updateNestedState]);

  const updateBundleItem = useCallback(async (id: string, updates: Partial<BundleItem>) => {
    try {
      const data = await adminProductsAPI.updateBundleItem(id, updates);
      updateNestedState('bundleItems', prev => ({
        ...prev,
        [data.bundle_id]: prev[data.bundle_id]?.map(item => 
          item.id === id ? data : item
        ) || []
      }));
      return data;
    } catch (error) {
      throw error;
    }
  }, [updateNestedState]);

  const removeBundleItem = useCallback(async (id: string) => {
    try {
      await adminProductsAPI.removeBundleItem(id);
      // Find which bundle this item belongs to and remove it
      updateNestedState('bundleItems', prev => {
        const newItems = { ...prev };
        Object.keys(newItems).forEach(bundleId => {
          newItems[bundleId] = newItems[bundleId].filter(item => item.id !== id);
        });
        return newItems;
      });
    } catch (error) {
      throw error;
    }
  }, [updateNestedState]);

  // Bundle Images Actions
  const fetchBundleImages = useCallback(async (bundleId: string) => {
    updateNestedState('bundleImagesLoading', { [bundleId]: true });
    updateNestedState('bundleImagesError', { [bundleId]: null });
    
    try {
      const data = await adminProductsAPI.getBundleImages(bundleId);
      updateNestedState('bundleImages', { [bundleId]: data });
      updateNestedState('bundleImagesLoading', { [bundleId]: false });
    } catch (error) {
      updateNestedState('bundleImagesError', { 
        [bundleId]: error instanceof Error ? error.message : 'Failed to fetch bundle images' 
      });
      updateNestedState('bundleImagesLoading', { [bundleId]: false });
    }
  }, [updateNestedState]);

  const addBundleImage = useCallback(async (image: Omit<BundleImage, 'id' | 'created_at'>) => {
    try {
      const data = await adminProductsAPI.addBundleImage(image);
      updateNestedState('bundleImages', (prev: Record<string, BundleImage[]>) => ({
        ...prev,
        [image.bundle_id]: [...(prev[image.bundle_id] || []), data]
      }));
      return data;
    } catch (error) {
      throw error;
    }
  }, [updateNestedState]);

  const updateBundleImage = useCallback(async (id: string, updates: Partial<BundleImage>) => {
    try {
      const data = await adminProductsAPI.updateBundleImage(id, updates);
      // Update the image in the context
      updateNestedState('bundleImages', (prev: Record<string, BundleImage[]>) => {
        const newState = { ...prev };
        Object.keys(newState).forEach(bundleId => {
          newState[bundleId] = newState[bundleId].map(image =>
            image.id === id ? data : image
          );
        });
        return newState;
      });
      return data;
    } catch (error) {
      throw error;
    }
  }, [updateNestedState]);

  const deleteBundleImage = useCallback(async (id: string) => {
    try {
      await adminProductsAPI.deleteBundleImage(id);
      // Remove the image from context
      updateNestedState('bundleImages', (prev: Record<string, BundleImage[]>) => {
        const newState = { ...prev };
        Object.keys(newState).forEach(bundleId => {
          newState[bundleId] = newState[bundleId].filter(image => image.id !== id);
        });
        return newState;
      });
    } catch (error) {
      throw error;
    }
  }, [updateNestedState]);

  // Bundle Reviews Actions
  const fetchBundleReviews = useCallback(async (bundleId: string) => {
    updateNestedState('bundleReviewsLoading', { [bundleId]: true });
    updateNestedState('bundleReviewsError', { [bundleId]: null });
    
    try {
      const data = await adminProductsAPI.getBundleReviews(bundleId);
      updateNestedState('bundleReviews', { [bundleId]: data });
      updateNestedState('bundleReviewsLoading', { [bundleId]: false });
    } catch (error) {
      updateNestedState('bundleReviewsError', { 
        [bundleId]: error instanceof Error ? error.message : 'Failed to fetch bundle reviews' 
      });
      updateNestedState('bundleReviewsLoading', { [bundleId]: false });
    }
  }, [updateNestedState]);

  const addBundleReview = useCallback(async (review: Omit<BundleReview, 'id' | 'created_at'>) => {
    try {
      const data = await adminProductsAPI.addBundleReview(review);
      updateNestedState('bundleReviews', (prev: Record<string, BundleReview[]>) => ({
        ...prev,
        [review.bundle_id]: [data, ...(prev[review.bundle_id] || [])]
      }));
      return data;
    } catch (error) {
      throw error;
    }
  }, [updateNestedState]);

  const updateBundleReview = useCallback(async (id: string, updates: Partial<BundleReview>) => {
    try {
      const data = await adminProductsAPI.updateBundleReview(id, updates);
      // Update the review in the context
      updateNestedState('bundleReviews', (prev: Record<string, BundleReview[]>) => {
        const newState = { ...prev };
        Object.keys(newState).forEach(bundleId => {
          newState[bundleId] = newState[bundleId].map(review =>
            review.id === id ? data : review
          );
        });
        return newState;
      });
      return data;
    } catch (error) {
      throw error;
    }
  }, [updateNestedState]);

  const deleteBundleReview = useCallback(async (id: string) => {
    try {
      await adminProductsAPI.deleteBundleReview(id);
      // Remove the review from context
      updateNestedState('bundleReviews', (prev: Record<string, BundleReview[]>) => {
        const newState = { ...prev };
        Object.keys(newState).forEach(bundleId => {
          newState[bundleId] = newState[bundleId].filter(review => review.id !== id);
        });
        return newState;
      });
    } catch (error) {
      throw error;
    }
  }, [updateNestedState]);

  // Image Upload/Download Actions
  const uploadImage = useCallback(async (file: File, bucket: 'product-images' | 'admin-assets', path: string) => {
    try {
      const result = await adminProductsAPI.uploadImage(file, bucket, path);
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteImage = useCallback(async (bucket: 'product-images' | 'admin-assets', path: string) => {
    try {
      await adminProductsAPI.deleteImage(bucket, path);
    } catch (error) {
      throw error;
    }
  }, []);

  const getImageUrl = useCallback(async (bucket: 'product-images' | 'admin-assets', path: string) => {
    try {
      const url = await adminProductsAPI.getImageUrl(bucket, path);
      return url;
    } catch (error) {
      throw error;
    }
  }, []);

  // Printful Sync Actions
  const fetchPrintfulSyncStatus = useCallback(async (productId?: string) => {
    updateState({ printfulSyncStatusLoading: true, printfulSyncStatusError: null });
    
    try {
      const data = await adminProductsAPI.getPrintfulSyncStatus(productId);
      updateState({ printfulSyncStatus: data, printfulSyncStatusLoading: false });
    } catch (error) {
      updateState({ 
        printfulSyncStatusError: error instanceof Error ? error.message : 'Failed to fetch Printful sync status',
        printfulSyncStatusLoading: false 
      });
    }
  }, [updateState]);

  const triggerPrintfulSync = useCallback(async (productId: string) => {
    try {
      updateNestedState('syncStatus', { isSyncing: true, syncProgress: 0 });
      await adminProductsAPI.triggerPrintfulSync(productId);
      
      // Simulate sync progress (in real implementation, this would come from a webhook or polling)
      const progressInterval = setInterval(() => {
        updateNestedState('syncStatus', prev => ({
          ...prev,
          syncProgress: Math.min(prev.syncProgress + 20, 90)
        }));
      }, 500);
      
      // Complete sync after a delay (simulate)
      setTimeout(() => {
        clearInterval(progressInterval);
        updateNestedState('syncStatus', {
          isSyncing: false,
          syncProgress: 100,
          lastSync: new Date().toISOString()
        });
        // Refresh sync status
        fetchPrintfulSyncStatus();
      }, 3000);
      
    } catch (error) {
      updateNestedState('syncStatus', {
        isSyncing: false,
        syncProgress: 0,
        syncErrors: [error instanceof Error ? error.message : 'Sync failed']
      });
      throw error;
    }
  }, [updateNestedState, fetchPrintfulSyncStatus]);

  // Utility Actions
  const clearErrors = useCallback(() => {
    updateState({
      productOverridesError: null,
      bundlesError: null,
      printfulSyncStatusError: null
    });
    updateNestedState('productImagesError', {});
    updateNestedState('bundleItemsError', {});
    updateNestedState('syncStatus', { syncErrors: [] });
  }, [updateState, updateNestedState]);

  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        fetchProducts(),
        fetchProductOverrides(),
        fetchBundles(),
        fetchPrintfulSyncStatus()
      ]);
    } catch (error) {
      console.error('Error refreshing all data:', error);
    }
  }, [fetchProducts, fetchProductOverrides, fetchBundles, fetchPrintfulSyncStatus]);

  // Real-time Sync Monitoring Actions
  const getPrintfulSyncStatus = useCallback(async () => {
    try {
      const status = await adminProductsAPI.getPrintfulSyncStatus();
      updateState({ realTimeSyncStatus: status });
      return status;
    } catch (error) {
      console.error('Failed to get sync status:', error);
      throw error;
    }
  }, [updateState]);

  const getSyncErrors = useCallback(async () => {
    try {
      const errors = await adminProductsAPI.getSyncErrors();
      return errors;
    } catch (error) {
      console.error('Failed to get sync errors:', error);
      throw error;
    }
  }, []);

  const getInventoryChanges = useCallback(async () => {
    try {
      const changes = await adminProductsAPI.getInventoryChanges();
      return changes;
    } catch (error) {
      console.error('Failed to get inventory changes:', error);
      throw error;
    }
  }, []);

  const getDataConflicts = useCallback(async () => {
    try {
      const conflicts = await adminProductsAPI.getDataConflicts();
      return conflicts;
    } catch (error) {
      console.error('Failed to get data conflicts:', error);
      throw error;
    }
  }, []);

  const resolveDataConflict = useCallback(async (conflictId: string, resolution: string) => {
    try {
      await adminProductsAPI.resolveDataConflict(conflictId, resolution);
    } catch (error) {
      console.error('Failed to resolve data conflict:', error);
      throw error;
    }
  }, []);

  const markErrorResolved = useCallback(async (errorId: string) => {
    try {
      await adminProductsAPI.markErrorResolved(errorId);
    } catch (error) {
      console.error('Failed to mark error resolved:', error);
      throw error;
    }
  }, []);

  const markInventoryChangeProcessed = useCallback(async (changeId: string) => {
    try {
      await adminProductsAPI.markInventoryChangeProcessed(changeId);
    } catch (error) {
      console.error('Failed to mark inventory change processed:', error);
      throw error;
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Context value
  const value: AdminProductsContextType = {
    ...state,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchProductOverrides,
    createProductOverride,
    updateProductOverride,
    deleteProductOverride,
    bulkUpdateProductOverrides,
    bulkDeleteProductOverrides,
    fetchProductImages,
    createProductImage,
    updateProductImage,
    deleteProductImage,
    reorderProductImages,
    fetchBundles,
    getBundleDetails,
    getBundleSavings,
    createBundle,
    updateBundle,
    deleteBundle,
    fetchBundleItems,
    addBundleItem,
    updateBundleItem,
    removeBundleItem,
    fetchBundleImages,
    addBundleImage,
    updateBundleImage,
    deleteBundleImage,
    fetchBundleReviews,
    addBundleReview,
    updateBundleReview,
    deleteBundleReview,
    uploadImage,
    deleteImage,
    getImageUrl,
    fetchPrintfulSyncStatus,
    triggerPrintfulSync,
    getPrintfulSyncStatus,
    getSyncErrors,
    getInventoryChanges,
    getDataConflicts,
    resolveDataConflict,
    markErrorResolved,
    markInventoryChangeProcessed,
    clearErrors,
    refreshAll
  };

  return (
    <AdminProductsContext.Provider value={value}>
      {children}
    </AdminProductsContext.Provider>
  );
};
