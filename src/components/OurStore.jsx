import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, MessageCircle } from 'lucide-react';

const OurStore = () => {
    const whatsappUrl = 'https://wa.me/971524676306?text=' + encodeURIComponent('Hello, I would like to visit or order from your store.');

    return (
        <section id="our-store" className="relative py-12 md:py-16 border-t border-brand-gold/20 dark:border-gray-800 bg-gradient-to-br from-white/80 via-brand-saffronLight/40 to-amber-50/60 dark:from-brand-card/40 dark:via-brand-darker dark:to-brand-card/20 overflow-hidden">
            <div className="orb orb-float-b w-64 h-64 bg-brand-orange/15 -right-10 top-0 opacity-70" />
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                        className="w-full md:w-2/5 relative shrink-0 grid grid-cols-2 gap-2"
                    >
                        <div className="col-span-2 rounded-2xl overflow-hidden border-2 border-brand-gold/30 dark:border-brand-gold/20 shadow-gold-glow relative">
                            <img
                                src="/images/store-interior.webp"
                                alt="Inside Pandit Ji Paneer Wale"
                                className="w-full h-40 md:h-44 object-cover"
                            />
                            <div className="absolute top-3 left-3 bg-white/95 dark:bg-gray-900/90 px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-green-400/40">
                                <span className="w-2 h-2 bg-green-500 rounded-full live-dot" />
                                <span className="font-bold text-brand-charcoal dark:text-white text-[11px] uppercase tracking-wide">Open now</span>
                            </div>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-brand-gold/25">
                            <img src="/images/shop-front.png" alt="Shop front at night" className="w-full h-24 object-cover" />
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-brand-gold/25">
                            <img src="/images/hero-kitchen.webp" alt="Fresh paneer prepared daily" className="w-full h-24 object-cover" />
                        </div>
                    </motion.div>

                    {/* Info strip */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.05 }}
                        className="w-full md:w-3/5"
                    >
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-goldDark dark:text-brand-gold mb-1">Visit us</p>
                        <h2 className="font-display text-2xl md:text-3xl font-semibold text-brand-charcoal dark:text-white mb-1">
                            Our Store
                        </h2>
                        <p className="text-brand-orange font-semibold text-sm mb-3">Pandit Ji Paneer Wale · Abu Dhabi</p>
                        <p className="text-brand-muted dark:text-gray-400 text-sm leading-relaxed mb-5 max-w-md">
                            Fresh paneer, dairy & spices from our shop. Drop by or order online — free delivery in Abu Dhabi.
                        </p>

                        <ul className="space-y-2.5 text-sm text-brand-charcoal dark:text-gray-300 mb-5">
                            <li className="flex items-start gap-2.5">
                                <MapPin className="w-4 h-4 text-brand-saffron shrink-0 mt-0.5" />
                                <span>F9QJ+F6F Abu Dhabi, United Arab Emirates</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Clock className="w-4 h-4 text-brand-saffron shrink-0" />
                                <span>Open for store visits & delivery</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Phone className="w-4 h-4 text-brand-saffron shrink-0" />
                                <a href="tel:+971524676306" className="hover:text-brand-orange transition">+971 52 467 6306</a>
                            </li>
                        </ul>

                        <div className="flex flex-wrap gap-2.5">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                            >
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp
                            </a>
                            <a
                                href="https://maps.google.com/?q=F9QJ+F6F+Abu+Dhabi"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 btn-secondary text-sm px-4 py-2.5"
                            >
                                <MapPin className="w-4 h-4" />
                                Directions
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default OurStore;
