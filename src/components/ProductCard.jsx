import React from 'react';

const ProductCard = ({ product, addToCart }) => {
  // Guard clause in case product data is missing
  if (!product) return null;

  return (
    <div className="group relative bg-white dark:bg-brand-card border border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Image Container with Gradient Overlay */}
      <div className="relative h-52 w-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-brand-card p-4 overflow-hidden">
        <div className="absolute inset-0 bg-brand-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain drop-shadow-md transform group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        {/* Quick Action Overlay (Optional) */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <span className="bg-white dark:bg-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow text-brand-orange">
             {product.category || 'Fresh'}
           </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow relative">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 leading-tight line-clamp-2 group-hover:text-brand-orange transition-colors">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
           {product.description || 'Premium quality product'}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Price</span>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
              ${product.price}
            </span>
          </div>
          
          <button
            onClick={() => addToCart(product)}
            className="flex-1 bg-gradient-to-r from-brand-orange to-red-500 hover:from-brand-dark hover:to-red-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transform active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>Add</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;