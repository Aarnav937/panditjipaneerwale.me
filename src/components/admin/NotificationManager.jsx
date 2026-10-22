import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Send, Loader2, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { initializePushNotifications } from '../../lib/pushNotifications';

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
                const { data: status, error: countError } = await supabase.rpc('store_operations_status');
                if (countError) throw countError;
                setSubscriberCount(status?.subscribers || 0);
            }
        } catch (error) {
            setMessage({text:'Could not load announcements: '+error.message,type:'error'});
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

    // Publishing inserts one announcement; the database creates durable push jobs.
    const sendNotification = async () => {
        if (!title.trim() || !body.trim()) { showMessage('Please enter both title and message', 'error'); return; }
        setSending(true);
        try {
            if (!supabase) throw new Error('Store database is not connected.');
            const { error } = await supabase.from('notifications').insert([{ title:title.trim().slice(0,120), body:body.trim().slice(0,500), target:'all' }]).select('id').single();
            if (error) throw error;
            const { data:status,error:statusError } = await supabase.rpc('store_operations_status');
            showMessage(statusError ? 'Announcement published. Delivery status could not be refreshed.' : status.subscribers ? `Announcement published and queued for ${status.subscribers} devices. Delivery runs automatically.` : 'Announcement published in the store. No devices have enabled browser alerts yet.');
            setTitle(''); setBody(''); loadHistory();
        } catch (error) { showMessage('Error sending notification: '+error.message,'error'); }
        finally { setSending(false); }
    };
    const requestPermission = async () => {
        try { await initializePushNotifications(); showMessage('Browser alerts enabled on this device.'); await loadHistory(); }
        catch (error) { showMessage(error.message,'error'); }
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
                            <p className="text-sm text-gray-400">Store Announcements</p>
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
                            Publish Store Announcement
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
