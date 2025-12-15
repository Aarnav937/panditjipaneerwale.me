import React from 'react';
import { X, Clock, RotateCcw, ShoppingBag, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderHistory = ({ isOpen, onClose, onReorder }) => {
    const [orders, setOrders] = React.useState([]);

    // Load orders from localStorage when modal opens
    React.useEffect(() => {
        if (isOpen) {
            const savedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
            setOrders(savedOrders);
        }
    }, [isOpen]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-AE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleReorder = (order) => {
        if (onReorder) {
            onReorder(order.items);
        }
        onClose();
    };

    const clearHistory = () => {
        if (window.confirm('Are you sure you want to clear your order history?')) {
            localStorage.setItem('orderHistory', '[]');
            setOrders([]);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-white dark:bg-gray-900 z-50 shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800"
                    >
                        {/* Header */}
                        <div className="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="bg-brand-orange/10 p-2 rounded-full">
                                    <Package className="text-brand-orange w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order History</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{orders.length} orders</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Orders List */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {orders.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                        <Package className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h3>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                            Your order history will appear here after you place your first order.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <motion.div
                                            key={order.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                                        >
                                            {/* Order Header */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {formatDate(order.date)}
                                                    </p>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                                        AED {order.total}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleReorder(order)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-full text-sm font-bold hover:bg-brand-dark transition-colors shadow-lg shadow-orange-500/20"
                                                >
                                                    <RotateCcw size={14} />
                                                    Reorder
                                                </button>
                                            </div>

                                            {/* Order Items */}
                                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                                {order.items.slice(0, 3).map((item, idx) => (
                                                    <p key={idx} className="flex justify-between">
                                                        <span className="truncate flex-1 mr-2">{item.name}</span>
                                                        <span className="text-gray-500">x{item.quantity}</span>
                                                    </p>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <p className="text-gray-400 text-xs">+{order.items.length - 3} more items</p>
                                                )}
                                            </div>

                                            {/* Delivery Info */}
                                            {order.timeSlot && (
                                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Delivery: {order.timeSlot}
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {orders.length > 0 && (
                            <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={clearHistory}
                                    className="w-full py-3 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                                >
                                    Clear Order History
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OrderHistory;
