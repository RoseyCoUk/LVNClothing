import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAdminProducts } from '../contexts/AdminProductsContext';
import { 
  X, 
  Upload, 
  Trash2, 
  Star, 
  Crown,
  GripVertical,

} from 'lucide-react';

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  image_order: number;
  is_primary: boolean;
  is_thumbnail: boolean; // New field for thumbnail
  variant_type: 'product' | 'color' | 'size';
  color?: string;
  size?: string;
  created_at: string;
}

interface UploadingImage {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

interface ImageManagementProps {
  productId: string;
  productName: string;
  currentImages: ProductImage[];
  onImagesUpdate: (images: ProductImage[]) => void;
  onClose: () => void;
  productCategory: string;
  variantColor?: string; // New prop for pre-filtering by color
  productVariants?: any[]; // Real variants for this product
}

const EnhancedImageManagement: React.FC<ImageManagementProps> = ({
  productId,
  productName,
  currentImages,
  onImagesUpdate,
  onClose,
  productCategory,
  variantColor,
  productVariants = []
}) => {
  const { uploadImage, createProductImage, deleteProductImage, fetchProductImages, updateProductImage } = useAdminProducts();
  
  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Auto-hide after 3 seconds
  };
  
  console.log('🔍 EnhancedImageManagement Debug:', {
    productId,
    productName,
    currentImages,
    currentImagesLength: currentImages?.length || 0,
    currentImagesType: typeof currentImages,
    productCategory,
    productVariants,
    productVariantsLength: productVariants?.length || 0,
    variantColor
  });
  
  const [images, setImages] = useState<ProductImage[]>(currentImages);
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  // const [isDragging, setIsDragging] = useState(false); // Currently unused
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Toast notification state
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  // Update local images state when currentImages prop changes
  useEffect(() => {
    console.log('🔄 currentImages prop changed:', {
      oldImages: images,
      newImages: currentImages,
      oldLength: images.length,
      newLength: currentImages?.length || 0
    });
    
    if (currentImages && currentImages.length > 0) {
      setImages(currentImages);
      console.log('✅ Updated local images state with:', currentImages);
    } else {
      console.log('⚠️ No currentImages provided or empty array');
    }
  }, [currentImages]);

  // Handle color filtering when variantColor prop changes
  useEffect(() => {
    if (variantColor) {
      console.log('🎨 Setting variant color filter:', variantColor);
      setSelectedVariantType('color');
      setSelectedColor(variantColor);
    } else {
      // Reset to product mode if no variantColor
      console.log('🔄 Resetting to product mode (no variantColor)');
      setSelectedVariantType('product');
      setSelectedColor('');
    }
  }, [variantColor]);
  
  // Variant management state - use both useState for UI updates and useRef for persistence
  const [selectedVariantType, setSelectedVariantTypeState] = useState<'product' | 'color' | 'size'>(
    variantColor ? 'color' : 'product'
  );
  const [selectedColor, setSelectedColorState] = useState<string>(variantColor || '');
  const [selectedSize, setSelectedSizeState] = useState<string>('');

  // Use refs to persist values across re-renders
  const selectedVariantTypeRef = useRef<'product' | 'color' | 'size'>(
    variantColor ? 'color' : 'product'
  );
  const selectedColorRef = useRef<string>(variantColor || '');
  const selectedSizeRef = useRef<string>('');

  // Helper functions to get current values (prioritize refs for persistence)
  const getSelectedVariantType = () => selectedVariantTypeRef.current || selectedVariantType;
  const getSelectedColor = () => selectedColorRef.current || selectedColor;
  const getSelectedSize = () => selectedSizeRef.current || selectedSize;

  // Helper functions to set values (update both state and refs)
  const setSelectedVariantType = (value: 'product' | 'color' | 'size') => {
    selectedVariantTypeRef.current = value;
    setSelectedVariantTypeState(value);
    console.log('🔄 Variant type dropdown change:', value);
  };

