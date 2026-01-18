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
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    // Try to get customer data
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

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event);
                if (session?.user) {
                    setUser(session.user);
                } else {
                    setUser(null);
                    setCustomer(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Guest login with phone (no OTP, just stores locally)
    const loginAsGuest = async (phone, name, address) => {
        try {
            // Check if customer exists
            let { data: existingCustomer } = await db.customers.getByPhone(phone);

            if (existingCustomer) {
                // Update existing customer
                const { data, error } = await db.customers.update(existingCustomer.id, {
                    name: name || existingCustomer.name,
                    address: address || existingCustomer.address,
                    updated_at: new Date().toISOString()
                });
                if (error) throw error;
                setCustomer(data);
            } else {
                // Create new customer
                const { data, error } = await db.customers.create({
                    phone,
                    name,
                    address
                });
                if (error) throw error;
                setCustomer(data);
            }

            // Store in localStorage for persistence
            localStorage.setItem('customerPhone', phone);
            return { success: true };
        } catch (error) {
            console.error('Guest login error:', error);
            return { success: false, error: error.message };
        }
    };

    // Restore customer from localStorage
    useEffect(() => {
        const restoreCustomer = async () => {
            const savedPhone = localStorage.getItem('customerPhone');
            if (savedPhone && !customer) {
                try {
                    const { data } = await db.customers.getByPhone(savedPhone);
                    if (data) setCustomer(data);
                } catch (error) {
                    console.error('Restore customer error:', error);
                }
            }
        };
        restoreCustomer();
    }, [customer]);

    // Logout
    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setCustomer(null);
        localStorage.removeItem('customerPhone');
    };

    // Place order
    const placeOrder = async (cartItems, total, notes = '') => {
        try {
            const orderData = {
                customer_id: customer?.id || null,
                customer_phone: customer?.phone || localStorage.getItem('customerPhone') || 'guest',
                customer_name: customer?.name || 'Guest',
                customer_address: customer?.address || '',
                items: cartItems,
                total: total,
                status: 'pending',
                notes: notes
            };

            const { data, error } = await db.orders.create(orderData);
            if (error) throw error;

            return { success: true, order: data };
        } catch (error) {
            console.error('Place order error:', error);
            return { success: false, error: error.message };
        }
    };

    // Get order history
    const getOrderHistory = async () => {
        try {
            const phone = customer?.phone || localStorage.getItem('customerPhone');
            if (!phone) return { orders: [] };

            const { data, error } = await db.orders.getByPhone(phone);
            if (error) throw error;

            return { orders: data || [] };
        } catch (error) {
            console.error('Get orders error:', error);
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
