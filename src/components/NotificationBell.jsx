import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, Package, Tag, ShoppingCart, AlertCircle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

    const getIcon = (type) => {
        switch (type) {
            case 'stock_alert': return <Package className="w-4 h-4 text-green-400" />;
            case 'order_update': return <ShoppingCart className="w-4 h-4 text-blue-400" />;
            case 'promo': return <Tag className="w-4 h-4 text-purple-400" />;
            default: return <AlertCircle className="w-4 h-4 text-orange-400" />;
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
                                    >
                                        <Check className="w-4 h-4" /> Mark all read
                                    </button>
                                )}
                            </div>

                            {/* List */}
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="py-8 text-center text-gray-500">
                                        <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                        <p>No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notification.read ? 'bg-orange-50 dark:bg-orange-900/10' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                        {notification.title || notification.message}
                                                    </p>
                                                    {notification.title && notification.message && (
                                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                                            {notification.message}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatTime(notification.created_at)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="p-1 text-gray-400 hover:text-green-500"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="p-1 text-gray-400 hover:text-red-500"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
