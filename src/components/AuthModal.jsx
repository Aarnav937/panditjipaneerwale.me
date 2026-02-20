import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowRight, Loader2, CheckCircle, Sparkles, ShieldCheck, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState('email'); // email, otp, success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(new Array(8).fill('')); // Increased to 8 for safety
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(0);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep('email');
                setEmail('');
                setOtp(new Array(8).fill(''));
                setError(null);
            }, 300);
        }
    }, [isOpen]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Send OTP to email
    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!email.trim() || !email.includes('@')) {
            setError('Please enter a valid email');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (supabase) {
                const { error } = await supabase.auth.signInWithOtp({
                    email: email.trim(),
                    options: {
                        shouldCreateUser: true,
                    }
                });

                if (error) throw error;
            }

            setStep('otp');
            setCountdown(60);
        } catch (err) {
            console.error('OTP send error:', err);
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP
    const handleVerifyOTP = async () => {
        const otpValue = otp.join('');
        if (otpValue.length < 6) { // Allow 6 to 8 length
            setError('Please enter the complete code');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (supabase) {
                const { data, error } = await supabase.auth.verifyOtp({
                    email: email.trim(),
                    token: otpValue,
                    type: 'email'
                });

                if (error) throw error;

                // Store user info
                localStorage.setItem('userEmail', email);
                localStorage.setItem('isLoggedIn', 'true');
            } else {
                // Demo mode verification
            }

            setStep('success');
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 2000);
        } catch (err) {
            console.error('OTP verify error:', err);
            setError(err.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP input
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        // Handle Paste
        if (value.length > 1) {
            const pastedData = value.split('').slice(0, 8); // Take max 8
            const newOtp = [...otp];
            pastedData.forEach((char, i) => {
                if (index + i < 8) newOtp[index + i] = char;
            });
            setOtp(newOtp);

            // Focus last filled or next empty
            const nextIndex = Math.min(index + pastedData.length, 7);
            document.getElementById(`otp-${nextIndex}`)?.focus();

            // Auto-verify if full
            if (newOtp.join('').length >= 6) {
                // Optional: auto trigger verify
            }
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 7) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    // Handle backspace
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    // Resend OTP
    const handleResend = () => {
        if (countdown > 0) return;
        handleSendOTP({ preventDefault: () => { } });
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
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-md bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl shadow-2xl border border-gray-800 overflow-hidden">
                            {/* Decorative gradient */}
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-orange-500/20 via-red-500/10 to-transparent" />

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700 transition-all z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="relative p-8">
                                {/* Email Step */}
                                <AnimatePresence mode="wait">
                                    {step === 'email' && (
                                        <motion.div
                                            key="email"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                        >
                                            {/* Icon */}
                                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                                <Mail className="w-10 h-10 text-white" />
                                            </div>

                                            <h2 className="text-2xl font-bold text-white text-center mb-2">
                                                Welcome Back! 👋
                                            </h2>
                                            <p className="text-gray-400 text-center mb-8">
                                                Enter your email to receive a magic code
                                            </p>

                                            <form onSubmit={handleSendOTP} className="space-y-4">
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="your@email.com"
                                                        className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                                        autoFocus
                                                    />
                                                </div>

                                                {error && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-red-400 text-sm text-center"
                                                    >
                                                        {error}
                                                    </motion.p>
                                                )}

                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50"
                                                >
                                                    {loading ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <>
                                                            Send Magic Code
                                                            <ArrowRight className="w-5 h-5" />
                                                        </>
                                                    )}
                                                </button>
                                            </form>

                                            <p className="text-gray-500 text-xs text-center mt-6">
                                                We'll send a 6-digit code to your email
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* OTP Step */}
                                    {step === 'otp' && (
                                        <motion.div
                                            key="otp"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                        >
                                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                                <ShieldCheck className="w-10 h-10 text-white" />
                                            </div>

                                            <h2 className="text-2xl font-bold text-white text-center mb-2">
                                                Check Your Email 📧
                                            </h2>
                                            <p className="text-gray-400 text-center mb-2">
                                                We sent a code to
                                            </p>
                                            <p className="text-orange-400 font-medium text-center mb-8">
                                                {email}
                                            </p>

                                            {/* OTP Inputs */}
                                            <div className="flex justify-center gap-2 mb-6">
                                                {otp.map((digit, index) => (
                                                    <input
                                                        key={index}
                                                        id={`otp-${index}`}
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={1}
                                                        value={digit}
                                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                                        className="w-12 h-14 text-center text-xl font-bold bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                                                        autoFocus={index === 0}
                                                    />
                                                ))}
                                            </div>

                                            {error && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-red-400 text-sm text-center mb-4"
                                                >
                                                    {error}
                                                </motion.p>
                                            )}

                                            <button
                                                onClick={handleVerifyOTP}
                                                disabled={loading || otp.join('').length < 6}
                                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50"
                                            >
                                                {loading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        Verify Code
                                                        <ArrowRight className="w-5 h-5" />
                                                    </>
                                                )}
                                            </button>

                                            <div className="text-center mt-6">
                                                <p className="text-gray-500 text-sm">
                                                    Didn't receive the code?{' '}
                                                    <button
                                                        onClick={handleResend}
                                                        disabled={countdown > 0}
                                                        className={`font-medium ${countdown > 0 ? 'text-gray-600' : 'text-orange-400 hover:text-orange-300'}`}
                                                    >
                                                        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
                                                    </button>
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Success Step */}
                                    {step === 'success' && (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            <div className="text-center py-8">
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', delay: 0.2 }}
                                                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
                                                >
                                                    <CheckCircle className="w-12 h-12 text-white" />
                                                </motion.div>

                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    <h2 className="text-2xl font-bold text-white mb-2">
                                                        Welcome! 🎉
                                                    </h2>
                                                    <p className="text-gray-400">
                                                        You're now logged in
                                                    </p>
                                                    <div className="flex items-center justify-center gap-2 mt-4 text-green-400">
                                                        <Sparkles className="w-5 h-5" />
                                                        <span>Enjoy shopping!</span>
                                                        <Sparkles className="w-5 h-5" />
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
