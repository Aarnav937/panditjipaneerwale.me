import React from 'react';
import { X, Trash2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = ({ isOpen, onClose, cartItems, removeFromCart, updateQuantity }) => {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    const message = `Hello, I would like to place an order:\n\n${cartItems.map(item => `- ${item.name} x${item.quantity} (AED ${item.price * item.quantity})`).join('\n')}\n\nTotal: AED ${total}`;
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
            className="fixed inset-0 bg-black z-50"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-96 bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="p-4 bg-brand-orange text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Cart</h2>
              <button onClick={onClose} className="hover:bg-brand-dark p-1 rounded-full transition">
                <X />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  <p>Your cart is empty.</p>
                  <button onClick={onClose} className="mt-4 text-brand-orange font-semibold">Start Shopping</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4 border-b pb-4">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                        <div className="text-brand-orange font-bold mt-1">AED {item.price}</div>
                        <div className="flex items-center gap-3 mt-2">
                          <button 
                            className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center font-bold"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="text-sm">{item.quantity}</span>
                          <button 
                            className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center font-bold"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                          <button 
                            className="ml-auto text-red-500 hover:text-red-700"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-4 text-xl font-bold">
                  <span>Total:</span>
                  <span>AED {total}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition shadow-lg"
                >
                  <MessageCircle size={20} />
                  Checkout via WhatsApp
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
