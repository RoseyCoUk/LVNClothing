import React, { useEffect, useState } from 'react';
import { ArrowLeft, Package, Calendar, CreditCard, Eye, Download, X, AlertCircle, CheckCircle } from 'lucide-react';
import { getUserOrders } from '../../lib/stripe';
import { cancelOrder } from '../../lib/api';
import { products } from '../../stripe-config';
import { useAuth } from '../../contexts/AuthContext';

interface OrdersPageProps {
  onBack: () => void;
}

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount / 100);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  const items = Array.isArray(order.items) ? order.items : (order.items ? JSON.parse(order.items) : []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order #{order.readable_order_id || 'Processing...'}</h2>
        <div className="text-sm text-gray-600 mb-4">
          <div>Date: {formatDate(order.created_at)}</div>
          <div>Email: {order.customer_email}</div>
          <div>Total: {formatCurrency(order.amount_total || 0)}</div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Items Ordered</h3>
          {items && items.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {items.map((item: any, idx: number) => (
                <li key={idx} className="py-2 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-800">{item.name || item.product_name}</div>
                    {item.variant && <div className="text-xs text-gray-500">{item.variant}</div>}
                  </div>
                  <div className="text-sm text-gray-700">Qty: {item.quantity || 1}</div>
                  <div className="text-sm text-gray-700">{formatCurrency(item.price_pence || (item.price ? Math.round(Number(item.price) * 100) : 0))}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 text-sm">No item details available.</div>
          )}
        </div>
        <button onClick={onClose} className="w-full bg-[lvn-maroon] hover:bg-lvn-maroon-dark text-white font-bold py-3 px-6 rounded-lg transition-colors mt-2">Close</button>
      </div>
    </div>
  );
};

const OrdersPage = ({ onBack }: OrdersPageProps) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState<any | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);
  const [reorderingOrder, setReorderingOrder] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        // Check if user is authenticated
        if (!user) {
          window.location.href = '/login';
          return;
        }

        const orderData = await getUserOrders();
        
        // Validate order data before setting
        if (Array.isArray(orderData)) {
          const validatedOrders = orderData.filter(order => 
            order && 
            order.id && 
            (order.readable_order_id || order.id) &&
            order.created_at
          );
          setOrders(validatedOrders);
        } else {
          console.warn('getUserOrders returned non-array data:', orderData);
          setOrders([]);
        }
      } catch (error) {
        console.error('Failed to load orders:', error);
        setOrders([]);
        // Show error message to user
        setReorderError('Failed to load order history. Please refresh the page and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelOrder = async (orderId: string, reason?: string) => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setCancellingOrder(orderId);
    setCancelError(null);
    setCancelSuccess(null);

    try {
      await cancelOrder(orderId, reason);
      
      // Update the order in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'canceled', canceled_at: new Date().toISOString() }
            : order
        )
      );

      setCancelSuccess('Order cancelled successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setCancelSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to cancel order';
      if (error.message) {
        if (error.message.includes('log in again')) {
          errorMessage = 'Please log in again to cancel your order';
        } else if (error.message.includes('Order not found')) {
          errorMessage = 'Order not found. Please refresh the page and try again.';
        } else if (error.message.includes('already cancelled')) {
          errorMessage = 'This order has already been cancelled.';
        } else if (error.message.includes('cannot be cancelled')) {
          errorMessage = 'This order cannot be cancelled.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setCancelError(errorMessage);
      
      // Clear error message after 8 seconds to give users time to read it
      setTimeout(() => setCancelError(null), 8000);
    } finally {
      setCancellingOrder(null);
    }
  };

  const handleReorder = async (order: any) => {
    if (!order || !order.items) {
      setReorderError('Cannot reorder: Order items not available');
      return;
    }

    try {
      setReorderingOrder(order.id);
      setReorderError(null);
      setReorderSuccess(null);

      // Parse order items
      let orderItems = [];
      try {
        orderItems = Array.isArray(order.items) ? order.items : JSON.parse(order.items);
      } catch (parseError) {
        console.error('Failed to parse order items:', parseError);
        setReorderError('Cannot reorder: Order items format is invalid');
        return;
      }

      if (!Array.isArray(orderItems) || orderItems.length === 0) {
        setReorderError('Cannot reorder: No valid items found in this order');
        return;
      }

      // Convert order items to cart format
      const cartItems = orderItems.map((item: any) => ({
        id: item.printful_variant_id || item.id || `item_${Date.now()}_${Math.random()}`,
        name: item.name || item.product_name || 'Unknown Product',
        price: item.price || item.price_pence / 100 || 0,
        quantity: item.quantity || 1,
        image: item.image || '/placeholder-product.png',
        printful_variant_id: item.printful_variant_id,
        variant: item.variant
      }));

      // Store items in session storage for cart restoration
      sessionStorage.setItem('reorderItems', JSON.stringify(cartItems));
      
      // Navigate to shop page with reorder items
      window.location.href = '/shop?reorder=true';
      
      setReorderSuccess('Items added to cart! Redirecting to shop...');
      
      // Clear success message after 3 seconds
      setTimeout(() => setReorderSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Reorder error:', error);
      setReorderError(error.message || 'Failed to reorder items. Please try again.');
    } finally {
      setReorderingOrder(null);
    }
  };

  const canCancelOrder = (order: any) => {
    // Only allow cancellation of pending or confirmed orders
    const cancellableStatuses = ['pending', 'confirmed', 'processing'];
    return cancellableStatuses.includes(order.status?.toLowerCase());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-[lvn-maroon] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="flex items-center space-x-3">
                <Package className="w-6 h-6 text-[lvn-maroon]" />
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-[lvn-maroon] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <Package className="w-6 h-6 text-[lvn-maroon]" />
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <button
              onClick={onBack}
              className="bg-[lvn-maroon] hover:bg-lvn-maroon-dark text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order History ({orders.length})
              </h2>
              <p className="text-gray-600">
                View and manage your LVN Clothing merchandise orders
              </p>
            </div>

            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.readable_order_id || 'Processing...'}
                    </h3>
                    <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[lvn-maroon]">
                      {formatCurrency(order.amount_total || 0)}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status || 'Processing'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
                  <button 
                    className="flex items-center space-x-2 text-[lvn-maroon] hover:text-lvn-maroon-dark font-medium text-sm" 
                    onClick={() => setViewOrder(order)}
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  
                  {/* Reorder Button */}
                  <button 
                    className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium text-sm"
                    onClick={() => handleReorder(order)}
                    disabled={reorderingOrder === order.id}
                  >
                    {reorderingOrder === order.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        <span>Adding to Cart...</span>
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4" />
                        <span>Reorder</span>
                      </>
                    )}
                  </button>
                  
                  {canCancelOrder(order) && (
                    <button 
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium text-sm"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrder === order.id}
                    >
                      {cancellingOrder === order.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          <span>Cancel Order</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-medium text-sm">
                    <Download className="w-4 h-4" />
                    <span>Download Receipt</span>
                  </button>
                </div>
              </div>
            ))}

          {/* Error and Success Messages */}
          {cancelError && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-800">{cancelError}</span>
              </div>
            </div>
          )}

          {cancelSuccess && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-800">{cancelSuccess}</span>
              </div>
            </div>
          )}

          {/* Reorder Status Messages */}
          {reorderError && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-800">{reorderError}</span>
              </div>
            </div>
          )}

          {reorderSuccess && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-800">{reorderSuccess}</span>
              </div>
            </div>
          )}

          </div>
        )}
      </div>

      {viewOrder && <OrderDetailsModal order={viewOrder} onClose={() => setViewOrder(null)} />}
    </div>
  );
};

export default OrdersPage;