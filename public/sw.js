/**
 * Service Worker del Joppa CRM.
 * Se encarga de recibir las notificaciones push (aunque la app esté cerrada)
 * y de abrir la pantalla correspondiente al tocarlas.
 */

const VERSION = 'joppa-crm-v1';

self.addEventListener('install', (event) => {
    // Activar la versión nueva sin esperar a que se cierren las pestañas viejas
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    if (!event.data) return;

    let payload = {};
    try {
        payload = event.data.json();
    } catch (e) {
        payload = { title: 'Joppa CRM', body: event.data.text() };
    }

    const title = payload.title || 'Joppa CRM';
    const options = {
        body: payload.body || '',
        icon: payload.icon || '/android-chrome-192x192.png',
        badge: '/favicon-32x32.png',
        tag: payload.tag || undefined,
        renotify: !!payload.tag,
        vibrate: [180, 80, 180],
        timestamp: Date.now(),
        data: {
            url: (payload.data && payload.data.url) || payload.url || '/dashboard',
        },
        actions: payload.actions || [],
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const target = (event.notification.data && event.notification.data.url) || '/dashboard';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Si el CRM ya está abierto, enfocar esa ventana y navegar
            for (const client of clientList) {
                if ('focus' in client) {
                    client.focus();
                    if ('navigate' in client) client.navigate(target);
                    return;
                }
            }
            // Si no, abrir una ventana nueva
            if (self.clients.openWindow) {
                return self.clients.openWindow(target);
            }
        })
    );
});
