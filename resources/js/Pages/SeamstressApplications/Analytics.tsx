// <ai_context>
// Propósito: Panel de analíticas de las postulaciones de costureras.
// Incluye tarjetas resumen, comparación de presupuestos por prospecto, línea temporal
// y distribuciones por experiencia, máquinas, ubicación y origen del tráfico.
// Exporta la comparación de presupuestos a CSV.
// Localización: CRM (Admin)
// </ai_context>

import React, { useState } from 'react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { StatCard } from '@/Components/ui/StatCard';
import { Head, Link } from '@inertiajs/react';
import {
    Users, DollarSign, TrendingUp, Gauge, Download, ArrowLeft,
    ChevronDown, ChevronsDownUp, ChevronsUpDown, Image as ImageIcon,
    MessageSquare, StickyNote, Phone, Mail, MapPin,
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface Dist { label: string; value: number }
interface Budget { id: number; name: string; price: number; capacity: number; status: string }
interface Prospect {
    id: number;
    name: string;
    email: string;
    phone: string;
    location: string;
    price: number | null;
    capacity: number | null;
    experience: string | null;
    machines: string[];
    status: string;
    status_label: string;
    photos: string[];
    message: string | null;
    budget_notes: string | null;
    admin_notes: string | null;
    created_at: string;
}

interface Props {
    stats: {
        total: number;
        with_price: number;
        avg_price: number | null;
        min_price: number | null;
        max_price: number | null;
        median_price: number | null;
        total_capacity: number;
        hired: number;
    };
    byStatus: { key: string; label: string; value: number }[];
    byExperience: Dist[];
    byMachine: Dist[];
    byLocation: Dist[];
    bySource: Dist[];
    timeline: { display: string; value: number }[];
    budgetComparison: Budget[];
    prospects: Prospect[];
}

const STATUS_STYLE: Record<string, { badge: string; dot: string }> = {
    pending:   { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-400' },
    reviewed:  { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',       dot: 'bg-blue-400' },
    contacted: { badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', dot: 'bg-purple-400' },
    hired:     { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
    rejected:  { badge: 'bg-red-500/10 text-red-400 border-red-500/20',           dot: 'bg-red-400' },
};

const PALETTE = ['#34d399', '#D4AF37', '#60a5fa', '#c084fc', '#f87171', '#22d3ee', '#fb923c', '#a3e635'];

const TOOLTIP_STYLE = {
    contentStyle: { borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f172a' },
    labelStyle: { color: '#94a3b8', marginBottom: 4, fontSize: 13 },
    itemStyle: { color: '#fff', fontSize: 14, fontWeight: 600 },
};

function ChartCard({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl border border-white/8 bg-white/[0.03] p-5 ${className}`}>
            <div className="mb-4">
                <h3 className="text-white font-semibold">{title}</h3>
                {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

function EmptyChart({ msg = 'Sin datos suficientes.' }: { msg?: string }) {
    return (
        <div className="h-[240px] flex items-center justify-center border-2 border-dashed border-white/8 rounded-xl">
            <span className="text-slate-600 text-sm">{msg}</span>
        </div>
    );
}

const money = (n: number | null) => (n === null ? '—' : `$${Number(n).toFixed(2)}`);

function DataChip({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">{label}</span>
            <span className="text-sm text-slate-200">{value}</span>
        </div>
    );
}

function NoteBlock({ icon: Icon, label, text, accent }: { icon: any; label: string; text: string; accent: string }) {
    return (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
            <div className={`flex items-center gap-1.5 mb-1.5 text-xs font-semibold ${accent}`}>
                <Icon className="w-3.5 h-3.5" /> {label}
            </div>
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{text}</p>
        </div>
    );
}

function ProspectCard({ p, open, onToggle, onZoom }: { p: Prospect; open: boolean; onToggle: () => void; onZoom: (url: string) => void }) {
    const st = STATUS_STYLE[p.status] ?? STATUS_STYLE.pending;
    const hasNotes = p.message || p.budget_notes || p.admin_notes;

    return (
        <div className="rounded-2xl overflow-hidden border border-white/8 bg-white/[0.03]">
            {/* Cabecera clicable */}
            <button onClick={onToggle} className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 hover:bg-white/[0.04] transition-colors text-left">
                <div className="flex items-center gap-3 min-w-0">
                    <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`} />
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white truncate">{p.name}</span>
                            <span className={`text-[11px] border px-2 py-0.5 rounded-full font-medium ${st.badge}`}>{p.status_label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                            <MapPin className="w-3 h-3" /> {p.location}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                        <div className="text-emerald-400 font-semibold">{p.price !== null ? money(p.price) : <span className="text-slate-600">Sin tarifa</span>}</div>
                        <div className="text-[11px] text-slate-500">{p.photos.length} foto{p.photos.length !== 1 ? 's' : ''}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 sm:hidden">
                        <ImageIcon className="w-3.5 h-3.5" /> {p.photos.length}
                    </span>
                </div>
            </button>

            {/* Contenido desplegable */}
            {open && (
                <div className="border-t border-white/8 p-4 sm:p-5 space-y-5">
                    {/* Datos clave */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <DataChip label="Tarifa / pieza" value={p.price !== null ? <span className="text-emerald-400 font-semibold">{money(p.price)}</span> : '—'} />
                        <DataChip label="Capacidad" value={p.capacity ? `${p.capacity} pzs/sem` : '—'} />
                        <DataChip label="Experiencia" value={p.experience ?? '—'} />
                        <DataChip label="Postulada" value={p.created_at} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DataChip label="Contacto" value={
                            <span className="flex flex-col gap-1">
                                <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline"><Mail className="w-3.5 h-3.5" /> {p.email}</a>
                                <a href={`https://wa.me/${p.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"><Phone className="w-3.5 h-3.5" /> {p.phone}</a>
                            </span>
                        } />
                        <DataChip label="Máquinas" value={
                            p.machines.length ? (
                                <span className="flex flex-wrap gap-1.5">
                                    {p.machines.map((m) => <span key={m} className="text-[11px] bg-white/8 border border-white/10 px-2 py-0.5 rounded-full">{m}</span>)}
                                </span>
                            ) : '—'
                        } />
                    </div>

                    {/* Minigalería */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-400">
                            <ImageIcon className="w-3.5 h-3.5" /> Fotos de su trabajo ({p.photos.length})
                        </div>
                        {p.photos.length ? (
                            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2">
                                {p.photos.map((photo, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onZoom(photo)}
                                        className="aspect-square rounded-lg overflow-hidden border border-white/10 bg-black hover:border-emerald-400/50 transition-colors group"
                                    >
                                        <img src={photo} alt={`${p.name} trabajo ${i + 1}`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-600 text-sm">No adjuntó fotos.</p>
                        )}
                    </div>

                    {/* Resumen de notas */}
                    {hasNotes && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {p.message && <NoteBlock icon={MessageSquare} label="Mensaje de la postulante" text={p.message} accent="text-blue-400" />}
                            {p.budget_notes && <NoteBlock icon={DollarSign} label="Detalle de presupuesto" text={p.budget_notes} accent="text-emerald-400" />}
                            {p.admin_notes && <NoteBlock icon={StickyNote} label="Notas internas del equipo" text={p.admin_notes} accent="text-amber-400" />}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Link href={`/seamstress-applications/${p.id}`} className="text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg transition-colors">
                            Abrir ficha completa →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Analytics({ stats, byStatus, byExperience, byMachine, byLocation, bySource, timeline, budgetComparison, prospects }: Props) {
    const [lightbox, setLightbox] = useState<string | null>(null);
    const [openIds, setOpenIds] = useState<number[]>([]);

    const toggle = (id: number) => setOpenIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    const allOpen = prospects.length > 0 && openIds.length === prospects.length;
    const toggleAll = () => setOpenIds(allOpen ? [] : prospects.map((p) => p.id));
    const hasData = stats.total > 0;
    const exportUrl = route('seamstress-applications.export');

    const experienceData = byExperience.filter((d) => d.value > 0);
    const machineData = byMachine.filter((d) => d.value > 0);
    const sourceData = bySource.filter((d) => d.value > 0);
    const budgetChartHeight = Math.max(220, budgetComparison.length * 40);
    const locationHeight = Math.max(220, byLocation.length * 40);

    return (
        <AppLayout>
            <Head title="Analíticas de Costureras - Admin" />

            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <Link href="/seamstress-applications" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Volver al listado
                            </Link>
                            <h1 className="text-2xl font-bold text-white tracking-tight mt-2">Analíticas de Costureras</h1>
                            <p className="text-slate-400 text-sm mt-0.5">
                                Visión general de las {stats.total} postulación{stats.total !== 1 ? 'es' : ''} recibidas
                            </p>
                        </div>
                        <a
                            href={exportUrl}
                            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm border border-emerald-400/20 hover:border-emerald-400/50 bg-emerald-400/10 px-4 py-2.5 rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Exportar presupuestos (CSV)
                        </a>
                    </div>

                    {!hasData ? (
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-16 text-center">
                            <p className="text-slate-500">Todavía no hay postulaciones para analizar.</p>
                            <p className="text-slate-600 text-sm mt-2">
                                Comparte <span className="text-emerald-400 font-medium">joppa.shop/unete</span> para empezar a recibir candidatas.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Tarjetas resumen */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard title="Postulaciones" value={stats.total} icon={Users} description={`${stats.hired} contratada${stats.hired !== 1 ? 's' : ''}`} />
                                <StatCard title="Tarifa promedio" value={money(stats.avg_price)} icon={DollarSign} description={`Mediana ${money(stats.median_price)} · ${stats.with_price} con precio`} />
                                <StatCard title="Rango de tarifas" value={`${money(stats.min_price)} – ${money(stats.max_price)}`} icon={TrendingUp} description="Mínimo y máximo por pieza" />
                                <StatCard title="Capacidad total" value={`${stats.total_capacity}`} icon={Gauge} description="Piezas/semana entre todas" />
                            </div>

                            {/* Comparación de presupuestos por prospecto */}
                            <ChartCard
                                title="Comparación de presupuestos por prospecto"
                                subtitle="Precio por pieza en USD, ordenado de menor a mayor. Solo candidatas que indicaron tarifa."
                            >
                                {budgetComparison.length === 0 ? (
                                    <EmptyChart msg="Ninguna candidata indicó su tarifa todavía." />
                                ) : (
                                    <ResponsiveContainer width="100%" height={budgetChartHeight}>
                                        <BarChart data={budgetComparison} layout="vertical" margin={{ left: 20, right: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
                                            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `$${v}`} />
                                            <YAxis type="category" dataKey="name" width={130} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                                            <Tooltip
                                                {...TOOLTIP_STYLE}
                                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                                formatter={(value: any, _n: any, item: any) => [`$${Number(value).toFixed(2)} · ${item.payload.capacity} pzs/sem · ${item.payload.status}`, 'Precio/pieza']}
                                            />
                                            <Bar dataKey="price" radius={[0, 6, 6, 0]} barSize={22}>
                                                {budgetComparison.map((_, i) => (
                                                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </ChartCard>

                            {/* Línea temporal */}
                            <ChartCard title="Postulaciones en el tiempo" subtitle="Últimos 30 días">
                                <ResponsiveContainer width="100%" height={260}>
                                    <LineChart data={timeline} margin={{ left: -20, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                                        <XAxis dataKey="display" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} interval={4} dy={6} />
                                        <YAxis allowDecimals={false} domain={[0, 'dataMax']} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                        <Tooltip {...TOOLTIP_STYLE} formatter={(v: any) => [v, 'Postulaciones']} labelFormatter={(l) => `Día ${l}`} />
                                        <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={3} dot={{ r: 3, fill: '#D4AF37', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#0B3022', stroke: '#D4AF37', strokeWidth: 2 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Experiencia */}
                                <ChartCard title="Experiencia" subtitle="Años cosiendo">
                                    {experienceData.length === 0 ? <EmptyChart /> : (
                                        <ResponsiveContainer width="100%" height={260}>
                                            <BarChart data={experienceData} margin={{ left: -20, right: 10 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                                                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} formatter={(v: any) => [v, 'Costureras']} />
                                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={48}>
                                                    {experienceData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </ChartCard>

                                {/* Origen */}
                                <ChartCard title="Origen del tráfico" subtitle="De dónde llegaron (utm_source)">
                                    {sourceData.length === 0 ? <EmptyChart /> : (
                                        <ResponsiveContainer width="100%" height={260}>
                                            <PieChart>
                                                <Pie data={sourceData} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
                                                    {sourceData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#0f172a" strokeWidth={2} />)}
                                                </Pie>
                                                <Tooltip {...TOOLTIP_STYLE} formatter={(v: any, n: any) => [`${v} postulaciones`, n]} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                    {sourceData.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3 justify-center">
                                            {sourceData.map((s, i) => (
                                                <span key={s.label} className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                                                    {s.label} ({s.value})
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </ChartCard>

                                {/* Máquinas */}
                                <ChartCard title="Máquinas disponibles" subtitle="Cada candidata puede tener varias">
                                    {machineData.length === 0 ? <EmptyChart /> : (
                                        <ResponsiveContainer width="100%" height={Math.max(220, machineData.length * 40)}>
                                            <BarChart data={machineData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
                                                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                <YAxis type="category" dataKey="label" width={90} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                                                <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} formatter={(v: any) => [v, 'Costureras']} />
                                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20} fill="#34d399" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </ChartCard>

                                {/* Ubicación */}
                                <ChartCard title="Ubicación" subtitle="Top zonas de las candidatas">
                                    {byLocation.length === 0 ? <EmptyChart /> : (
                                        <ResponsiveContainer width="100%" height={locationHeight}>
                                            <BarChart data={byLocation} layout="vertical" margin={{ left: 20, right: 30 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
                                                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                <YAxis type="category" dataKey="label" width={110} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#cbd5e1' }} />
                                                <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} formatter={(v: any) => [v, 'Costureras']} />
                                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20} fill="#60a5fa" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </ChartCard>
                            </div>

                            {/* Estado (resumen de pipeline) */}
                            <ChartCard title="Embudo de selección" subtitle="Postulaciones por estado">
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    {byStatus.map((s, i) => (
                                        <div key={s.key} className="rounded-xl border border-white/8 bg-white/[0.02] p-4 text-center">
                                            <div className="text-2xl font-bold text-white">{s.value}</div>
                                            <div className="flex items-center justify-center gap-1.5 mt-1">
                                                <span className="w-2 h-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                                                <span className="text-xs text-slate-400">{s.label}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ChartCard>

                            {/* Fichas de prospecto para debatir en vivo */}
                            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                    <div>
                                        <h3 className="text-white font-semibold">Fichas de prospectos</h3>
                                        <p className="text-slate-500 text-xs mt-0.5">Fotos y notas de cada candidata para revisarlas en equipo. Toca una para desplegarla.</p>
                                    </div>
                                    {prospects.length > 0 && (
                                        <button
                                            onClick={toggleAll}
                                            className="inline-flex items-center gap-2 text-slate-200 hover:text-white font-medium text-sm border border-white/10 hover:border-white/25 bg-white/5 px-4 py-2 rounded-lg transition-colors"
                                        >
                                            {allOpen ? <><ChevronsDownUp className="w-4 h-4" /> Colapsar todas</> : <><ChevronsUpDown className="w-4 h-4" /> Expandir todas</>}
                                        </button>
                                    )}
                                </div>

                                {prospects.length === 0 ? (
                                    <p className="text-slate-600 text-sm py-4 text-center">No hay prospectos para mostrar.</p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {prospects.map((p) => (
                                            <ProspectCard
                                                key={p.id}
                                                p={p}
                                                open={openIds.includes(p.id)}
                                                onToggle={() => toggle(p.id)}
                                                onZoom={setLightbox}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Lightbox de fotos */}
            {lightbox && (
                <div
                    onClick={() => setLightbox(null)}
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 cursor-zoom-out"
                >
                    <img src={lightbox} alt="Trabajo de la postulante" className="max-w-full max-h-full object-contain rounded-lg" />
                </div>
            )}
        </AppLayout>
    );
}
