import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Sparkles, MessageCircle, Star, ShieldCheck, Truck, Clock } from 'lucide-react';
const Hero = ({ onAddToCart }) => {

  const scrollToProducts = () => {
    const heading = document.getElementById('catalog-heading') || document.getElementById('products');
    if (heading) {
      const nav = document.querySelector('header') || document.querySelector('nav');
      const offset = (nav?.getBoundingClientRect().height || 80) + 16;
      const top = heading.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  };

  const whatsappDirectOrder = 'https://wa.me/971524676306?text=' + encodeURIComponent('Hello Pandit Ji Paneer Wale! I would like to order fresh paneer and dairy products for delivery in Abu Dhabi.');

  const signaturePaneer = {
    id: 3,
    name: "Fresh Paneer (500g)",
    price: 15,
    compareAtPrice: 21,
    image: "images/packs/product-3.webp",
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-14 md:pt-10 md:pb-20">
      {/* Visual Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[30rem] h-[30rem] bg-amber-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center max-w-7xl mx-auto">
          
          {/* LEFT: Headline & Value Prop */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Live Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs sm:text-sm font-bold mb-5 shadow-sm"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 live-dot shrink-0" />
              <span>Abu Dhabi's #1 Fresh Artisan Dairy</span>
              <span className="text-amber-400">•</span>
              <span className="text-brand-orange font-extrabold flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> Free Same-Day Delivery
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-brand-charcoal dark:text-white tracking-tight leading-[1.12] mb-5"
            >
              Handcrafted Buffalo Paneer,{' '}
              <span className="bg-gradient-to-r from-brand-orange via-amber-500 to-brand-saffron bg-clip-text text-transparent">
                Delivered Fresh Daily.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8 font-medium"
            >
              Soft, melt-in-the-mouth paneer prepared fresh every morning in Abu Dhabi with 100% pure buffalo milk. No preservatives, no starches. Order in 30 seconds via WhatsApp.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 mb-10"
            >
              <a
                href={whatsappDirectOrder}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-base shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all transform hover:-translate-y-0.5 active:scale-98"
              >
                <MessageCircle className="w-5 h-5 text-white" />
                <span>Order via WhatsApp</span>
              </a>

              <button
                onClick={scrollToProducts}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orangeDark hover:to-amber-600 text-white font-bold text-base shadow-xl shadow-brand-orange/25 transition-all transform hover:-translate-y-0.5 active:scale-98"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Explore 150+ Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Social Proof & Guarantee Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-6 border-t border-gray-200/80 dark:border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-600 dark:text-gray-300"
            >
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-extrabold text-brand-charcoal dark:text-white">4.9 / 5.0</span>
                <span className="text-gray-400">(1,450+ Happy Homes)</span>
              </div>

              <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Pure Buffalo Milk</span>
              </div>

              <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Made Fresh 05:00 AM Today</span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Interactive Signature Spotlight Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 sm:p-7 border border-amber-500/30 dark:border-white/10 shadow-2xl shadow-brand-orange/15 overflow-hidden">
              {/* Shimmer Accent */}
              <div className="accent-gold-line absolute top-0 left-0 right-0" />

              {/* Card Top Label */}
              <div className="flex justify-between items-center mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Signature Bestseller
                </span>
                <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                  SAVE 28%
                </span>
              </div>

              {/* Product Visual */}
              <div className="relative h-56 sm:h-64 w-full image-plate rounded-2xl overflow-hidden flex items-center justify-center p-4 mb-5 border border-gray-100 dark:border-white/5">
                <img
                  src={signaturePaneer.image}
                  alt={signaturePaneer.name}
                  className="product-cutout w-full h-full object-contain filter drop-shadow-xl transform hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-gray-700 dark:text-gray-200 shadow border border-gray-100 dark:border-white/10">
                  🥛 Farm Fresh 500g Pack
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-2 mb-5">
                <h3 className="font-display text-xl font-bold text-brand-charcoal dark:text-white">
                  Fresh Paneer (500g)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  Soft, creamy and freshly made daily for rich curries, snacks, or grilling. In-store & online sale price.
                </p>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-2xl font-black text-brand-orange dark:text-amber-400">AED 15</span>
                  <span className="text-sm text-gray-400 line-through">AED 21</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-auto">
                    Free Abu Dhabi Delivery
                  </span>
                </div>
              </div>

              {/* 1-Click Action */}
              <button
                type="button"
                onClick={() => onAddToCart && onAddToCart(signaturePaneer)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orangeDark hover:to-amber-600 text-white font-extrabold text-sm shadow-lg shadow-brand-orange/25 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Fresh Paneer (500g) to Bag — AED 15</span>
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
