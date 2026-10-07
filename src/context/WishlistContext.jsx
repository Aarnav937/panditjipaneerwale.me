import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const WishlistContext = createContext({});

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState(() => {
        // Load from localStorage initially
        const saved = localStorage.getItem('wishlist');
        return saved ? JSON.parse(saved) : [];
    });
    const [loading] = useState(false);

    // Sync with localStorage
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    // Sync with Supabase if available
    const syncWithSupabase = useCallback(async () => {
        const phone = localStorage.getItem('customerPhone');
        if (!phone || !user?.id || !supabase) return;

        try {
            const { data, error } = await supabase
                .from('wishlists')
                .select('product_id')
                .eq('owner_id', user.id);

            if (error && error.code !== 'PGRST116') throw error;

            if (data && data.length > 0) {
                setWishlist(data.map(w => w.product_id));
            }
        } catch (error) {
            console.warn('Wishlist sync failed:', error);
        }
    }, [user?.id]);

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
        if (phone && user?.id && supabase) {
            try {
                await supabase
                    .from('wishlists')
                    .insert([{ customer_phone: phone, product_id: productId, owner_id: user.id }]);
            } catch (error) {
                console.warn('Wishlist add failed:', error);
            }
        }
    }, [wishlist, user?.id]);

    // Remove from wishlist
    const removeFromWishlist = useCallback(async (productId) => {
        setWishlist(prev => prev.filter(id => id !== productId));

        // Sync with Supabase
        const phone = localStorage.getItem('customerPhone');
        if (phone && user?.id && supabase) {
            try {
                await supabase
                    .from('wishlists')
                    .delete()
                    .eq('owner_id', user.id)
                    .eq('product_id', productId);
            } catch (error) {
                console.warn('Wishlist remove failed:', error);
            }
        }
    }, [user?.id]);

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
        if (phone && user?.id && supabase) {
            try {
                await supabase
                    .from('wishlists')
                    .delete()
                    .eq('owner_id', user.id);
            } catch (error) {
                console.warn('Wishlist clear failed:', error);
            }
        }
    }, [user?.id]);

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
