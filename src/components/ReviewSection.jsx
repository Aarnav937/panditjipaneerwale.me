import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Loader2, User, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import StarRating from './StarRating';

const ReviewSection = ({ productId, productName }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [averageRating, setAverageRating] = useState(0);
    const [formData, setFormData] = useState({
        rating: 0,
        comment: '',
        user_name: ''
    });
    const [message, setMessage] = useState(null);

    // Get user email from localStorage
    const userEmail = localStorage.getItem('userEmail') || '';

    // Load reviews
    const loadReviews = useCallback(async () => {
        try {
            if (supabase && productId) {
                const { data, error } = await supabase
                    .from('reviews')
                    .select('*')
                    .eq('product_id', productId)
                    .eq('is_approved', true)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setReviews(data || []);

                // Calculate average
                if (data && data.length > 0) {
                    const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
                    setAverageRating(Math.round(avg * 10) / 10);
                }
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    // Submit review
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.rating || !formData.comment.trim()) {
            setMessage({ type: 'error', text: 'Please provide a rating and comment' });
            return;
        }

        setSubmitting(true);
        try {
            if (supabase) {
                const { error } = await supabase.from('reviews').insert([{
                    product_id: productId,
                    user_email: userEmail,
                    user_name: formData.user_name || 'Anonymous',
                    rating: formData.rating,
                    comment: formData.comment,
                    is_approved: false // Requires admin approval
                }]);

                if (error) throw error;

                setMessage({ type: 'success', text: 'Review submitted! It will appear after approval.' });
                setFormData({ rating: 0, comment: '', user_name: '' });
                setShowForm(false);
            } else {
                setMessage({ type: 'error', text: 'Database not connected' });
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSubmitting(false);
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Customer Reviews</h3>
                    {reviews.length > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={Math.round(averageRating)} readonly size="sm" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {averageRating} out of 5 ({reviews.length} reviews)
                            </span>
                        </div>
                    )}
                </div>
                {userEmail && !showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                        <Star className="w-4 h-4" /> Write Review
                    </button>
                )}
            </div>

            {/* Message */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-3 rounded-lg mb-4 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}
                    >
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Review Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSubmit}
                        className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                        <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Your Review</h4>

                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Rating</label>
                            <StarRating
                                rating={formData.rating}
                                onRate={(r) => setFormData({ ...formData, rating: r })}
                                size="lg"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Your Name</label>
                            <input
                                type="text"
                                value={formData.user_name}
                                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                                placeholder="Anonymous"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Comment</label>
                            <textarea
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                placeholder="Share your experience..."
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Submit
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Reviews List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No reviews yet. Be the first to review!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                                        <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {review.user_name || 'Anonymous'}
                                        </p>
                                        <StarRating rating={review.rating} readonly size="sm" />
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                            </div>
                            <p className="mt-2 text-gray-700 dark:text-gray-300 pl-13">{review.comment}</p>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
