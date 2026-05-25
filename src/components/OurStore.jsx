import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const OurStore = () => {
    const { t } = useLanguage();

    return (
        <section id="our-store" className="bg-brand-light dark:bg-gray-900 py-24 transition-colors duration-300 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-orange/5 dark:bg-brand-orange/10 transform skew-x-12 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-300/10 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl font-bold text-brand-dark dark:text-brand-orange mb-4"
                    >
                        Visit Our Store
                    </motion.h2>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-24 h-1 bg-brand-orange mx-auto rounded-full"
                    />
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    {/* Store Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full lg:w-1/2 relative group"
                    >
                        {/* Enhanced Background Frame */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-brand-orange via-yellow-400 to-brand-orange opacity-30 blur-2xl rounded-[2rem] transform -rotate-2 group-hover:rotate-0 group-hover:opacity-40 transition-all duration-700 -z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent rounded-2xl z-10 pointer-events-none" />

                        <img
                            src="/images/shop-front.png"
                            alt="RRC International General Trading - Pandit G Paneer Wale Storefront"
                            className="w-full rounded-2xl shadow-2xl object-cover h-[400px] md:h-[500px] ring-4 ring-white/50 dark:ring-gray-800/50 transform group-hover:scale-[1.02] transition-transform duration-500 relative z-0"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
                            }}
                        />

                        {/* Status Badge */}
                        <div className="absolute top-6 left-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <span className="font-bold text-gray-800 dark:text-white text-sm tracking-wide uppercase">Open Now</span>
                        </div>
                    </motion.div>

                    {/* Store Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full lg:w-1/2"
                    >
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">RRC International General Trading</h3>
                        <h4 className="text-xl text-brand-orange font-semibold mb-8">Pandit G Paneer Wale</h4>

                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                            Experience the authentic taste of fresh, homemade-style paneer and premium dairy products directly from our physical store in Abu Dhabi. We welcome you to drop by!
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="bg-brand-orange/10 dark:bg-brand-orange/20 p-4 rounded-xl text-brand-orange mt-1">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h5 className="font-bold text-xl text-gray-900 dark:text-white mb-1">Our Location</h5>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                                        F9QJ+F6F Abu Dhabi<br />
                                        United Arab Emirates
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-brand-orange/10 dark:bg-brand-orange/20 p-4 rounded-xl text-brand-orange mt-1">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h5 className="font-bold text-xl text-gray-900 dark:text-white mb-1">Store Hours</h5>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                                        Open 24/7 for Fresh Deliveries & Store Visits
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-brand-orange/10 dark:bg-brand-orange/20 p-4 rounded-xl text-brand-orange mt-1">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h5 className="font-bold text-xl text-gray-900 dark:text-white mb-1">Contact Us</h5>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                                        Phone: +971 52 467 6306<br />
                                        WhatsApp Available
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default OurStore;
