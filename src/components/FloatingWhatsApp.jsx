import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const FloatingWhatsApp = () => {
  const phoneNumber = "971524676306";
  const message = "Hello, I have a query regarding your products.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl z-50 flex items-center justify-center hover:bg-green-600 transition-colors"
      title="Chat on WhatsApp"
    >
      <MessageCircle size={32} />
    </motion.a>
  );
};

export default FloatingWhatsApp;
