import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';

// Fallback image as data URI (simple product placeholder)
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23f3f4f6' width='300' height='200'/%3E%3Ctext x='150' y='95' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='14'%3EProduct Image%3C/text%3E%3Cpath d='M130 110 L150 90 L170 110 L160 110 L160 130 L140 130 L140 110 Z' fill='%23d1d5db'/%3E%3C/svg%3E";

const ProductCard = ({ product, addToCart, onViewDetails }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { t } = useLanguage();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Guard clause in case product data is missing
  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);

  // Determine the image source - use fallback if error or if it's a placeholder URL
  const imageSrc = imageError || product.image?.includes('placeholder')
    ? FALLBACK_IMAGE
    : product.image;

  // Check if product is available
  const isAvailable = product.is_available !== false && (product.stock_quantity === undefined || product.stock_quantity > 0);

  return (
    <div 
      onClick={() => onViewDetails && onViewDetails(product)}
      className={`group relative bg-[#FFFDF0] dark:bg-brand-card border border-brand-gold/25 dark:border-brand-gold/15 rounded-2xl shadow-gold-glow shadow-md hover:shadow-gold-glow-hover overflow-hidden transition-all duration-300 hover:-translate-y-1.5 cursor-pointer ${!isAvailable ? 'opacity-75' : ''}`}
    >
      {/* Decorative Gold Header Bar */}
      <div className="h-1 bg-gradient-to-r from-brand-gold/50 via-brand-saffron to-brand-gold/50" />

      {/* Image Container with Gradient Overlay */}
      <div className="relative h-52 w-full bg-gradient-to-b from-[#FFFDF9] to-[#FFF5E6] dark:from-brand-card dark:to-gray-800 p-4 overflow-hidden">
        <div className="absolute inset-0 bg-brand-saffron/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Skeleton Loader - shows while image is loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}

        <img
          src={imageSrc}
          alt={product.name}
          className={`w-full h-full object-contain drop-shadow-md transform group-hover:scale-110 transition-all duration-500 ease-out ${imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => { setImageError(true); setImageLoaded(true); }}
        />

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 left-3 p-2 rounded-full shadow-md transition-all duration-200 ${isWishlisted
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:scale-110'
            }`}
        >
          <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Category Badge */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-brand-saffron/10 text-brand-saffron dark:bg-brand-saffron/20 border border-brand-saffron/20 text-xs font-bold px-2 py-1 rounded-full shadow">
            {product.category || 'Fresh'}
          </span>
        </div>

        {/* Quick View Tag on Hover */}
        <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-black/70 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
            Quick View
          </span>
        </div>

        {/* Out of Stock Badge */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow relative bg-[#FFFDF9] dark:bg-brand-card">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 leading-tight line-clamp-2 group-hover:text-brand-saffron transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
          {product.description || 'Premium quality product'}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Price</span>
            <span className="text-xl font-black text-brand-saffron">
              AED {product.price}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            disabled={!isAvailable}
            className={`flex-1 font-bold py-2.5 px-4 rounded-xl shadow-lg transform active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 ${isAvailable
                ? 'bg-gradient-to-r from-brand-saffron to-brand-orange hover:from-brand-saffron hover:to-red-500 text-white shadow-saffron/30 hover:shadow-saffron/50'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
          >
            <span>{isAvailable ? t('add') : 'Unavailable'}</span>
            {isAvailable && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;