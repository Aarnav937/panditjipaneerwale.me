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
        { value: 'Free', label: 'Delivery', color: 'text-brand-gold' },
        { value: '24/7', label: 'Orders', color: 'text-white' },
    ];

    return (
        <section className="relative flex items-center justify-center overflow-hidden min-h-[30rem] md:min-h-[34rem]">
            <div className="absolute inset-0 hero-kenburns pointer-events-none" aria-hidden>
                <img
                    src="/images/hero-kitchen.webp"
                    alt=""
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-[#FFFDF9] dark:to-brand-darker" />

            <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                        className="inline-flex items-center gap-2 bg-white/15 text-white border border-white/30 px-4 py-2 rounded-full text-xs sm:text-sm font-bold mb-6 backdrop-blur-sm"
                    >
                        <span className="w-2 h-2 rounded-full bg-brand-gold live-dot" />
                        Free Delivery in Abu Dhabi
                        <Sparkles className="w-3.5 h-3.5 text-brand-gold live-bounce" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.05 }}
                        className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-semibold text-white mb-4 leading-[1.15] tracking-tight drop-shadow-md"
                    >
                        {t('heroTitle')}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.12 }}
                        className="text-base md:text-lg text-white/85 mb-9 max-w-xl mx-auto leading-relaxed"
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
                            <ShoppingBag className="w-5 h-5 relative z-10" />
                            <span className="relative z-10">{t('shopNow')}</span>
                            <ArrowRight className={`w-4 h-4 relative z-10 ${isRTL ? 'rotate-180' : ''}`} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={scrollToProducts}
                            className="flex items-center gap-2 bg-white/90 text-brand-charcoal px-8 py-4 rounded-full font-semibold text-base border border-white/50 shadow-md"
                        >
                            {t('viewProducts')}
                        </motion.button>
                    </motion.div>

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
                                className="rounded-2xl bg-black/30 border border-white/15 px-2 py-3 sm:px-4 sm:py-4 backdrop-blur-sm"
                            >
                                <div className={`text-xl sm:text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                                <div className="text-[10px] sm:text-xs text-white/70 mt-0.5 font-medium">{s.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
