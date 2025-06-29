import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Shield, Zap, Gift } from 'lucide-react';
import { Product } from '../types';
import { db } from '../lib/supabase';
import { useCartStore } from '../store/cart';
import { useWalletStore } from '../store/wallet';
import { ReviewSection } from '../components/Products/ReviewSection';
import toast from 'react-hot-toast';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  
  const { addItem } = useCartStore();
  const { isConnected } = useWalletStore();

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      const productData = await db.getProduct(productId);
      setProduct(productData);
      if (productData.sizes.length > 0) {
        setSelectedSize(productData.sizes[0]);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (product.stock[selectedSize] < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    addItem(product, selectedSize, quantity);
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-300 mb-4">Product not found</p>
          <Link
            to="/products"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const availableStock = selectedSize ? product.stock[selectedSize] || 0 : 0;
  const isOutOfStock = availableStock === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-gray-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Products</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square bg-gray-800 rounded-2xl overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* NFT Badge */}
            <div className="absolute top-4 left-4">
              <div className="bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-sm px-3 py-2 rounded-full">
                <span className="text-white text-sm font-medium">🎨 NFT Included</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-purple-400">${product.price}</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-gray-300">4.8 (124 reviews)</span>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Size</h3>
              <div className="grid grid-cols-4 gap-3">
                {product.sizes.map((size) => {
                  const sizeStock = product.stock[size] || 0;
                  const isAvailable = sizeStock > 0;
                  
                  return (
                    <button
                      key={size}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`py-3 px-4 rounded-lg font-medium transition-all ${
                        selectedSize === size && isAvailable
                          ? 'bg-purple-600 text-white border-2 border-purple-500'
                          : isAvailable
                          ? 'bg-gray-700 text-white hover:bg-gray-600 border-2 border-transparent'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700'
                      }`}
                    >
                      {size}
                      {!isAvailable && <div className="text-xs mt-1">Out</div>}
                    </button>
                  );
                })}
              </div>
              {selectedSize && (
                <p className="text-sm text-gray-400 mt-2">
                  {availableStock} items available in {selectedSize}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-semibold text-white w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  disabled={quantity >= availableStock}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg font-semibold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || !selectedSize}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-6 w-6" />
                <span>
                  {isOutOfStock ? 'Out of Stock' : `Add to Cart - $${(product.price * quantity).toFixed(2)}`}
                </span>
              </button>

              {!isConnected && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-300 text-sm">
                    💡 Connect your wallet to mint NFTs automatically after purchase
                  </p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                <Zap className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-1">Instant NFT</h4>
                <p className="text-sm text-gray-400">Minted on purchase</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-1">Authentic</h4>
                <p className="text-sm text-gray-400">Blockchain verified</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                <Gift className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-1">Limited</h4>
                <p className="text-sm text-gray-400">
                  Edition {product.max_edition || 100}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection productId={product.id} />
      </div>
    </div>
  );
};