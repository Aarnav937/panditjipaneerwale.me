import React, { useEffect, useState } from 'react';
import { X, Trash2, MessageCircle, ShoppingBag, ArrowRight, Plus, Minus, Clock, Phone, Truck, Heart, Package, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { useWishlist } from '../context/WishlistContext';
import { products } from '../data/products';

// Fallback image for broken/placeholder images
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23f3f4f6' width='300' height='200'/%3E%3Ctext x='150' y='95' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='14'%3EProduct%3C/text%3E%3Cpath d='M130 110 L150 90 L170 110 L160 110 L160 130 L140 130 L140 110 Z' fill='%23d1d5db'/%3E%3C/svg%3E";

// Time slot options
const TIME_SLOTS = [
  { id: 'morning', label: 'Morning (9AM - 12PM)', value: 'Morning (9AM - 12PM)' },
  { id: 'afternoon', label: 'Afternoon (12PM - 4PM)', value: 'Afternoon (12PM - 4PM)' },
  { id: 'evening', label: 'Evening (4PM - 8PM)', value: 'Evening (4PM - 8PM)' },
  { id: 'nextday', label: 'Next Day', value: 'Next Day' },
];

const Cart = ({ isOpen, onClose, cartItems, removeFromCart, updateQuantity, onOrderPlaced, onAddToCart, onReorder }) => {
  const [activeTab, setActiveTab] = useState('cart'); // 'cart', 'wishlist', 'orders'
  
  // Initialize state from localStorage for Cart
  const [customerName, setCustomerName] = React.useState(() => localStorage.getItem('customerName') || '');
  const [customerPhone, setCustomerPhone] = React.useState(() => localStorage.getItem('customerPhone') || '');
  const [address, setAddress] = React.useState(() => localStorage.getItem('customerAddress') || '');
  const [timeSlot, setTimeSlot] = React.useState(() => localStorage.getItem('deliveryTimeSlot') || 'morning');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { t } = useLanguage();
  const { placeOrder, loginAsGuest } = useAuth();
  const { checkAdminCode } = useAdmin();

  // Wishlist Logic
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));
  const handleWishlistAddToCart = (product) => {
      onAddToCart(product);
      removeFromWishlist(product.id);
  };

  // Order History Logic
  const [orders, setOrders] = React.useState([]);
  React.useEffect(() => {
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
  React.useEffect(() => {
    if (address) {
      const isAdmin = checkAdminCode(address);
      if (isAdmin) {
        setAddress('');
        localStorage.removeItem('customerAddress');
        onClose(); // Close cart to show dashboard
      }
    }
  }, [address, checkAdminCode, onClose]);

  // Lock body scroll when cart is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Reset tab when closed
      setTimeout(() => setActiveTab('cart'), 300);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Save to localStorage whenever they change
  React.useEffect(() => localStorage.setItem('customerName', customerName), [customerName]);
  React.useEffect(() => localStorage.setItem('customerPhone', customerPhone), [customerPhone]);
  React.useEffect(() => localStorage.setItem('customerAddress', address), [address]);
  React.useEffect(() => localStorage.setItem('deliveryTimeSlot', timeSlot), [timeSlot]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const deliveryFee = 0;
  const grandTotal = total;

  const handleCheckout = async () => {
    if (!address.trim()) {
      alert('Please enter your delivery address before checking out.');
      return;
    }

    if (!customerPhone.trim()) {
      alert('Please enter your phone number for order updates.');
      return;
    }

    setIsSubmitting(true);
    const selectedTimeSlot = TIME_SLOTS.find(t => t.id === timeSlot)?.value || 'Not specified';

    try {
      // First, register/update customer in Supabase
      await loginAsGuest(customerPhone, customerName, address);

      // Save order to Supabase
      const orderNotes = `Time: ${selectedTimeSlot}`;
      const result = await placeOrder(cartItems, grandTotal, orderNotes);

      if (!result.success) {
        console.warn('Failed to save to Supabase, continuing with WhatsApp:', result.error);
      }
    } catch (error) {
      console.warn('Supabase save failed, continuing with WhatsApp:', error);
    }

    // Also save order to localStorage (backup)
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
    setOrders(existingOrders.slice(0, 20)); // update state in case they switch to orders tab

    // Notify parent component if callback exists
    if (onOrderPlaced) {
      onOrderPlaced(order);
    }

    // Send to WhatsApp
    const message = `Hello, I would like to place an order:

*Customer Details:*
Name: ${customerName || 'Not provided'}
Phone: ${customerPhone}
Address: ${address}
Delivery Time: ${selectedTimeSlot}

*Order Details:*
${cartItems.map(item => `- ${item.name} x${item.quantity} (AED ${item.price * item.quantity})`).join('\n')}
${deliveryFee > 0 ? `\n*Delivery Fee: AED ${deliveryFee}*` : ''}

*Total Amount: AED ${grandTotal}*`;

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
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-white dark:bg-gray-900 z-50 shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800"
          >
            {/* Header */}
            <div className="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-4 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-orange/10 p-2 rounded-full">
                    <ShoppingBag className="text-brand-orange w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Bag</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage items and orders</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveTab('cart')} 
                  className={`flex-1 py-2 flex justify-center items-center gap-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'cart' ? 'bg-white dark:bg-gray-700 text-brand-orange shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  <ShoppingBag size={16} /> Cart
                  {cartItems.length > 0 && <span className="bg-brand-orange text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{cartItems.length}</span>}
                </button>
                <button 
                  onClick={() => setActiveTab('wishlist')} 
                  className={`flex-1 py-2 flex justify-center items-center gap-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'wishlist' ? 'bg-white dark:bg-gray-700 text-brand-orange shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  <Heart size={16} /> Wishlist
                  {wishlistProducts.length > 0 && <span className="bg-brand-orange text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{wishlistProducts.length}</span>}
                </button>
                <button 
                  onClick={() => setActiveTab('orders')} 
                  className={`flex-1 py-2 flex justify-center items-center gap-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-gray-700 text-brand-orange shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  <Package size={16} /> Orders
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 overscroll-contain bg-gray-50 dark:bg-gray-900/50" style={{ overscrollBehavior: 'contain' }}>
              
              {/* CART CONTENT */}
              {activeTab === 'cart' && (
                <>
                  {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 mt-12">
                      <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                        <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('cartEmpty')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                          {t('cartEmptyMsg')}
                        </p>
                      </div>
                      <button
                        onClick={onClose}
                        className="px-8 py-3 bg-brand-orange text-white rounded-full font-bold hover:bg-brand-dark transition-colors shadow-lg shadow-brand-orange/30 flex items-center gap-2 group"
                      >
                        {t('startShopping')} <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-6">
                      {cartItems.map(item => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          key={item.id}
                          className="flex gap-4 bg-white dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                        >
                          <div className="w-24 h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                            <img
                              src={item.image?.includes('placeholder') ? FALLBACK_IMAGE : item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">{item.name}</h3>
                                <button
                                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                              <div className="text-brand-orange font-bold mt-1">AED {item.price}</div>
                            </div>

                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                                <button
                                  className="w-8 h-8 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-white shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-8 text-center font-bold text-gray-900 dark:text-white text-sm">{item.quantity}</span>
                                <button
                                  className="w-8 h-8 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-white shadow-sm hover:scale-105 transition-transform"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-auto">
                                {t('total')}: <span className="text-gray-900 dark:text-white font-bold">AED {item.price * item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Delivery Details */}
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Truck size={20} className="text-brand-orange" />
                        Delivery Details
                      </h3>
                      <div className="space-y-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('nameLabel')}</label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder={t('namePlaceholder')}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="+971 XX XXX XXXX"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('addressLabel')} <span className="text-red-500">*</span></label>
                          <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder={t('addressPlaceholder')}
                            rows="2"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all resize-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            {t('timeLabel')}
                          </label>
                          <select
                            value={timeSlot}
                            onChange={(e) => setTimeSlot(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all cursor-pointer text-sm"
                          >
                            {TIME_SLOTS.map(slot => (
                              <option key={slot.id} value={slot.id}>{t(slot.id)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 mb-4">
                      <div className="space-y-3 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>{t('subtotal')}</span>
                          <span className="font-medium text-gray-900 dark:text-white">AED {total}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>{t('delivery')}</span>
                          <span className="text-green-500 font-medium">{t('free')}</span>
                        </div>
                      </div>
                    </div>
                    </>
                  )}
                </>
              )}

              {/* WISHLIST CONTENT */}
              {activeTab === 'wishlist' && (
                <>
                  {wishlistProducts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 mt-12">
                        <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                            <Heart className="w-10 h-10 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Your wishlist is empty</h3>
                            <p className="text-gray-500 text-sm">Save items you love by tapping the heart icon</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-brand-orange text-white rounded-full font-medium hover:bg-brand-dark transition-colors mt-4"
                        >
                            Explore Products
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
                                className="flex gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
                            >
                                <div className="w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
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
                                            onClick={() => handleWishlistAddToCart(product)}
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
                </>
              )}

              {/* ORDERS CONTENT */}
              {activeTab === 'orders' && (
                <>
                  {orders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 mt-12">
                        <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                            <Package className="w-12 h-12 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('noOrders')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                {t('noOrdersMsg')}
                            </p>
                        </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                            >
                                {/* Order Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Clock size={12} />
                                            {formatDate(order.date)}
                                        </p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                            AED {order.total}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleReorderClick(order)}
                                        className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-full text-sm font-bold hover:bg-brand-dark transition-colors shadow-sm"
                                    >
                                        <RotateCcw size={14} />
                                        {t('reorder')}
                                    </button>
                                </div>

                                {/* Order Items */}
                                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                    {order.items.slice(0, 3).map((item, idx) => (
                                        <p key={idx} className="flex justify-between">
                                            <span className="truncate flex-1 mr-2">{item.name}</span>
                                            <span className="text-gray-500">x{item.quantity}</span>
                                        </p>
                                    ))}
                                    {order.items.length > 3 && (
                                        <p className="text-gray-400 text-xs">+{order.items.length - 3} more items</p>
                                    )}
                                </div>

                                {/* Delivery Info */}
                                {order.timeSlot && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Delivery: {order.timeSlot}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footers for each tab */}
            {activeTab === 'cart' && cartItems.length > 0 && (
              <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4">
                 <div className="flex-shrink-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">AED {grandTotal}</p>
                 </div>
                 <button
                   onClick={handleCheckout}
                   className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg shadow-green-500/20"
                 >
                   <MessageCircle size={20} />
                   <span>{t('checkoutWhatsApp')}</span>
                 </button>
              </div>
            )}

            {activeTab === 'wishlist' && wishlistProducts.length > 0 && (
              <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 space-y-3">
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
                      className="w-full py-2 text-gray-500 hover:text-red-500 text-sm transition-colors font-medium"
                  >
                      Clear Wishlist
                  </button>
              </div>
            )}

            {activeTab === 'orders' && orders.length > 0 && (
              <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                  <button
                      onClick={clearHistory}
                      className="w-full py-3 text-red-500 hover:text-red-600 text-sm font-bold transition-colors bg-red-50 dark:bg-red-900/20 rounded-xl"
                  >
                      {t('clearHistory')}
                  </button>
              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
