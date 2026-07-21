import React from 'react';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = ({ cartCount, onCartClick, onProfileClick, isLoggedIn }) => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToProducts = () => {
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
        { icon: ShoppingCart, label: 'Cart', action: onCartClick, badge: cartCount },
        { icon: User, label: isLoggedIn ? 'Profile' : 'Login', action: onProfileClick },
    ];

    return (
        <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-brand-darker/95 backdrop-blur-lg border-t border-brand-border dark:border-gray-800 shadow-bar safe-area-bottom"
        >
            <div className="flex justify-around items-center py-1.5 px-2">
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={item.action}
                        className="flex flex-col items-center gap-0.5 p-2 min-w-[64px] group relative"
                    >
                        <div className="relative">
                            <item.icon
                                className="w-5 h-5 text-brand-muted group-hover:text-brand-orange group-active:scale-90 transition-all"
                            />
                            {item.badge > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1.5 -right-2 bg-brand-orange text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
                                >
                                    {item.badge > 99 ? '99+' : item.badge}
                                </motion.span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium text-brand-muted group-hover:text-brand-orange transition-colors">
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </motion.nav>
    );
};

export default BottomNav;
