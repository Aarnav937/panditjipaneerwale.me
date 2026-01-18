import React from 'react';
import { ShoppingCart, Search, Menu, X, Moon, Sun, Package, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const Navbar = ({ cartCount, setIsCartOpen, setIsOrderHistoryOpen, searchQuery, setSearchQuery, isDarkMode, toggleTheme, cartPulse }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <>
      <nav className="bg-white/95 dark:bg-brand-darker/95 backdrop-blur-md text-gray-800 dark:text-white sticky top-0 z-50 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xl md:text-2xl font-bold font-sans text-brand-orange"
            >
              Pandit Ji Paneer Wale
            </motion.div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className={`absolute top-2.5 text-gray-500 ${language === 'ar' ? 'left-3' : 'right-3'}`}>
              <Search className="w-5 h-5" />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 font-medium">
            <a href="#" className="hover:text-brand-orange transition">{t('home')}</a>
            <a href="#about" className="hover:text-brand-orange transition">{t('about')}</a>
            <a href="#contact" className="hover:text-brand-orange transition">{t('contact')}</a>

            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-1 font-bold text-sm"
              title="Switch Language"
            >
              <Languages size={20} />
              <span>{language === 'en' ? 'AR' : 'EN'}</span>
            </button>

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
              title={t('orderHistory')}
            >
              <Package className="w-6 h-6" />
            </button>

            <button
              className="relative hover:scale-110 transition-transform"
              onClick={() => setIsCartOpen(true)}
            >
              <motion.div
                animate={cartPulse ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <ShoppingCart className="w-7 h-7" />
              </motion.div>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-brand-orange text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
          </div>

          {/* Mobile Header Actions - Simplified, main nav is in BottomNav */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 font-bold text-xs"
            >
              {language === 'en' ? 'AR' : 'EN'}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search - Always Visible */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full px-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className={`absolute top-2.5 text-gray-500 ${language === 'ar' ? 'left-3' : 'right-3'}`}>
              <Search className="w-5 h-5" />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-in Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black z-[60]"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed right-0 top-0 h-full w-72 bg-white dark:bg-brand-darker z-[70] shadow-2xl"
            >
              <div className="p-4">
                {/* Drawer Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-lg font-bold text-brand-orange">Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Drawer Links */}
                <div className="flex flex-col gap-2">
                  <button
                    className="text-left px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                    onClick={() => { window.scrollTo(0, 0); setIsMobileMenuOpen(false); }}
                  >
                    {t('home')}
                  </button>
                  <a
                    href="#about"
                    className="px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('about')}
                  </a>
                  <a
                    href="#contact"
                    className="px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('contact')}
                  </a>
                  <button
                    className="text-left px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium flex items-center gap-3"
                    onClick={() => { setIsOrderHistoryOpen(true); setIsMobileMenuOpen(false); }}
                  >
                    <Package size={18} /> {t('orderHistory')}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
