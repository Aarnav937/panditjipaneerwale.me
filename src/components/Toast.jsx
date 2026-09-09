import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Undo2 } from 'lucide-react';

const Toast = ({ show, message, onClose, onUndo, duration = 3200 }) => {
    useEffect(() => {
        if (show && duration) {
            const timer = setTimeout(() => { onClose(); }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 48, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.96 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 340 }}
                    className="fixed bottom-[7.5rem] md:bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md"
                >
                    <div className="bg-brand-forestDeep text-white ps-3 pe-2 py-2.5 rounded-2xl shadow-soft-hover flex items-center gap-3 border border-brand-gold/30">
                        <span className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </span>
                        <span className="flex-1 font-semibold text-sm leading-snug">{message}</span>
                        {onUndo && (
                            <button
                                onClick={() => { onUndo(); onClose(); }}
                                className="flex items-center gap-1 px-3.5 py-2 bg-brand-gold text-brand-forestDeep text-xs font-extrabold rounded-xl hover:brightness-105 transition shrink-0"
                            >
                                <Undo2 size={13} /> Undo
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors shrink-0" aria-label="Dismiss">
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
