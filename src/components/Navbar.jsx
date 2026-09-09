import React, { useState } from 'react';
import { 
  ShoppingCart, Search, Menu, X, Moon, Sun, Languages, 
  Settings2, User, LogOut, MessageCircle, MapPin, Sparkles, ChevronDown 
} from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { isAdmin } = useAdmin();

  return (
    <>
      <header className="safe-area-top sticky top-0 z-50 transition-all duration-300 glass-capsule border-b border-gray-200/80 dark:border-white/10">
        {/* Top Mini Info Bar (Desktop) */}
        <div className="hidden lg:block border-b border-gray-100 dark:border-white/5 py-1 px-4 text-xs">
          <div className="container mx-auto flex items-center justify-between text-brand-muted dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 live-dot" />
                Store Open Daily in Abu Dhabi
              </span>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-orange" />
                F9QJ+F6F Abu Dhabi, UAE
              </span>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                ⚡ Same-Day Free Delivery
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href="https://wa.me/971524676306?text=Hello%20Pandit%20Ji%20Paneer%20Wale%2C%20I%20have%20an%20order%20inquiry." 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 font-semibold"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                WhatsApp: +971 52 467 6306
              </a>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="container mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3 md:gap-6 max-w-7xl">
          {/* Brand Logo */}
          <a
            href="#"
            className="group flex items-center gap-2.5 min-w-0 shrink-0 select-none"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-brand-saffron to-brand-orange flex items-center justify-center shadow-md shadow-brand-orange/25 group-hover:scale-105 transition-transform duration-300">
              <span className="text-xl">🧀</span>
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1">
                <span className="font-display text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-brand-charcoal via-brand-saffron to-brand-orange dark:from-white dark:via-amber-200 dark:to-brand-orange bg-clip-text text-transparent">
                  Pandit Ji
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse hidden sm:inline-block" />
              </div>
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400 -mt-0.5">
                Paneer Wale • Abu Dhabi
              </span>
            </div>
          </a>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg relative group">
            <input
              type="text"
              placeholder={t('searchPlaceholder') || "Search fresh paneer, spices, ghee, sweets..."}
              className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-gray-100/80 dark:bg-slate-900/80 text-brand-charcoal dark:text-white border border-gray-200/80 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition-all text-sm placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className={`absolute top-3 text-gray-400 group-focus-within:text-brand-orange transition-colors ${language === 'ar' ? 'right-3.5' : 'left-3.5'}`}>
              <Search className="w-4 h-4" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-2.5 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ${language === 'ar' ? 'left-3' : 'right-3'}`}
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-2">
            <nav className="flex items-center gap-1 mr-2 text-sm font-bold">
              <a
                href="#products"
                className="px-3 py-2 rounded-xl text-gray-600 hover:text-brand-orange dark:text-gray-300 dark:hover:text-amber-400 hover:bg-orange-50/60 dark:hover:bg-white/5 transition-all"
              >
                {t('allProducts') || "Products"}
              </a>
              <a
                href="#our-store"
                className="px-3 py-2 rounded-xl text-gray-600 hover:text-brand-orange dark:text-gray-300 dark:hover:text-amber-400 hover:bg-orange-50/60 dark:hover:bg-white/5 transition-all"
              >
                {t('about') || "Abu Dhabi Store"}
              </a>
            </nav>

            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl border border-gray-200/80 dark:border-white/10 hover:border-brand-orange/50 hover:bg-orange-50/50 dark:hover:bg-white/5 transition flex items-center gap-1.5 font-bold text-xs text-gray-600 dark:text-gray-300"
              title="Switch Language"
            >
              <Languages className="w-4 h-4 text-brand-orange" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Dark Mode Switch */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-gray-200/80 dark:border-white/10 hover:border-brand-orange/50 hover:bg-orange-50/50 dark:hover:bg-white/5 transition text-gray-600 dark:text-gray-300"
              aria-label="Toggle theme"
            >
              <motion.div initial={false} animate={{ rotate: isDarkMode ? 180 : 0 }} transition={{ duration: 0.3 }}>
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </motion.div>
            </button>

            {/* Notification Bell */}
            {isLoggedIn && <NotificationBell />}

            {/* Admin Portal Button */}
            {isAdmin && (
              <button
                className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 transition-all flex items-center gap-1 text-xs font-bold"
                onClick={() => setIsAdminDashboardOpen(true)}
                title="Admin Dashboard"
              >
                <Settings2 className="w-4 h-4" />
                <span className="hidden xl:inline">Admin</span>
              </button>
            )}

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                  isLoggedIn
                    ? 'border-brand-orange/40 bg-brand-orange/10 text-brand-orange'
                    : 'border-gray-200/80 dark:border-white/10 hover:border-brand-orange/50 text-gray-600 dark:text-gray-300'
                }`}
                title="Account"
              >
                <User className="w-4 h-4" />
                {isLoggedIn && (
                  <span className="text-xs font-bold max-w-[80px] truncate">
                    {customerName?.split(' ')[0] || 'User'}
                  </span>
                )}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    className="absolute right-0 top-12 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden min-w-[210px] z-50 py-1.5"
                  >
                    {isLoggedIn ? (
                      <div className="p-3 border-b border-gray-100 dark:border-white/10 bg-amber-50/40 dark:bg-white/5">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Signed in as</p>
                        <p className="font-bold text-brand-charcoal dark:text-white truncate text-sm">{customerName || 'Customer'}</p>
                      </div>
                    ) : (
                      <div className="p-3 border-b border-gray-100 dark:border-white/10">
                        <button
                          onClick={() => {
                            setIsAuthModalOpen(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-brand-orange to-brand-saffron text-white font-bold text-xs hover:shadow-md transition text-center"
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
                      className="w-full px-4 py-2.5 text-left text-brand-charcoal dark:text-gray-200 hover:bg-orange-50/50 dark:hover:bg-white/5 flex items-center gap-2.5 text-xs font-bold"
                    >
                      <ShoppingCart className="w-4 h-4 text-brand-orange" />
                      <span>View Bag & Orders</span>
                    </button>

                    {isLoggedIn && (
                      <button
                        onClick={() => {
                          onLogout?.();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border-t border-gray-100 dark:border-white/10 flex items-center gap-2.5 text-xs font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Shopping Bag Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 text-white font-black text-sm shadow-lg shadow-brand-orange/25 hover:shadow-xl transition-all"
              aria-label="Open Cart"
            >
              <motion.div animate={cartPulse ? { scale: [1, 1.35, 1], rotate: [0, -10, 10, 0] } : {}} transition={{ duration: 0.35 }}>
                <ShoppingCart className="w-4 h-4" />
              </motion.div>
              <span className="hidden lg:inline">{t('yourCart') || "Bag"}</span>
              {cartCount > 0 ? (
                <span className="bg-white text-brand-orange text-xs font-black px-1.5 py-0.5 rounded-full min-w-[1.2rem] h-[1.2rem] flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              ) : null}
            </motion.button>
          </div>

          {/* Mobile Right Controls */}
          <div className="md:hidden flex items-center gap-1.5">
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 rounded-lg text-xs font-black text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10"
              aria-label="Language switch"
            >
              {language === 'en' ? 'عربي' : 'EN'}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300"
              aria-label="Theme switch"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl bg-brand-orange/10 text-brand-orange dark:text-amber-400"
              aria-label="Open Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-brand-charcoal dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Field */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder') || "Search fresh paneer, spices, ghee..."}
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-gray-100/90 dark:bg-slate-900/90 text-brand-charcoal dark:text-white border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className={`absolute top-2.5 text-gray-400 ${language === 'ar' ? 'right-3' : 'left-3'}`}>
              <Search className="w-4 h-4" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-2 p-0.5 text-gray-400 ${language === 'ar' ? 'left-3' : 'right-3'}`}
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="md:hidden fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-900 z-[70] shadow-2xl border-l border-gray-200 dark:border-white/10 flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🧀</span>
                    <span className="font-display font-black text-lg text-brand-orange">Pandit Ji</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 font-bold text-sm">
                  <button
                    className="text-left px-4 py-3 rounded-xl hover:bg-orange-50 dark:hover:bg-white/5 text-brand-charcoal dark:text-white transition"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t('home')}
                  </button>
                  <a
                    href="#products"
                    className="px-4 py-3 rounded-xl hover:bg-orange-50 dark:hover:bg-white/5 text-brand-charcoal dark:text-white transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('allProducts') || "All Products"}
                  </a>
                  <a
                    href="#our-store"
                    className="px-4 py-3 rounded-xl hover:bg-orange-50 dark:hover:bg-white/5 text-brand-charcoal dark:text-white transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('about') || "Our Abu Dhabi Store"}
                  </a>
                  <a
                    href="#contact"
                    className="px-4 py-3 rounded-xl hover:bg-orange-50 dark:hover:bg-white/5 text-brand-charcoal dark:text-white transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('contact') || "Contact & Support"}
                  </a>

                  {isAdmin && (
                    <button
                      className="text-left px-4 py-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-2"
                      onClick={() => {
                        setIsAdminDashboardOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Settings2 className="w-4 h-4" /> Admin Portal
                    </button>
                  )}
                </div>

                <a
                  href="https://wa.me/971524676306?text=Hello%20Pandit%20Ji%20Paneer%20Wale%2C%20I%20would%20like%20to%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/25"
                >
                  <MessageCircle className="w-5 h-5" /> Order on WhatsApp
                </a>
              </div>

              <div className="p-5 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                {isLoggedIn ? (
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                    <p className="font-bold text-sm text-brand-charcoal dark:text-white truncate mb-3">{customerName || 'Customer'}</p>
                    <button
                      onClick={() => {
                        onLogout?.();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-2 px-3 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg"
                  >
                    <User className="w-4 h-4" /> Sign In / Register
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
