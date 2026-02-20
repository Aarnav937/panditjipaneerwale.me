import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingCart, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { products } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

// Fallback image
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23f3f4f6' width='300' height='200'/%3E%3Ctext x='150' y='95' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='14'%3EProduct%3C/text%3E%3C/svg%3E";

const Wishlist = ({ isOpen, onClose, onAddToCart }) => {
    const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
    const { t } = useLanguage();

    // Get wishlist products
    const wishlistProducts = products.filter(p => wishlist.includes(p.id));

    const handleAddToCart = (product) => {
        onAddToCart(product);
        removeFromWishlist(product.id);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Wishlist Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-white dark:bg-gray-900 z-50 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                                    <Heart className="text-red-500 w-6 h-6" fill="currentColor" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Wishlist</h2>
                                    <p className="text-sm text-gray-500">{wishlistProducts.length} items</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {wishlistProducts.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                        <Heart className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Your wishlist is empty</h3>
                                        <p className="text-gray-500 text-sm">Save items you love by tapping the heart icon</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 bg-brand-orange text-white rounded-full font-medium hover:bg-brand-dark transition-colors"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {wishlistProducts.map(product => (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            className="flex gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl"
                                        >
                                            <div className="w-20 h-20 flex-shrink-0 bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
                                                <img
                                                    src={product.image || FALLBACK_IMAGE}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-brand-orange font-bold mt-1">AED {product.price}</p>
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleAddToCart(product)}
                                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-brand-orange text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
                                                    >
                                                        <ShoppingCart className="w-4 h-4" />
                                                        Add
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromWishlist(product.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {wishlistProducts.length > 0 && (
                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                                <button
                                    onClick={() => {
                                        wishlistProducts.forEach(p => onAddToCart(p));
                                        clearWishlist();
                                    }}
                                    className="w-full py-3 bg-brand-orange text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    Add All to Cart
                                </button>
                                <button
                                    onClick={clearWishlist}
                                    className="w-full py-2 text-gray-500 hover:text-red-500 text-sm transition-colors"
                                >
                                    Clear Wishlist
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Wishlist;
