import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Floating WhatsApp — offset above bottom nav (+ cart bar when present).
 */
const FloatingWhatsApp = ({ hasCartItems = false }) => {
  const phoneNumber = '971524676306';
  const message = 'Hello, I have a query regarding your products.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // Above bottom nav; higher when mobile cart bar is showing
  const bottomClass = hasCartItems
    ? 'bottom-[9.5rem] md:bottom-6'
    : 'bottom-[5.5rem] md:bottom-6';

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className={`fixed right-4 ${bottomClass} z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1ebe57] transition-all border-2 border-white/30`}
      title="Chat on WhatsApp"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} />
    </motion.a>
  );
};

export default FloatingWhatsApp;