  const setSelectedColor = (value: string) => {
    selectedColorRef.current = value;
    setSelectedColorState(value);
    console.log('🔄 Color dropdown change:', value);
  };

  const setSelectedSize = (value: string) => {
    selectedSizeRef.current = value;
    setSelectedSizeState(value);
    console.log('🔄 Size dropdown change:', value);
  };

  // Determine if this product has variants
  const hasVariants = (() => {
    const normalized = productCategory?.toLowerCase() || '';
    // Use includes() to match partial product names like "Reform UK T-Shirt"
    return normalized.includes('t-shirt') || 
           normalized.includes('tshirt') || 
           normalized.includes('hoodie') || 
           normalized.includes('cap') || 
           normalized.includes('tote') ||
           normalized.includes('water-bottle') ||
           normalized.includes('mug') ||
           normalized.includes('mouse-pad') ||
           normalized.includes('sticker');
  })();

  const hasColors = (() => {
    const normalized = productCategory?.toLowerCase() || '';
    // Use includes() to match partial product names like "Reform UK T-Shirt"
    return normalized.includes('t-shirt') || 
           normalized.includes('tshirt') || 
           normalized.includes('hoodie') || 
           normalized.includes('cap') || 
           normalized.includes('tote') ||
           normalized.includes('water-bottle') ||
           normalized.includes('mug') ||
           normalized.includes('mouse-pad') ||
           normalized.includes('sticker');
  })();

  const hasSizes = (() => {
    const normalized = productCategory?.toLowerCase() || '';
    // Use includes() to match partial product names like "Reform UK T-Shirt"
    return normalized.includes('t-shirt') || 
           normalized.includes('tshirt') || 
           normalized.includes('hoodie');
  })();

  // Log when color dropdown should be rendered
  useEffect(() => {
    if (getSelectedVariantType() === 'color' && hasColors) {
      console.log('🎨 Color dropdown should be visible:', {
        selectedVariantType: getSelectedVariantType(),
        selectedColor: getSelectedColor(),
        availableColors: getAvailableColors(),
        hasColors
      });
    }
  }, [getSelectedVariantType(), getSelectedColor(), hasColors]);

  // Helper function to extract color from variant (same logic as VariantManagement)
  const getColorFromVariant = (variant: any): string => {
    if (!variant.color) return '';
    if (typeof variant.color === 'string') return variant.color;
    if (typeof variant.color === 'object') {
      const colorObj = variant.color as any;
      if (colorObj.name) return colorObj.name;
      if (colorObj.value) return colorObj.value;
    }
    return '';
  };

  // Get available colors from actual product variants (REAL COLORS)
  const getAvailableColors = (): string[] => {
    console.log('🎨 Getting available colors from variants:', productVariants);
    
    if (productVariants && productVariants.length > 0) {
      // Extract unique colors from actual variants
      const colors = new Set<string>();
      
      productVariants.forEach(variant => {
        const color = getColorFromVariant(variant);
        if (color && color.trim() !== '') {
          colors.add(color);
        }
      });
      
      const realColors = Array.from(colors).sort();
      console.log('🎨 Real colors from variants:', realColors);
      return realColors;
    }
    
    // Fallback to hardcoded colors if no variants provided
    console.log('🎨 Using fallback hardcoded colors for category:', productCategory);
    const normalizedCategory = productCategory?.toLowerCase().replace(/\s+/g, '-');
    
    switch (normalizedCategory) {
      case 'cap':
      case 'caps':
        return ['Black', 'Dark Grey', 'Khaki', 'Light Blue', 'Navy', 'Pink', 'Stone', 'White'];
      case 'tshirt':
      case 'tshirts':
        return ['Army', 'Asphalt', 'Autumn', 'Black', 'Black Heather', 'Dark Grey Heather', 'Heather Deep Teal', 'Mauve', 'Navy', 'Olive', 'Red', 'Steel Blue', 'Ash', 'Athletic Heather', 'Heather Dust', 'Heather Prism Peach', 'Mustard', 'Pink', 'White', 'Yellow'];
      case 'hoodie':
      case 'hoodies':
        return ['Black', 'Dark Heather', 'Indigo Blue', 'Navy', 'Red', 'Light Blue', 'Light Pink', 'Sport Grey', 'White'];
      case 'tote':
      case 'totes':
      case 'tote-bags':
        return ['Black'];
      case 'water-bottle':
      case 'water-bottles':
        return ['Stainless Steel'];
      case 'mug':
      case 'mugs':
        return ['White'];
      case 'mouse-pad':
      case 'mouse-pads':
        return ['White'];
      case 'sticker':
      case 'stickers':
        return ['Default'];
      default:
        return [];
    }
  };

