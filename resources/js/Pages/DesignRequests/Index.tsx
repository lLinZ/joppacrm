// <ai_context>
// Propósito: Interfaz administrativa para listar las solicitudes de diseño personalizado.
// Características: Vista agrupada por status con secciones colapsables y opción de eliminar.
// Localización: CRM (Admin)
// </ai_context>

import React, { useState } from 'react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Badge } from "@/Components/ui/badge";

interface DesignRequest {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    items_count: number;
    created_at: string;
}

interface Props {
    requests: {
        data: DesignRequest[];
    };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; badgeClass: string }> = {
    pending: {
        label: 'Pendientes',
        color: 'text-yellow-400',
        dot: 'bg-yellow-400',
        badgeClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },
    reviewed: {
        label: 'Revisadas',
        color: 'text-blue-400',
        dot: 'bg-blue-400',
        badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    in_progress: {
        label: 'En Progreso',
        color: 'text-purple-400',
        dot: 'bg-purple-400',
        badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    accepted: {
        label: 'Aceptadas',
        color: 'text-emerald-400',
        dot: 'bg-emerald-400',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    rejected: {
        label: 'Rechazadas',
        color: 'text-red-400',
        dot: 'bg-red-400',
        badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
};

const STATUS_ORDER = ['pending', 'reviewed', 'in_progress', 'accepted', 'rejected'];

function ChevronIcon({ open }: { open: boolean }) {
    return (
        <svg
            className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );
}

interface GroupSectionProps {
    status: string;
    items: DesignRequest[];
    defaultOpen?: boolean;
}

function GroupSection({ status, items, defaultOpen = true }: GroupSectionProps) {
    const [open, setOpen] = useState(defaultOpen);
    const config = STATUS_CONFIG[status] ?? {
        label: status,
        color: 'text-slate-400',
        dot: 'bg-slate-400',
        badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar esta solicitud de diseño? Esta acción no se puede deshacer.')) {
            router.delete(`/design-requests/${id}`);
        }
    };

    return (
        <div className="rounded-2xl overflow-hidden border border-white/8 bg-white/[0.03]">
            {/* Section Header */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.04] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${config.dot} shadow-lg`} style={{ boxShadow: `0 0 6px 1px ${config.dot.replace('bg-', '').includes('yellow') ? '#facc15' : config.dot.replace('bg-', '').includes('blue') ? '#60a5fa' : config.dot.replace('bg-', '').includes('emerald') ? '#34d399' : config.dot.replace('bg-', '').includes('red') ? '#f87171' : '#c084fc'}` }} />
                    <span className={`font-semibold text-sm ${config.color}`}>{config.label}</span>
                    <span className="text-xs text-slate-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                        {items.length}
                    </span>
                </div>
                <span className="text-slate-500">
                    <ChevronIcon open={open} />
                </span>
            </button>

            {/* Collapsible Content */}
            {open && (
                <div className="border-t border-white/8">
                    {items.length === 0 ? (
                        <p className="px-6 py-6 text-center text-slate-600 text-sm">No hay solicitudes en este estado.</p>
                    ) : (
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-white/[0.025] text-slate-500 text-xs uppercase font-medium">
                                <tr>
                                    <th className="px-5 py-3 border-b border-white/8">ID</th>
                                    <th className="px-5 py-3 border-b border-white/8">Cliente</th>
                                    <th className="px-5 py-3 border-b border-white/8">Contacto</th>
                                    <th className="px-5 py-3 border-b border-white/8 text-center">Piezas</th>
                                    <th className="px-5 py-3 border-b border-white/8">Fecha</th>
                                    <th className="px-5 py-3 border-b border-white/8 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {items.map((req) => (
                                    <tr key={req.id} className="hover:bg-white/[0.025] transition-colors group">
                                        <td className="px-5 py-3.5 font-semibold text-white">#{req.id}</td>
                                        <td className="px-5 py-3.5">{req.name}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-slate-300">{req.email}</span>
                                                {req.phone && <span className="text-slate-500 text-xs">{req.phone}</span>}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="inline-flex items-center justify-center bg-white/10 px-2.5 py-0.5 rounded-full text-xs font-medium text-white">
                                                {req.items_count} prendas
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-500 text-xs">
                                            {new Date(req.created_at).toLocaleDateString('es-ES', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/design-requests/${req.id}`}
                                                    className="text-emerald-400 hover:text-emerald-300 font-medium text-xs transition-colors border border-emerald-400/20 hover:border-emerald-400/50 bg-emerald-400/10 px-3 py-1.5 rounded-lg"
                                                >
                                                    Revisar
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(req.id)}
                                                    className="text-red-400/70 hover:text-red-400 transition-colors border border-red-400/10 hover:border-red-400/30 bg-red-400/5 hover:bg-red-400/10 p-1.5 rounded-lg"
                                                    title="Eliminar solicitud"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Index({ requests }: Props) {
    const grouped = STATUS_ORDER.reduce<Record<string, DesignRequest[]>>((acc, status) => {
        acc[status] = requests.data.filter((r) => r.status === status);
        return acc;
    }, {});

    // Any unknown statuses also show up
    const unknownStatuses = [...new Set(requests.data.map((r) => r.status).filter((s) => !STATUS_ORDER.includes(s)))];
    unknownStatuses.forEach((s) => {
        grouped[s] = requests.data.filter((r) => r.status === s);
    });

    const allStatuses = [...STATUS_ORDER, ...unknownStatuses];
    const total = requests.data.length;

    return (
        <AppLayout>
            <Head title="Solicitudes de Diseño - Admin" />

            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-5">

                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Solicitudes de Diseño</h1>
                            <p className="text-slate-400 text-sm mt-0.5">
                                {total} solicitud{total !== 1 ? 'es' : ''} en total recibidas desde el E-commerce
                            </p>
                        </div>
                        {/* Status pill summary */}
                        <div className="hidden sm:flex items-center gap-2 flex-wrap justify-end">
                            {STATUS_ORDER.map((s) => {
                                const count = grouped[s]?.length ?? 0;
                                if (count === 0) return null;
                                const cfg = STATUS_CONFIG[s];
                                return (
                                    <span key={s} className={`text-xs border px-2.5 py-1 rounded-full font-medium ${cfg.badgeClass}`}>
                                        {count} {cfg.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* Grouped sections */}
                    {total === 0 ? (
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-16 text-center text-slate-500">
                            No hay solicitudes de diseño aún.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {allStatuses.map((status) => {
                                // Skip empty completed groups — show accepted/rejected collapsed by default
                                const items = grouped[status] ?? [];
                                const isCompleted = status === 'accepted' || status === 'rejected';
                                return (
                                    <GroupSection
                                        key={status}
                                        status={status}
                                        items={items}
                                        defaultOpen={!isCompleted}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
