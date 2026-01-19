import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Users, Bell, Settings, BarChart3, LogOut, Clock, Box, AlertTriangle, Star } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import ProductManager from './ProductManager';
import InventoryManager from './InventoryManager';
import CustomerDatabase from './CustomerDatabase';
import NotificationManager from './NotificationManager';
import AnalyticsDashboard from './AnalyticsDashboard';
import ReviewModerator from './ReviewModerator';

const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Box },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
];

const AdminDashboard = ({ isOpen, onClose }) => {
    const { isAdmin, logoutAdmin, getSessionTimeRemaining } = useAdmin();
    const [activeTab, setActiveTab] = useState('analytics');
    const [sessionTime, setSessionTime] = useState(null);

    // Update session time every minute
    useEffect(() => {
        if (isAdmin && isOpen) {
            const updateTime = () => setSessionTime(getSessionTimeRemaining());
            updateTime();
            const interval = setInterval(updateTime, 60000);
            return () => clearInterval(interval);
        }
    }, [isAdmin, isOpen, getSessionTimeRemaining]);

    if (!isAdmin) return null;

    const handleLogout = () => {
        logoutAdmin();
        onClose();
    };

    const formatTime = (minutes) => {
        if (!minutes) return '';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'analytics':
                return <AnalyticsDashboard />;
            case 'products':
                return <ProductManager />;
            case 'inventory':
                return <InventoryManager />;
            case 'reviews':
                return <ReviewModerator />;
            case 'customers':
                return <CustomerDatabase />;
            case 'notifications':
                return <NotificationManager />;
            default:
                return <AnalyticsDashboard />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Dashboard Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full md:w-[900px] bg-gray-900 text-white z-50 flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg">Admin Dashboard</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        <span>Session: {formatTime(sessionTime)} remaining</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 p-2 bg-gray-800 border-b border-gray-700 overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-orange-600 text-white'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {renderContent()}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AdminDashboard;
