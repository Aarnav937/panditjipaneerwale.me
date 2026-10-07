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

    // A typed phone is a delivery contact, not proof of account ownership.
    const loginAsGuest = async (phone, name, address) => {
        // Always save to localStorage first
        localStorage.setItem('customerPhone', phone);
        localStorage.setItem('customerName', name);
        localStorage.setItem('customerAddress', address);

        setCustomer({ phone, name, address });
        return { success: true };
    };

    // Restore customer from localStorage
    useEffect(() => {
        const savedPhone = localStorage.getItem('customerPhone');
        const savedName = localStorage.getItem('customerName');
        const savedAddress = localStorage.getItem('customerAddress');

        if (savedPhone && !customer) {
            // Set from localStorage immediately
            setCustomer({ phone: savedPhone, name: savedName || '', address: savedAddress || '' });

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
    const placeOrder = async (cartItems, total, notes = '', details = {}, requestId = crypto.randomUUID()) => {
        const orderData = {
            request_id: requestId,
            customer_phone: details.phone ?? customer?.phone ?? localStorage.getItem('customerPhone') ?? '',
            customer_name: details.name ?? customer?.name ?? localStorage.getItem('customerName') ?? 'Customer',
            customer_address: details.address ?? customer?.address ?? localStorage.getItem('customerAddress') ?? '',
            items: cartItems.map(({ id, quantity }) => ({ id, quantity })),
            total: total,
            notes: notes
        };

        // A WhatsApp message alone is not a persisted order receipt.
        if (!supabase) {
            return { success: false, error: 'Online ordering is temporarily unavailable. Please contact the store on WhatsApp.' };
        }

        try {
            const { data, error } = await db.orders.create(orderData);
            if (error) throw error;
            if (!data?.id) throw new Error('We could not confirm that your order was saved. Please retry.');
            return { success: true, order: data };
        } catch (error) {
            return { success: false, error: error.message || 'We could not save your order. Please try again.' };
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
        isLoggedIn: !!customer || !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
