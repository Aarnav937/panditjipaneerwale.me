import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, MessageCircle, Navigation, Sparkles } from 'lucide-react';

const OurStore = () => {
  const whatsappUrl = 'https://wa.me/971524676306?text=' + encodeURIComponent('Hello Pandit Ji Paneer Wale! I would like to visit or place an order from your Abu Dhabi store.');

  return (
    <section id="our-store" className="relative py-16 md:py-20 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/60 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-900/80 border-t border-amber-500/20 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-center">
          
          {/* Photos Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-1/2 grid grid-cols-2 gap-3.5"
          >
            {/* Main Interior Photo */}
            <div className="col-span-2 relative rounded-3xl overflow-hidden shadow-xl border-2 border-amber-500/30 group">
              <img
                src="/images/store-interior.webp"
                alt="Pandit Ji Paneer Wale Store Interior"
                className="w-full h-52 sm:h-60 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-2 border border-emerald-500/30">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full live-dot" />
                <span className="font-black text-brand-charcoal dark:text-white text-[11px] uppercase tracking-wider">
                  Open Daily • Store Visits & Delivery
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <p className="font-extrabold text-base">Authentic Retail Shop in Abu Dhabi</p>
                <p className="text-xs text-amber-200">Fresh cuts prepared in-house every morning</p>
              </div>
            </div>

            {/* Shop Front Photo */}
            <div className="rounded-2xl overflow-hidden shadow-md border border-amber-500/20 group">
              <img
                src="/images/shop-front.png"
                alt="Shop Front in Abu Dhabi"
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Fresh Kitchen Photo */}
            <div className="rounded-2xl overflow-hidden shadow-md border border-amber-500/20 group">
              <img
                src="/images/hero-kitchen.webp"
                alt="Fresh Paneer Preparation"
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>

          {/* Store Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full lg:w-1/2"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 font-black text-xs tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              <span>Visit Us in Abu Dhabi</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-charcoal dark:text-white tracking-tight leading-tight mb-2">
              Our Physical Store & Dairy Hub
            </h2>

            <p className="text-brand-orange font-bold text-sm mb-4">
              Pandit Ji Paneer Wale • Abu Dhabi, United Arab Emirates
            </p>

            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 font-medium">
              Step right into our retail shop for warm customer service, custom dairy cuts, and pantry shopping, or have your orders delivered to your doorstep in Abu Dhabi with free delivery.
            </p>

            {/* Information List */}
            <ul className="space-y-3.5 text-sm text-gray-700 dark:text-gray-200 mb-8">
              <li className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-orange-50 dark:bg-slate-800 text-brand-orange shrink-0 mt-0.5 shadow-sm">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold block text-brand-charcoal dark:text-white">Store Address</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">F9QJ+F6F Abu Dhabi, United Arab Emirates</span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 shrink-0 mt-0.5 shadow-sm">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold block text-brand-charcoal dark:text-white">Operating Hours</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Open Daily for In-Store Shopping & Same-Day Delivery</span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 shrink-0 mt-0.5 shadow-sm">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold block text-brand-charcoal dark:text-white">Customer Phone & WhatsApp</span>
                  <a href="tel:+971524676306" className="text-brand-orange font-bold text-xs hover:underline">
                    +971 52 467 6306
                  </a>
                </div>
              </li>
            </ul>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-emerald-600/25 transition-all hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Store</span>
              </a>

              <a
                href="https://maps.google.com/?q=F9QJ+F6F+Abu+Dhabi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 text-brand-charcoal dark:text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-brand-orange transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <Navigation className="w-4 h-4 text-brand-orange" />
                <span>Get Directions (Google Maps)</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OurStore;
