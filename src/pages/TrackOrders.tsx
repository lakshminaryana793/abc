import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, MapPin, ArrowLeft, Star } from 'lucide-react';
import { useWalletStore } from '../store/wallet';
import { db } from '../lib/supabase';
import toast from 'react-hot-toast';

interface OrderWithProduct {
  id: string;
  user_address: string;
  product_id: string;
  size: string;
  quantity: number;
  total_amount: number;
  status: string;
  delivery_status: string;
  delivered_at?: string;
  nft_claimable: boolean;
  nft_minted: boolean;
  created_at: string;
  customer_info: any;
  payment_method: string;
  products: {
    name: string;
    image_url: string;
    price: number;
  };
}

export const TrackOrders: React.FC = () => {
  const { address, isConnected, connect } = useWalletStore();
  const [orders, setOrders] = useState<OrderWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const loadOrders = async () => {
    if (!address) return;
    
    try {
      const ordersData = await db.getOrders(address);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-400" />;
      case 'delivered':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      default:
        return <Package className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'shipped':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'delivered':
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Placed';
      case 'confirmed':
        return 'Confirmed';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'completed':
        return 'Completed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getTrackingSteps = (currentStatus: string) => {
    const steps = [
      { key: 'confirmed', label: 'Order Confirmed', icon: Package },
      { key: 'shipped', label: 'Shipped', icon: Truck },
      { key: 'delivered', label: 'Delivered', icon: MapPin },
      { key: 'completed', label: 'Completed', icon: CheckCircle }
    ];

    const statusOrder = ['confirmed', 'shipped', 'delivered', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Track Your Orders</h1>
          <p className="text-gray-300 mb-8">
            Connect your wallet to view your order history and tracking information
          </p>
          <button
            onClick={handleConnectWallet}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105"
          >
            <Package className="h-5 w-5" />
            <span>Connect Wallet</span>
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Track Your Orders</h1>
          <p className="text-xl text-gray-300">
            Monitor your order status and delivery progress
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No Orders Found</h2>
            <p className="text-gray-300 mb-8">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
            >
              <span>Start Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Info */}
                  <div className="lg:col-span-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={order.products.image_url}
                        alt={order.products.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {order.products.name}
                        </h3>
                        <p className="text-gray-400">Size: {order.size} • Qty: {order.quantity}</p>
                        <p className="text-purple-400 font-semibold">${order.total_amount}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Order ID:</span>
                        <span className="text-white">{order.id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Order Date:</span>
                        <span className="text-white">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Payment:</span>
                        <span className="text-white capitalize">{order.payment_method}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Progress */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Order Status</h4>
                      <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(order.delivery_status)}`}>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.delivery_status)}
                          <span>{getStatusText(order.delivery_status)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        {getTrackingSteps(order.delivery_status).map((step, index) => (
                          <div key={step.key} className="flex flex-col items-center relative">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                step.completed
                                  ? 'bg-purple-600 border-purple-600 text-white'
                                  : step.active
                                  ? 'bg-purple-600/20 border-purple-600 text-purple-400'
                                  : 'bg-gray-700 border-gray-600 text-gray-400'
                              }`}
                            >
                              <step.icon className="h-5 w-5" />
                            </div>
                            <span
                              className={`text-xs mt-2 text-center ${
                                step.completed || step.active ? 'text-white' : 'text-gray-400'
                              }`}
                            >
                              {step.label}
                            </span>
                            {index < getTrackingSteps(order.delivery_status).length - 1 && (
                              <div
                                className={`absolute top-5 left-10 w-full h-0.5 ${
                                  step.completed ? 'bg-purple-600' : 'bg-gray-600'
                                }`}
                                style={{ width: 'calc(100% + 2.5rem)' }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {order.delivered_at && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-green-300 text-sm font-medium">Delivered</span>
                          </div>
                          <p className="text-green-200 text-xs mt-1">
                            {new Date(order.delivered_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {order.nft_claimable && !order.nft_minted && (
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-purple-400" />
                            <span className="text-purple-300 text-sm font-medium">NFT Ready</span>
                          </div>
                          <p className="text-purple-200 text-xs mt-1">
                            Ready to claim your NFT
                          </p>
                        </div>
                      )}

                      {order.nft_minted && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-400" />
                            <span className="text-blue-300 text-sm font-medium">NFT Claimed</span>
                          </div>
                          <p className="text-blue-200 text-xs mt-1">
                            NFT successfully minted
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {orders.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/claim-nfts"
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
            >
              <Star className="h-5 w-5" />
              <span>Claim NFTs</span>
            </Link>
            <Link
              to="/products"
              className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
            >
              <span>Continue Shopping</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};