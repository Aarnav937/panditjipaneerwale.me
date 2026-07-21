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
                    initial={{ opacity: 0, y: 60, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 18, stiffness: 340 }}
                    className="fixed bottom-36 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
                >
                    <div className="bg-gradient-to-r from-brand-charcoal via-[#2a1810] to-brand-charcoal dark:from-white dark:to-amber-50 text-white dark:text-brand-charcoal px-4 py-3.5 rounded-2xl shadow-lg shadow-brand-orange/25 flex items-center gap-3 border border-brand-gold/40">
                        <motion.div
                            initial={{ scale: 0, rotate: -40 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.05, type: 'spring', stiffness: 420 }}
                            className="flex-shrink-0"
                        >
                            <div className="bg-gradient-to-br from-green-400 to-green-600 p-1.5 rounded-full shadow">
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                        </motion.div>

                        <span className="flex-1 font-semibold text-sm">{message}</span>

                        {onUndo && (
                            <button
                                onClick={() => {
                                    onUndo();
                                    onClose();
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-brand-orange to-brand-saffron hover:brightness-110 text-white text-xs font-bold rounded-full transition shadow"
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
