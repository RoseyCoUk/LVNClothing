import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../ui/button';

interface Product {
  id: string;
  name: string;
  price: number;
  slug: string;
  description: string;
  image_url: string;
  category: string;
  stock_quantity: number;
  tags: string[];
  rating: number;
  review_count: number;
}

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  isNewProduct?: boolean;
  onClose: () => void;
  onSave: (product: Product | Omit<Product, 'id'>) => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  isOpen,
  isNewProduct = false,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    category: '',
    stock_quantity: 0,
    image_url: '',
    tags: []
  });

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        stock_quantity: product.stock_quantity,
        image_url: product.image_url,
        tags: product.tags
      });
    } else if (isNewProduct && isOpen) {
      setFormData({
        name: '',
        price: 0,
        description: '',
        category: 'apparel',
        stock_quantity: 0,
        image_url: '',
        tags: []
      });
    }
  }, [product, isOpen, isNewProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isNewProduct) {
      onSave({
        ...formData,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        rating: 0,
        review_count: 0
      });
    } else if (product) {
      onSave({
        ...product,
        ...formData
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {isNewProduct ? 'Add New Product' : 'Edit Product'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (£)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                required
              >
                <option value="apparel">Apparel</option>
                <option value="gear">Gear</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-lvn-maroon hover:bg-lvn-maroon/90">
                <Save className="w-4 h-4 mr-2" />
                {isNewProduct ? 'Create Product' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductEditModal;
