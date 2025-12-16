import React from 'react';
import { X, Trash2, MessageCircle, ShoppingBag, ArrowRight, Plus, Minus, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

// Fallback image for broken/placeholder images
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23f3f4f6' width='300' height='200'/%3E%3Ctext x='150' y='95' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='14'%3EProduct%3C/text%3E%3Cpath d='M130 110 L150 90 L170 110 L160 110 L160 130 L140 130 L140 110 Z' fill='%23d1d5db'/%3E%3C/svg%3E";

// Get image source with fallback
// Time slot options
const TIME_SLOTS = [
  { id: 'morning', label: 'Morning (9AM - 12PM)', value: 'Morning (9AM - 12PM)' },
  { id: 'afternoon', label: 'Afternoon (12PM - 4PM)', value: 'Afternoon (12PM - 4PM)' },
  { id: 'evening', label: 'Evening (4PM - 8PM)', value: 'Evening (4PM - 8PM)' },
  { id: 'nextday', label: 'Next Day', value: 'Next Day' },
];

const Cart = ({ isOpen, onClose, cartItems, removeFromCart, updateQuantity, onOrderPlaced }) => {
  // Initialize state from localStorage
  const [customerName, setCustomerName] = React.useState(() => localStorage.getItem('customerName') || '');
  const [address, setAddress] = React.useState(() => localStorage.getItem('customerAddress') || '');
  const [timeSlot, setTimeSlot] = React.useState(() => localStorage.getItem('deliveryTimeSlot') || 'morning');
  const { t } = useLanguage();

  // Save to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('customerName', customerName);
  }, [customerName]);

  React.useEffect(() => {
    localStorage.setItem('customerAddress', address);
  }, [address]);

  React.useEffect(() => {
    localStorage.setItem('deliveryTimeSlot', timeSlot);
  }, [timeSlot]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!address.trim()) {
      alert('Please enter your delivery address before checking out.');
      return;
    }

    const selectedTimeSlot = TIME_SLOTS.find(t => t.id === timeSlot)?.value || 'Not specified';

    const message = `Hello, I would like to place an order:

*Customer Details:*
Name: ${customerName || 'Not provided'}
Address: ${address}
Delivery Time: ${selectedTimeSlot}

*Order Details:*
${cartItems.map(item => `- ${item.name} x${item.quantity} (AED ${item.price * item.quantity})`).join('\n')}

*Total Amount: AED ${total}*`;

    // Save order to history
    const order = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: cartItems.map(item => ({ ...item })),
      total,
      address,
      customerName,
      timeSlot: selectedTimeSlot,
    };

    const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    existingOrders.unshift(order);
    localStorage.setItem('orderHistory', JSON.stringify(existingOrders.slice(0, 20))); // Keep last 20 orders

    // Notify parent component if callback exists
    if (onOrderPlaced) {
      onOrderPlaced(order);
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/971524676306?text=${encodedMessage}`, '_blank');
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
            <div className="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="bg-brand-orange/10 p-2 rounded-full">
                  <ShoppingBag className="text-brand-orange w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('yourCart')}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{cartItems.length} {t('items')}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('cartEmpty')}</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                      {t('cartEmptyMsg')}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-brand-orange text-white rounded-full font-bold hover:bg-brand-dark transition-colors shadow-lg shadow-brand-orange/30 flex items-center gap-2"
                  >
                    {t('startShopping')} <ArrowRight size={18} />
                  </button>
                </div>
              ) : (
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
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">

                {/* Delivery Details Inputs */}
                <div className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('nameLabel')}</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t('namePlaceholder')}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('addressLabel')} <span className="text-red-500">*</span></label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t('addressPlaceholder')}
                      rows="2"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span className="flex items-center gap-2">
                        <Clock size={14} />
                        {t('timeLabel')}
                      </span>
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all cursor-pointer"
                    >
                      {TIME_SLOTS.map(slot => (
                        <option key={slot.id} value={slot.id}>{t(slot.id)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>{t('subtotal')}</span>
                    <span>AED {total}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>{t('delivery')}</span>
                    <span className="text-green-500 font-medium">{t('free')}</span>
                  </div>
                  <div className="flex justify-between items-center text-2xl font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-gray-800">
                    <span>{t('total')}</span>
                    <span>AED {total}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg shadow-green-500/30"
                >
                  <MessageCircle size={24} />
                  <span>{t('checkoutWhatsApp')}</span>
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                  {t('secureCheckout')}
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