  // Get available sizes based on product category
  const getAvailableSizes = (): string[] => {
    const normalizedCategory = productCategory?.toLowerCase().replace(/\s+/g, '-');
    
    if (['tshirt', 'tshirts', 'hoodie', 'hoodies'].includes(normalizedCategory)) {
      return ['S', 'M', 'L', 'XL', '2XL'];
    }
    return [];
  };

  // Debug logging
  console.log('🔍 EnhancedImageManagement Debug:', {
    productCategory,
    hasVariants,
    hasColors,
    hasSizes,
    availableColors: getAvailableColors(),
    normalizedCategory: productCategory?.toLowerCase().replace(/\s+/g, '-'),
    variantColor,
    initialSelectedVariantType: variantColor ? 'color' : 'product',
    initialSelectedColor: variantColor || 'none'
  });

  // Remove automatic syncing to prevent images from disappearing
  // useEffect(() => {
  //   if (JSON.stringify(images) !== JSON.stringify(currentImages)) {
  //     onImagesUpdate(images);
  //   }
  // }, [images, onImagesUpdate, currentImages]);

  const handleFileSelect = useCallback((files: FileList) => {
    const newUploadingImages: UploadingImage[] = Array.from(files).map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingImages(prev => [...prev, ...newUploadingImages]);
    processUploads(newUploadingImages);
  }, []);

  const processUploads = async (uploadingImages: UploadingImage[]) => {
    for (const uploadingImage of uploadingImages) {
      try {
        // Simulate file upload to Supabase Storage
        const imageUrl = await uploadToStorage(uploadingImage.file);
        
        // Create new product image
        const newImage: Omit<ProductImage, 'id' | 'created_at'> = {
          product_id: productId,
          image_url: imageUrl,
          image_order: images.length + uploadingImages.indexOf(uploadingImage),
          is_primary: false,
          is_thumbnail: false, // New images are not thumbnail by default
          variant_type: getSelectedVariantType(),
          color: getSelectedVariantType() === 'color' ? getSelectedColor() : undefined,
          size: getSelectedVariantType() === 'size' ? getSelectedSize() : undefined
        };

        console.log('🖼️ Created new image object:', newImage);
        console.log('🔍 Debug - selectedVariantType:', getSelectedVariantType());
        console.log('🔍 Debug - selectedColor:', getSelectedColor());
        console.log('🔍 Debug - selectedSize:', getSelectedSize());

        // Add to images array
        const addedImage = { ...newImage, id: `temp-${Date.now()}`, created_at: new Date().toISOString() };
        console.log('➕ Adding image to local state:', addedImage);
        
        setImages(prev => {
          const newImages = [...prev, addedImage];
          console.log('📊 Updated images array, total count:', newImages.length);
          return newImages;
        });

        // Update upload status
        setUploadingImages(prev => prev.map(img => 
          img.id === uploadingImage.id 
            ? { ...img, status: 'success', progress: 100 }
            : img
        ));

        // Remove from uploading after a delay
        setTimeout(() => {
          setUploadingImages(prev => prev.filter(img => img.id !== uploadingImage.id));
        }, 2000);

              } catch (error) {
          console.error('Failed to upload image:', error);
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          setUploadingImages(prev => prev.map(img => 
            img.id === uploadingImage.id 
              ? { ...img, status: 'error', error: errorMessage }
              : img
          ));
        }
    }
  };

