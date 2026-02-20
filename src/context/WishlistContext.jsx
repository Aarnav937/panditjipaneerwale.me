import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

const WishlistContext = createContext({});

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(() => {
        // Load from localStorage initially
        const saved = localStorage.getItem('wishlist');
        return saved ? JSON.parse(saved) : [];
    });
    const [loading, setLoading] = useState(false);

    // Sync with localStorage
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    // Sync with Supabase if available
    const syncWithSupabase = useCallback(async () => {
        const phone = localStorage.getItem('customerPhone');
        if (!phone || !supabase) return;

        try {
            const { data, error } = await supabase
                .from('wishlists')
                .select('product_id')
                .eq('customer_phone', phone);

            if (error && error.code !== 'PGRST116') throw error;

            if (data && data.length > 0) {
                setWishlist(data.map(w => w.product_id));
            }
        } catch (error) {
            console.warn('Wishlist sync failed:', error);
        }
    }, []);

    useEffect(() => {
        syncWithSupabase();
    }, [syncWithSupabase]);

    // Check if product is in wishlist
    const isInWishlist = useCallback((productId) => {
        return wishlist.includes(productId);
    }, [wishlist]);

    // Add to wishlist
    const addToWishlist = useCallback(async (productId) => {
        if (wishlist.includes(productId)) return;

        setWishlist(prev => [...prev, productId]);

        // Sync with Supabase
        const phone = localStorage.getItem('customerPhone');
        if (phone && supabase) {
            try {
                await supabase
                    .from('wishlists')
                    .insert([{ customer_phone: phone, product_id: productId }]);
            } catch (error) {
                console.warn('Wishlist add failed:', error);
            }
        }
    }, [wishlist]);

    // Remove from wishlist
    const removeFromWishlist = useCallback(async (productId) => {
        setWishlist(prev => prev.filter(id => id !== productId));

        // Sync with Supabase
        const phone = localStorage.getItem('customerPhone');
        if (phone && supabase) {
            try {
                await supabase
                    .from('wishlists')
                    .delete()
                    .eq('customer_phone', phone)
                    .eq('product_id', productId);
            } catch (error) {
                console.warn('Wishlist remove failed:', error);
            }
        }
    }, []);

    // Toggle wishlist
    const toggleWishlist = useCallback(async (productId) => {
        if (isInWishlist(productId)) {
            await removeFromWishlist(productId);
        } else {
            await addToWishlist(productId);
        }
    }, [isInWishlist, addToWishlist, removeFromWishlist]);

    // Clear wishlist
    const clearWishlist = useCallback(async () => {
        setWishlist([]);

        const phone = localStorage.getItem('customerPhone');
        if (phone && supabase) {
            try {
                await supabase
                    .from('wishlists')
                    .delete()
                    .eq('customer_phone', phone);
            } catch (error) {
                console.warn('Wishlist clear failed:', error);
            }
        }
    }, []);

    const value = {
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        loading
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

export default WishlistContext;
