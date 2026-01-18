import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminContext = createContext({});

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || 'papakiwebsite';
const ADMIN_SESSION_KEY = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminExpiry, setAdminExpiry] = useState(null);

    // Check for existing admin session on mount
    useEffect(() => {
        const session = localStorage.getItem(ADMIN_SESSION_KEY);
        if (session) {
            try {
                const { expiry } = JSON.parse(session);
                if (expiry && new Date(expiry) > new Date()) {
                    setIsAdmin(true);
                    setAdminExpiry(new Date(expiry));
                } else {
                    // Session expired
                    localStorage.removeItem(ADMIN_SESSION_KEY);
                }
            } catch (e) {
                localStorage.removeItem(ADMIN_SESSION_KEY);
            }
        }
    }, []);

    // Check if text contains admin secret code
    const checkAdminCode = useCallback((text) => {
        if (!text) return false;

        const normalizedText = text.toLowerCase().trim();
        const normalizedSecret = ADMIN_SECRET.toLowerCase().trim();

        if (normalizedText.includes(normalizedSecret)) {
            const expiry = new Date(Date.now() + SESSION_DURATION);
            localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ expiry: expiry.toISOString() }));
            setIsAdmin(true);
            setAdminExpiry(expiry);
            console.log('🔓 Admin access granted!');
            return true;
        }
        return false;
    }, []);

    // Logout admin
    const logoutAdmin = useCallback(() => {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        setIsAdmin(false);
        setAdminExpiry(null);
        console.log('🔒 Admin logged out');
    }, []);

    // Get remaining session time
    const getSessionTimeRemaining = useCallback(() => {
        if (!adminExpiry) return null;
        const remaining = adminExpiry - new Date();
        if (remaining <= 0) {
            logoutAdmin();
            return null;
        }
        return Math.floor(remaining / 1000 / 60); // minutes
    }, [adminExpiry, logoutAdmin]);

    const value = {
        isAdmin,
        checkAdminCode,
        logoutAdmin,
        getSessionTimeRemaining,
        adminExpiry
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

export default AdminContext;
