// <ai_context>
// Propósito: Ficha detallada de una postulación de costurera con galería de trabajos, gestión de status y notas internas.
// Localización: CRM (Admin)
// </ai_context>

import React, { useState } from 'react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';

interface SeamstressApplication {
    id: number;
    name: string;
    email: string;
    phone: string;
    location: string;
    price_per_piece: string | null;
    budget_notes: string | null;
    experience_years: string | null;
    machines: string[] | null;
    weekly_capacity: number | null;
    message: string | null;
    photos: string[] | null;
    status: string;
    admin_notes: string | null;
    source: string | null;
    created_at: string;
}

interface Props {
    application: SeamstressApplication;
}

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Nueva', class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    { value: 'reviewed', label: 'Revisada', class: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    { value: 'contacted', label: 'Contactada', class: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    { value: 'hired', label: 'Contratada', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    { value: 'rejected', label: 'Descartada', class: 'bg-red-500/10 text-red-400 border-red-500/30' },
];

const EXPERIENCE_LABELS: Record<string, string> = {
    menos_1: 'Menos de 1 año',
    '1_3': 'Entre 1 y 3 años',
    '3_5': 'Entre 3 y 5 años',
    mas_5: 'Más de 5 años',
};

const MACHINE_LABELS: Record<string, string> = {
    recta: 'Recta',
    overlock: 'Overlock',
    collarin: 'Collarín',
    bordadora: 'Bordadora',
    familiar: 'Familiar',
    ninguna: 'Ninguna (trabaja en taller)',
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1 py-3 border-b border-white/5 last:border-0">
            <span className="text-xs uppercase tracking-wide text-slate-500 font-medium">{label}</span>
            <span className="text-slate-200">{value}</span>
        </div>
    );
}

