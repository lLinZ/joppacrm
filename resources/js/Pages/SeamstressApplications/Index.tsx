// <ai_context>
// Propósito: Interfaz administrativa para listar las postulaciones de costureras recibidas desde /unete.
// Características: Vista agrupada por status con secciones colapsables, resumen de tarifas y opción de eliminar.
// Localización: CRM (Admin)
// </ai_context>

import React, { useState } from 'react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, Download } from 'lucide-react';

interface SeamstressApplication {
    id: number;
    name: string;
    email: string;
    phone: string;
    location: string;
    price_per_piece: string | null;
    experience_years: string | null;
    weekly_capacity: number | null;
    photos: string[] | null;
    status: string;
    created_at: string;
}

interface Props {
    applications: {
        data: SeamstressApplication[];
    };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; badgeClass: string }> = {
    pending: {
        label: 'Nuevas',
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
    contacted: {
        label: 'Contactadas',
        color: 'text-purple-400',
        dot: 'bg-purple-400',
        badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    hired: {
        label: 'Contratadas',
        color: 'text-emerald-400',
        dot: 'bg-emerald-400',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    rejected: {
        label: 'Descartadas',
        color: 'text-red-400',
        dot: 'bg-red-400',
        badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
};

const STATUS_ORDER = ['pending', 'reviewed', 'contacted', 'hired', 'rejected'];

const EXPERIENCE_LABELS: Record<string, string> = {
    menos_1: '< 1 año',
    '1_3': '1-3 años',
    '3_5': '3-5 años',
    mas_5: '+5 años',
};

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
    items: SeamstressApplication[];
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
        if (confirm('¿Eliminar esta postulación? Esta acción no se puede deshacer.')) {
            router.delete(`/seamstress-applications/${id}`);
        }
    };

    return (
        <div className="rounded-2xl overflow-hidden border border-white/8 bg-white/[0.03]">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.04] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                    <span className={`font-semibold text-sm ${config.color}`}>{config.label}</span>
                    <span className="text-xs text-slate-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                        {items.length}
                    </span>
                </div>
                <span className="text-slate-500">
                    <ChevronIcon open={open} />
                </span>
            </button>

            {open && (
                <div className="border-t border-white/8 overflow-x-auto">
                    {items.length === 0 ? (
                        <p className="px-6 py-6 text-center text-slate-600 text-sm">No hay postulaciones en este estado.</p>
                    ) : (
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-white/[0.025] text-slate-500 text-xs uppercase font-medium">
                                <tr>
                                    <th className="px-5 py-3 border-b border-white/8">ID</th>
                                    <th className="px-5 py-3 border-b border-white/8">Costurera</th>
                                    <th className="px-5 py-3 border-b border-white/8">Contacto</th>
                                    <th className="px-5 py-3 border-b border-white/8">Ubicación</th>
                                    <th className="px-5 py-3 border-b border-white/8 text-center">Exp.</th>
                                    <th className="px-5 py-3 border-b border-white/8 text-right">Tarifa</th>
                                    <th className="px-5 py-3 border-b border-white/8 text-center">Fotos</th>
                                    <th className="px-5 py-3 border-b border-white/8">Fecha</th>
                                    <th className="px-5 py-3 border-b border-white/8 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {items.map((app) => (
                                    <tr key={app.id} className="hover:bg-white/[0.025] transition-colors">
                                        <td className="px-5 py-3.5 font-semibold text-white">#{app.id}</td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">{app.name}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-slate-300">{app.email}</span>
                                                <span className="text-slate-500 text-xs">{app.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-400">{app.location}</td>
                                        <td className="px-5 py-3.5 text-center text-xs text-slate-400 whitespace-nowrap">
                                            {app.experience_years ? EXPERIENCE_LABELS[app.experience_years] ?? app.experience_years : '—'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            {app.price_per_piece
                                                ? <span className="text-emerald-400 font-semibold">${Number(app.price_per_piece).toFixed(2)}</span>
                                                : <span className="text-slate-600">—</span>}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="inline-flex items-center justify-center bg-white/10 px-2.5 py-0.5 rounded-full text-xs font-medium text-white">
                                                {app.photos?.length ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                                            {new Date(app.created_at).toLocaleDateString('es-ES', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/seamstress-applications/${app.id}`}
                                                    className="text-emerald-400 hover:text-emerald-300 font-medium text-xs transition-colors border border-emerald-400/20 hover:border-emerald-400/50 bg-emerald-400/10 px-3 py-1.5 rounded-lg"
                                                >
                                                    Revisar
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(app.id)}
                                                    className="text-red-400/70 hover:text-red-400 transition-colors border border-red-400/10 hover:border-red-400/30 bg-red-400/5 hover:bg-red-400/10 p-1.5 rounded-lg"
                                                    title="Eliminar postulación"
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

export default function Index({ applications }: Props) {
    const grouped = STATUS_ORDER.reduce<Record<string, SeamstressApplication[]>>((acc, status) => {
        acc[status] = applications.data.filter((a) => a.status === status);
        return acc;
    }, {});

    const total = applications.data.length;

    // Tarifa promedio de las postulaciones que sí indicaron precio
    const priced = applications.data.filter((a) => a.price_per_piece !== null);
    const avgPrice = priced.length
        ? priced.reduce((sum, a) => sum + Number(a.price_per_piece), 0) / priced.length
        : null;

    return (
        <AppLayout>
            <Head title="Costureras - Admin" />

            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-5">

                    <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Postulaciones de Costureras</h1>
                            <p className="text-slate-400 text-sm mt-0.5">
                                {total} postulación{total !== 1 ? 'es' : ''} recibida{total !== 1 ? 's' : ''} desde joppa.shop/unete
                                {avgPrice !== null && ` · Tarifa promedio $${avgPrice.toFixed(2)} por pieza`}
                            </p>
                        </div>
                        {total > 0 && (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/seamstress-applications/analytics"
                                    className="inline-flex items-center gap-2 text-slate-200 hover:text-white font-medium text-sm border border-white/10 hover:border-white/25 bg-white/5 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <BarChart3 className="w-4 h-4" /> Analíticas
                                </Link>
                                <a
                                    href="/seamstress-applications/export"
                                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm border border-emerald-400/20 hover:border-emerald-400/50 bg-emerald-400/10 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Download className="w-4 h-4" /> Exportar CSV
                                </a>
                            </div>
                        )}
                    </div>

                    {total > 0 && (
                        <div className="hidden sm:flex items-center gap-2 flex-wrap">
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
                    )}

                    {total === 0 ? (
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-16 text-center">
                            <p className="text-slate-500">No hay postulaciones todavía.</p>
                            <p className="text-slate-600 text-sm mt-2">
                                Comparte el link <span className="text-emerald-400 font-medium">joppa.shop/unete</span> para empezar a recibirlas.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {STATUS_ORDER.map((status) => (
                                <GroupSection
                                    key={status}
                                    status={status}
                                    items={grouped[status] ?? []}
                                    defaultOpen={status !== 'hired' && status !== 'rejected'}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
