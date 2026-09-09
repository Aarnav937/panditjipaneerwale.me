import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingWhatsApp = ({ hasCartItems = false }) => {
  const [showTooltip, setShowTooltip] = useState(true);
  const phoneNumber = '971524676306';
  const message = 'Hello Pandit Ji Paneer Wale! I have an order or inquiry about your fresh paneer & dairy products.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const bottomClass = hasCartItems
    ? 'bottom-[9.5rem] md:bottom-6'
    : 'bottom-[5.5rem] md:bottom-6';

  return (
    <div className={`hidden md:flex fixed right-6 ${bottomClass} z-40 items-center gap-3`}>
      {/* Friendly Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-500/20 text-xs font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 live-dot shrink-0" />
            <span>Need fresh paneer? Chat with us!</span>
            <button
              onClick={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 ml-1"
              aria-label="Dismiss tooltip"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-900 rotate-45 border-t border-r border-emerald-500/20" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all border-2 border-white/40"
        title="Chat on WhatsApp (+971 52 467 6306)"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
        <MessageCircle size={28} className="fill-white/15" />
      </motion.a>
    </div>
  );
};

export default FloatingWhatsApp;
