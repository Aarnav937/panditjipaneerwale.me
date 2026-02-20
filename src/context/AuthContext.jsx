import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, db } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(false);

    // Check for existing session on mount - ONLY if supabase exists
    useEffect(() => {
        // Skip if no supabase client
        if (!supabase) {
            setLoading(false);
            return;
        }

        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    const phone = session.user.phone;
                    if (phone) {
                        const { data } = await db.customers.getByPhone(phone);
                        if (data) setCustomer(data);
                    }
                }
            } catch (error) {
                console.error('Session check error:', error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes - only if supabase exists
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    setUser(session.user);
                } else {
                    setUser(null);
                    setCustomer(null);
                }
            }
        );

        return () => subscription?.unsubscribe();
    }, []);

    // Guest login with phone (stores in localStorage, tries Supabase if available)
    const loginAsGuest = async (phone, name, address) => {
        // Always save to localStorage first
        localStorage.setItem('customerPhone', phone);
        localStorage.setItem('customerName', name);
        localStorage.setItem('customerAddress', address);

        // If no supabase, just return success
        if (!supabase) {
            setCustomer({ phone, name, address });
            return { success: true };
        }

        try {
            let { data: existingCustomer } = await db.customers.getByPhone(phone);

            if (existingCustomer) {
                const { data, error } = await db.customers.update(existingCustomer.id, {
                    name: name || existingCustomer.name,
                    address: address || existingCustomer.address,
                    updated_at: new Date().toISOString()
                });
                if (!error && data) setCustomer(data);
            } else {
                const { data, error } = await db.customers.create({ phone, name, address });
                if (!error && data) setCustomer(data);
            }
            return { success: true };
        } catch (error) {
            console.warn('Supabase save failed:', error);
            // Still return success since localStorage works
            return { success: true };
        }
    };

    // Restore customer from localStorage
    useEffect(() => {
        const savedPhone = localStorage.getItem('customerPhone');
        const savedName = localStorage.getItem('customerName');
        const savedAddress = localStorage.getItem('customerAddress');

        if (savedPhone && !customer) {
            // Set from localStorage immediately
            setCustomer({ phone: savedPhone, name: savedName || '', address: savedAddress || '' });

            // Try to get from Supabase if available
            if (supabase) {
                db.customers.getByPhone(savedPhone).then(({ data }) => {
                    if (data) setCustomer(data);
                }).catch(() => { });
            }
        }
    }, []);

    // Logout
    const logout = async () => {
        if (supabase) {
            try {
                await supabase.auth.signOut();
            } catch (e) { }
        }
        setUser(null);
        setCustomer(null);
        localStorage.removeItem('customerPhone');
        localStorage.removeItem('customerName');
        localStorage.removeItem('customerAddress');
    };

    // Place order
    const placeOrder = async (cartItems, total, notes = '') => {
        const orderData = {
            customer_id: customer?.id || null,
            customer_phone: customer?.phone || localStorage.getItem('customerPhone') || 'guest',
            customer_name: customer?.name || localStorage.getItem('customerName') || 'Guest',
            customer_address: customer?.address || localStorage.getItem('customerAddress') || '',
            items: cartItems,
            total: total,
            status: 'pending',
            notes: notes
        };

        // If no supabase, just return success (order goes via WhatsApp anyway)
        if (!supabase) {
            return { success: true, order: orderData };
        }

        try {
            const { data, error } = await db.orders.create(orderData);
            if (error) throw error;
            return { success: true, order: data };
        } catch (error) {
            console.warn('Supabase order save failed:', error);
            return { success: true, order: orderData }; // Still success for WhatsApp
        }
    };

    // Get order history
    const getOrderHistory = async () => {
        const phone = customer?.phone || localStorage.getItem('customerPhone');
        if (!phone || !supabase) return { orders: [] };

        try {
            const { data, error } = await db.orders.getByPhone(phone);
            if (error) throw error;
            return { orders: data || [] };
        } catch (error) {
            return { orders: [] };
        }
    };

    const value = {
        user,
        customer,
        loading,
        loginAsGuest,
        logout,
        placeOrder,
        getOrderHistory,
        isLoggedIn: !!customer
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
