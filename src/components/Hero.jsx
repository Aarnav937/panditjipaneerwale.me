import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Hero = () => {
    const { t, isRTL } = useLanguage();

    const scrollToProducts = () => {
        const productsSection = document.getElementById('products');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-brand-light via-white to-orange-50 dark:from-brand-darker dark:via-gray-900 dark:to-gray-800 overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-orange/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 py-16 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange px-4 py-2 rounded-full text-sm font-medium mb-6"
                    >
                        <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
                        Fresh Delivery in Abu Dhabi
                    </motion.div>

                    {/* Main heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
                    >
                        {t('heroTitle')}
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto"
                    >
                        {t('heroSubtitle')}
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}
                    >
                        <button
                            onClick={scrollToProducts}
                            className="group flex items-center gap-2 bg-brand-orange hover:bg-brand-dark text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg shadow-brand-orange/30 hover:shadow-xl hover:shadow-brand-orange/40 hover:scale-105"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {t('shopNow')}
                            <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                        </button>

                        <button
                            onClick={scrollToProducts}
                            className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 hover:border-brand-orange hover:text-brand-orange dark:hover:text-brand-orange"
                        >
                            {t('viewProducts')}
                        </button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
                    >
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-brand-orange">150+</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Products</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-brand-orange">Free</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Delivery</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-brand-orange">24/7</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
