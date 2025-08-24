import React, { useState } from 'react';
import { Check, Plus, Minus } from 'lucide-react';
import type { StickerAddon } from '../types/printful';

interface StickerAddonSelectorProps {
  availableStickers: StickerAddon[];
  selectedStickers: Array<{ sticker: StickerAddon; quantity: number }>;
  onStickerChange: (sticker: StickerAddon, quantity: number) => void;
  className?: string;
}

const StickerAddonSelector: React.FC<StickerAddonSelectorProps> = ({
  availableStickers,
  selectedStickers,
  onStickerChange,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleQuantityChange = (sticker: StickerAddon, newQuantity: number) => {
    if (newQuantity < 0) return;
    onStickerChange(sticker, newQuantity);
  };

  const getSelectedStickerQuantity = (stickerId: string) => {
    const selected = selectedStickers.find(s => s.sticker.id === stickerId);
    return selected ? selected.quantity : 0;
  };

  const totalStickerPrice = selectedStickers.reduce((total, item) => {
    return total + (item.sticker.price * item.quantity);
  }, 0);

  if (availableStickers.length === 0) {
    return null;
  }

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Add Stickers</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {isExpanded ? 'Hide' : 'Show'} Options
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {availableStickers.map((sticker) => {
            const currentQuantity = getSelectedStickerQuantity(sticker.id);
            
            return (
              <div key={sticker.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={sticker.image}
                    alt={sticker.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{sticker.name}</h4>
                    <p className="text-sm text-gray-600">{sticker.description}</p>
                    <p className="text-sm font-medium text-blue-600">£{sticker.price.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {currentQuantity > 0 && (
                    <button
                      onClick={() => handleQuantityChange(sticker, currentQuantity - 1)}
                      className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                  
                  {currentQuantity > 0 && (
                    <span className="w-8 text-center font-medium">{currentQuantity}</span>
                  )}
                  
                  <button
                    onClick={() => handleQuantityChange(sticker, currentQuantity + 1)}
                    className={`p-2 rounded-lg transition-colors ${
                      currentQuantity > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {currentQuantity > 0 ? (
                      <Plus className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">Add</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
          
          {totalStickerPrice > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Sticker Total:</span>
                <span className="font-bold text-blue-600">£{totalStickerPrice.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StickerAddonSelector;
