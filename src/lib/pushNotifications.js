// Push Notifications Utility
// Handles service worker registration and push subscription

const PUBLIC_VAPID_KEY = ''; // Will be set from Supabase or env

// Check if push is supported
export const isPushSupported = () => {
    return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Register service worker
export const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
        console.warn('Service workers not supported');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', registration.scope);
        return registration;
    } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        return null;
    }
};

// Request notification permission
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('🔔 Notification permission:', permission);
    return permission;
};

// Subscribe to push notifications
export const subscribeToPush = async (registration) => {
    if (!registration) {
        console.warn('No service worker registration');
        return null;
    }

    try {
        // Check existing subscription
        let subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            console.log('📬 Existing push subscription found');
            return subscription;
        }

        // Create new subscription
        // Note: In production, you'd get the VAPID key from your server
        const vapidKey = PUBLIC_VAPID_KEY || localStorage.getItem('vapid_public_key');

        if (!vapidKey) {
            console.warn('No VAPID key available');
            return null;
        }

        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });

        console.log('📬 New push subscription created');
        return subscription;
    } catch (error) {
        console.error('❌ Push subscription failed:', error);
        return null;
    }
};

// Unsubscribe from push
export const unsubscribeFromPush = async () => {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            await subscription.unsubscribe();
            console.log('🔕 Unsubscribed from push');
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Unsubscribe failed:', error);
        return false;
    }
};

// Save subscription to server (Supabase)
export const saveSubscriptionToServer = async (subscription, userEmail) => {
    if (!subscription || !userEmail) return false;

    try {
        const { supabase } = await import('./supabase');

        if (!supabase) return false;

        const { error } = await supabase.from('push_subscriptions').upsert({
            user_email: userEmail,
            subscription: JSON.stringify(subscription),
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_email'
        });

        if (error) throw error;

        console.log('💾 Subscription saved to server');
        return true;
    } catch (error) {
        console.error('❌ Failed to save subscription:', error);
        return false;
    }
};

// Initialize push notifications
export const initializePushNotifications = async (userEmail) => {
    if (!isPushSupported()) {
        console.warn('Push not supported');
        return false;
    }

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
    }

    const registration = await registerServiceWorker();
    if (!registration) return false;

    const subscription = await subscribeToPush(registration);
    if (!subscription) return false;

    if (userEmail) {
        await saveSubscriptionToServer(subscription, userEmail);
    }

    return true;
};

// Helper: Convert VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
