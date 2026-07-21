import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Hero = () => {
    const { t, isRTL } = useLanguage();

    const scrollToProducts = () => {
        const productsSection = document.getElementById('products');
        if (productsSection) {
            const offset = 90;
            const top = productsSection.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    return (
        <section className="relative flex items-center justify-center overflow-hidden border-b border-brand-border/60 dark:border-gray-800">
            {/* Soft wash only */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 right-0 w-72 h-72 bg-brand-orange/8 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="inline-flex items-center gap-2 bg-brand-saffronLight dark:bg-brand-saffron/15 text-brand-saffron border border-brand-gold/30 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-5"
                    >
                        <span className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                        Free Delivery in Abu Dhabi
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.05 }}
                        className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-charcoal dark:text-white mb-4 leading-tight tracking-tight"
                    >
                        {t('heroTitle')}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.1 }}
                        className="text-base md:text-lg text-brand-muted dark:text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed"
                    >
                        {t('heroSubtitle')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.15 }}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}
                    >
                        <button
                            onClick={scrollToProducts}
                            className="group flex items-center gap-2 bg-brand-orange hover:bg-brand-dark text-white px-7 py-3.5 rounded-full font-semibold text-base transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {t('shopNow')}
                            <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${isRTL ? 'rotate-180 group-hover:-translate-x-0.5' : ''}`} />
                        </button>

                        <button
                            onClick={scrollToProducts}
                            className="flex items-center gap-2 bg-white/80 dark:bg-brand-card text-brand-charcoal dark:text-white px-7 py-3.5 rounded-full font-medium text-base border border-brand-border dark:border-gray-700 hover:border-brand-gold/60 transition-all duration-200"
                        >
                            {t('viewProducts')}
                        </button>
                    </motion.div>

                    {/* Compact stats — less visual weight */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                        className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-10 text-sm"
                    >
                        <div className="text-center">
                            <div className="text-lg font-bold text-brand-orange">150+</div>
                            <div className="text-brand-muted dark:text-gray-500 text-xs mt-0.5">Products</div>
                        </div>
                        <div className="hidden sm:block w-px h-8 bg-brand-border dark:bg-gray-700 self-center" />
                        <div className="text-center">
                            <div className="text-lg font-bold text-brand-saffron">Free</div>
                            <div className="text-brand-muted dark:text-gray-500 text-xs mt-0.5">Delivery</div>
                        </div>
                        <div className="hidden sm:block w-px h-8 bg-brand-border dark:bg-gray-700 self-center" />
                        <div className="text-center">
                            <div className="text-lg font-bold text-brand-goldDark dark:text-brand-gold">24/7</div>
                            <div className="text-brand-muted dark:text-gray-500 text-xs mt-0.5">Orders</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
