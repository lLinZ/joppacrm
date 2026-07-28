// <ai_context>
// Propósito: Tarjeta para activar/desactivar las notificaciones push en este dispositivo
// e instalar el CRM como app. Se muestra en la página de Notificaciones.
// Localización: CRM (Admin)
// </ai_context>

import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { BellRing, BellOff, Download, Smartphone, Send } from 'lucide-react';
import { pushSupported, currentSubscription, subscribeToPush, unsubscribeFromPush } from '@/lib/push';

export function PushSettings() {
    const [supported, setSupported] = useState(true);
    const [subscribed, setSubscribed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [installEvent, setInstallEvent] = useState<any>(null);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        setSupported(pushSupported());
        currentSubscription().then((sub) => setSubscribed(!!sub));

        // ¿Ya está corriendo como app instalada?
        setInstalled(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true);

        const onPrompt = (e: Event) => {
            e.preventDefault();
            setInstallEvent(e);
        };
        window.addEventListener('beforeinstallprompt', onPrompt);
        return () => window.removeEventListener('beforeinstallprompt', onPrompt);
    }, []);

    const enable = async () => {
        setBusy(true);
        const result = await subscribeToPush();
        setBusy(false);

        if (result.ok) {
            setSubscribed(true);
            toast.success('Notificaciones activadas', { description: 'Este dispositivo recibirá avisos de órdenes, postulaciones y solicitudes.' });
        } else {
            toast.error('No se pudieron activar', { description: result.reason });
        }
    };

    const disable = async () => {
        setBusy(true);
        await unsubscribeFromPush();
        setBusy(false);
        setSubscribed(false);
        toast.success('Notificaciones desactivadas en este dispositivo.');
    };

    const sendTest = () => router.post('/push-subscriptions/test', {}, { preserveScroll: true });

    const install = async () => {
        if (!installEvent) return;
        installEvent.prompt();
        const { outcome } = await installEvent.userChoice;
        if (outcome === 'accepted') {
            setInstalled(true);
            setInstallEvent(null);
        }
    };

    return (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 mb-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex gap-3 min-w-0">
                    <span className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ring-1 ${subscribed ? 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20' : 'bg-slate-500/15 text-slate-300 ring-slate-500/20'}`}>
                        {subscribed ? <BellRing className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0">
                        <h3 className="text-white font-semibold">Notificaciones en este dispositivo</h3>
                        <p className="text-slate-400 text-sm mt-0.5">
                            {!supported
                                ? 'Este navegador no soporta notificaciones push. Prueba con Chrome, Edge o Safari 16.4+.'
                                : subscribed
                                    ? 'Activadas. Recibirás avisos de órdenes, postulaciones y solicitudes aunque el CRM esté cerrado.'
                                    : 'Actívalas para enterarte al instante de cada orden, postulación o solicitud nueva.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {supported && (
                        subscribed ? (
                            <>
                                <button
                                    onClick={sendTest}
                                    className="inline-flex items-center gap-2 text-slate-200 hover:text-white font-medium text-sm border border-white/10 hover:border-white/25 bg-white/5 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Send className="w-4 h-4" /> Probar
                                </button>
                                <button
                                    onClick={disable}
                                    disabled={busy}
                                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-medium text-sm border border-white/10 hover:border-white/25 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <BellOff className="w-4 h-4" /> Desactivar
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={enable}
                                disabled={busy}
                                className="inline-flex items-center gap-2 text-white font-medium text-sm bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <BellRing className="w-4 h-4" /> {busy ? 'Activando...' : 'Activar notificaciones'}
                            </button>
                        )
                    )}

                    {installEvent && !installed && (
                        <button
                            onClick={install}
                            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm border border-emerald-400/20 hover:border-emerald-400/50 bg-emerald-400/10 px-4 py-2 rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" /> Instalar app
                        </button>
                    )}
                </div>
            </div>

            {/* Ayuda para instalar en el teléfono */}
            {!installed && !installEvent && (
                <div className="mt-4 pt-4 border-t border-white/8 flex items-start gap-2.5 text-xs text-slate-500">
                    <Smartphone className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                        <span className="text-slate-400 font-medium">¿Instalarlo en el teléfono?</span>{' '}
                        En Android (Chrome): menú ⋮ → “Instalar aplicación”. En iPhone (Safari): botón Compartir → “Añadir a pantalla de inicio”.
                        En iPhone las notificaciones solo funcionan después de instalarlo así.
                    </p>
                </div>
            )}
        </div>
    );
}