  const uploadToStorage = async (file: File): Promise<string> => {
    try {
      // Generate a unique path for the image
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomId}.${fileExtension}`;
      const path = `products/${productId}/${fileName}`;
      
      console.log('🔄 Uploading image to path:', path);
      
      // Upload to Supabase Storage
      const result = await uploadImage(file, 'product-images', path);
      
      console.log('✅ Image uploaded successfully:', result);
      console.log('🔗 Generated URL:', result.url);
      console.log('📁 File path:', result.path);
      
      // Test if the URL is accessible
      try {
        const testResponse = await fetch(result.url, { method: 'HEAD' });
        console.log('🔍 URL accessibility test:', {
          url: result.url,
          status: testResponse.status,
          ok: testResponse.ok
        });
        
        if (!testResponse.ok) {
          console.warn('⚠️ Warning: Generated URL returned status:', testResponse.status);
        }
      } catch (urlTestError) {
        console.warn('⚠️ Warning: Could not test URL accessibility:', urlTestError);
      }
      
      return result.url;
    } catch (error) {
      console.error('❌ Failed to upload image to storage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to upload image: ${errorMessage}`);
    }
  };

  const handleDragStart = (index: number) => {
    console.log('🎯 Drag started for index:', index);
    setDragIndex(index);
    // setIsDragging(true); // Currently unused
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    // Only log every 5th event to reduce console spam
    if (index % 5 === 0) console.log('🎯 Drag over index:', index);
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    console.log('🎯 Drop event:', { dragIndex, dropIndex });
    
    if (dragIndex === null || dragIndex === dropIndex) {
      console.log('🎯 Drop cancelled - same index or no drag index');
      return;
    }

    // Get the filtered images array to work with correct indices
    const filteredImages = images.filter(image => {
      const selectedVariantType = getSelectedVariantType();
      const selectedColor = getSelectedColor();
      
      if (selectedVariantType === 'product') {
        return true;
      } else if (selectedVariantType === 'color' && selectedColor) {
        return image.variant_type === 'product' || 
               (image.variant_type === 'color' && image.color === selectedColor);
      }
      return true;
    });

    console.log('🎯 Filtered images for reordering:', filteredImages.length);
    
    // Create new array for reordering
    const newImages = [...images];
    
    // Find the actual image objects being moved
    const draggedImage = filteredImages[dragIndex];
    const targetImage = filteredImages[dropIndex];
    
    if (!draggedImage || !targetImage) {
      console.log('🎯 Could not find dragged or target image');
      return;
    }
    
    console.log('🎯 Moving image:', draggedImage.id, 'to position of:', targetImage.id);

    // Find their positions in the full images array
    const draggedImageIndex = newImages.findIndex(img => img.id === draggedImage.id);
    const targetImageIndex = newImages.findIndex(img => img.id === targetImage.id);
    
    // Perform the swap
    const movedImage = newImages.splice(draggedImageIndex, 1)[0];
    newImages.splice(targetImageIndex, 0, movedImage);

    // Update order numbers for all images
    newImages.forEach((img, idx) => {
      img.image_order = idx;
    });

    console.log('🎯 Reordered images:', newImages.map(img => ({ id: img.id, order: img.image_order })));
    
    setImages(newImages);
    setDragIndex(null);
    setDragOverIndex(null);
    
    // Auto-save the new order to database (without the full save process that might reset images)
    setTimeout(() => {
      console.log('🎯 Auto-saving image order...');
      saveImageOrderOnly(newImages);
    }, 500); // Small delay to allow UI to update
    
    // setIsDragging(false); // Currently unused
  };

  const handleDragEnd = () => {
    console.log('🎯 Drag ended');
    setDragIndex(null);
    setDragOverIndex(null);
    // setIsDragging(false); // Currently unused
  };

  // Save only image order without full refresh
  const saveImageOrderOnly = async (updatedImages: ProductImage[]) => {
    try {
      console.log('🎯 Saving image order only...');
      
      // Update only the image_order for existing images
      for (const image of updatedImages) {
        if (!String(image.id).startsWith('temp-')) {
          try {
            await updateProductImage(image.id, {
              image_order: image.image_order
            });
            console.log('✅ Updated order for image:', image.id, 'to order:', image.image_order);
          } catch (error) {
            console.error('❌ Failed to update image order:', image.id, error);
          }
        }
      }
      
      showToast('🎯 Image order saved!', 'success');
      console.log('✅ Image order saved successfully');
      
    } catch (error) {
      console.error('❌ Failed to save image order:', error);
      showToast('❌ Failed to save image order', 'error');
    }
  };

  const handleSetPrimary = (imageId: string) => {
    const selectedVariantType = getSelectedVariantType();
    const selectedColor = getSelectedColor();
    
    setImages(prev => prev.map(img => {
      // For variant-specific images, only unset primary for images of the same type/color
      if (selectedVariantType === 'color' && selectedColor) {
        // Only affect images of the same color variant
        if (img.variant_type === 'color' && img.color === selectedColor) {
          return { ...img, is_primary: img.id === imageId };
        }
        // Keep other images unchanged
        return img;
      } else {
        // For product-level images, traditional logic
        return { ...img, is_primary: img.id === imageId };
      }
    }));
    
    console.log(`🌟 Set primary image for ${selectedVariantType}${selectedColor ? ` (${selectedColor})` : ''}:`, imageId);
  };

  const handleSetThumbnail = (imageId: string) => {
    const selectedVariantType = getSelectedVariantType();
    const selectedColor = getSelectedColor();
    
    setImages(prev => prev.map(img => {
      // For variant-specific images, only unset thumbnail for images of the same type/color
      if (selectedVariantType === 'color' && selectedColor) {
        // Only affect images of the same color variant
        if (img.variant_type === 'color' && img.color === selectedColor) {
          return { ...img, is_thumbnail: img.id === imageId };
        }
        // Keep other images unchanged
        return img;
      } else {
        // For product-level images, traditional logic
        return { ...img, is_thumbnail: img.id === imageId };
      }
    }));
    
    console.log(`👑 Set thumbnail image for ${selectedVariantType}${selectedColor ? ` (${selectedColor})` : ''}:`, imageId);
  };

  const handleDeleteImage = async (imageId: any) => {
    console.log('🗑️ handleDeleteImage called with:', imageId);
    console.log('imageId type:', typeof imageId);
    console.log('imageId value:', imageId);
    
    // Type check - ensure imageId is a string or number
    if (imageId === undefined || imageId === null) {
      console.error('❌ imageId is undefined or null:', imageId);
      alert('Invalid image ID. Please try again.');
      return;
    }
    
    if (typeof imageId !== 'string' && typeof imageId !== 'number') {
      console.error('❌ imageId is not a string or number:', imageId);
      alert('Invalid image ID. Please try again.');
      return;
    }
    
    // Convert to string for consistent handling
    const imageIdStr = String(imageId);
    
    // Add confirmation before deletion
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }
    
    // Check if this is a thumbnail or primary image
    const imageToDelete = images.find(img => img.id === imageId);
    if (imageToDelete) {
      if (imageToDelete.is_thumbnail) {
        if (!confirm('⚠️ WARNING: This is a thumbnail image. Deleting it will remove the thumbnail from the product card. Continue?')) {
          return;
        }
      }
      
      if (imageToDelete.is_primary) {
        if (!confirm('⚠️ WARNING: This is a primary image. Deleting it will remove the primary status. Continue?')) {
          return;
        }
      }
      
      // Additional safety check - prevent deletion if this is the only image
      if (images.length === 1) {
        alert('❌ Cannot delete the last remaining image. Products must have at least one image.');
        return;
      }
    }
    
    console.log('🗑️ Deleting image:', imageId);
    
    try {
      // Check if this is a temporary image or a saved image
      if (imageIdStr.startsWith('temp-')) {
        // Temporary image - just remove from local state
        console.log('🗑️ Removing temporary image from local state');
        setImages(prev => prev.filter(img => img.id !== imageId));
      } else {
        // Saved image - delete from database
        console.log('🗑️ Deleting saved image from database');
        await deleteProductImage(imageIdStr);
        console.log('✅ Image deleted from database successfully');
        
        // Remove from local state
        setImages(prev => prev.filter(img => img.id !== imageId));
      }
      
    } catch (error) {
      console.error('❌ Failed to delete image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast(`Failed to delete image: ${errorMessage}`, 'error');
    }
  };

  const handleSave = async () => {
    console.log('🔥 SAVE BUTTON CLICKED - handleSave function called');
    console.log('🔍 Current images state:', images);
    console.log('🔍 Current images length:', images.length);
    
    try {
      console.log('💾 Starting save process...');
      console.log('Images to save:', images);
      
      // Filter out temporary images (those with temp IDs)
      const imagesToSave = images.filter(img => !String(img.id).startsWith('temp-'));
      const newImages = images.filter(img => String(img.id).startsWith('temp-'));
      
      console.log('📊 Image analysis:');
      console.log('  - Total images:', images.length);
      console.log('  - Existing images to keep:', imagesToSave.length, imagesToSave);
      console.log('  - New images to save:', newImages.length, newImages);
      
      if (newImages.length === 0 && imagesToSave.length === 0) {
        console.log('⚠️ No images to save!');
        showToast('⚠️ No images to save!', 'info');
        return;
      }
      
      // Save new images to database
      for (const image of newImages) {
        try {
          // Validate required fields
          if (!image.image_url) {
            throw new Error(`Image missing image_url: ${JSON.stringify(image)}`);
          }
          if (!productId) {
            throw new Error(`Missing productId: ${productId}`);
          }
          
          const imageData = {
            product_id: productId,
            image_url: image.image_url,
            image_order: image.image_order || 0,
            is_primary: image.is_primary || false,
            is_thumbnail: image.is_thumbnail || false,
            variant_type: image.variant_type || 'product',
            color: image.color || undefined,
            size: image.size || undefined
          };
          
          console.log('💾 Preparing to save image:', imageData);
          console.log('📝 Image data validation passed');
          
          const savedImage = await createProductImage(imageData);
          console.log('✅ Image saved successfully to database:', savedImage);
          
          // Replace temp image with saved image
          setImages(prev => prev.map(img => 
            img.id === image.id ? savedImage : img
          ));
          
        } catch (error) {
          console.error('❌ Failed to save image:', error);
          console.error('❌ Failed image data:', image);
          console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          showToast(`❌ Failed to save image: ${errorMessage}`, 'error');
          return; // Don't close modal if save fails
        }
      }
      
      // Update existing images if their properties changed
      for (const image of imagesToSave) {
        try {
          // Find the original image from currentImages to compare
          const originalImage = currentImages.find(img => img.id === image.id);
          if (originalImage && (
            originalImage.is_primary !== image.is_primary ||
            originalImage.is_thumbnail !== image.is_thumbnail ||
            originalImage.image_order !== image.image_order
          )) {
            console.log('Updating existing image:', image.id, {
              old: {
                is_primary: originalImage.is_primary,
                is_thumbnail: originalImage.is_thumbnail,
                image_order: originalImage.image_order
              },
              new: {
                is_primary: image.is_primary,
                is_thumbnail: image.is_thumbnail,
                image_order: image.image_order
              }
            });
            
            await updateProductImage(image.id, {
              is_primary: image.is_primary,
              is_thumbnail: image.is_thumbnail,
              image_order: image.image_order
            });
            
            console.log('✅ Image updated successfully:', image.id);
          }
        } catch (error) {
          console.error('Failed to update image:', image.id, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          showToast(`Failed to update image: ${errorMessage}`, 'error');
          return; // Don't continue if update fails
        }
      }
      
      console.log('✅ All images saved successfully');
      
      // Refresh the product images in the context to show the newly saved images
      console.log('🔄 Refreshing product images in context...');
      await fetchProductImages(productId);
      
      // Notify parent component of the updated images (this will refresh the modal)
      console.log('🔄 Notifying parent component of updates...');
      onImagesUpdate(images);
      
      // Don't automatically close modal - let user see the uploaded images
      console.log('✅ Images saved successfully! Modal stays open to show results.');
      
      // Show success toast
      showToast('✅ Images saved successfully!', 'success');
      
    } catch (error) {
      console.error('❌ SAVE ERROR:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Error details:', errorMessage);
      showToast(`❌ Failed to save images: ${errorMessage}`, 'error');
    }
  };

  // Helper functions for variant management
  const canUpload = (): boolean => {
    const variantType = getSelectedVariantType();
    const color = getSelectedColor();
    const size = getSelectedSize();
    
    console.log('🔍 canUpload check:', {
      variantType,
      color,
      size,
      hasColor: color !== '',
      hasSize: size !== ''
    });
    
    if (variantType === 'product') return true;
    if (variantType === 'color') return color !== '';
    if (variantType === 'size') return size !== '';
    return false;
  };

  const getVariantTypeLabel = (): string => {
    switch (getSelectedVariantType()) {
      case 'product': return 'Product';
      case 'color': return `Color (${getSelectedColor()})`;
      case 'size': return `Size (${getSelectedSize()})`;
      default: return 'Product';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                🖼️ Enhanced Image Management - {productName}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>



          {/* Variant Type Selector - Only show for products with variants */}
          {hasVariants && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                🎨 Variant Image Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Variant Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Type
                  </label>
                                      <select
                      value={getSelectedVariantType()}
                      onChange={(e) => setSelectedVariantType(e.target.value as 'product' | 'color' | 'size')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="product">📦 Product Images (General)</option>
                      {hasColors && <option value="color">🎨 Color-Specific Images</option>}
                      {hasSizes && <option value="size">📏 Size-Specific Images</option>}
                    </select>
                  </div>

                  {/* Color Selection */}
                  {getSelectedVariantType() === 'color' && hasColors && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color Variant
                      </label>
                      <select
                        value={getSelectedColor()}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Color</option>
                        {getAvailableColors().map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Size Selection */}
                  {getSelectedVariantType() === 'size' && hasSizes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size Variant
                      </label>
                      <select
                        value={getSelectedSize()}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Size</option>
                        {getAvailableSizes().map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                  )}
              </div>

              {/* Upload Button */}
              <div className="mt-4">
                <button
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={!canUpload()}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    canUpload() 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Upload className="h-4 w-4 inline mr-2" />
                  Upload {getVariantTypeLabel()} Images
                </button>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div className="px-6 py-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drag and drop images here, or browse files
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Supports JPG, PNG, WebP. Images will be optimized automatically.
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
              >
                Browse Files
              </label>
            </div>

            {/* Upload Progress */}
            {uploadingImages.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">📤 Upload Progress</h4>
                <div className="space-y-2">
                  {uploadingImages.map((uploadingImage) => (
                    <div key={uploadingImage.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {uploadingImage.file.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {uploadingImage.status === 'uploading' && `${uploadingImage.progress}%`}
                            {uploadingImage.status === 'success' && '✅ Success'}
                            {uploadingImage.status === 'error' && '❌ Failed'}
                          </span>
                        </div>
                        {uploadingImage.status === 'uploading' && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadingImage.progress}%` }}
                            />
                          </div>
                        )}
                        {uploadingImage.status === 'error' && (
                          <p className="text-sm text-red-600">
                            Failed to upload image: {uploadingImage.error}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Grid */}
            {images.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Current Images 
                  {getSelectedVariantType() === 'color' && getSelectedColor() && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      (Filtered for {getSelectedColor()})
                    </span>
                  )}
                  <span className="text-xs text-gray-500 block mt-1">
                    💡 Hover over images and drag to reorder them
                  </span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images
                    // Filter images based on selected variant type and color
                    .filter(image => {
                      const selectedVariantType = getSelectedVariantType();
                      const selectedColor = getSelectedColor();
                      
                      if (selectedVariantType === 'product') {
                        // Show all images when in product mode
                        return true;
                      } else if (selectedVariantType === 'color' && selectedColor) {
                        // Show only images for the selected color (or product-level images)
                        return image.variant_type === 'product' || 
                               (image.variant_type === 'color' && image.color === selectedColor);
                      }
                      
                      return true; // Default: show all
                    })
                    .map((image, index) => (
                    <div
                      key={image.id}
                      className={`relative group border-2 rounded-lg overflow-hidden transition-all cursor-move ${
                        dragIndex === index 
                          ? 'border-blue-500 opacity-60 transform scale-105 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${
                        dragOverIndex === index ? 'border-dashed border-blue-400 bg-blue-50' : ''
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Drag Handle - Top Center */}
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-10">
                        <div className="bg-black bg-opacity-70 rounded-md px-2 py-1 flex items-center gap-1">
                          <GripVertical className="h-4 w-4 text-white" />
                          <span className="text-xs text-white font-medium">Drag to reorder</span>
                        </div>
                      </div>

                      {/* Order Badge - Top Right */}
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
                        {image.image_order + 1}
                      </div>

                      {/* Image */}
                      <img
                        src={image.image_url}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />

                      {/* Status Badges - Top Left */}
                      <div className="absolute top-2 left-2 flex space-x-1">
                        {/* Primary Image Badge */}
                        <button
                          onClick={() => handleSetPrimary(image.id)}
                          className={`p-1 rounded-full transition-colors ${
                            image.is_primary 
                              ? 'bg-yellow-500 text-white' 
                              : 'bg-white bg-opacity-80 text-gray-600 hover:bg-yellow-100'
                          }`}
                          title={image.is_primary ? 'Primary Image' : 'Set as Primary'}
                        >
                          <Star className="h-3 w-3" fill={image.is_primary ? 'currentColor' : 'none'} />
                        </button>

                        {/* Thumbnail Badge */}
                        <button
                          onClick={() => handleSetThumbnail(image.id)}
                          className={`p-1 rounded-full transition-colors ${
                            image.is_thumbnail 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-white bg-opacity-80 text-gray-600 hover:bg-purple-100'
                          }`}
                          title={image.is_thumbnail ? 'Thumbnail Image' : 'Set as Thumbnail'}
                        >
                          <Crown className="h-3 w-3" fill={image.is_thumbnail ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      {/* Variant Info - Bottom Left */}
                      {(image.variant_type === 'color' || image.variant_type === 'size') && (
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {image.variant_type === 'color' && image.color && `Color: ${image.color}`}
                          {image.variant_type === 'size' && image.size && `Size: ${image.size}`}
                        </div>
                      )}

                      {/* Delete Button - Top Right */}
                      <button
                        onClick={() => {
                          console.log('🗑️ Delete button clicked for image:', image);
                          console.log('Image ID:', image.id);
                          console.log('Image ID type:', typeof image.id);
                          handleDeleteImage(image.id);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        title="Delete Image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>

                      {/* Order Number */}
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {image.image_order + 1}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Image Legend */}
                <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Primary Image (for galleries)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-purple-500" />
                    <span>Thumbnail Image (for product cards)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GripVertical className="h-4 w-4 text-gray-500" />
                    <span>Drag to reorder</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  console.log('🔥 SAVE BUTTON CLICKED - Event triggered');
                  console.log('🔍 Button click event:', e);
                  console.log('🔍 Save button disabled?', e.currentTarget.disabled);
                  e.preventDefault();
                  e.stopPropagation();
                  handleSave();
                }}
                disabled={images.length === 0}
                className={`px-4 py-2 text-sm font-medium border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  images.length === 0 
                    ? 'text-gray-400 bg-gray-300 cursor-not-allowed' 
                    : 'text-white bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Save Changes {images.length === 0 ? '(No Images)' : `(${images.length} images)`}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' :
          toast.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="text-white hover:text-gray-200 ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedImageManagement;
