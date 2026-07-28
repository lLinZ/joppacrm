// <ai_context>
// Propósito: Activar/desactivar notificaciones push en este dispositivo, ver los
// dispositivos registrados del usuario y probar el envío en uno concreto.
// Localización: CRM (Admin)
// </ai_context>

import React, { useCallback, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import { BellRing, BellOff, Download, Smartphone, Send, Monitor, Trash2, RefreshCw } from 'lucide-react';
import { pushSupported, currentSubscription, subscribeToPush, unsubscribeFromPush } from '@/lib/push';

interface Device {
    id: number;
    endpoint: string;
    device_name: string;
    created_at: string | null;
}

export function PushSettings() {
    const [supported, setSupported] = useState(true);
    const [endpoint, setEndpoint] = useState<string | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);
    const [busy, setBusy] = useState(false);
    const [installEvent, setInstallEvent] = useState<any>(null);
    const [installed, setInstalled] = useState(false);

    const subscribed = !!endpoint;
    // ¿La suscripción de este navegador está realmente guardada en el servidor?
    const registeredHere = !!endpoint && devices.some((d) => d.endpoint === endpoint);

    const loadDevices = useCallback(async () => {
        try {
            const { data } = await axios.get('/push-subscriptions');
            setDevices(data.devices ?? []);
        } catch {
            /* si falla, simplemente no mostramos la lista */
        }
    }, []);

    useEffect(() => {
        setSupported(pushSupported());
        currentSubscription().then((sub) => setEndpoint(sub?.endpoint ?? null));
        loadDevices();

        setInstalled(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true);

        const onPrompt = (e: Event) => {
            e.preventDefault();
            setInstallEvent(e);
        };
        window.addEventListener('beforeinstallprompt', onPrompt);
        return () => window.removeEventListener('beforeinstallprompt', onPrompt);
    }, [loadDevices]);

    const enable = async () => {
        setBusy(true);
        const result = await subscribeToPush();
        if (result.ok) {
            const sub = await currentSubscription();
            setEndpoint(sub?.endpoint ?? null);
            await loadDevices();
            toast.success('Notificaciones activadas', { description: 'Este dispositivo recibirá avisos de órdenes, postulaciones y solicitudes.' });
        } else {
            toast.error('No se pudieron activar', { description: result.reason });
        }
        setBusy(false);
    };

    const disable = async () => {
        setBusy(true);
        await unsubscribeFromPush();
        setEndpoint(null);
        await loadDevices();
        setBusy(false);
        toast.success('Notificaciones desactivadas en este dispositivo.');
    };

    /** Prueba dirigida: sólo al dispositivo desde el que se pulsa */
    const testThisDevice = () => {
        if (!endpoint) return;
        router.post('/push-subscriptions/test', { endpoint }, { preserveScroll: true });
    };

    const testAll = () => router.post('/push-subscriptions/test', {}, { preserveScroll: true });

    const removeDevice = async (d: Device) => {
        if (!confirm(`¿Quitar "${d.device_name}"? Dejará de recibir notificaciones.`)) return;
        try {
            await axios.delete('/push-subscriptions', { data: { endpoint: d.endpoint } });
            if (d.endpoint === endpoint) {
                await unsubscribeFromPush();
                setEndpoint(null);
            }
            await loadDevices();
            toast.success('Dispositivo quitado.');
        } catch {
            toast.error('No se pudo quitar el dispositivo.');
        }
    };

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
                                    ? 'Activadas. Recibirás avisos aunque el CRM esté cerrado.'
                                    : 'Actívalas para enterarte al instante de cada orden, postulación o solicitud nueva.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {supported && (
                        subscribed ? (
                            <>
                                <button
                                    onClick={testThisDevice}
                                    className="inline-flex items-center gap-2 text-white font-medium text-sm bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Send className="w-4 h-4" /> Probar aquí
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

            {/* Aviso: activado en el navegador pero no guardado en el servidor */}
            {subscribed && devices.length > 0 && !registeredHere && (
                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-sm">
                    <p className="text-amber-300 font-medium">Este dispositivo no aparece en la lista</p>
                    <p className="text-slate-400 mt-1">
                        El navegador tiene el permiso, pero el servidor no guardó la suscripción. Desactiva y vuelve a activar aquí para registrarlo.
                    </p>
                </div>
            )}

            {/* Dispositivos registrados */}
            <div className="mt-4 pt-4 border-t border-white/8">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-300">
                        Dispositivos registrados <span className="text-slate-500 font-normal">({devices.length})</span>
                    </h4>
                    <div className="flex items-center gap-2">
                        <button onClick={loadDevices} title="Actualizar" className="text-slate-500 hover:text-white transition-colors p-1.5">
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        {devices.length > 1 && (
                            <button onClick={testAll} className="text-xs text-slate-400 hover:text-white transition-colors">
                                Probar en todos
                            </button>
                        )}
                    </div>
                </div>

                {devices.length === 0 ? (
                    <p className="text-slate-600 text-sm">Ninguno todavía. Activa las notificaciones para registrar este dispositivo.</p>
                ) : (
                    <div className="space-y-2">
                        {devices.map((d) => {
                            const isThis = d.endpoint === endpoint;
                            const mobile = /Android|iPhone|iPad/i.test(d.device_name);
                            return (
                                <div key={d.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5">
                                    <span className="shrink-0 text-slate-400">
                                        {mobile ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm text-slate-200">{d.device_name}</span>
                                            {isThis && (
                                                <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">ESTE</span>
                                            )}
                                        </div>
                                        {d.created_at && <span className="text-[11px] text-slate-600">Desde {d.created_at}</span>}
                                    </div>
                                    <button
                                        onClick={() => removeDevice(d)}
                                        title="Quitar dispositivo"
                                        className="shrink-0 text-red-400/60 hover:text-red-400 transition-colors p-1.5"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
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
