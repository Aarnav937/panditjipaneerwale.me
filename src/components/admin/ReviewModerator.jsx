import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2, Star, Search, User, MessageSquare, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ReviewModerator = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, approved, all
    const [message, setMessage] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    // Load reviews
    const loadReviews = useCallback(async () => {
        setLoading(true);
        try {
            if (supabase) {
                let query = supabase
                    .from('reviews')
                    .select('*, products(name)')
                    .order('created_at', { ascending: false });

                if (filter === 'pending') {
                    query = query.eq('is_approved', false);
                } else if (filter === 'approved') {
                    query = query.eq('is_approved', true);
                }

                const { data, error } = await query;
                if (error) throw error;
                setReviews(data || []);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            showMessage('Error loading reviews', 'error');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    // Approve review
    const handleApprove = async (reviewId) => {
        setActionLoading(reviewId);
        try {
            if (supabase) {
                const { error } = await supabase
                    .from('reviews')
                    .update({ is_approved: true })
                    .eq('id', reviewId);

                if (error) throw error;
                showMessage('Review approved!');
                loadReviews();
            }
        } catch (error) {
            showMessage('Error approving review', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    // Reject/Delete review
    const handleDelete = async (reviewId) => {
        if (!confirm('Delete this review permanently?')) return;

        setActionLoading(reviewId);
        try {
            if (supabase) {
                const { error } = await supabase
                    .from('reviews')
                    .delete()
                    .eq('id', reviewId);

                if (error) throw error;
                showMessage('Review deleted');
                loadReviews();
            }
        } catch (error) {
            showMessage('Error deleting review', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const pendingCount = reviews.filter(r => !r.is_approved).length;

    return (
        <div className="space-y-4">
            {/* Message */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-3 rounded-lg ${message.type === 'error' ? 'bg-red-600/20 text-red-400' : 'bg-green-600/20 text-green-400'}`}
                    >
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Review Moderation</h3>
                <div className="flex gap-2">
                    {['pending', 'approved', 'all'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${filter === f
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            {f} {f === 'pending' && pendingCount > 0 && `(${pendingCount})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No {filter} reviews found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.map((review) => (
                        <motion.div
                            key={review.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`p-4 rounded-xl border ${review.is_approved
                                    ? 'bg-green-900/10 border-green-700'
                                    : 'bg-gray-800 border-gray-700'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    {/* User & Product */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-orange-600/20 flex items-center justify-center">
                                            <User className="w-4 h-4 text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{review.user_name || 'Anonymous'}</p>
                                            <p className="text-xs text-gray-400">{review.user_email}</p>
                                        </div>
                                    </div>

                                    {/* Product & Rating */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm text-orange-400">{review.products?.name || 'Unknown Product'}</span>
                                        <span className="text-gray-600">•</span>
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-4 h-4 ${star <= review.rating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'fill-gray-600 text-gray-600'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <p className="text-gray-300">{review.comment}</p>

                                    {/* Date */}
                                    <p className="text-xs text-gray-500 mt-2">{formatDate(review.created_at)}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    {!review.is_approved && (
                                        <button
                                            onClick={() => handleApprove(review.id)}
                                            disabled={actionLoading === review.id}
                                            className="p-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
                                            title="Approve"
                                        >
                                            {actionLoading === review.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Check className="w-4 h-4" />
                                            )}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        disabled={actionLoading === review.id}
                                        className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewModerator;
