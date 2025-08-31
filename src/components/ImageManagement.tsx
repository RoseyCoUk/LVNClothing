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
  Loader2
} from 'lucide-react';

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  image_order: number;
  is_primary: boolean;
  is_thumbnail: boolean;
  created_at: string;
}

interface UploadingImage {
  id: string;
  file: File;
  preview: string;
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
}

const ImageManagement: React.FC<ImageManagementProps> = ({
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
  
  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Update parent component when images change
  useEffect(() => {
    onImagesUpdate(images);
  }, [images, onImagesUpdate]);

  // Generate unique ID for uploading images
  const generateUploadId = () => `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Image optimization function
  const optimizeImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate optimal dimensions (max 800x800 for admin, maintain aspect ratio)
        const maxDimension = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw optimized image
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality optimization
        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Generate thumbnail for admin display
  const generateThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Thumbnail dimensions (200x200)
        const thumbSize = 200;
        let { width, height } = img;
        
        // Calculate thumbnail dimensions maintaining aspect ratio
        if (width > height) {
          height = (height * thumbSize) / width;
          width = thumbSize;
        } else {
          width = (width * thumbSize) / height;
          height = thumbSize;
        }
        
        canvas.width = thumbSize;
        canvas.height = thumbSize;
        
        // Center the image in the thumbnail
        const offsetX = (thumbSize - width) / 2;
        const offsetY = (thumbSize - height) / 2;
        
        ctx?.drawImage(img, offsetX, offsetY, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file selection
  const handleFileSelect = async (files: FileList) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;

    const newUploadingImages: UploadingImage[] = [];
    
    for (const file of imageFiles) {
      const uploadId = generateUploadId();
      const thumbnail = await generateThumbnail(file);
      
      newUploadingImages.push({
        id: uploadId,
        file,
        preview: thumbnail,
        progress: 0,
        status: 'uploading'
      });
    }
    
    setUploadingImages(prev => [...prev, ...newUploadingImages]);
    
    // Start upload process
    processUploads(newUploadingImages);
  };

  // Process uploads with progress tracking
  const processUploads = async (uploadingImages: UploadingImage[]) => {
    for (const uploadingImage of uploadingImages) {
      try {
        // Optimize image
        const optimizedFile = await optimizeImage(uploadingImage.file);
        
        // Generate storage path
        const timestamp = Date.now();
        const path = `products/${productId}/${timestamp}_${uploadingImage.file.name}`;
        
        // Update progress to 25%
        setUploadingImages(prev => prev.map(img => 
          img.id === uploadingImage.id 
            ? { ...img, progress: 25 }
            : img
        ));
        
        // Upload to Supabase Storage
        const result = await uploadImage(optimizedFile, 'product-images', path);
        
        // Update progress to 75%
        setUploadingImages(prev => prev.map(img => 
          img.id === uploadingImage.id 
            ? { ...img, progress: 75 }
            : img
        ));
        
        // Create product image record
        const newImage: Omit<ProductImage, 'id' | 'created_at'> = {
          product_id: productId,
          image_url: result.url,
          image_order: images.length + uploadingImages.indexOf(uploadingImage),
          is_primary: images.length === 0 && uploadingImages.indexOf(uploadingImage) === 0
        };
        
        const createdImage = await createProductImage(newImage);
        
        // Update progress to 100% and mark as success
        setUploadingImages(prev => prev.map(img => 
          img.id === uploadingImage.id 
            ? { ...img, progress: 100, status: 'success' }
            : img
        ));
        
        // Add to images array
        setImages(prev => [...prev, createdImage]);
        
        // Remove from uploading after a delay
        setTimeout(() => {
          setUploadingImages(prev => prev.filter(img => img.id !== uploadingImage.id));
        }, 2000);
        
      } catch (error) {
        console.error('Upload failed:', error);
        
        // Mark as error
        setUploadingImages(prev => prev.map(img => 
          img.id === uploadingImage.id 
            ? { 
                ...img, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Upload failed' 
              }
            : img
        ));
      }
    }
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, []);

  // Image reordering handlers
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null) return;
    
    setDragOverIndex(index);
  };

  const handleDragEnd = async () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      const newImages = [...images];
      const draggedImage = newImages[dragIndex];
      
      // Remove from old position
      newImages.splice(dragIndex, 1);
      // Insert at new position
      newImages.splice(dragOverIndex, 0, draggedImage);
      
      // Update order numbers
      newImages.forEach((img, idx) => {
        img.image_order = idx;
      });
      
      setImages(newImages);
      
      // Save new order to database
      try {
        const imageIds = newImages.map(img => img.id);
        await reorderProductImages(productId, imageIds);
      } catch (error) {
        console.error('Failed to reorder images:', error);
      }
    }
    
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // Set primary image
  const handleSetPrimary = async (imageId: string) => {
    try {
      // Update all images to not primary
      const updatedImages = images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      }));
      
      // Update in database
      for (const img of updatedImages) {
        await updateProductImage(img.id, { is_primary: img.is_primary });
      }
      
      setImages(updatedImages);
    } catch (error) {
      console.error('Failed to set primary image:', error);
    }
  };

  // Delete image
  const handleDeleteImage = async (imageId: string) => {
    try {
      const imageToDelete = images.find(img => img.id === imageId);
      if (!imageToDelete) return;
      
      // Delete from database
      await deleteProductImage(imageId);
      
      // Remove from state
      setImages(prev => prev.filter(img => img.id !== imageId));
      
      // If this was the primary image and there are other images, set the first one as primary
      if (imageToDelete.is_primary && images.length > 1) {
        const remainingImages = images.filter(img => img.id !== imageId);
        if (remainingImages.length > 0) {
          await handleSetPrimary(remainingImages[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  // Remove uploading image
  const handleRemoveUploading = (uploadId: string) => {
    setUploadingImages(prev => prev.filter(img => img.id !== uploadId));
  };

  // Retry failed upload
  const handleRetryUpload = (uploadingImage: UploadingImage) => {
    setUploadingImages(prev => prev.map(img => 
      img.id === uploadingImage.id 
        ? { ...img, status: 'uploading', progress: 0, error: undefined }
        : img
    ));
    
    processUploads([uploadingImage]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Image Management
                </h3>
                <p className="text-sm text-gray-500">
                  Manage images for {productName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Upload Section */}
            <div className="mb-8">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Upload New Images</h4>
              
              {/* Drop Zone */}
              <div
                ref={dropZoneRef}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                  className="hidden"
                />
                
                <Upload className={`mx-auto h-12 w-12 mb-4 ${
                  isDragging ? 'text-blue-500' : 'text-gray-400'
                }`} />
                
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {isDragging ? 'Drop images here' : 'Drag and drop images here'}
                  </p>
                  <p className="text-sm text-gray-500">
                    or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      browse files
                    </button>
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF up to 10MB • Images will be automatically optimized
                  </p>
                </div>
              </div>
            </div>

            {/* Uploading Images */}
            {uploadingImages.length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Uploading Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadingImages.map((uploadingImage) => (
                    <div key={uploadingImage.id} className="relative border border-gray-200 rounded-lg overflow-hidden">
                      {/* Preview */}
                      <div className="relative h-32 bg-gray-100">
                        <img
                          src={uploadingImage.preview}
                          alt="Uploading preview"
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Status Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          {uploadingImage.status === 'uploading' && (
                            <div className="text-center">
                              <Loader2 className="h-6 w-6 animate-spin text-white mx-auto mb-2" />
                              <div className="w-16 bg-white bg-opacity-30 rounded-full h-2">
                                <div 
                                  className="bg-white h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadingImage.progress}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-white mt-1">{uploadingImage.progress}%</p>
                            </div>
                          )}
                          
                          {uploadingImage.status === 'success' && (
                            <div className="text-center">
                              <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
                              <p className="text-xs text-white">Uploaded!</p>
                            </div>
                          )}
                          
                          {uploadingImage.status === 'error' && (
                            <div className="text-center">
                              <AlertCircle className="h-6 w-6 text-red-400 mx-auto mb-2" />
                              <p className="text-xs text-white">Failed</p>
                              <p className="text-xs text-red-300">{uploadingImage.error}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveUploading(uploadingImage.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      
                      {/* Retry Button for Failed Uploads */}
                      {uploadingImage.status === 'error' && (
                        <div className="p-2">
                          <button
                            onClick={() => handleRetryUpload(uploadingImage)}
                            className="w-full px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                          >
                            Retry Upload
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Images */}
            {images.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  Current Images ({images.length})
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`relative group border-2 rounded-lg overflow-hidden transition-all ${
                        dragIndex === index 
                          ? 'border-blue-500 shadow-lg scale-105' 
                          : dragOverIndex === index
                          ? 'border-blue-300 border-dashed'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                                              onDragOver={(e) => handleImageDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Drag Handle */}
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <GripVertical className="h-4 w-4 text-white bg-black bg-opacity-50 rounded p-1" />
                      </div>

                      {/* Order Number */}
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {image.image_order + 1}
                      </div>

                      {/* Primary Badge */}
                      {image.is_primary && (
                        <div className="absolute top-2 left-8 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          <Star className="h-3 w-3 inline mr-1" />
                          Primary
                        </div>
                      )}

                      {/* Image */}
                      <img
                        src={image.image_url}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/public/BackReformLogo.png';
                        }}
                      />

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleSetPrimary(image.id)}
                            disabled={image.is_primary}
                            className={`p-2 rounded-full ${
                              image.is_primary
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                            title="Set as primary"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => window.open(image.image_url, '_blank')}
                            className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"
                            title="Preview image"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                            title="Delete image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="mt-3 text-sm text-gray-500">
                  Drag and drop images to reorder. The first image will be the primary image.
                </p>
              </div>
            )}

            {/* Empty State */}
            {images.length === 0 && uploadingImages.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No images uploaded yet</p>
                <p className="text-sm text-gray-400">Upload some images to get started</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {images.length} image{images.length !== 1 ? 's' : ''} • 
                {images.filter(img => img.is_primary).length > 0 ? ' Primary image set' : ' No primary image'}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageManagement;