export default function Show({ application }: Props) {
    const [lightbox, setLightbox] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    const { data, setData, patch, processing } = useForm({
        status: application.status,
        admin_notes: application.admin_notes ?? '',
    });

    const sendConfirmationEmail = () => {
        if (!confirm(`¿Enviar el correo de confirmación a ${application.email}?`)) return;
        setSending(true);
        router.post(`/seamstress-applications/${application.id}/send-email`, {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                // Refleja en el textarea la nota que el servidor acaba de registrar
                const fresh = (page.props as any).application;
                if (fresh && fresh.admin_notes !== undefined) setData('admin_notes', fresh.admin_notes ?? '');
            },
            onFinish: () => setSending(false),
        });
    };

    const save = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/seamstress-applications/${application.id}`, { preserveScroll: true });
    };

    const updateStatus = (status: string) => {
        setData('status', status);
        router.patch(`/seamstress-applications/${application.id}`, { status }, { preserveScroll: true });
    };

    const handleDelete = () => {
        if (confirm('¿Eliminar esta postulación? Esta acción no se puede deshacer.')) {
            router.delete(`/seamstress-applications/${application.id}`);
        }
    };

    // Número limpio para el enlace de WhatsApp
    const waNumber = application.phone.replace(/[^\d]/g, '');

    return (
        <AppLayout>
            <Head title={`${application.name} - Costurera`} />

            <div className="py-10">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <Link href="/seamstress-applications" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                                ← Volver a postulaciones
                            </Link>
                            <h1 className="text-2xl font-bold text-white tracking-tight mt-2">{application.name}</h1>
                            <p className="text-slate-400 text-sm mt-0.5">
                                Postulación #{application.id} · {application.location} ·{' '}
                                {new Date(application.created_at).toLocaleDateString('es-ES', {
                                    day: '2-digit', month: 'long', year: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            <button
                                onClick={sendConfirmationEmail}
                                disabled={sending}
                                className="inline-flex items-center gap-2 text-white font-medium text-sm bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <MailCheck className="w-4 h-4" />
                                {sending ? 'Enviando...' : 'Enviar confirmación'}
                            </button>
                            <a
                                href={`https://wa.me/${waNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 font-medium text-sm border border-emerald-400/20 hover:border-emerald-400/50 bg-emerald-400/10 px-4 py-2 rounded-lg transition-colors"
                            >
                                WhatsApp
                            </a>
                            <a
                                href={`mailto:${application.email}`}
                                className="text-slate-300 hover:text-white font-medium text-sm border border-white/10 hover:border-white/25 bg-white/5 px-4 py-2 rounded-lg transition-colors"
                            >
                                Email
                            </a>
                            <button
                                onClick={handleDelete}
                                className="text-red-400/70 hover:text-red-400 text-sm border border-red-400/10 hover:border-red-400/30 bg-red-400/5 px-4 py-2 rounded-lg transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>

                    {/* Status switcher */}
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                        <p className="text-xs uppercase tracking-wide text-slate-500 font-medium mb-3">Estado</p>
                        <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((opt) => {
                                const active = data.status === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => updateStatus(opt.value)}
                                        className={`text-sm px-4 py-2 rounded-lg border font-medium transition-all ${
                                            active ? opt.class : 'border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/20'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Datos */}
                        <div className="lg:col-span-1 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                            <h2 className="text-white font-semibold mb-2">Datos de contacto</h2>
                            <InfoRow label="Email" value={<a href={`mailto:${application.email}`} className="text-emerald-400 hover:underline">{application.email}</a>} />
                            <InfoRow label="Teléfono" value={application.phone} />
                            <InfoRow label="Ubicación" value={application.location} />
                            {application.source && <InfoRow label="Vino de" value={application.source} />}
                        </div>

                        {/* Perfil profesional */}
                        <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                            <h2 className="text-white font-semibold mb-2">Perfil profesional</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                                <InfoRow
                                    label="Precio por corte y costura"
                                    value={application.price_per_piece
                                        ? <span className="text-emerald-400 font-semibold text-lg">${Number(application.price_per_piece).toFixed(2)} USD</span>
                                        : <span className="text-slate-600">No indicado</span>}
                                />
                                <InfoRow
                                    label="Experiencia"
                                    value={application.experience_years
                                        ? EXPERIENCE_LABELS[application.experience_years] ?? application.experience_years
                                        : <span className="text-slate-600">No indicada</span>}
                                />
                                <InfoRow
                                    label="Capacidad semanal"
                                    value={application.weekly_capacity
                                        ? `${application.weekly_capacity} piezas por semana`
                                        : <span className="text-slate-600">No indicada</span>}
                                />
                                <InfoRow
                                    label="Máquinas"
                                    value={application.machines?.length
                                        ? (
                                            <span className="flex flex-wrap gap-1.5">
                                                {application.machines.map((m) => (
                                                    <span key={m} className="text-xs bg-white/8 border border-white/10 px-2 py-0.5 rounded-full">
                                                        {MACHINE_LABELS[m] ?? m}
                                                    </span>
                                                ))}
                                            </span>
                                        )
                                        : <span className="text-slate-600">No indicadas</span>}
                                />
                            </div>
                            {application.budget_notes && (
                                <InfoRow label="Detalle de precios / presupuesto" value={<span className="whitespace-pre-wrap">{application.budget_notes}</span>} />
                            )}
                        </div>
                    </div>

                    {/* Mensaje */}
                    {application.message && (
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                            <h2 className="text-white font-semibold mb-3">Mensaje de la postulante</h2>
                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{application.message}</p>
                        </div>
                    )}

                    {/* Galería */}
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                        <h2 className="text-white font-semibold mb-3">
                            Fotos de su trabajo
                            <span className="text-slate-500 font-normal text-sm ml-2">({application.photos?.length ?? 0})</span>
                        </h2>
                        {application.photos?.length ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {application.photos.map((photo, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setLightbox(photo)}
                                        className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-black hover:border-emerald-400/40 transition-colors"
                                    >
                                        <img src={photo} alt={`Trabajo ${i + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-600 text-sm py-4">No adjuntó fotos.</p>
                        )}
                    </div>

                    {/* Notas internas */}
                    <form onSubmit={save} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                        <h2 className="text-white font-semibold mb-3">Notas internas</h2>
                        <textarea
                            value={data.admin_notes}
                            onChange={(e) => setData('admin_notes', e.target.value)}
                            rows={4}
                            placeholder="Observaciones del equipo sobre esta candidata..."
                            className="w-full rounded-xl bg-black/20 border border-white/10 text-slate-200 placeholder:text-slate-600 px-4 py-3 focus:border-emerald-400/50 focus:ring-0"
                        />
                        <div className="flex justify-end mt-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="text-emerald-400 hover:text-emerald-300 font-medium text-sm border border-emerald-400/20 hover:border-emerald-400/50 bg-emerald-400/10 px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Guardando...' : 'Guardar notas'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div
                    onClick={() => setLightbox(null)}
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 cursor-zoom-out"
                >
                    <img src={lightbox} alt="Trabajo" className="max-w-full max-h-full object-contain rounded-lg" />
                </div>
            )}
        </AppLayout>
    );
}
