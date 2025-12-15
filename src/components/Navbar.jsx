import React from 'react';
import { ShoppingCart, Search, Menu, X, Moon, Sun, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ cartCount, setIsCartOpen, setIsOrderHistoryOpen, searchQuery, setSearchQuery, isDarkMode, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white/80 dark:bg-brand-darker/80 backdrop-blur-md text-gray-800 dark:text-white sticky top-0 z-50 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold font-sans text-brand-orange"
          >
            Pandit Ji Paneer Wale
          </motion.div>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input
            type="text"
            placeholder="Search for paneer, spices..."
            className="w-full px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-2.5 text-gray-500 w-5 h-5" />
        </div>

        <div className="hidden md:flex items-center gap-6 font-medium">
          <a href="#" className="hover:text-brand-orange transition">Home</a>
          <a href="#about" className="hover:text-brand-orange transition">About</a>
          <a href="#contact" className="hover:text-brand-orange transition">Contact</a>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Order History Button */}
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition hover:scale-110"
            onClick={() => setIsOrderHistoryOpen(true)}
            title="Order History"
          >
            <Package className="w-6 h-6" />
          </button>

          <button
            className="relative hover:scale-110 transition-transform"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-7 h-7" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className="p-2"
            onClick={() => setIsOrderHistoryOpen(true)}
            title="Order History"
          >
            <Package className="w-5 h-5" />
          </button>
          <button
            className="relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="md:hidden bg-white dark:bg-brand-darker border-t dark:border-gray-700 overflow-hidden"
        >
          <div className="px-4 py-4 flex flex-col gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="text-left hover:text-brand-orange" onClick={() => window.scrollTo(0, 0)}>Home</button>
            <a href="#about" className="text-left hover:text-brand-orange">About</a>
            <a href="#contact" className="text-left hover:text-brand-orange">Contact</a>
            <button
              className="text-left hover:text-brand-orange flex items-center gap-2"
              onClick={() => { setIsOrderHistoryOpen(true); setIsMobileMenuOpen(false); }}
            >
              <Package size={16} /> Order History
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
