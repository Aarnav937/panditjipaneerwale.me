import React from 'react';
import { ShoppingCart, Search, Menu, X, Moon, Sun, Languages, Settings2, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';
import NotificationBell from './NotificationBell';

const Navbar = ({
  cartCount,
  setIsCartOpen,
  setIsAdminDashboardOpen,
  setIsAuthModalOpen,
  isLoggedIn,
  customerName,
  onLogout,
  searchQuery,
  setSearchQuery,
  isDarkMode,
  toggleTheme,
  cartPulse
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { isAdmin } = useAdmin();

  return (
    <>
      <nav className="bg-white/90 dark:bg-brand-darker/90 backdrop-blur-md text-brand-charcoal dark:text-white sticky top-0 z-50 border-b border-brand-border/80 dark:border-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 py-2.5 flex justify-between items-center gap-3">
          <a href="#" className="flex items-center gap-2 min-w-0 shrink-0" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="leading-tight"
            >
              <span className="block text-lg md:text-xl font-bold text-brand-orange tracking-tight truncate max-w-[11rem] sm:max-w-none">
                Pandit Ji
              </span>
              <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-goldDark dark:text-brand-gold -mt-0.5">
                Paneer Wale
              </span>
            </motion.div>
          </a>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full px-4 py-2 rounded-full bg-brand-cream dark:bg-gray-900 text-brand-charcoal dark:text-white border border-brand-border dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition-colors text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className={`absolute top-2.5 text-brand-muted ${language === 'ar' ? 'left-3' : 'right-3'}`}>
              <Search className="w-4 h-4" />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 font-medium">
            <a href="#products" className="px-2.5 py-1.5 text-sm text-brand-muted hover:text-brand-orange transition rounded-lg">
              Products
            </a>
            <a href="#our-store" className="px-2.5 py-1.5 text-sm text-brand-muted hover:text-brand-orange transition rounded-lg">
              Store
            </a>

            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-brand-saffronLight dark:hover:bg-gray-800 transition flex items-center gap-1 font-semibold text-xs text-brand-muted"
              title="Switch Language"
            >
              <Languages size={18} />
              <span>{language === 'en' ? 'AR' : 'EN'}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-brand-saffronLight dark:hover:bg-gray-800 transition text-brand-muted"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isLoggedIn && <NotificationBell />}

            {isAdmin && (
              <button
                className="p-2 rounded-full bg-brand-saffron text-white hover:bg-brand-orange transition-all"
                onClick={() => setIsAdminDashboardOpen(true)}
                title="Admin Dashboard"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`p-2 rounded-full transition-all ${isLoggedIn
                  ? 'bg-brand-orange/10 text-brand-orange'
                  : 'hover:bg-brand-saffronLight dark:hover:bg-gray-800 text-brand-muted'
                  }`}
                title="Account"
              >
                <User className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    className="absolute right-0 top-11 bg-white dark:bg-brand-card rounded-2xl shadow-soft-hover border border-brand-border dark:border-gray-700 overflow-hidden min-w-[200px] z-50 py-1"
                  >
                    {isLoggedIn ? (
                      <div className="p-3 border-b border-brand-border dark:border-gray-700">
                        <p className="text-[10px] text-brand-muted font-semibold uppercase tracking-wider">Signed in</p>
                        <p className="font-semibold text-brand-charcoal dark:text-white truncate text-sm">{customerName || 'User'}</p>
                      </div>
                    ) : (
                      <div className="p-3 border-b border-brand-border dark:border-gray-700">
                        <button
                          onClick={() => {
                            setIsAuthModalOpen(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-brand-orange text-white font-semibold text-sm hover:bg-brand-dark transition text-center"
                        >
                          Login / Sign Up
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setIsCartOpen(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-brand-charcoal dark:text-gray-200 hover:bg-brand-saffronLight dark:hover:bg-gray-800 flex items-center gap-2 text-sm"
                    >
                      <ShoppingCart className="w-4 h-4 text-brand-muted" />
                      <span>Bag & Orders</span>
                    </button>

                    {isLoggedIn && (
                      <button
                        onClick={() => {
                          onLogout?.();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-brand-saffron hover:bg-brand-saffronLight dark:hover:bg-red-900/20 border-t border-brand-border dark:border-gray-700 flex items-center gap-2 text-sm font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              className="relative ml-1 p-2 rounded-full hover:bg-brand-saffronLight dark:hover:bg-gray-800 transition"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open cart"
            >
              <motion.div animate={cartPulse ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
                <ShoppingCart className="w-6 h-6 text-brand-charcoal dark:text-white" />
              </motion.div>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-[10px] font-bold rounded-full min-w-[1.15rem] h-[1.15rem] flex items-center justify-center px-1"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </button>
          </div>

          {/* Mobile: compact actions */}
          <div className="md:hidden flex items-center gap-0.5">
            <button onClick={toggleLanguage} className="p-2 font-bold text-xs text-brand-muted" aria-label="Language">
              {language === 'en' ? 'AR' : 'EN'}
            </button>
            <button onClick={toggleTheme} className="p-2 text-brand-muted" aria-label="Theme">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="relative p-2 text-brand-charcoal dark:text-white"
              onClick={() => setIsCartOpen(true)}
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-orange text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2" aria-label="Menu">
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-2.5">
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full px-4 py-2.5 rounded-full bg-brand-cream dark:bg-gray-900 text-brand-charcoal dark:text-white border border-brand-border dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className={`absolute top-2.5 text-brand-muted ${language === 'ar' ? 'left-3' : 'right-3'}`}>
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black z-[60]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="md:hidden fixed right-0 top-0 h-full w-72 bg-white dark:bg-brand-darker z-[70] shadow-soft-hover border-l border-brand-border dark:border-gray-800"
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-brand-border dark:border-gray-800">
                  <span className="text-base font-bold text-brand-orange">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-brand-saffronLight dark:hover:bg-gray-800">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <button className="text-left px-3 py-2.5 rounded-xl hover:bg-brand-saffronLight dark:hover:bg-gray-800 font-medium text-sm" onClick={() => { window.scrollTo(0, 0); setIsMobileMenuOpen(false); }}>
                    {t('home')}
                  </button>
                  <a href="#products" className="px-3 py-2.5 rounded-xl hover:bg-brand-saffronLight dark:hover:bg-gray-800 font-medium text-sm" onClick={() => setIsMobileMenuOpen(false)}>Products</a>
                  <a href="#our-store" className="px-3 py-2.5 rounded-xl hover:bg-brand-saffronLight dark:hover:bg-gray-800 font-medium text-sm" onClick={() => setIsMobileMenuOpen(false)}>Store</a>
                  <a href="#about" className="px-3 py-2.5 rounded-xl hover:bg-brand-saffronLight dark:hover:bg-gray-800 font-medium text-sm" onClick={() => setIsMobileMenuOpen(false)}>{t('about')}</a>
                  <a href="#contact" className="px-3 py-2.5 rounded-xl hover:bg-brand-saffronLight dark:hover:bg-gray-800 font-medium text-sm" onClick={() => setIsMobileMenuOpen(false)}>{t('contact')}</a>

                  {isAdmin && (
                    <button className="text-left px-3 py-2.5 rounded-xl hover:bg-brand-saffronLight font-medium text-sm text-brand-saffron flex items-center gap-2" onClick={() => { setIsAdminDashboardOpen(true); setIsMobileMenuOpen(false); }}>
                      <Settings2 size={16} /> Admin
                    </button>
                  )}

                  {isLoggedIn ? (
                    <div className="border-t border-brand-border dark:border-gray-800 pt-2 mt-2">
                      <div className="px-3 py-2">
                        <p className="text-xs text-brand-muted">Signed in as</p>
                        <p className="font-semibold truncate text-sm">{customerName}</p>
                      </div>
                      <button onClick={() => { onLogout?.(); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-xl text-brand-saffron font-medium text-sm flex items-center gap-2">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      className="mt-3 w-full py-2.5 rounded-xl bg-brand-orange text-white font-semibold text-sm flex items-center justify-center gap-2"
                      onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                    >
                      <User size={16} /> Login
                    </button>
                  )}
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
