import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Undo2 } from 'lucide-react';

const Toast = ({ show, message, onClose, onUndo, duration = 3000 }) => {
    useEffect(() => {
        if (show && duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
                >
                    <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700 dark:border-gray-200">
                        {/* Success Icon with pulse animation */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
                            className="flex-shrink-0"
                        >
                            <div className="bg-green-500 p-1.5 rounded-full">
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                        </motion.div>

                        {/* Message */}
                        <span className="flex-1 font-medium text-sm">{message}</span>

                        {/* Undo Button */}
                        {onUndo && (
                            <button
                                onClick={() => {
                                    onUndo();
                                    onClose();
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-brand-orange hover:bg-brand-dark text-white text-xs font-bold rounded-full transition-colors"
                            >
                                <Undo2 size={12} />
                                Undo
                            </button>
                        )}

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-700 dark:hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
