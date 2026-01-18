/**
 * Test Comment - Added on 18 Jan 2026
 * This comment is invisible to website users.
 * It's just to test the GitHub deployment workflow! 🚀
 */

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import OrderHistory from './components/OrderHistory';
import Toast from './components/Toast';
import BottomNav from './components/BottomNav';
import { products as initialProducts, categories } from './data/products';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from './context/LanguageContext';

function App() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('products_custom');
    return saved ? JSON.parse(saved) : initialProducts;
  });
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Initialize cart from local storage (Lazy Initialization)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      console.log('🛒 [Debug] Loading cart from storage:', savedCart);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('🛒 [Debug] Error loading cart:', error);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const [cartPulse, setCartPulse] = useState(false);

  const { t } = useLanguage();

  // Load dark mode preference on mount
  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    console.log('🛒 [Debug] Saving cart to storage:', cartItems);
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

  const exportData = () => {
    const dataStr = "export const products = " + JSON.stringify(products, null, 2) + ";";
    navigator.clipboard.writeText(dataStr);
    alert("Product data copied to clipboard! You can now paste it into src/data/products.js");
  };

  const toggleTheme = React.useCallback(() => setIsDarkMode(prev => !prev), []);

  // Helper to parse weight/volume from product name
  const parseProductUnit = (name) => {
    const match = name.match(/(\d+(\.\d+)?)\s*(kg|g|gm|ltr|l|ml)/i);
    if (!match) return { weight: 0, volume: 0 };

    const value = parseFloat(match[1]);
    const unit = match[3].toLowerCase();

    if (unit === 'kg') return { weight: value, volume: 0 };
    if (unit === 'g' || unit === 'gm') return { weight: value / 1000, volume: 0 };
    if (unit === 'ltr' || unit === 'l') return { weight: 0, volume: value };
    if (unit === 'ml') return { weight: 0, volume: value / 1000 };

    return { weight: 0, volume: 0 };
  };

  const checkLimits = (newCartItems) => {
    let totalWeight = 0;
    let totalVolume = 0;
    let totalQuantity = 0;

    newCartItems.forEach(item => {
      const { weight, volume } = parseProductUnit(item.name);
      totalWeight += weight * item.quantity;
      totalVolume += volume * item.quantity;
      totalQuantity += item.quantity;
    });

    if (totalQuantity > 50) return "Limit reached: You can only order up to 50 items in total.";
    if (totalWeight > 50) return "Limit reached: Total weight cannot exceed 50kg.";
    if (totalVolume > 50) return "Limit reached: Total volume cannot exceed 50 liters.";

    return null;
  };

  const addToCart = useCallback((product) => {
    let newCartItems = [...cartItems];
    const existingIndex = newCartItems.findIndex(item => item.id === product.id);

    if (existingIndex >= 0) {
      newCartItems[existingIndex] = {
        ...newCartItems[existingIndex],
        quantity: newCartItems[existingIndex].quantity + 1
      };
    } else {
      newCartItems.push({ ...product, quantity: 1 });
    }

    const error = checkLimits(newCartItems);
    if (error) {
      alert(error);
      return;
    }

    setCartItems(newCartItems);

    // Show toast notification
    setLastAddedProduct(product);
    setToastMessage(`${product.name} added to cart!`);
    setShowToast(true);

    // Trigger cart icon pulse
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 300);
  }, [cartItems]);

  const removeFromCart = useCallback((id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Undo last add to cart action
  const undoAddToCart = useCallback(() => {
    if (!lastAddedProduct) return;

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === lastAddedProduct.id);
      if (existingIndex >= 0) {
        const item = prev[existingIndex];
        if (item.quantity === 1) {
          // Remove item completely
          return prev.filter(i => i.id !== lastAddedProduct.id);
        } else {
          // Decrease quantity by 1
          return prev.map(i =>
            i.id === lastAddedProduct.id
              ? { ...i, quantity: i.quantity - 1 }
              : i
          );
        }
      }
      return prev;
    });
    setLastAddedProduct(null);
  }, [lastAddedProduct]);

  const updateQuantity = React.useCallback((id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }

    const newCartItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );

    const error = checkLimits(newCartItems);
    if (error) {
      alert(error);
      return;
    }

    setCartItems(newCartItems);
  }, [cartItems, removeFromCart]);

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

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 font-sans relative">
      {/* Fixed Background for Performance */}
      <div className="fixed inset-0 z-[-1] bg-fixed-gradient pointer-events-none" />

      <Navbar
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        setIsCartOpen={setIsCartOpen}
        setIsOrderHistoryOpen={setIsOrderHistoryOpen}
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
            transition={{ duration: 0.3 }}
          >
            <Hero />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 container mx-auto px-4 py-12" id="products">

        {/* Mobile Category Scrolling with Scroll Indicators */}
        <div className="md:hidden mb-8 sticky top-20 z-40 bg-white/80 dark:bg-brand-darker/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            {/* Left Fade + Arrow */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-brand-darker to-transparent z-10 pointer-events-none flex items-center">
              <div className="w-6 h-6 bg-white dark:bg-brand-card rounded-full shadow-md flex items-center justify-center ml-1 pointer-events-auto opacity-70">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </div>

            {/* Scrollable Categories */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 px-8">
              {sortedCategories.map(category => (
                <button
                  key={category}
                  onClick={(e) => handleCategoryChange(category, e)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 border ${selectedCategory === category
                    ? 'bg-brand-orange text-white border-brand-orange shadow-md transform scale-105'
                    : 'bg-white dark:bg-brand-card text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-brand-orange'
                    }`}
                >
                  {t(category)}
                </button>
              ))}
            </div>

            {/* Right Fade + Arrow */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-brand-darker to-transparent z-10 pointer-events-none flex items-center justify-end">
              <div className="w-6 h-6 bg-white dark:bg-brand-card rounded-full shadow-md flex items-center justify-center mr-1 pointer-events-auto opacity-70">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters - Desktop Only */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-brand-card p-6 rounded-2xl shadow-lg sticky top-24 transition-colors duration-300">
              <h3 className="font-bold text-xl mb-4 text-brand-dark dark:text-brand-orange">{t('categories')}</h3>
              <div className="space-y-2">
                {sortedCategories.map(category => (
                  <button
                    key={category}
                    onClick={(e) => handleCategoryChange(category, e)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${selectedCategory === category
                      ? 'bg-brand-orange text-white font-bold shadow-md transform scale-105'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {t(category)}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                {searchQuery ? (
                  <>
                    Results for "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
                    >
                      Clear
                    </button>
                  </>
                ) : (
                  `${selectedCategory} Products`
                )}
                <span className="text-lg font-normal text-gray-500 dark:text-gray-400">({filteredProducts.length} items)</span>
              </h2>
            </div>

            {filteredProducts.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    addToCart={addToCart}
                    isAdminMode={isAdminMode}
                    onUpdateImage={updateProductImage}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-brand-card rounded-2xl shadow-sm">
                <p className="text-xl text-gray-500 dark:text-gray-400">No products found matching your criteria.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="mt-4 text-brand-orange font-semibold hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {!searchQuery && (
        <>
          <section id="about" className="bg-white dark:bg-brand-card py-20 transition-colors duration-300">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-brand-dark dark:text-brand-orange mb-8">{t('aboutTitle')}</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-12">
                  We are dedicated to providing the freshest paneer and highest quality dairy products to our community.
                  With a passion for authentic flavors and a commitment to excellence, we ensure that every product
                  that reaches your kitchen is pure, fresh, and delicious.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <motion.div whileHover={{ y: -10 }} className="p-8 bg-brand-light dark:bg-gray-800 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-2xl mb-3 text-brand-orange">Freshness Guaranteed</h3>
                    <p className="text-gray-600 dark:text-gray-400">Farm-fresh products delivered daily to ensure maximum quality.</p>
                  </motion.div>
                  <motion.div whileHover={{ y: -10 }} className="p-8 bg-brand-light dark:bg-gray-800 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-2xl mb-3 text-brand-orange">Authentic Taste</h3>
                    <p className="text-gray-600 dark:text-gray-400">Traditional recipes and pure ingredients for that homemade feel.</p>
                  </motion.div>
                  <motion.div whileHover={{ y: -10 }} className="p-8 bg-brand-light dark:bg-gray-800 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-2xl mb-3 text-brand-orange">Fast Delivery</h3>
                    <p className="text-gray-600 dark:text-gray-400">Quick and reliable delivery service to your doorstep.</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          <section id="contact" className="bg-brand-orange text-white py-20">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-4xl font-bold mb-12">{t('getInTouch')}</h2>
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
                <motion.div whileHover={{ scale: 1.1 }} className="flex flex-col items-center">
                  <div className="bg-white text-brand-orange p-6 rounded-full mb-6 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <h3 className="font-bold text-2xl mb-2">Call Us</h3>
                  <p className="text-lg">+971 52 467 6306</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} className="flex flex-col items-center">
                  <div className="bg-white text-brand-orange p-6 rounded-full mb-6 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <h3 className="font-bold text-2xl mb-2">Visit Us</h3>
                  <p className="text-lg">F9QJ+M5J, Al Zahiyah - E16 02<br />Abu Dhabi, UAE</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} className="flex flex-col items-center">
                  <div className="bg-white text-brand-orange p-6 rounded-full mb-6 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <h3 className="font-bold text-2xl mb-2">Email Us</h3>
                  <p className="text-lg">rrc.inttrading@gmail.com</p>
                </motion.div>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
      <FloatingWhatsApp />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        onOrderPlaced={() => setCartItems([])}
      />

      <OrderHistory
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        onReorder={(items) => {
          setCartItems(items.map(item => ({ ...item })));
          setIsCartOpen(true);
        }}
      />

      {/* Toast Notification */}
      <Toast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
        onUndo={undoAddToCart}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onOrderHistoryClick={() => setIsOrderHistoryOpen(true)}
      />

      {/* Spacer for bottom nav on mobile */}
      <div className="md:hidden h-20" />
    </div>
  );
}

export default App;
