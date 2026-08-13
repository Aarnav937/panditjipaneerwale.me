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
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-brand-darker border-t border-brand-gold/20 dark:border-gray-800 shadow-bar safe-area-bottom"
        >
            <div className="flex justify-around items-center py-1.5 px-1">
                {navItems.map((item) => {
                    const isActive = active === item.label || (item.label === 'Login' && active === 'Profile');
                    return (
                        <motion.button
                            key={item.label}
                            type="button"
                            onClick={item.action}
                            whileTap={{ scale: 0.88 }}
                            className="flex flex-col items-center gap-0.5 p-2 min-w-[64px] min-h-[48px] relative"
                        >
                            {isActive && (
                                <motion.span
                                    layoutId="nav-pill"
                                    className="absolute inset-1 rounded-2xl bg-gradient-to-b from-brand-orange/15 to-brand-saffron/10"
                                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                                />
                            )}
                            <div className="relative z-10">
                                <item.icon
                                    className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-orange' : 'text-brand-muted'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {item.badge > 0 && (
                                    <motion.span
                                        key={item.badge}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1.5 -right-2 bg-gradient-to-br from-brand-orange to-brand-saffron text-white text-[9px] font-extrabold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow"
                                    >
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </motion.span>
                                )}
                            </div>
                            <span className={`relative z-10 text-[10px] font-semibold transition-colors ${isActive ? 'text-brand-orange' : 'text-brand-muted'}`}>
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
