import React, { useState, useEffect, useCallback, lazy, Suspense, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Toast from './components/Toast';
import BottomNav from './components/BottomNav';
import MobileCartBar from './components/MobileCartBar';
import OurStore from './components/OurStore';
import OfferTicker from './components/OfferTicker';
import OffersRail from './components/OffersRail';
import AmbientBackground from './components/AmbientBackground';
import { RoyalDivider, RoyalEyebrow } from './components/RoyalOrnament';
import PromotionalOfferModal from './components/PromotionalOfferModal';
import { products as initialProducts, categories } from './data/products';
import { OPENING_PROMOTION_PRODUCT_ID } from './data/store';
import { getDailyDiscountedProducts } from './lib/discounts';
import { loadStoreCatalog, loadDailyFeatureIds } from './lib/catalogApi';
import { useStoreDay } from './lib/storeDay';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from './context/LanguageContext';
import { useAdmin } from './context/AdminContext';
import { useAuth } from './context/AuthContext';
import {
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  undoLastAdd,
} from './lib/cart';
import { ArrowUpDown, Sparkles, ShieldCheck, Truck, HeartHandshake } from 'lucide-react';

const Cart = lazy(() => import('./components/Cart'));
const QuickViewModal = lazy(() => import('./components/QuickViewModal'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const AuthModal = lazy(() => import('./components/AuthModal'));

const LazyPanelFallback = () => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
    <div className="w-10 h-10 rounded-full border-3 border-brand-orange border-t-transparent animate-spin" />
  </div>
);

// Visual category icon map
const CATEGORY_ICONS = {
  "All": "✨",
  "Milk Products": "🧀",
  "Everest Spices": "🌶️",
  "Bikaji Bikaneri": "🥨",
  "Amul": "🧈",
  "Chings": "🍜",
  "Amul Kool": "🧃",
  "Dhara": "🫒",
  "Satvik": "🌿",
  "Wagh Bakri": "☕",
};

function App() {
  const storeDay = useStoreDay();
  const [dailyFeatureIds, setDailyFeatureIds] = useState(null);
  const [products, setProducts] = useState(() => {
    let base = initialProducts;
    const saved = localStorage.getItem('products_custom');
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved);
        const mergedProducts = initialProducts.map(p => {
          const savedProduct = parsedSaved.find(sp => sp.id === p.id);
          if (savedProduct && savedProduct.image !== p.image) {
            return { ...p, image: savedProduct.image };
          }
          return p;
        });
        const customAdded = parsedSaved.filter(sp => !initialProducts.some(p => p.id === sp.id));
        base = [...mergedProducts, ...customAdded];
      } catch (e) {
        base = initialProducts;
      }
    }
    return getDailyDiscountedProducts(base);
  });

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isPromotionalOfferOpen, setIsPromotionalOfferOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const [cartPulse, setCartPulse] = useState(false);

  const { t } = useLanguage();
  const { isAdmin } = useAdmin();
  const { isLoggedIn, customer, logout } = useAuth();

  useEffect(() => {
    let cancelled = false;
    const refreshCatalog = () => loadStoreCatalog(initialProducts).then((catalog) => {
      if (!catalog || cancelled) return;
      const priced = getDailyDiscountedProducts(catalog, { dateSeed: storeDay });
      setProducts(priced);
      setCartItems((items) => items.map((item) => {
        const current = priced.find((product) => product.id === item.id);
        return current ? { ...current, quantity: item.quantity } : item;
      }));
    }).catch(() => { /* Browsing remains available; checkout verifies prices on the server. */ });
    const refresh = () => {
      refreshCatalog();
      loadDailyFeatureIds(storeDay).then(ids => { if (!cancelled) setDailyFeatureIds(ids); }).catch(() => { if (!cancelled) setDailyFeatureIds(null); });
    };
    refresh();
    const featureTimer = setInterval(() => {
      if (document.visibilityState === 'visible') loadDailyFeatureIds(storeDay).then(ids => { if (!cancelled && ids) setDailyFeatureIds(ids); }).catch(() => {});
    }, 60000);
    const wake = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', wake);
    return () => { cancelled = true; clearInterval(featureTimer); document.removeEventListener('visibilitychange', wake); };
  }, [storeDay]);

  useEffect(() => {
    if (isAdmin && !isAdminDashboardOpen) {
      setIsAdminDashboardOpen(true);
    }
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (searchQuery) {
      setSelectedCategory('All');
    }
  }, [searchQuery]);

  const toggleTheme = useCallback(() => setIsDarkMode(prev => !prev), []);

  const handleViewDetails = useCallback((product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  }, []);

  const promotionalProduct = useMemo(
    // The opening campaign is an explicit storefront choice. Legacy catalog flags
    // must not replace it after backend prices and availability finish loading.
    () => products.find((product) => product.id === OPENING_PROMOTION_PRODUCT_ID && product.is_available !== false),
    [products]
  );

  useEffect(() => {
    if (!promotionalProduct) return undefined;

    const timer = window.setTimeout(() => {
      setIsPromotionalOfferOpen(true);
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [promotionalProduct?.id]);

  const addToCart = useCallback((product) => {
    const { cart, error } = addItemToCart(cartItems, product);
    if (error) {
      alert(error);
      return;
    }

    setCartItems(cart);
    setLastAddedProduct(product);
    setToastMessage(`${product.name} added to bag!`);
    setShowToast(true);
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 350);
  }, [cartItems]);

  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => removeItemFromCart(prev, id));
  }, []);

  const undoAddToCart = useCallback(() => {
    if (!lastAddedProduct) return;
    setCartItems((prev) => undoLastAdd(prev, lastAddedProduct.id));
    setLastAddedProduct(null);
  }, [lastAddedProduct]);

  const updateQuantity = useCallback(
    (id, newQuantity) => {
      const { cart, error } = updateItemQuantity(cartItems, id, newQuantity);
      if (error) {
        alert(error);
        return;
      }
      setCartItems(cart);
    },
    [cartItems]
  );

  const sortedCategories = useMemo(() => {
    return ['All', ...categories.filter(c => c !== 'All').sort()];
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    products.forEach(p => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const fuzzyMatch = useCallback((text, query) => {
    if (!query) return { matches: true, score: 0 };
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();

    if (textLower.includes(queryLower)) return { matches: true, score: 100 };

    let textIndex = 0;
    let matchedChars = 0;
    for (const char of queryLower) {
      const foundIndex = textLower.indexOf(char, textIndex);
      if (foundIndex !== -1) {
        matchedChars++;
        textIndex = foundIndex + 1;
      }
    }
    const similarityScore = (matchedChars / queryLower.length) * 100;
    return { matches: similarityScore >= 65, score: similarityScore };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery) {
      result = result
        .map(product => {
          const nameMatch = fuzzyMatch(product.name, searchQuery);
          const categoryMatch = fuzzyMatch(product.category, searchQuery);
          const descMatch = fuzzyMatch(product.description || '', searchQuery);
          const bestScore = Math.max(nameMatch.score, categoryMatch.score * 0.8, descMatch.score * 0.6);
          const matches = nameMatch.matches || categoryMatch.matches || descMatch.matches;
          return { ...product, _searchScore: bestScore, _matches: matches };
        })
        .filter(product => product._matches)
        .sort((a, b) => b._searchScore - a._searchScore);
    }

    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    } else if (!searchQuery) {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy, products, fuzzyMatch]);

  const headerOffset = () => {
    const nav = document.querySelector('header') || document.querySelector('nav');
    const categories = document.getElementById('catalog-categories');
    return (nav?.getBoundingClientRect().height || 80) + (categories?.getBoundingClientRect().height || 0) + 16;
  };

  const handleCategoryChange = (category, e) => {
    setSelectedCategory(category);
    const heading = document.getElementById('catalog-heading');
    if (heading) {
      const offsetPosition = heading.getBoundingClientRect().top + window.pageYOffset - headerOffset();
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
    }
    if (e && e.currentTarget) {
      e.currentTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0),
    [cartItems]
  );

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 font-sans relative text-brand-charcoal dark:text-gray-100">
      {/* 2.5D blurred orb background */}
      <AmbientBackground />

      {/* Top Banner Ticker */}
      <OfferTicker />

      {/* Modern Capsule Navbar */}
      <Navbar
        cartCount={cartCount}
        setIsCartOpen={setIsCartOpen}
        setIsAdminDashboardOpen={setIsAdminDashboardOpen}
        setIsAuthModalOpen={setIsAuthModalOpen}
        isLoggedIn={isLoggedIn}
        customerName={customer?.name}
        onLogout={logout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        cartPulse={cartPulse}
      />

      {/* Hero & Daily Featured Specials */}
      <AnimatePresence>
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.25 }}
          >
            <Hero onAddToCart={addToCart} />
            <OffersRail onOpenProduct={handleViewDetails} products={products} featureIds={dailyFeatureIds} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Catalog Section */}
      <main className="store-catalog flex-1 container mx-auto px-4 py-8 md:py-12 max-w-7xl" id="products">
        {/* Sticky Visual Category Bar */}
        <div id="catalog-categories" className="catalog-categories sticky top-[var(--store-header-height,7rem)] z-40 -mx-4 px-4 py-3 mb-8 glass-capsule border-y border-amber-500/20 shadow-md">
          <div className="relative">
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 md:flex-wrap md:overflow-visible items-center">
              {sortedCategories.map((category, i) => {
                const isSelected = selectedCategory === category;
                const count = categoryCounts[category] || 0;
                const icon = CATEGORY_ICONS[category] || "📦";
                return (
                  <motion.button
                    key={category}
                    type="button"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.2) }}
                    whileTap={{ scale: 0.94 }}
                    onClick={(e) => handleCategoryChange(category, e)}
                    aria-pressed={isSelected}
                    className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 border flex items-center gap-2 shrink-0 ${
                      isSelected
                        ? 'btn-kesar border-transparent scale-[1.03]'
                        : 'bg-white/70 dark:bg-white/[0.04] backdrop-blur-md text-gray-700 dark:text-gray-300 border-white/80 dark:border-white/10 shadow-sm hover:border-brand-kesar/40 hover:text-brand-ink hover:bg-white dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="text-base">{icon}</span>
                    <span>{t(category) || category}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        isSelected
                          ? 'bg-white/25 text-white'
                          : 'bg-gray-100/80 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section Heading & Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div className="flex items-baseline gap-3">
            <h2 id="catalog-heading" className="font-display text-2xl sm:text-3xl font-extrabold text-brand-ink dark:text-white tracking-tight">
              {searchQuery ? (
                <span>Search results for “{searchQuery}”</span>
              ) : selectedCategory === 'All' ? (
                'All Fresh Dairy & Pantry Staples'
              ) : (
                selectedCategory
              )}
            </h2>
            <span className="text-xs font-black text-brand-royalGoldLight bg-brand-maroon px-3 py-1 rounded-full ring-1 ring-brand-royalGold/60 whitespace-nowrap">
              {filteredProducts.length} items
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 transition"
              >
                Clear Search
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800/90 border border-gray-200/80 dark:border-white/10 rounded-2xl px-3 py-2 shadow-sm text-xs font-bold text-gray-600 dark:text-gray-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-brand-orange" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer text-xs font-extrabold text-brand-charcoal dark:text-white"
                aria-label="Sort products"
              >
                <option value="featured" className="dark:bg-slate-900">Featured</option>
                <option value="price-asc" className="dark:bg-slate-900">Price: Low to High</option>
                <option value="price-desc" className="dark:bg-slate-900">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="catalog-grid relative z-0 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={index < 12 ? { opacity: 0, y: 20 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.03 }}
              >
                <ProductCard
                  product={product}
                  addToCart={addToCart}
                  onViewDetails={handleViewDetails}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900/80 rounded-3xl border border-amber-500/20 shadow-sm p-8 max-w-md mx-auto">
            <p className="text-base font-bold text-gray-700 dark:text-gray-200 mb-2">
              No products found matching your search.
            </p>
            <p className="text-xs text-gray-400 mb-5">
              Try searching for fresh paneer, ghee, milk, Everest spices, or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="btn-kesar px-6 py-2.5 rounded-2xl text-xs font-black"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Interactive Abu Dhabi Store Showcase */}
      {!searchQuery && <OurStore />}

      {/* The Pandit Ji Quality Promise: maroon palace band with gold jaali */}
      {!searchQuery && (
        <section id="about" className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-brand-maroon to-brand-maroonDeep text-amber-50">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
            <div className="jaali absolute inset-0 opacity-[0.09]" />
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[46rem] h-[22rem] rounded-full bg-brand-kesar/30 blur-3xl" />
            <div className="absolute -bottom-40 right-[-4rem] w-[30rem] h-[30rem] rounded-full bg-brand-marigold/15 blur-3xl" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-royalGold to-transparent" />
            <div className="absolute top-1.5 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-royalGold/40 to-transparent" />
          </div>
          <div className="relative container mx-auto px-4 max-w-7xl">
            <div className="max-w-3xl mx-auto text-center mb-12 flex flex-col items-center">
              <RoyalEyebrow tone="light" className="mb-4">Pure Indian Dairy Heritage</RoyalEyebrow>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
                Why Abu Dhabi Chooses <span className="text-gold-foil italic pr-1">Pandit Ji</span>
              </h2>
              <RoyalDivider tone="light" className="mb-4" />
              <p className="text-sm sm:text-base text-amber-50/75 leading-relaxed">
                Handcrafted daily with authentic Indian quality standards and doorstep delivery across Abu Dhabi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[
                { icon: Sparkles, title: 'Prepared Fresh Daily', body: 'Zero starches, palm oil, or artificial softeners. Pure farm dairy crafted for soft, melt-in-the-mouth texture.' },
                { icon: Truck, title: 'Free Abu Dhabi Delivery', body: 'Temperature-controlled same-day delivery right to your apartment, villa, or office across Abu Dhabi.' },
                { icon: HeartHandshake, title: '30-Sec WhatsApp Order', body: 'No complex checkouts or card entries. Select your products and chat directly with our store concierge.' },
                { icon: ShieldCheck, title: 'Daily 05:00 AM Fresh Batch', body: 'Every batch of paneer, khoa, and malai is prepared early in the morning so you receive the freshest cuts.' },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="royal-frame group p-6 rounded-3xl bg-black/15 hover:bg-black/25 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-marigold via-brand-kesar to-brand-rani text-white flex items-center justify-center mb-5 shadow-lg shadow-black/40 ring-2 ring-brand-royalGold/60 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" strokeWidth={2.25} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-brand-royalGoldLight mb-2">
                    {title}
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-50/75 leading-relaxed">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer onToggleAdmin={() => setIsAdminDashboardOpen(prev => !prev)} />

      {/* Floating WhatsApp Launcher */}
      {!isCartOpen && <FloatingWhatsApp hasCartItems={cartCount > 0} />}

      {/* Lazy Loaded Panels */}
      {isCartOpen && (
        <Suspense fallback={<LazyPanelFallback />}>
          <Cart
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            onOrderPlaced={() => setCartItems([])}
            onAddToCart={addToCart}
            onReorder={(items) => {
              setCartItems(items.map(item => ({ ...item })));
              setIsCartOpen(true);
            }}
          />
        </Suspense>
      )}

      {isQuickViewOpen && selectedProduct && (
        <Suspense fallback={<LazyPanelFallback />}>
          <QuickViewModal
            product={selectedProduct}
            isOpen={isQuickViewOpen}
            onClose={() => setIsQuickViewOpen(false)}
            addToCart={addToCart}
          />
        </Suspense>
      )}

      {isAdminDashboardOpen && (
        <Suspense fallback={<LazyPanelFallback />}>
          <AdminDashboard
            isOpen={isAdminDashboardOpen}
            onClose={() => setIsAdminDashboardOpen(false)}
          />
        </Suspense>
      )}

      {isAuthModalOpen && (
        <Suspense fallback={<LazyPanelFallback />}>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={() => setIsAuthModalOpen(false)}
          />
        </Suspense>
      )}

      <PromotionalOfferModal
        product={promotionalProduct}
        isOpen={isPromotionalOfferOpen}
        onClose={() => setIsPromotionalOfferOpen(false)}
        onAddToCart={addToCart}
        onViewProduct={(product) => {
          setIsPromotionalOfferOpen(false);
          handleViewDetails(product);
        }}
      />

      <Toast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
        onUndo={undoAddToCart}
      />

      {/* Sticky Mobile Bar & Bottom Nav */}
      {!isCartOpen && (
        <>
          <MobileCartBar
            itemCount={cartCount}
            total={cartTotal}
            onOpenCart={() => setIsCartOpen(true)}
          />
          <BottomNav
            cartCount={cartCount}
            onCartClick={() => setIsCartOpen(true)}
            onProfileClick={() => setIsAuthModalOpen(true)}
            isLoggedIn={isLoggedIn}
          />
        </>
      )}

      {!isCartOpen && (
        <div className={`md:hidden ${cartCount > 0 ? 'h-36' : 'h-20'}`} />
      )}
    </div>
  );
}

export default App;
