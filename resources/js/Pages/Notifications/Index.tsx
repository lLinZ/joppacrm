// <ai_context>
// Propósito: Historial completo de notificaciones (leídas y no leídas) con filtro y navegación.
// Localización: CRM (Admin)
// </ai_context>

import React from 'react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { PageHeader } from '@/Components/ui/PageHeader';
import { PushSettings } from '@/Components/ui/PushSettings';
import { Head, Link, router } from '@inertiajs/react';
import { Bell, Scissors, Palette, ShoppingBag, Star, Check } from 'lucide-react';

interface NotificationItem {
    id: string;
    data: { title: string; message: string; [k: string]: any };
    read_at: string | null;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface Props {
    notifications: Paginated<NotificationItem>;
    filter: 'all' | 'unread';
    unreadCount: number;
}

function meta(data: any): { Icon: any; chip: string; ring: string } {
    if (data?.seamstress_application_id) return { Icon: Scissors, chip: 'bg-emerald-500/15 text-emerald-400', ring: 'ring-emerald-500/20' };
    if (data?.design_request_id)         return { Icon: Palette, chip: 'bg-purple-500/15 text-purple-400', ring: 'ring-purple-500/20' };
    if (data?.order_id)                  return { Icon: ShoppingBag, chip: 'bg-amber-500/15 text-amber-400', ring: 'ring-amber-500/20' };
    if (data?.product_id)                return { Icon: Star, chip: 'bg-yellow-500/15 text-yellow-400', ring: 'ring-yellow-500/20' };
    return { Icon: Bell, chip: 'bg-slate-500/15 text-slate-300', ring: 'ring-slate-500/20' };
}

function timeAgo(dateStr?: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const secs = Math.floor((Date.now() - d.getTime()) / 1000);
    if (secs < 60) return 'hace un momento';
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs} h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `hace ${days} d`;
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function cleanLabel(label: string): string {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›').replace('pagination.previous', '‹').replace('pagination.next', '›');
}

export default function Index({ notifications, filter, unreadCount }: Props) {
    const openNotification = (id: string) => router.post(route('notifications.open', id));
    const markAllRead = () => router.post(route('notifications.mark-read'), {}, { preserveScroll: true });

    return (
        <AppLayout>
            <Head title="Notificaciones" />

            <PageHeader
                title="Notificaciones"
                description={unreadCount > 0 ? `Tienes ${unreadCount} sin leer` : 'Estás al día'}
                action={
                    unreadCount > 0 ? (
                        <button
                            onClick={markAllRead}
                            className="inline-flex items-center gap-2 text-slate-200 hover:text-white font-medium text-sm border border-white/10 hover:border-white/25 bg-white/5 px-4 py-2 rounded-lg transition-colors"
                        >
                            <Check className="w-4 h-4" /> Marcar todas como leídas
                        </button>
                    ) : undefined
                }
            />

            {/* Notificaciones push / instalar app */}
            <PushSettings />

            {/* Filtros */}
            <div className="flex items-center gap-2 mb-5">
                {([['all', 'Todas'], ['unread', 'No leídas']] as const).map(([key, label]) => (
                    <Link
                        key={key}
                        href={route('notifications.index', key === 'unread' ? { filter: 'unread' } : {})}
                        className={`text-sm px-4 py-1.5 rounded-lg border font-medium transition-colors ${
                            filter === key
                                ? 'bg-emerald-400/10 border-emerald-400/40 text-emerald-400'
                                : 'border-white/8 text-slate-400 hover:text-slate-200 hover:border-white/20'
                        }`}
                    >
                        {label}
                    </Link>
                ))}
            </div>

            {/* Lista */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
                {notifications.data.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <Bell className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-400">{filter === 'unread' ? 'No tienes notificaciones sin leer.' : 'No hay notificaciones todavía.'}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {notifications.data.map((n) => {
                            const m = meta(n.data);
                            const unread = !n.read_at;
                            return (
                                <button
                                    key={n.id}
                                    onClick={() => openNotification(n.id)}
                                    className={`w-full text-left flex gap-4 px-4 sm:px-5 py-4 hover:bg-white/[0.03] transition-colors ${unread ? 'bg-white/[0.015]' : ''}`}
                                >
                                    <span className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ring-1 ${m.chip} ${m.ring}`}>
                                        <m.Icon className="h-4.5 w-4.5" />
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm leading-snug ${unread ? 'font-semibold text-white' : 'font-medium text-slate-300'}`}>{n.data.title}</p>
                                            {unread && <span className="shrink-0 h-2 w-2 rounded-full bg-emerald-400 mt-1.5" />}
                                        </div>
                                        <p className="text-slate-400 mt-0.5 text-xs">{n.data.message}</p>
                                        <p className="text-slate-600 mt-1 text-[11px]">{timeAgo(n.created_at)}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Paginación */}
                {notifications.links && notifications.links.length > 3 && (
                    <div className="p-4 border-t border-white/8 flex justify-center">
                        <div className="flex flex-wrap gap-1">
                            {notifications.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                    disabled={!link.url}
                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                        link.active ? 'bg-emerald-400/15 text-emerald-400 font-medium' : 'border border-white/10 text-slate-400 hover:text-white hover:border-white/25'
                                    } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                >
                                    {cleanLabel(link.label)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
