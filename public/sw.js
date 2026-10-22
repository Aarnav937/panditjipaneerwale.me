// Service Worker for Push Notifications
// This file should be in the public folder


// Install event
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installed');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activated');
    event.waitUntil(clients.claim());
});

// Push notification event
self.addEventListener('push', (event) => {
    console.log('📨 Push notification received');

    let data = {
        title: 'Pandit Ji Paneer Wale',
        body: 'You have a new notification!',
        icon: '/images/packs/product-194.webp',
        url: '/'
    };

    try {
        if (event.data) {
            data = { ...data, ...event.data.json() };
        }
    } catch (e) {
        console.error('Error parsing push data:', e);
    }

    const options = {
        body: data.body,
        icon: '/images/packs/product-194.webp',
        tag: data.tag,
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        },
        actions: [
            { action: 'open', title: 'Open' },
            { action: 'close', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ Notification clicked');
    event.notification.close();

    if (event.action === 'close') return;

    let urlToOpen = new URL('/', self.location.origin).href;
    try {
        const requested = new URL(event.notification.data?.url || '/', self.location.origin);
        if (requested.origin === self.location.origin) urlToOpen = requested.href;
    } catch { /* Keep the store homepage. */ }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if there's already a window open
                for (const client of windowClients) {
                    if (client.url.includes(self.registration.scope) && 'focus' in client) {
                        client.navigate(urlToOpen);
                        return client.focus();
                    }
                }
                // Open new window if none exists
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Background sync (for offline actions)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-notifications') {
        console.log('🔄 Syncing notifications...');
        // Could sync pending notifications here
    }
});
