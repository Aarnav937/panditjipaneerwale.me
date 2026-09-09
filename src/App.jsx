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
import { products as initialProducts, categories } from './data/products';
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
  const [products] = useState(() => {
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
        return [...mergedProducts, ...customAdded];
      } catch (e) {
        return initialProducts;
      }
    }
    return initialProducts;
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
    if (isAdmin && !isAdminDashboardOpen) {
      setIsAdminDashboardOpen(true);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

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
    return (nav?.getBoundingClientRect().height || 80) + 16;
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
    if (e && e.target) {
      e.target.scrollIntoView({
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
      {/* Radiant Background */}
      <div className="fixed inset-0 z-[-1] bg-fixed-gradient pointer-events-none" />

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
            <OffersRail onOpenProduct={handleViewDetails} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Catalog Section */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-7xl" id="products">
        {/* Sticky Visual Category Bar */}
        <div className="sticky top-[4.2rem] md:top-[4rem] z-40 -mx-4 px-4 py-3 mb-8 glass-capsule border-y border-amber-500/20 shadow-md">
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
                    className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 border flex items-center gap-2 shrink-0 ${
                      isSelected
                        ? 'bg-gradient-to-r from-brand-orange to-amber-500 text-white border-transparent shadow-md shadow-brand-orange/25 scale-[1.03]'
                        : 'bg-white/90 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200/80 dark:border-white/10 hover:border-brand-orange/50 hover:bg-orange-50/40 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="text-base">{icon}</span>
                    <span>{t(category) || category}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        isSelected
                          ? 'bg-white/25 text-white'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
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
            <h2 id="catalog-heading" className="font-display text-2xl sm:text-3xl font-extrabold text-brand-charcoal dark:text-white tracking-tight">
              {searchQuery ? (
                <span>Search results for “{searchQuery}”</span>
              ) : selectedCategory === 'All' ? (
                'All Fresh Dairy & Pantry Staples'
              ) : (
                selectedCategory
              )}
            </h2>
            <span className="text-xs font-black text-brand-orange bg-amber-500/10 dark:bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/20">
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
          <div className="relative z-0 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
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
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 text-white text-xs font-black shadow-md hover:shadow-lg transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Interactive Abu Dhabi Store Showcase */}
      {!searchQuery && <OurStore />}

      {/* The Pandit Ji Quality Promise: Bento Grid */}
      {!searchQuery && (
        <section id="about" className="py-16 bg-white/70 dark:bg-slate-950/70 border-t border-amber-500/20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-xs font-black uppercase tracking-widest text-brand-orange mb-2 block">
                Pure Indian Dairy Heritage
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-brand-charcoal dark:text-white mb-3">
                Why Abu Dhabi Chooses Pandit Ji
              </h2>
              <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full mb-4" />
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Handcrafted daily from pure buffalo milk with authentic Indian quality standards and doorstep delivery across Abu Dhabi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-amber-500/20 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-brand-orange flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-brand-charcoal dark:text-white mb-2">
                  100% Buffalo Milk
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Zero starches, palm oil, or artificial softeners. Pure farm dairy crafted for soft, melt-in-the-mouth texture.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-amber-500/20 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-brand-charcoal dark:text-white mb-2">
                  Free Abu Dhabi Delivery
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Temperature-controlled same-day delivery right to your apartment, villa, or office across Abu Dhabi.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-amber-500/20 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-brand-charcoal dark:text-white mb-2">
                  30-Sec WhatsApp Order
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  No complex checkouts or card entries. Select your products and chat directly with our store concierge.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-amber-500/20 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-brand-charcoal dark:text-white mb-2">
                  Daily 05:00 AM Fresh Batch
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Every batch of paneer, khoa, and malai is prepared early in the morning so you receive the freshest cuts.
                </p>
              </div>
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
