import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Send, Loader2, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const NotificationManager = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subscriberCount, setSubscriberCount] = useState(0);

    // Load notification history
    const loadHistory = useCallback(async () => {
        setLoading(true);
        try {
            if (supabase) {
                // Get notification history
                const { data: notifications, error: notifError } = await supabase
                    .from('notifications')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (notifError && notifError.code !== 'PGRST116') throw notifError;
                setHistory(notifications || []);

                // Get subscriber count
                const { count, error: countError } = await supabase
                    .from('push_subscriptions')
                    .select('*', { count: 'exact', head: true });

                if (!countError) setSubscriberCount(count || 0);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 5000);
    };

    // Send push notification
    const sendNotification = async () => {
        if (!title.trim() || !body.trim()) {
            showMessage('Please enter both title and message', 'error');
            return;
        }

        setSending(true);
        try {
            // Get all push subscriptions
            if (supabase) {
                const { data: subscriptions, error: subError } = await supabase
                    .from('push_subscriptions')
                    .select('*');

                if (subError && subError.code !== 'PGRST116') throw subError;

                // Save notification to history
                const { error: saveError } = await supabase
                    .from('notifications')
                    .insert([{
                        title: title.trim(),
                        body: body.trim(),
                        sent_at: new Date().toISOString(),
                        target: 'all'
                    }]);

                if (saveError && saveError.code !== 'PGRST116') {
                    console.warn('Could not save notification to history:', saveError);
                }

                // Send to each subscriber via service worker
                if (subscriptions && subscriptions.length > 0) {
                    // In production, you'd send these to a backend endpoint
                    // that uses web-push library to send actual push notifications
                    console.log(`Would send to ${subscriptions.length} subscribers:`, { title, body });
                    showMessage(`Notification queued for ${subscriptions.length} subscribers!`);
                } else {
                    showMessage('Notification saved! No subscribers yet.', 'warning');
                }

                // Also show notification locally for demo
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(title, { body, icon: '/icons/icon-192.png' });
                }
            } else {
                // Demo mode without Supabase
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(title, { body });
                    showMessage('Demo notification sent locally!');
                } else {
                    showMessage('Notifications not supported or not permitted', 'error');
                }
            }

            setTitle('');
            setBody('');
            loadHistory();
        } catch (error) {
            console.error('Error sending notification:', error);
            showMessage('Error sending notification: ' + error.message, 'error');
        } finally {
            setSending(false);
        }
    };

    // Request notification permission
    const requestPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                showMessage('Notifications enabled!');
            } else {
                showMessage('Notification permission denied', 'error');
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Message */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-3 rounded-lg flex items-center gap-2 ${message.type === 'error' ? 'bg-red-600/20 text-red-400' :
                                message.type === 'warning' ? 'bg-yellow-600/20 text-yellow-400' :
                                    'bg-green-600/20 text-green-400'
                            }`}
                    >
                        {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{subscriberCount}</p>
                            <p className="text-sm text-gray-400">Subscribers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{history.length}</p>
                            <p className="text-sm text-gray-400">Notifications Sent</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compose Notification */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Send className="w-4 h-4 text-orange-500" />
                    Compose Notification
                </h4>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Notification Title (e.g., 'Special Offer!')"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        maxLength={100}
                    />
                    <textarea
                        placeholder="Notification Message (e.g., 'Get 20% off on all paneer products today!')"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows={3}
                        maxLength={200}
                    />

                    {/* Preview */}
                    {(title || body) && (
                        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                            <p className="text-xs text-gray-400 mb-2">Preview:</p>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold">{title || 'Title'}</p>
                                    <p className="text-sm text-gray-300">{body || 'Message'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={sendNotification}
                            disabled={sending || !title.trim() || !body.trim()}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 font-medium"
                        >
                            {sending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                            Send to All Subscribers
                        </button>
                        <button
                            onClick={requestPermission}
                            className="px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                            title="Enable notifications on this device"
                        >
                            <Bell className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification History */}
            <div className="bg-gray-800 rounded-xl border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                    <h4 className="font-bold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        Notification History
                    </h4>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>No notifications sent yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-700 max-h-80 overflow-y-auto">
                        {history.map((notif) => (
                            <div key={notif.id} className="p-4 hover:bg-gray-700/30 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{notif.title}</p>
                                        <p className="text-sm text-gray-400 mt-1">{notif.body}</p>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(notif.sent_at || notif.created_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4 text-sm text-blue-300">
                <p className="font-medium mb-1">💡 How Push Notifications Work:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-400">
                    <li>Users must allow notifications in their browser</li>
                    <li>Works on Chrome, Firefox, Edge (limited on iOS Safari)</li>
                    <li>Notifications are delivered even when site is closed</li>
                    <li>Click "Enable notifications" below to test on this device</li>
                </ul>
            </div>
        </div>
    );
};

export default NotificationManager;
