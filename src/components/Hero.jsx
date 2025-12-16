import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-brand-orange via-brand-dark to-purple-900 text-white py-24 md:py-40">
      {/* Decorative Circles with Watery Animation */}
      <motion.div
        animate={{
          scale: [1, 1.1, 0.9, 1],
          rotate: [0, 45, -45, 0],
          borderRadius: ["50%", "40%", "60%", "50%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 0.8, 1],
          x: [0, 30, -30, 0],
          y: [0, -30, 30, 0],
          borderRadius: ["50%", "60%", "40%", "50%"],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-20 -left-20 w-72 h-72 bg-yellow-300/20 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 text-center relative z-10">

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, type: "spring", stiffness: 50 }}
          className="mb-8 drop-shadow-2xl"
        >
          <span className="block text-4xl md:text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-200 pb-4 leading-tight">
            {t('heroTitle')}
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 50 }}
          className="text-lg md:text-2xl mb-12 opacity-80 max-w-2xl mx-auto font-light leading-relaxed"
        >
          {t('heroSubtitle')}
        </motion.p>
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(255,255,255,0.3)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="bg-white text-brand-orange px-12 py-5 rounded-full font-bold text-xl hover:bg-brand-light transition shadow-xl ring-4 ring-white/30"
          onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
        >
          {t('shopNow')}
        </motion.button>
      </div>
    </div>
  );
};


export default Hero;
