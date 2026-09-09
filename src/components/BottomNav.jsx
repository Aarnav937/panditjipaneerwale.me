import React, { useState } from 'react';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = ({ cartCount, onCartClick, onProfileClick, isLoggedIn }) => {
  const [active, setActive] = useState('Home');

  const scrollToTop = () => {
    setActive('Home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToProducts = () => {
    setActive('Shop');
    const productsSection = document.getElementById('products');
    if (productsSection) {
      const offset = 80;
      const elementPosition = productsSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', action: scrollToTop },
    { icon: ShoppingBag, label: 'Shop', action: scrollToProducts },
    {
      icon: ShoppingCart,
      label: 'Cart',
      action: () => { setActive('Cart'); onCartClick(); },
      badge: cartCount,
    },
    {
      icon: User,
      label: isLoggedIn ? 'Profile' : 'Login',
      action: () => { setActive(isLoggedIn ? 'Profile' : 'Login'); onProfileClick(); },
    },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 260 }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-white/10 shadow-2xl safe-area-bottom"
    >
      <div className="flex justify-around items-center py-1.5 px-2">
        {navItems.map((item) => {
          const isActive = active === item.label || (item.label === 'Login' && active === 'Profile');
          return (
            <motion.button
              key={item.label}
              type="button"
              onClick={item.action}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[64px] min-h-[48px] relative rounded-2xl transition-colors"
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-active-pill"
                  className="absolute inset-0 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
              <div className="relative z-10">
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-brand-orange dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {item.badge > 0 && (
                  <motion.span
                    key={item.badge}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2.5 bg-gradient-to-r from-brand-orange to-red-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-sm"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.span>
                )}
              </div>
              <span
                className={`relative z-10 text-[10px] font-bold transition-colors ${
                  isActive ? 'text-brand-orange dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
