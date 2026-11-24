import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, MessageCircle, Navigation, Sparkles } from 'lucide-react';
import { RoyalDivider, RoyalEyebrow } from './RoyalOrnament';

const OurStore = () => {
  const whatsappUrl = 'https://wa.me/971524676306?text=' + encodeURIComponent('Hello Pandit Ji Paneer Wale! I would like to visit or place an order from your Abu Dhabi store.');

  return (
    <section id="our-store" className="relative py-16 md:py-24 bg-white/30 backdrop-blur-2xl dark:bg-black/20 border-t border-brand-royalGold/30 overflow-hidden">
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
            <div className="col-span-2 relative rounded-3xl overflow-hidden shadow-xl ring-1 ring-brand-royalGold/70 ring-offset-4 ring-offset-[#FFF3E2] dark:ring-offset-[#12070A] group">
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
            <div className="rounded-2xl overflow-hidden shadow-md border border-brand-royalGold/50 group">
              <img
                src="/images/shop-front.png"
                alt="Shop Front in Abu Dhabi"
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Fresh Kitchen Photo */}
            <div className="rounded-2xl overflow-hidden shadow-md border border-brand-royalGold/50 group">
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
            <RoyalEyebrow className="mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-kesar" />
              Visit Us in Abu Dhabi
            </RoyalEyebrow>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-ink dark:text-white tracking-tight leading-tight mb-1">
              Our Physical Store & <span className="text-kesar italic pr-1">Dairy Hub</span>
            </h2>
            <RoyalDivider className="-ml-2 mb-3" />

            <p className="text-brand-rani dark:text-brand-marigold font-bold text-sm mb-4">
              Pandit Ji Paneer Wale • Abu Dhabi, United Arab Emirates
            </p>

            <p className="text-[#5C3A2E] dark:text-gray-300 text-sm leading-relaxed mb-6 font-medium">
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
                <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-slate-800 text-[#A0700F] shrink-0 mt-0.5 shadow-sm">
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
                className="btn-ink inline-flex items-center gap-2 font-black text-sm px-6 py-3.5 rounded-2xl hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4 text-emerald-300" />
                <span>Chat with Store</span>
              </a>

              <a
                href="https://maps.google.com/?q=F9QJ+F6F+Abu+Dhabi"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-kesar inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3.5 rounded-2xl hover:-translate-y-0.5"
              >
                <Navigation className="w-4 h-4" />
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
