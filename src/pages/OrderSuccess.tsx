import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, CreditCard, Truck, ArrowRight, Wallet, Mail } from 'lucide-react';

export const OrderSuccess: React.FC = () => {
  const location = useLocation();
  
  const { orders, customerInfo, paymentMethod, totalAmount } = location.state || {};

  if (!orders) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-300 mb-4">Order not found</p>
          <Link
            to="/products"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const getPaymentMethodIcon = () => {
    switch (paymentMethod) {
      case 'card':
        return <CreditCard className="h-5 w-5 text-blue-400" />;
      case 'upi':
        return <CreditCard className="h-5 w-5 text-purple-400" />;
      case 'cod':
        return <Truck className="h-5 w-5 text-green-400" />;
      default:
        return <CreditCard className="h-5 w-5 text-blue-400" />;
    }
  };

  const getPaymentMethodText = () => {
    switch (paymentMethod) {
      case 'card':
        return 'Credit/Debit Card';
      case 'upi':
        return 'UPI';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return 'Card Payment';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Order Placed Successfully!</h1>
          <p className="text-xl text-gray-300">
            Thank you for your purchase. Your order is being processed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <Package className="h-6 w-6" />
              <span>Order Details</span>
            </h2>

            <div className="space-y-4">
              {orders.map((order: any, index: number) => (
                <div key={order.id} className="border-b border-gray-600 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-semibold">Order #{index + 1}</h3>
                      <p className="text-gray-400 text-sm">ID: {order.id.slice(0, 8)}...</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      {order.delivery_status || 'Confirmed'}
                    </span>
                  </div>
                  <div className="text-gray-300">
                    <p>Size: {order.size}</p>
                    <p>Quantity: {order.quantity}</p>
                    <p>Amount: ${order.total_amount}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-white">Total Amount</span>
                <span className="text-2xl font-bold text-purple-400">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="space-y-6">
            {/* Shipping Info */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Shipping Information</h3>
              <div className="text-gray-300 space-y-2">
                <p><strong>Name:</strong> {customerInfo.name}</p>
                <p><strong>Email:</strong> {customerInfo.email}</p>
                <p><strong>Phone:</strong> {customerInfo.phone}</p>
                <p><strong>Address:</strong> {customerInfo.address}</p>
                <p><strong>City:</strong> {customerInfo.city}, {customerInfo.state} - {customerInfo.pincode}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Payment Information</h3>
              <div className="flex items-center space-x-3">
                {getPaymentMethodIcon()}
                <span className="text-gray-300">{getPaymentMethodText()}</span>
              </div>
              {paymentMethod === 'cod' && (
                <p className="text-yellow-300 text-sm mt-2">
                  💵 Please keep ${totalAmount.toFixed(2)} ready for delivery
                </p>
              )}
            </div>
          </div>
        </div>

        {/* NFT Information Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Your NFT Collectibles</h2>
          <p className="text-xl text-gray-300 mb-6">
            Your purchase includes {orders.reduce((sum: number, order: any) => sum + order.quantity, 0)} unique NFT collectible{orders.reduce((sum: number, order: any) => sum + order.quantity, 0) > 1 ? 's' : ''}
          </p>
          
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-300 mb-3">🎉 NFT Ready for Claiming!</h3>
            <div className="text-left space-y-3 text-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">✓</div>
                <span>Order confirmed and ready for NFT claiming</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <span>Add your wallet address to claim your NFT</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <span>Mint your unique NFT collectible</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-blue-300 text-sm">
              🚀 <strong>Great News!</strong> Your NFTs are available for claiming immediately! 
              No waiting period required - just add your wallet address and claim your collectibles.
            </p>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Mail className="h-5 w-5 text-purple-400" />
              <span className="text-purple-300 font-medium">Remember Your Email</span>
            </div>
            <p className="text-purple-200 text-sm">
              Save this email address: <strong>{customerInfo.email}</strong><br/>
              You'll need it to find your orders and add your wallet address for NFT claiming.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
          >
            <span>Continue Shopping</span>
          </Link>
          <Link
            to="/orders"
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
          >
            <span>Track Orders</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/claim-nfts"
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
          >
            <Wallet className="h-5 w-5" />
            <span>Claim NFTs Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
};