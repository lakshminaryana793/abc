import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const totalStock = Object.values(product.stock).reduce((sum, stock) => sum + stock, 0);
  const isOutOfStock = totalStock === 0;

  return (
    <div className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs">4.8</span>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
            {product.name}
          </h3>
          <span className="text-2xl font-bold text-purple-400">
            ${product.price}
          </span>
        </div>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Sizes:</span>
            <div className="flex space-x-1">
              {product.sizes.map((size) => (
                <span
                  key={size}
                  className={`px-2 py-1 text-xs rounded ${
                    product.stock[size] > 0
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-800 text-gray-500 line-through'
                  }`}
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg font-medium text-center transition-all duration-200 transform hover:scale-105"
          >
            View Details
          </Link>
          
          {!isOutOfStock && (
            <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              <ShoppingCart className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* NFT Badge */}
        <div className="mt-3 flex items-center justify-center">
          <div className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
            <span className="text-xs text-purple-300 font-medium">
              🎨 Includes NFT Collectible
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};