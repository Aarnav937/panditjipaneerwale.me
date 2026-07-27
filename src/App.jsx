import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Toast from './components/Toast';
import BottomNav from './components/BottomNav';
import MobileCartBar from './components/MobileCartBar';
import OurStore from './components/OurStore';
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

// Heavy UI loaded only when opened — smaller first paint for shoppers
const Cart = lazy(() => import('./components/Cart'));
const QuickViewModal = lazy(() => import('./components/QuickViewModal'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const AuthModal = lazy(() => import('./components/AuthModal'));

/** Minimal full-screen wait while a lazy panel downloads */
const LazyPanelFallback = () => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[1px] pointer-events-none">
    <div className="w-10 h-10 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
  </div>
);

function App() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('products_custom');
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved);
        // Merge to keep any custom images while loading new prices and products from code
        const mergedProducts = initialProducts.map(p => {
          const savedProduct = parsedSaved.find(sp => sp.id === p.id);
          if (savedProduct && savedProduct.image !== p.image) {
            return { ...p, image: savedProduct.image };
          }
          return p;
        });
        
        // Include any entirely custom products just in case
        const customAdded = parsedSaved.filter(sp => !initialProducts.some(p => p.id === sp.id));
        return [...mergedProducts, ...customAdded];
      } catch (e) {
        return initialProducts;
      }
    }
    return initialProducts;
  });
  const [isAdminMode] = useState(false);

  // Initialize cart from local storage (Lazy Initialization)
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const [cartPulse, setCartPulse] = useState(false);

  const { t } = useLanguage();
  const { isAdmin } = useAdmin();
  const { isLoggedIn, customer, logout } = useAuth();

  // Auto-open admin dashboard when admin access is granted
  useEffect(() => {
    if (isAdmin && !isAdminDashboardOpen) {
      setIsAdminDashboardOpen(true);
    }
  }, [isAdmin]);

  // Load dark mode preference on mount
  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Reset category to All when searching
  useEffect(() => {
    if (searchQuery) {
      setSelectedCategory('All');
    }
  }, [searchQuery]);

  const updateProductImage = (id, newUrl) => {
    const updatedProducts = products.map(p =>
      p.id === id ? { ...p, image: newUrl } : p
    );
    setProducts(updatedProducts);
    localStorage.setItem('products_custom', JSON.stringify(updatedProducts));
  };

  const toggleTheme = React.useCallback(() => setIsDarkMode(prev => !prev), []);

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
    setToastMessage(`${product.name} added to cart!`);
    setShowToast(true);
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 300);
  }, [cartItems]);

  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => removeItemFromCart(prev, id));
  }, []);

  const undoAddToCart = useCallback(() => {
    if (!lastAddedProduct) return;
    setCartItems((prev) => undoLastAdd(prev, lastAddedProduct.id));
    setLastAddedProduct(null);
  }, [lastAddedProduct]);

  const updateQuantity = React.useCallback(
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

  const sortedCategories = React.useMemo(() => {
    return ['All', ...categories.filter(c => c !== 'All').sort()];
  }, []);

  // Fuzzy search helper - calculates similarity score between two strings
  const fuzzyMatch = React.useCallback((text, query) => {
    if (!query) return { matches: true, score: 0 };

    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact match gets highest score
    if (textLower.includes(queryLower)) return { matches: true, score: 100 };

    // Check if all query characters exist in order (fuzzy)
    let textIndex = 0;
    let matchedChars = 0;
    for (const char of queryLower) {
      const foundIndex = textLower.indexOf(char, textIndex);
      if (foundIndex !== -1) {
        matchedChars++;
        textIndex = foundIndex + 1;
      }
    }

    // Calculate similarity ratio
    const similarityScore = (matchedChars / queryLower.length) * 100;

    // Levenshtein distance for typo tolerance
    const levenshteinDistance = (s1, s2) => {
      const len1 = s1.length, len2 = s2.length;
      const dp = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

      for (let i = 0; i <= len1; i++) dp[i][0] = i;
      for (let j = 0; j <= len2; j++) dp[0][j] = j;

      for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
          if (s1[i - 1] === s2[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1];
          } else {
            dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
          }
        }
      }
      return dp[len1][len2];
    };

    // Check each word in the text for typo tolerance
    const words = textLower.split(' ');
    for (const word of words) {
      if (word.length >= 3 && queryLower.length >= 3) {
        // Calculate edit distance
        const distance = levenshteinDistance(word, queryLower);
        const maxLength = Math.max(word.length, queryLower.length);

        // Allow 1-2 character differences based on length
        const tolerance = queryLower.length <= 5 ? 1 : 2;

        if (distance <= tolerance) {
          const score = 100 - (distance / maxLength * 20); // Score decreases with distance
          return { matches: true, score: Math.max(score, 75) };
        }
      }
    }

    return { matches: similarityScore >= 70, score: similarityScore };
  }, []);


  const filteredProducts = React.useMemo(() => {
    if (!searchQuery) {
      // No search - just filter by category
      return products
        .filter(product => selectedCategory === 'All' || product.category === selectedCategory)
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    // With search - use fuzzy matching across name, category, and description
    return products
      .map(product => {
        const nameMatch = fuzzyMatch(product.name, searchQuery);
        const categoryMatch = fuzzyMatch(product.category, searchQuery);
        const descMatch = fuzzyMatch(product.description || '', searchQuery);

        // Best score from any field
        const bestScore = Math.max(nameMatch.score, categoryMatch.score * 0.8, descMatch.score * 0.6);
        const matches = nameMatch.matches || categoryMatch.matches || descMatch.matches;

        return { ...product, _searchScore: bestScore, _matches: matches };
      })
      .filter(product => product._matches)
      .filter(product => selectedCategory === 'All' || product.category === selectedCategory)
      .sort((a, b) => b._searchScore - a._searchScore); // Sort by relevance
  }, [searchQuery, selectedCategory, products, fuzzyMatch]);

  const handleCategoryChange = (category, e) => {
    setSelectedCategory(category);

    // Scroll to products section
    const productsSection = document.getElementById('products');
    if (productsSection) {
      const offset = 100; // Adjust for sticky header
      const elementPosition = productsSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }

    // Center the button in the mobile scroll view
    if (e && e.target) {
      e.target.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  const cartCount = React.useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );
  const cartTotal = React.useMemo(
    () => cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0),
    [cartItems]
  );

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 font-sans relative text-brand-charcoal">
      <div className="fixed inset-0 z-[-1] bg-fixed-gradient pointer-events-none" />

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

      <AnimatePresence>
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.25 }}
          >
            <Hero />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-10" id="products">
        {/* Category chips — sticky + lively selection */}
        <div className="sticky top-[6.75rem] md:top-[3.5rem] z-40 -mx-4 px-4 py-3.5 mb-6 bg-[#FFFDF9]/90 dark:bg-brand-darker/90 backdrop-blur-xl border-b border-brand-gold/20 dark:border-gray-800 shadow-sm">
          <div className="relative">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#FFFDF9] dark:from-brand-darker to-transparent z-10 md:hidden" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#FFFDF9] dark:from-brand-darker to-transparent z-10 md:hidden" />
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-0.5 md:flex-wrap md:overflow-visible">
              {sortedCategories.map((category, i) => (
                <motion.button
                  key={category}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  whileTap={{ scale: 0.92 }}
                  onClick={(e) => handleCategoryChange(category, e)}
                  className={`chip ${selectedCategory === category ? 'chip-active' : 'chip-idle'}`}
                >
                  {t(category)}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          key={selectedCategory + (searchQuery || '')}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-between items-end gap-3 mb-6"
        >
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-charcoal dark:text-white flex flex-wrap items-baseline gap-2">
            {searchQuery ? (
              <>
                <span>Results for “{searchQuery}”</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold bg-white dark:bg-brand-card border border-brand-gold/30 dark:border-gray-700 px-3 py-1 rounded-full hover:border-brand-orange text-brand-saffron shadow-sm"
                >
                  Clear
                </button>
              </>
            ) : (
              <span className="bg-gradient-to-r from-brand-charcoal to-brand-saffron dark:from-white dark:to-brand-gold bg-clip-text text-transparent">
                {selectedCategory === 'All' ? 'All products' : selectedCategory}
              </span>
            )}
            <motion.span
              key={filteredProducts.length}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-sm font-semibold text-brand-orange bg-brand-orange/10 px-2.5 py-0.5 rounded-full"
            >
              {filteredProducts.length}
            </motion.span>
          </h2>
        </motion.div>

        {filteredProducts.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 22, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92, y: -8 }}
                  transition={{
                    type: 'spring',
                    stiffness: 280,
                    damping: 24,
                    delay: Math.min(index * 0.03, 0.45),
                  }}
                >
                  <ProductCard
                    product={product}
                    addToCart={addToCart}
                    isAdminMode={isAdminMode}
                    onUpdateImage={updateProductImage}
                    onViewDetails={handleViewDetails}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white/90 dark:bg-brand-card rounded-2xl border border-brand-gold/25 dark:border-gray-800 shadow-gold-glow"
          >
            <p className="text-base text-brand-muted">No products found matching your criteria.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 px-5 py-2 rounded-full bg-brand-orange text-white font-bold text-sm shadow-md hover:bg-brand-dark transition"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </main>

      {!searchQuery && (
        <>
          <OurStore />
          <section id="about" className="py-12 md:py-14 border-t border-brand-border/60 dark:border-gray-800">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-brand-charcoal dark:text-white mb-3">{t('aboutTitle')}</h2>
                <div className="w-12 h-0.5 bg-brand-gold mx-auto mb-5 rounded-full" />
                <p className="text-base text-brand-muted dark:text-gray-400 leading-relaxed mb-8">
                  Fresh paneer, dairy and spices for your kitchen — pure ingredients, honest prices, free delivery across Abu Dhabi.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { title: 'Freshness', body: 'Daily-ready dairy you can trust.' },
                    { title: 'Authentic', body: 'Real flavours for home cooking.' },
                    { title: 'Delivery', body: 'Free delivery in Abu Dhabi.' },
                  ].map((card) => (
                    <div key={card.title} className="p-5 bg-white dark:bg-brand-card rounded-2xl border border-brand-border/80 dark:border-gray-800 shadow-soft text-left sm:text-center">
                      <h3 className="font-semibold text-base mb-1 text-brand-orange">{card.title}</h3>
                      <p className="text-sm text-brand-muted dark:text-gray-400">{card.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="contact" className="bg-brand-charcoal text-white py-12 md:py-14 border-t border-brand-gold/25">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('getInTouch')}</h2>
              <p className="text-white/60 text-sm mb-8">Call, visit, or message us anytime</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <a href="tel:+971524676306" className="flex flex-col items-center p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-gold/40 transition">
                  <span className="w-11 h-11 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </span>
                  <h3 className="font-semibold text-sm mb-1">Call</h3>
                  <p className="text-sm text-white/80">+971 52 467 6306</p>
                </a>
                <div className="flex flex-col items-center p-5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="w-11 h-11 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </span>
                  <h3 className="font-semibold text-sm mb-1">Visit</h3>
                  <p className="text-sm text-white/80">F9QJ+F6F Abu Dhabi</p>
                </div>
                <a href="mailto:rrc.inttrading@gmail.com" className="flex flex-col items-center p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-saffron/40 transition">
                  <span className="w-11 h-11 rounded-full bg-brand-saffron/20 text-brand-saffron flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </span>
                  <h3 className="font-semibold text-sm mb-1">Email</h3>
                  <p className="text-sm text-white/80 break-all">rrc.inttrading@gmail.com</p>
                </a>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
      {!isCartOpen && <FloatingWhatsApp hasCartItems={cartCount > 0} />}

      {/* Lazy panels: chunk only downloaded the first time each is opened */}
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

      {/* Hide bottom chrome while bag is open so Place Order is never covered */}
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

      {/* Space for bottom nav + optional cart bar on mobile */}
      {!isCartOpen && (
        <div className={`md:hidden ${cartCount > 0 ? 'h-36' : 'h-20'}`} />
      )}
    </div>
  );
}

export default App;
