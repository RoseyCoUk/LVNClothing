import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAdminProducts } from '../contexts/AdminProductsContext';
import { 
  Upload, 
  X, 
  Star, 
  GripVertical, 
  Image as ImageIcon,
  Trash2, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Camera,
  Plus,
  Move,
  RotateCcw
} from 'lucide-react';

interface ProductImage {
  id: string;
  imageUrl: string;
  imageOrder: number;
  isPrimary: boolean;
  isThumbnail: boolean;
}

interface UploadingImage {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

interface MobileImageManagementProps {
  productId: string;
  productName: string;
  currentImages: ProductImage[];
  onImagesUpdate: (images: ProductImage[]) => void;
  onClose: () => void;
}

const MobileImageManagement: React.FC<MobileImageManagementProps> = ({
  productId,
  productName,
  currentImages,
  onImagesUpdate,
  onClose
}) => {
  const { uploadImage, createProductImage, updateProductImage, deleteProductImage, reorderProductImages } = useAdminProducts();
  
  // State management
  const [images, setImages] = useState<ProductImage[]>(currentImages);
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'camera' | 'gallery' | 'bulk'>('gallery');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Update parent when images change
  useEffect(() => {
    onImagesUpdate(images);
  }, [images, onImagesUpdate]);

  // Generate unique upload ID
  const generateUploadId = () => `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Image optimization for mobile
  const optimizeImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate optimal dimensions for mobile
        const maxWidth = 800;
        const maxHeight = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Generate thumbnail for mobile
  const generateThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const size = 150;
        canvas.width = size;
        canvas.height = size;
        
        // Center crop
        const scale = Math.max(size / img.width, size / img.height);
        const x = (img.width * scale - size) / 2;
        const y = (img.height * scale - size) / 2;
        
        ctx.drawImage(img, -x, -y, img.width * scale, img.height * scale);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList) => {
    const newUploads: UploadingImage[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      
      const uploadId = generateUploadId();
      const preview = await generateThumbnail(file);
      
      newUploads.push({
        id: uploadId,
        file,
        preview,
        progress: 0,
        status: 'uploading'
      });
    }
    
    setUploadingImages(prev => [...prev, ...newUploads]);
    await processUploads(newUploads);
  }, []);

  // Process uploads
  const processUploads = async (uploads: UploadingImage[]) => {
    for (const upload of uploads) {
      try {
        // Optimize image
        const optimizedBlob = await optimizeImage(upload.file);
        const optimizedFile = new File([optimizedBlob], upload.file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        // Upload to Supabase
        const result = await uploadImage(optimizedFile, 'product-images', `${productId}/${upload.id}`);
        
        // Create product image record
        const newImage = await createProductImage({
          product_id: productId,
          image_url: result.url,
          image_order: images.length + uploadingImages.length,
          is_primary: images.length === 0 // First image is primary
        });
        
        // Update state
        setImages(prev => [...prev, newImage]);
        setUploadingImages(prev => prev.map(u => 
          u.id === upload.id 
            ? { ...u, status: 'success', progress: 100 }
            : u
        ));
        
        // Remove successful upload after delay
        setTimeout(() => {
          setUploadingImages(prev => prev.filter(u => u.id !== upload.id));
        }, 2000);
        
      } catch (error) {
        setUploadingImages(prev => prev.map(u => 
          u.id === upload.id 
            ? { ...u, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : u
        ));
      }
    }
  };

  // Touch-friendly drag and drop for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent, index: number) => {
    e.preventDefault();
    setDragIndex(index);
    setIsDragging(true);
    
    // Add haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || dragIndex === null) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const imageElement = elements.find(el => el.classList.contains('mobile-image-item'));
    
    if (imageElement) {
      const index = parseInt(imageElement.getAttribute('data-index') || '0');
      if (index !== dragOverIndex) {
        setDragOverIndex(index);
      }
    }
  }, [isDragging, dragIndex, dragOverIndex]);

  const handleTouchEnd = useCallback(async () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      // Reorder images
      const newImages = [...images];
      const [draggedImage] = newImages.splice(dragIndex, 1);
      newImages.splice(dragOverIndex, 0, draggedImage);
      
      // Update order numbers
      const updatedImages = newImages.map((img, index) => ({
        ...img,
        imageOrder: index
      }));
      
      setImages(updatedImages);
      
      // Update database
      try {
        await reorderProductImages(productId, updatedImages.map(img => img.id));
      } catch (error) {
        console.error('Failed to reorder images:', error);
        // Revert on error
        setImages(currentImages);
      }
    }
    
    setDragIndex(null);
    setIsDragging(false);
    setDragOverIndex(null);
  }, [dragIndex, dragOverIndex, images, productId, reorderProductImages, currentImages]);

  // Selection mode handlers
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedImages(new Set());
  }, [isSelectionMode]);

  const toggleImageSelection = useCallback((imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  }, []);

  const selectAllImages = useCallback(() => {
    setSelectedImages(new Set(images.map(img => img.id)));
  }, [images]);

  const clearSelection = useCallback(() => {
    setSelectedImages(new Set());
  }, []);

  // Bulk operations
  const deleteSelectedImages = useCallback(async () => {
    if (selectedImages.size === 0) return;
    
    try {
      for (const imageId of selectedImages) {
        const image = images.find(img => img.id === imageId);
        if (image) {
          await deleteProductImage(imageId);
        }
      }
      
      setImages(prev => prev.filter(img => !selectedImages.has(img.id)));
      setSelectedImages(new Set());
      setIsSelectionMode(false);
      
    } catch (error) {
      console.error('Failed to delete selected images:', error);
    }
  }, [selectedImages, images, deleteProductImage]);

  const setPrimarySelected = useCallback(async () => {
    if (selectedImages.size !== 1) return;
    
    const imageId = Array.from(selectedImages)[0];
    try {
      // Update all images to not primary
      for (const image of images) {
        if (image.isPrimary) {
          await updateProductImage(image.id, { isPrimary: false });
        }
      }
      
      // Set selected image as primary
      await updateProductImage(imageId, { isPrimary: true });
      
      // Update local state
      setImages(prev => prev.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      })));
      
      setSelectedImages(new Set());
      setIsSelectionMode(false);
      
    } catch (error) {
      console.error('Failed to set primary image:', error);
    }
  }, [selectedImages, images, updateProductImage]);

  // Camera capture
  const handleCameraCapture = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileSelect(files);
    }
    // Reset input
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  // Gallery selection
  const handleGallerySelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileSelect(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Manage Images</h2>
              <p className="text-sm text-gray-600">{productName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSelectionMode}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isSelectionMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isSelectionMode ? 'Cancel' : 'Select'}
            </button>
            
            {isSelectionMode && (
              <button
                onClick={() => setShowUploadOptions(!showUploadOptions)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upload Options */}
      {showUploadOptions && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center space-y-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <Camera className="h-6 w-6 text-blue-600" />
              <span className="text-xs font-medium text-gray-700">Camera</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center space-y-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <ImageIcon className="h-6 w-6 text-blue-600" />
              <span className="text-xs font-medium text-gray-700">Gallery</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center space-y-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <Upload className="h-6 w-6 text-blue-600" />
              <span className="text-xs font-medium text-gray-700">Bulk</span>
            </button>
          </div>
        </div>
      )}

      {/* Selection Actions */}
      {isSelectionMode && selectedImages.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-800">
                {selectedImages.size} image{selectedImages.size !== 1 ? 's' : ''} selected
              </span>
              
              <button
                onClick={selectAllImages}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              
              <button
                onClick={clearSelection}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {selectedImages.size === 1 && (
                <button
                  onClick={setPrimarySelected}
                  className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
                >
                  Set Primary
                </button>
              )}
              
              <button
                onClick={deleteSelectedImages}
                className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Uploading Images */}
        {uploadingImages.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Uploading...</h3>
            <div className="grid grid-cols-2 gap-3">
              {uploadingImages.map((upload) => (
                <div key={upload.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={upload.preview}
                    alt="Uploading"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Progress overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    {upload.status === 'uploading' && (
                      <div className="text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-white mx-auto mb-2" />
                        <div className="w-16 bg-white bg-opacity-30 rounded-full h-1">
                          <div 
                            className="bg-white h-1 rounded-full transition-all duration-300"
                            style={{ width: `${upload.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {upload.status === 'success' && (
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    )}
                    
                    {upload.status === 'error' && (
                      <div className="text-center">
                        <AlertCircle className="h-6 w-6 text-red-400 mx-auto mb-2" />
                        <p className="text-xs text-red-200">{upload.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Images */}
        <div className="grid grid-cols-2 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`mobile-image-item relative aspect-square bg-gray-100 rounded-lg overflow-hidden ${
                isDragging && dragIndex === index ? 'opacity-50 scale-95' : ''
              } ${dragOverIndex === index ? 'ring-2 ring-blue-500' : ''}`}
              data-index={index}
              onTouchStart={(e) => handleTouchStart(e, index)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={image.imageUrl}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Selection overlay */}
              {isSelectionMode && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedImages.has(image.id)}
                    onChange={() => toggleImageSelection(image.id)}
                    className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              )}
              
              {/* Primary indicator */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                </div>
              )}
              
              {/* Order indicator */}
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-black bg-opacity-50 text-white text-xs font-bold rounded-full">
                  {image.imageOrder + 1}
                </span>
              </div>
              
              {/* Drag handle */}
              {!isSelectionMode && (
                <div className="absolute bottom-2 left-2">
                  <Move className="h-4 w-4 text-white drop-shadow-lg" />
                </div>
              )}
              
              {/* Actions overlay */}
              {!isSelectionMode && (
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        // Set as primary
                        setImages(prev => prev.map(img => ({
                          ...img,
                          isPrimary: img.id === image.id
                        })));
                      }}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                      title="Set as primary"
                    >
                      <Star className="h-4 w-4 text-gray-700" />
                    </button>
                    
                    <button
                      onClick={async () => {
                        try {
                          await deleteProductImage(image.id);
                          setImages(prev => prev.filter(img => img.id !== image.id));
                        } catch (error) {
                          console.error('Failed to delete image:', error);
                        }
                      }}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                      title="Delete image"
                    >
                      <Trash2 className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {images.length === 0 && uploadingImages.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
            <p className="text-gray-600 mb-4">Add your first product image to get started</p>
            <button
              onClick={() => setShowUploadOptions(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Images
            </button>
          </div>
        )}
      </div>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleGallerySelect}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />
    </div>
  );
};

export default MobileImageManagement;
