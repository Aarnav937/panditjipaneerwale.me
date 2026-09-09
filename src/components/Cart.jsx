import React, { useState, useEffect } from 'react';
import { 
  X, Trash2, MessageCircle, ShoppingBag, ShoppingCart, 
  ArrowRight, Plus, Minus, Clock, Truck, Heart, Package, RotateCcw, Check, Sparkles, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { useWishlist } from '../context/WishlistContext';
import { products } from '../data/products';
import { useMediaQuery, useVisualViewport } from '../lib/useMediaQuery';

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23FFF8F2' width='300' height='200'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='%23D4AF37' font-family='sans-serif' font-size='14' font-weight='700'%3E🧀 Pandit Ji Fresh%3C/text%3E%3C/svg%3E";

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning (9AM - 12PM)', value: 'Morning (9AM - 12PM)' },
  { id: 'afternoon', label: 'Afternoon (12PM - 4PM)', value: 'Afternoon (12PM - 4PM)' },
  { id: 'evening', label: 'Evening (4PM - 8PM)', value: 'Evening (4PM - 8PM)' },
  { id: 'nextday', label: 'Next Day Delivery', value: 'Next Day' },
];

const Cart = ({ isOpen, onClose, cartItems, removeFromCart, updateQuantity, onOrderPlaced, onAddToCart, onReorder }) => {
  const [activeTab, setActiveTab] = useState('cart');
  
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('customerName') || '');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('customerPhone') || '');
  const [address, setAddress] = useState(() => localStorage.getItem('customerAddress') || '');
  const [timeSlot, setTimeSlot] = useState(() => localStorage.getItem('deliveryTimeSlot') || 'morning');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { t } = useLanguage();
  const { placeOrder, loginAsGuest } = useAuth();
  const { checkAdminCode } = useAdmin();
  const isPhone = useMediaQuery('(max-width: 767px)');
  const viewport = useVisualViewport();

  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleWishlistAddToCart = (product) => {
    onAddToCart(product);
    removeFromWishlist(product.id);
  };

  const [orders, setOrders] = useState([]);
  useEffect(() => {
    if (isOpen) {
      const savedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      setOrders(savedOrders);
    }
  }, [isOpen]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReorderClick = (order) => {
    if (onReorder) {
      onReorder(order.items);
    }
    setActiveTab('cart');
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your order history?')) {
      localStorage.setItem('orderHistory', '[]');
      setOrders([]);
    }
  };

  // Check for admin secret code in address field
  useEffect(() => {
    if (address) {
      const isAdmin = checkAdminCode(address);
      if (isAdmin) {
        setAddress('');
        localStorage.removeItem('customerAddress');
        onClose();
      }
    }
  }, [address, checkAdminCode, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setTimeout(() => setActiveTab('cart'), 300);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => localStorage.setItem('customerName', customerName), [customerName]);
  useEffect(() => localStorage.setItem('customerPhone', customerPhone), [customerPhone]);
  useEffect(() => localStorage.setItem('customerAddress', address), [address]);
  useEffect(() => localStorage.setItem('deliveryTimeSlot', timeSlot), [timeSlot]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 0;
  const grandTotal = total;

  const handleCheckout = async () => {
    if (!address.trim()) {
      alert('Please enter your Abu Dhabi delivery address.');
      return;
    }

    if (!customerPhone.trim()) {
      alert('Please enter your phone number for order updates.');
      return;
    }

    setIsSubmitting(true);
    const selectedTimeSlot = TIME_SLOTS.find(t => t.id === timeSlot)?.value || 'Not specified';

    try {
      await loginAsGuest(customerPhone, customerName, address);
      const orderNotes = `Time: ${selectedTimeSlot}`;
      const result = await placeOrder(cartItems, grandTotal, orderNotes);
      if (!result.success) {
        console.warn('Supabase backup logged with note:', result.error);
      }
    } catch (error) {
      console.warn('Supabase checkout handling note:', error);
    }

    const order = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: cartItems.map(item => ({ ...item })),
      total: grandTotal,
      subtotal: total,
      deliveryFee,
      address,
      customerName,
      customerPhone,
      timeSlot: selectedTimeSlot,
    };

    const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    existingOrders.unshift(order);
    localStorage.setItem('orderHistory', JSON.stringify(existingOrders.slice(0, 20)));
    setOrders(existingOrders.slice(0, 20));

    if (onOrderPlaced) {
      onOrderPlaced(order);
    }

    // Format WhatsApp invoice order
    const message = `🧀 *NEW ORDER: Pandit Ji Paneer Wale*

*Customer Details:*
• Name: ${customerName || 'Customer'}
• Phone: ${customerPhone}
• Address: ${address} (Abu Dhabi)
• Preferred Delivery: ${selectedTimeSlot}

*Order Items:*
${cartItems.map(item => `• ${item.name} × ${item.quantity} = AED ${item.price * item.quantity}`).join('\n')}

*Delivery:* FREE (Abu Dhabi)
*Grand Total:* AED ${grandTotal}

_Thank you! Please confirm delivery timing._`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/971524676306?text=${encodedMessage}`, '_blank');
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
            onClick={onClose}
          />

          <motion.div
            initial={isPhone ? { y: '100%' } : { x: '100%' }}
            animate={isPhone ? { y: 0 } : { x: 0 }}
            exit={isPhone ? { y: '100%' } : { x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:right-0 md:top-0 w-full md:w-[440px] bg-white dark:bg-slate-900 z-[90] shadow-2xl flex flex-col border-t md:border-t-0 md:border-l border-gray-200 dark:border-white/10 rounded-t-3xl md:rounded-none overflow-hidden"
            style={isPhone ? { height: viewport.height, top: viewport.offsetTop } : { height: '100%' }}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-white/10 flex flex-col gap-3 shrink-0">
              {isPhone && (
                <div className="mx-auto -mt-1 mb-1 h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-700" aria-hidden />
              )}
              <div className="accent-gold-line -mx-4 sm:-mx-5 mb-1 opacity-70" />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-orange/20">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-brand-charcoal dark:text-white">
                      Your Shopping Bag
                    </h2>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Abu Dhabi • Free Delivery
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex bg-gray-100 dark:bg-slate-800/80 p-1 rounded-2xl">
                <button
                  onClick={() => setActiveTab('cart')}
                  className={`flex-1 py-2 flex justify-center items-center gap-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'cart'
                      ? 'bg-white dark:bg-slate-900 text-brand-orange shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-brand-charcoal'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Cart</span>
                  {cartItems.length > 0 && (
                    <span className="bg-brand-orange text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                      {cartItems.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`flex-1 py-2 flex justify-center items-center gap-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'wishlist'
                      ? 'bg-white dark:bg-slate-900 text-brand-orange shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-brand-charcoal'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Wishlist</span>
                  {wishlistProducts.length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                      {wishlistProducts.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex-1 py-2 flex justify-center items-center gap-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'orders'
                      ? 'bg-white dark:bg-slate-900 text-brand-orange shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-brand-charcoal'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>History</span>
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-amber-50/20 dark:bg-slate-950/40">
              {activeTab === 'cart' && (
                <>
                  {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                      <div className="w-20 h-20 rounded-full bg-amber-500/10 text-brand-orange flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-brand-charcoal dark:text-white">Your bag is empty</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mt-1">
                          Explore our artisan paneer, fresh dairy, and authentic spices to get started!
                        </p>
                      </div>
                      <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-brand-orange to-amber-500 text-white text-xs font-black shadow-md hover:shadow-lg transition-all"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Free Delivery Banner */}
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                        <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold">
                          🎉 <strong>Free Delivery Unlocked</strong> for Abu Dhabi addresses!
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="space-y-3">
                        {cartItems.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex gap-3 bg-white dark:bg-slate-800/90 p-3 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm"
                          >
                            <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden image-plate flex items-center justify-center p-1 border border-gray-100 dark:border-white/5">
                              <img
                                src={item.image?.includes('placeholder') ? FALLBACK_IMAGE : item.image}
                                alt={item.name}
                                className="product-cutout w-full h-full object-contain"
                                onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                              />
                            </div>

                            <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                <div className="flex justify-between items-start gap-1">
                                  <h4 className="font-bold text-xs sm:text-sm text-brand-charcoal dark:text-white line-clamp-2 leading-snug">
                                    {item.name}
                                  </h4>
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    aria-label="Remove item"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <span className="text-xs font-black text-brand-orange dark:text-amber-400">
                                  AED {item.price}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-2">
                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700/80 p-0.5 rounded-xl">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-200 shadow-sm disabled:opacity-40"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="w-7 text-center font-black text-xs text-brand-charcoal dark:text-white">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-200 shadow-sm"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                  AED {item.price * item.quantity}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Delivery Details Form */}
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
                        <h3 className="text-sm font-bold text-brand-charcoal dark:text-white mb-2 flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-brand-orange" />
                          <span>Delivery Details (Abu Dhabi)</span>
                        </h3>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                          No pre-payment required. Pay cash or instant transfer upon delivery.
                        </p>

                        <div className="space-y-3 bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm">
                          <div>
                            <label className="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                              Your Name
                            </label>
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="e.g. Rahul Sharma"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900/50 text-brand-charcoal dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                              Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="+971 5X XXX XXXX"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900/50 text-brand-charcoal dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                              Abu Dhabi Delivery Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="Flat/Villa No, Building, Street, Area in Abu Dhabi..."
                              rows="2"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900/50 text-brand-charcoal dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                              Preferred Time Slot
                            </label>
                            <select
                              value={timeSlot}
                              onChange={(e) => setTimeSlot(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900/50 text-brand-charcoal dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                            >
                              {TIME_SLOTS.map((slot) => (
                                <option key={slot.id} value={slot.id}>
                                  {slot.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Summary breakdown */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-gray-100 dark:border-white/5 space-y-2 text-xs">
                        <div className="flex justify-between text-gray-500 dark:text-gray-400">
                          <span>Subtotal</span>
                          <span className="font-bold text-brand-charcoal dark:text-white">AED {total}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 dark:text-gray-400">
                          <span>Abu Dhabi Delivery</span>
                          <span className="font-bold text-emerald-600">FREE</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-brand-charcoal dark:text-white pt-2 border-t border-gray-100 dark:border-white/10">
                          <span>Total Amount</span>
                          <span className="text-brand-orange dark:text-amber-400 text-base">AED {grandTotal}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'wishlist' && (
                <div>
                  {wishlistProducts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                        <Heart className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-brand-charcoal dark:text-white text-sm">Your wishlist is empty</h3>
                      <p className="text-xs text-gray-500">Tap the heart on any item to save it for later.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {wishlistProducts.map((p) => (
                        <div key={p.id} className="flex gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                          <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden image-plate p-1">
                            <img src={p.image || FALLBACK_IMAGE} alt={p.name} className="product-cutout w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <h4 className="font-bold text-xs line-clamp-1">{p.name}</h4>
                              <span className="text-xs font-bold text-brand-orange">AED {p.price}</span>
                            </div>
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={() => handleWishlistAddToCart(p)}
                                className="flex-1 py-1.5 px-3 rounded-xl bg-brand-orange text-white text-xs font-bold hover:bg-brand-orangeDark transition"
                              >
                                Add to Bag
                              </button>
                              <button
                                onClick={() => removeFromWishlist(p.id)}
                                className="p-1.5 rounded-xl text-gray-400 hover:text-red-500"
                                aria-label="Remove from wishlist"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  {orders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Package className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-brand-charcoal dark:text-white text-sm">No past orders yet</h3>
                      <p className="text-xs text-gray-500">Your recent orders placed will be listed here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((o) => (
                        <div key={o.id} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[11px] text-gray-400 block">{formatDate(o.date)}</span>
                              <span className="font-black text-sm text-brand-orange">AED {o.total}</span>
                            </div>
                            <button
                              onClick={() => handleReorderClick(o)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-brand-orange bg-orange-50 dark:bg-slate-700 px-3 py-1.5 rounded-xl hover:bg-orange-100 transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Reorder
                            </button>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            {o.items?.slice(0, 3).map((it, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="truncate mr-2">{it.name}</span>
                                <span>×{it.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sticky Place Order Footer */}
            {activeTab === 'cart' && cartItems.length > 0 && (
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-white/10 shadow-2xl shrink-0">
                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="text-gray-500 font-bold">Total with Free Delivery</span>
                  <span className="font-black text-lg text-brand-charcoal dark:text-white">
                    AED {grandTotal}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-70 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 active:scale-98 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{isSubmitting ? 'Preparing WhatsApp Order…' : 'Place Order via WhatsApp'}</span>
                </button>

                <p className="text-[10px] text-center text-gray-400 mt-2">
                  ✓ Instant confirmation • Free delivery across Abu Dhabi • Cash / Bank Transfer
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
