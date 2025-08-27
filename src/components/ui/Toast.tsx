import React, { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  isVisible, 
  onClose, 
  duration = 3000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !isAnimating) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
          bg-white border border-gray-200 text-gray-900
          transform transition-all duration-300 ease-in-out
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setIsAnimating(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

// Hook for managing toast state
export const useToast = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  const showToast = (msg: string) => {
    setMessage(msg);
    setIsVisible(true);
  };

  const hideToast = () => {
    setIsVisible(false);
  };

  return { isVisible, message, showToast, hideToast };
};
