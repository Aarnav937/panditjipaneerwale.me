import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Hero = () => {
    const { t, isRTL } = useLanguage();

    const scrollToProducts = () => {
        const heading = document.getElementById('catalog-heading') || document.getElementById('products');
        if (heading) {
            const nav = document.querySelector('nav');
            const offset = (nav?.getBoundingClientRect().height || 88) + 12;
            const top = heading.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
    };

    const stats = [
        { value: '150+', label: 'Products', color: 'text-brand-orange' },
        { value: 'Free', label: 'Delivery', color: 'text-brand-saffron' },
        { value: '24/7', label: 'Orders', color: 'text-brand-goldDark dark:text-brand-gold' },
    ];

    return (
        <section className="relative flex items-center justify-center overflow-hidden border-b border-brand-gold/20 dark:border-gray-800">
            {/* Living orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
                <div className="orb orb-float-a w-80 h-80 bg-brand-orange/25 -top-20 -right-16" />
                <div className="orb orb-float-b w-72 h-72 bg-brand-gold/20 -bottom-16 -left-12" />
                <div className="orb orb-float-c w-48 h-48 bg-brand-saffron/15 top-1/2 left-1/3" />
                {/* Soft diagonal wash */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/[0.07] via-transparent to-brand-gold/[0.1]" />
            </div>

            <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-saffronLight via-white to-amber-50 dark:from-brand-saffron/20 dark:via-brand-card dark:to-brand-saffron/10 text-brand-saffron border border-brand-gold/40 px-4 py-2 rounded-full text-xs sm:text-sm font-bold mb-6 shadow-md shadow-brand-orange/10"
                    >
                        <span className="w-2 h-2 rounded-full bg-brand-gold live-dot" />
                        Free Delivery in Abu Dhabi
                        <Sparkles className="w-3.5 h-3.5 text-brand-gold live-bounce" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.05 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-brand-charcoal dark:text-white mb-4 leading-[1.15] tracking-tight"
                    >
                        <span className="bg-gradient-to-r from-brand-charcoal via-brand-saffron to-brand-orange dark:from-white dark:via-orange-200 dark:to-brand-gold bg-clip-text text-transparent bg-[length:200%_auto] btn-glow">
                            {t('heroTitle')}
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.12 }}
                        className="text-base md:text-lg text-brand-muted dark:text-gray-300 mb-9 max-w-xl mx-auto leading-relaxed"
                    >
                        {t('heroSubtitle')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 160, damping: 18, delay: 0.18 }}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={scrollToProducts}
                            className="group relative flex items-center gap-2 text-white px-8 py-4 rounded-full font-bold text-base shadow-lg shadow-brand-orange/40 overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #FF8C00, #E25822, #FF8C00)',
                                backgroundSize: '200% 200%',
                            }}
                        >
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-700" />
                            <ShoppingBag className="w-5 h-5 relative z-10 live-wiggle" />
                            <span className="relative z-10">{t('shopNow')}</span>
                            <ArrowRight className={`w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180' : ''}`} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={scrollToProducts}
                            className="flex items-center gap-2 bg-white/90 dark:bg-brand-card text-brand-charcoal dark:text-white px-8 py-4 rounded-full font-semibold text-base border-2 border-brand-gold/35 dark:border-brand-gold/25 hover:border-brand-orange shadow-md hover:shadow-lg transition-colors"
                        >
                            {t('viewProducts')}
                        </motion.button>
                    </motion.div>

                    {/* Living stats cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.28 }}
                        className="mt-12 grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto"
                    >
                        {stats.map((s, i) => (
                            <motion.div
                                key={s.label}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.32 + i * 0.08, type: 'spring', stiffness: 200 }}
                                whileHover={{ y: -4, scale: 1.04 }}
                                className="rounded-2xl bg-white/80 dark:bg-brand-card/80 backdrop-blur-sm border border-brand-gold/25 dark:border-brand-gold/15 px-2 py-3 sm:px-4 sm:py-4 shadow-md shadow-brand-orange/5"
                            >
                                <div className={`text-xl sm:text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                                <div className="text-[10px] sm:text-xs text-brand-muted dark:text-gray-400 mt-0.5 font-medium">{s.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
