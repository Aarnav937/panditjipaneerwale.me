import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import { products as initialProducts, categories } from './data/products';
import { motion } from 'framer-motion';

function App() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('products_custom');
    return saved ? JSON.parse(saved) : initialProducts;
  });
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    
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

  const addToCart = React.useCallback((product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = React.useCallback((id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = React.useCallback((id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev => 
      prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
    );
  }, [removeFromCart]);

  const sortedCategories = React.useMemo(() => {
    return ['All', ...categories.filter(c => c !== 'All').sort()];
  }, []);

  const filteredProducts = React.useMemo(() => products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.name.localeCompare(b.name)), [searchQuery, selectedCategory]);

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
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      
      <Hero />

      <main className="flex-1 container mx-auto px-4 py-12" id="products">
        
        {/* Mobile Category Scrolling */}
        <div className="md:hidden mb-8 sticky top-20 z-40 bg-white/80 dark:bg-brand-darker/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {sortedCategories.map(category => (
              <button
                key={category}
                onClick={(e) => handleCategoryChange(category, e)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 border ${
                  selectedCategory === category 
                    ? 'bg-brand-orange text-white border-brand-orange shadow-md transform scale-105' 
                    : 'bg-white dark:bg-brand-card text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-brand-orange'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters - Desktop Only */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-brand-card p-6 rounded-2xl shadow-lg sticky top-24 transition-colors duration-300">
              <h3 className="font-bold text-xl mb-4 text-brand-dark dark:text-brand-orange">Categories</h3>
              <div className="space-y-2">
                {sortedCategories.map(category => (
                  <button
                    key={category}
                    onClick={(e) => handleCategoryChange(category, e)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                      selectedCategory === category 
                        ? 'bg-brand-orange text-white font-bold shadow-md transform scale-105' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                {selectedCategory} Products
                <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-3">({filteredProducts.length} items)</span>
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
                  onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
                  className="mt-4 text-brand-orange font-semibold hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <section id="about" className="bg-white dark:bg-brand-card py-20 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-brand-dark dark:text-brand-orange mb-8">About Pandit Ji Paneer Wale</h2>
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
          <h2 className="text-4xl font-bold mb-12">Get in Touch</h2>
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
              <p className="text-lg">F9QJ+M5J, Al Zahiyah - E16 02<br/>Abu Dhabi, UAE</p>
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

      <Footer />
      <FloatingWhatsApp />

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems} 
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
      />
    </div>
  );
}

export default App;
