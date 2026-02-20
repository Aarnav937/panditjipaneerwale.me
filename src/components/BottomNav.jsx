import React from 'react';
import { Home, ShoppingBag, ShoppingCart, Package, User } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = ({ cartCount, onCartClick, onOrderHistoryClick, onProfileClick, isLoggedIn }) => {
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
        { icon: ShoppingBag, label: 'Products', action: scrollToProducts },
        { icon: ShoppingCart, label: 'Cart', action: onCartClick, badge: cartCount },
        { icon: Package, label: 'Orders', action: onOrderHistoryClick },
        { icon: User, label: isLoggedIn ? 'Profile' : 'Login', action: onProfileClick },
    ];

    return (
        <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-bottom"
        >
            <div className="flex justify-around items-center py-2 px-4">
                {navItems.map((item, index) => (
                    <button
                        key={item.label}
                        onClick={item.action}
                        className="flex flex-col items-center gap-0.5 p-2 min-w-[60px] group relative"
                    >
                        <div className="relative">
                            <item.icon
                                className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-brand-orange group-active:scale-90 transition-all"
                            />
                            {/* Badge for cart count */}
                            {item.badge > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 bg-brand-orange text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                                >
                                    {item.badge > 99 ? '99+' : item.badge}
                                </motion.span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 group-hover:text-brand-orange transition-colors">
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </motion.nav>
    );
};

export default BottomNav;
