// <ai_context>
// Utilidades para la PWA: registro del service worker y suscripción a notificaciones push.
// Localización: CRM
// </ai_context>

import axios from 'axios';

/** El navegador soporta notificaciones push */
export function pushSupported(): boolean {
    return typeof window !== 'undefined'
        && 'serviceWorker' in navigator
        && 'PushManager' in window
        && 'Notification' in window;
}

/** Registra el service worker (idempotente: si ya está, devuelve el existente) */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) return null;
    try {
        return await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    } catch (e) {
        console.error('No se pudo registrar el service worker:', e);
        return null;
    }
}

/** La clave pública VAPID viene inyectada en el <head> por Blade */
function vapidPublicKey(): string | null {
    const meta = document.querySelector('meta[name="vapid-public-key"]');
    const key = meta?.getAttribute('content')?.trim();
    return key ? key : null;
}

/** Convierte la clave base64-url al buffer que espera PushManager */
function urlBase64ToBuffer(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    const buffer = new ArrayBuffer(raw.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
    return buffer;
}

/** ¿Este dispositivo ya está suscrito? */
export async function currentSubscription(): Promise<PushSubscription | null> {
    if (!pushSupported()) return null;
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return null;
    return await reg.pushManager.getSubscription();
}

export interface SubscribeResult {
    ok: boolean;
    /** Motivo del fallo, presente sólo cuando ok es false */
    reason?: string;
}

/** Pide permiso y suscribe este dispositivo a las notificaciones push. */
export async function subscribeToPush(): Promise<SubscribeResult> {
    if (!pushSupported()) {
        return { ok: false, reason: 'Este navegador no soporta notificaciones push.' };
    }

    const key = vapidPublicKey();
    if (!key) {
        return { ok: false, reason: 'Faltan las claves VAPID en el servidor. Corre "php artisan webpush:vapid".' };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        return {
            ok: false,
            reason: permission === 'denied'
                ? 'Bloqueaste las notificaciones. Habilítalas desde los ajustes del navegador para este sitio.'
                : 'No se concedió el permiso de notificaciones.',
        };
    }

    const reg = (await navigator.serviceWorker.getRegistration()) ?? (await registerServiceWorker());
    if (!reg) return { ok: false, reason: 'No se pudo registrar el service worker.' };

    // Esperar a que el SW esté activo antes de suscribir
    await navigator.serviceWorker.ready;

    try {
        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToBuffer(key),
        });

        await axios.post('/push-subscriptions', subscription.toJSON());
        return { ok: true };
    } catch (e: any) {
        console.error('Error al suscribir:', e);
        return { ok: false, reason: e?.message ?? 'No se pudo completar la suscripción.' };
    }
}

/** Da de baja este dispositivo */
export async function unsubscribeFromPush(): Promise<boolean> {
    const sub = await currentSubscription();
    if (!sub) return true;

    try {
        await axios.delete('/push-subscriptions', { data: { endpoint: sub.endpoint } });
    } catch (e) {
        console.error('Error al borrar la suscripción en el servidor:', e);
    }

    return await sub.unsubscribe();
}
